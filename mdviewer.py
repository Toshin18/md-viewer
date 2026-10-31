#!/usr/bin/env python3
"""
md viewer - Native Linux Desktop Markdown Viewer & Architecture Studio
Replicates GitHub's authentic Markdown interface with high efficiency,
live auto-reload, outline navigation, split view, architecture studio, and offline rendering.
"""

import sys
import os
import json
import argparse
import subprocess
import threading
from pathlib import Path

# Ensure paths are absolute
APP_DIR = Path(__file__).resolve().parent
ASSETS_DIR = APP_DIR / "assets"
INDEX_HTML = ASSETS_DIR / "index.html"
ICON_PATH = ASSETS_DIR / "icon.svg"


def run_gtk_app(target_file, initial_theme=None, initial_view="preview", watch_file=True):
    """Launch the native GTK3 + WebKit2 application."""
    import gi
    gi.require_version('Gtk', '3.0')
    gi.require_version('Gdk', '3.0')
    try:
        gi.require_version('WebKit2', '4.1')
    except (ValueError, AttributeError):
        try:
            gi.require_version('WebKit2', '4.0')
        except (ValueError, AttributeError):
            print("Error: WebKit2GTK (version 4.1 or 4.0) is required.", file=sys.stderr)
            raise
    from gi.repository import Gtk, Gdk, WebKit2, Gio, GLib

    GLib.set_prgname("mdviewer")
    GLib.set_application_name("md viewer")

    class MarkdownViewerWindow(Gtk.Window):
        def __init__(self, file_path):
            super().__init__(title="md viewer")
            self.set_default_size(1220, 840)
            self.set_size_request(640, 440)
            self.set_position(Gtk.WindowPosition.CENTER)
            self.set_wmclass("mdviewer", "md viewer")

            # Set Window Icon
            if ICON_PATH.exists():
                try:
                    self.set_icon_from_file(str(ICON_PATH))
                except Exception as e:
                    print(f"Notice: Failed to load icon: {e}", file=sys.stderr)

            self.file_path = Path(file_path).resolve() if file_path else None
            self.file_monitor = None
            self.monitor_handler_id = None
            self._reload_timer_id = None

            # Setup WebKit UserContentManager for bidirectional IPC
            self.ucm = WebKit2.UserContentManager()
            self.ucm.register_script_message_handler("appBridge")
            self.ucm.connect("script-message-received::appBridge", self.on_js_message)

            # Setup WebKit Settings
            settings = WebKit2.Settings()
            settings.set_enable_developer_extras(True)
            settings.set_enable_smooth_scrolling(True)
            settings.set_enable_javascript(True)
            settings.set_enable_page_cache(True)
            settings.set_allow_file_access_from_file_urls(True)
            settings.set_allow_universal_access_from_file_urls(True)

            # Setup WebView
            self.webview = WebKit2.WebView.new_with_user_content_manager(self.ucm)
            self.webview.set_settings(settings)
            self.webview.connect("load-changed", self.on_load_changed)

            # Add to window
            self.add(self.webview)

            # Enable Drag and Drop for Markdown files
            self.setup_drag_and_drop()

            # Window destroy handler
            self.connect("destroy", self.on_window_close)

            # Start watching file
            if watch_file and self.file_path and self.file_path.exists():
                self.setup_file_monitor(self.file_path)

            # Load local index.html
            uri = INDEX_HTML.as_uri()
            self.webview.load_uri(uri)

        def setup_drag_and_drop(self):
            """Enable dragging .md files onto the application window."""
            self.drag_dest_set(
                Gtk.DestDefaults.ALL,
                [],
                Gdk.DragAction.COPY
            )
            self.drag_dest_add_uri_targets()
            self.connect("drag-data-received", self.on_drag_data_received)

        def on_drag_data_received(self, widget, drag_context, x, y, data, info, time):
            uris = data.get_uris()
            if uris:
                first_uri = uris[0]
                gio_file = Gio.File.new_for_uri(first_uri)
                local_path = gio_file.get_path()
                if local_path and (local_path.endswith('.md') or local_path.endswith('.markdown') or local_path.endswith('.txt')):
                    self.open_file(Path(local_path))
            Gtk.drag_finish(drag_context, True, False, time)

        def setup_file_monitor(self, file_path):
            """Watch file for external changes and push live updates."""
            if self.file_monitor and self.monitor_handler_id:
                self.file_monitor.disconnect(self.monitor_handler_id)
                self.file_monitor.cancel()

            gio_file = Gio.File.new_for_path(str(file_path))
            try:
                self.file_monitor = gio_file.monitor_file(Gio.FileMonitorFlags.NONE, None)
                self.monitor_handler_id = self.file_monitor.connect("changed", self.on_file_changed)
            except Exception as e:
                print(f"Warning: Could not monitor file {file_path}: {e}", file=sys.stderr)

        def on_file_changed(self, monitor, file, other_file, event_type):
            if event_type in (Gio.FileMonitorEvent.CHANGES_DONE_HINT, Gio.FileMonitorEvent.CHANGED):
                # Debounce reload requests
                if self._reload_timer_id is not None:
                    GLib.source_remove(self._reload_timer_id)
                self._reload_timer_id = GLib.timeout_add(150, self._debounced_reload)

        def _debounced_reload(self):
            self._reload_timer_id = None
            if getattr(self, '_saving_internally', False):
                return False
            if self.file_path and self.file_path.exists():
                try:
                    content = self.file_path.read_text(encoding="utf-8", errors="replace")
                    self.send_to_js({
                        "action": "fileChanged",
                        "content": content
                    })
                except Exception as e:
                    print(f"Error reading file on change: {e}", file=sys.stderr)
            return False

        def open_file(self, file_path):
            """Load a new file into the viewer."""
            self.file_path = Path(file_path).resolve()
            if watch_file and self.file_path.exists():
                self.setup_file_monitor(self.file_path)

            try:
                content = self.file_path.read_text(encoding="utf-8", errors="replace")
            except Exception as e:
                content = f"# Error reading file\n\nCould not read `{self.file_path}`:\n\n```{e}```"

            self.set_title(f"md viewer - {self.file_path.name}")
            self.send_to_js({
                "action": "loadFile",
                "path": str(self.file_path),
                "dir": str(self.file_path.parent),
                "content": content
            })

        def show_open_dialog(self):
            """Show native GTK Open File Dialog."""
            dialog = Gtk.FileChooserDialog(
                title="Open Markdown File",
                parent=self,
                action=Gtk.FileChooserAction.OPEN
            )
            dialog.add_buttons(
                Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL,
                Gtk.STOCK_OPEN, Gtk.ResponseType.OK
            )

            filter_md = Gtk.FileFilter()
            filter_md.set_name("Markdown Files (*.md, *.markdown)")
            filter_md.add_pattern("*.md")
            filter_md.add_pattern("*.markdown")
            filter_md.add_pattern("*.mdown")
            dialog.add_filter(filter_md)

            filter_all = Gtk.FileFilter()
            filter_all.set_name("All Files")
            filter_all.add_pattern("*")
            dialog.add_filter(filter_all)

            if self.file_path and self.file_path.parent.exists():
                dialog.set_current_folder(str(self.file_path.parent))

            response = dialog.run()
            if response == Gtk.ResponseType.OK:
                selected_filename = dialog.get_filename()
                dialog.destroy()
                if selected_filename:
                    self.open_file(Path(selected_filename))
            else:
                dialog.destroy()

        def eval_js(self, script):
            """Execute JavaScript in the WebView cleanly without deprecation warnings."""
            if hasattr(self.webview, "evaluate_javascript"):
                self.webview.evaluate_javascript(script, -1, None, None, None, None, None)
            else:
                self.webview.run_javascript(script, None, None, None)

        def send_to_js(self, payload):
            """Send a JSON payload to the WebKit WebView."""
            json_str = json.dumps(payload)
            script = f"if (window.appBridgeReceive) {{ window.appBridgeReceive({json_str}); }}"
            self.eval_js(script)

        def on_js_message(self, manager, js_result):
            """Handle messages posted from frontend JavaScript."""
            try:
                raw_val = js_result.get_js_value().to_string()
                msg = json.loads(raw_val)
                action = msg.get("action")

                if action == "ready":
                    # Load current file content into the WebView
                    if self.file_path and self.file_path.exists():
                        self.open_file(self.file_path)
                    else:
                        self.send_to_js({"action": "showWelcome"})
                    
                    theme_to_set = initial_theme
                    if not theme_to_set:
                        gtk_settings = Gtk.Settings.get_default()
                        if gtk_settings:
                            try:
                                is_dark = gtk_settings.get_property("gtk-application-prefer-dark-theme")
                                theme_to_set = "dark" if is_dark else "light"
                            except Exception:
                                theme_to_set = "dark"
                    if theme_to_set:
                        self.send_to_js({"action": "setTheme", "theme": theme_to_set})

                elif action == "saveFile":
                    content = msg.get("content", "")
                    target_str = msg.get("path")
                    target = Path(target_str).resolve() if target_str else self.file_path
                    if target:
                        try:
                            self._saving_internally = True
                            target.write_text(content, encoding="utf-8")
                            self.send_to_js({"action": "saveSuccess", "path": str(target)})
                            GLib.timeout_add(350, lambda: setattr(self, '_saving_internally', False) or False)
                        except Exception as e:
                            self.send_to_js({"action": "saveError", "error": str(e)})

                elif action == "openFileDialog":
                    GLib.idle_add(self.show_open_dialog)

                elif action == "openFile":
                    path_str = msg.get("path")
                    if path_str:
                        target_path = Path(path_str).resolve()
                        if target_path.exists():
                            GLib.idle_add(lambda: self.open_file(target_path))

                elif action == "copy":
                    text = msg.get("text", "")
                    clipboard = Gtk.Clipboard.get(Gdk.SELECTION_CLIPBOARD)
                    clipboard.set_text(text, -1)

            except Exception as e:
                print(f"Error handling JS message: {e}", file=sys.stderr)

        def on_load_changed(self, webview, event):
            if event == WebKit2.LoadEvent.FINISHED:
                if initial_view != "preview":
                    self.eval_js(f"switchView('{initial_view}')")

        def on_window_close(self, widget):
            if self.file_monitor and self.monitor_handler_id:
                try:
                    self.file_monitor.disconnect(self.monitor_handler_id)
                    self.file_monitor.cancel()
                except Exception:
                    pass
            Gtk.main_quit()

    # Launch GTK
    win = MarkdownViewerWindow(target_file)
    win.show_all()
    Gtk.main()


def run_web_or_chrome(target_file, chrome_mode=True, initial_theme=None, port=8765):
    """Run via local HTTP server with Chrome app window or standard browser."""
    import http.server
    import socketserver
    import webbrowser

    os.chdir(ASSETS_DIR)

    handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("127.0.0.1", port), handler)
    
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    url = f"http://127.0.0.1:{port}/index.html"
    print(f"md viewer running at {url}")

    if chrome_mode:
        chrome_bin = "/usr/bin/google-chrome"
        if os.path.exists(chrome_bin):
            subprocess.run([chrome_bin, f"--app={url}", "--window-size=1180,820"])
            return

    webbrowser.open(url)
    print("Press Ctrl+C to terminate.")
    try:
        server_thread.join()
    except KeyboardInterrupt:
        httpd.shutdown()


def main():
    parser = argparse.ArgumentParser(
        description="md viewer - Native Linux desktop app for smooth, authentic Markdown reading and Architecture Studio."
    )
    parser.add_argument("file", nargs="?", default=None, help="Markdown file to open (default: sample.md)")
    parser.add_argument("--theme", choices=["dark", "light", "high-contrast"], default=None, help="Initial color theme")
    parser.add_argument("--split", action="store_true", help="Start directly in side-by-side Split View")
    parser.add_argument("--code", action="store_true", help="Start directly in Raw Code View")
    parser.add_argument("--arch", action="store_true", help="Start directly in Architecture Studio Canvas")
    parser.add_argument("--no-watch", action="store_true", help="Disable live file watching")
    parser.add_argument("--chrome", action="store_true", help="Launch in Google Chrome app window mode")
    parser.add_argument("--web", action="store_true", help="Launch via local web server in default browser")

    args = parser.parse_args()

    # Determine initial view mode
    initial_view = "preview"
    if args.arch:
        initial_view = "arch"
    elif args.split:
        initial_view = "split"
    elif args.code:
        initial_view = "code"

    # Keep target_path None if not provided, allowing Welcome screen to open on start
    target_path = args.file
    if not target_path and (args.chrome or args.web):
        sample_file = APP_DIR / "sample.md"
        if sample_file.exists():
            target_path = str(sample_file)

    # Launch Chrome/Web or GTK Native
    if args.chrome or args.web:
        run_web_or_chrome(target_path, chrome_mode=args.chrome, initial_theme=args.theme)
    else:
        run_gtk_app(
            target_path,
            initial_theme=args.theme,
            initial_view=initial_view,
            watch_file=not args.no_watch
        )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
