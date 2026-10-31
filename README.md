# md viewer

A modern, high-performance Linux desktop Markdown viewer, WYSIWYG editor, and interactive diagram studio crafted with **GTK 3** and **WebKit2GTK**. It delivers instant startup, smooth typography, hardware-accelerated rendering, an authentic Microsoft Word / Google Docs paper editing layout, an interactive architecture diagram studio, and zero-latency live auto-reload.

![md viewer Icon](assets/icon.svg)

---

## Table of Contents

- [Key Features](#key-features)
  - [1. Reading & Authenticity](#1-reading--authenticity)
  - [2. WYSIWYG Google Docs & Word Paper Editor](#2-wysiwyg-google-docs--word-paper-editor)
  - [3. Interactive Architecture Studio & Diagrammer](#3-interactive-architecture-studio--diagrammer)
  - [4. Five Distinct View Modes](#4-five-distinct-view-modes)
  - [5. Slide Presentation Deck Mode](#5-slide-presentation-deck-mode)
  - [6. Window Resizing & Responsive Layout](#6-window-resizing--responsive-layout)
- [Prerequisites & Dependencies](#prerequisites--dependencies)
- [Installation](#installation)
- [Uninstallation](#uninstallation)
- [Usage & CLI Options](#usage--cli-options)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Project Architecture](#project-architecture)

---

## Key Features

### 1. Reading & Authenticity
- **100% Offline & Self-Contained**: All rendering engines (Marked, Prism syntax highlighter, KaTeX math parser, and Mermaid diagram engine) are pre-bundled offline. No telemetry, CDN requests, or external internet connections required.
- **Zero-Latency Live Auto-Reload**: Monitors documents using native Linux `inotify` via `Gio.FileMonitor`. External updates (e.g. from Vim, VS Code, or git checkout) update instantly without resetting scroll position.
- **Primer Typography & Dark/Light Themes**: Authentic GitHub Primer design system with light, dark, and high-contrast dark themes that automatically detect system GTK preferences.
- **Mathematical Formulas**: Full KaTeX math support for inline (`$...$`) and display (`$$...$$`) LaTeX equations.
- **GitHub-Flavored Markdown (GFM)**: Tables, task lists with clickable checkboxes (`- [x]`), strikethrough, syntax-highlighted code fences with copy buttons, and callout alerts (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`).
- **Relative Local Assets**: Automatically resolves relative images (`![chart](./images/plot.png)`) relative to the document directory.

### 2. WYSIWYG Google Docs & Word Paper Editor
- **"Edit Document" Toggle**: Click **✏️ Edit Document** right inside the Preview window to edit rich text directly without switching to raw code view.
- **Floating Formatting Ribbon**: Includes a Google Docs / Microsoft Word-style floating toolbar:
  - Text formatting: **Bold** (<kbd>Ctrl</kbd>+<kbd>B</kbd>), *Italic* (<kbd>Ctrl</kbd>+<kbd>I</kbd>), <u>Underline</u> (<kbd>Ctrl</kbd>+<kbd>U</kbd>), ~~Strikethrough~~, `Inline Code`.
  - Paragraph formatting: Headings dropdown (Heading 1–3, Paragraph), Alignment (Left, Center, Right).
  - Structural elements: Bullet lists, Numbered lists, Blockquotes, and Insert Tables.
- **📄 Paper View Mode**: Switches the preview into a centered A4 document canvas with realistic drop shadows and margins matching Google Docs and Microsoft Word.
- **Bi-Directional Markdown Sync**: Formatted edits in the paper view automatically convert back to clean Markdown and sync with disk and the code editor.

### 3. Interactive Architecture Studio & Diagrammer
- **Bi-Directional Diagram Editing**:
  - Click **✏️ Edit in Studio** on any Mermaid diagram in the document to load it into Architecture Studio.
  - Modify blocks, drag connections, or adjust styles, then click **💾 Update in Doc** to replace that exact diagram block in the Markdown file!
  - Switch between multiple diagrams in the document with the diagram selector dropdown, or click **+ Insert New** to append a new diagram.
- **Drag-to-Reshape Blocks**: Grab the interactive handle on the bottom-right corner of any block to resize width and height. Titles dynamically center and wrap according to the shape's size.
- **Subgraphs & Multi-Stage Pipelines**: Full support for `subgraph ... end` cluster boundaries, preserving vertical and horizontal hierarchies without distortion.
- **Extended Shape Library**:
  - Rectangles `[]`
  - Rounded Boxes `()`
  - Circles `(())`
  - Ovals / Stadiums `([])`
  - Databases / Cylinders `[()]`
  - Diamonds / Decision Nodes `{}`
- **Flexible Connector Links**:
  - Directed Arrows (`-->`)
  - Bidirectional Links (`<-->`)
  - Undirected Lines (`---`)
  - Dashed Connectors (`-.->`)
  - Connecting Line Labels (`-->|REST API|`) with double-click inline editing.
- **Movable Floating Toolbar**: Drag the toolbar handle (`⠿`) anywhere across the canvas. Automatically clamps inside the viewport on window resize so it never gets lost.
- **Full History Stack**: Undo (<kbd>Ctrl</kbd>+<kbd>Z</kbd>) and Redo (<kbd>Ctrl</kbd>+<kbd>Y</kbd>) for all block moves, additions, connections, deletions, and resizes.
- **Auto-Arrange**: One-click layered hierarchical graph layout algorithm that organizes complex diagrams into clean ranks.
- **Image Export**: Export diagrams as vector SVG or high-resolution PNG images.

### 4. Five Distinct View Modes
Switch seamlessly between 5 optimized view modes via the toolbar or keyboard shortcuts:
1. **Preview Mode** (<kbd>Ctrl</kbd>+<kbd>1</kbd>): Fully rendered document with interactive diagrams, math equations, outline sidebar, and WYSIWYG paper editor.
2. **Code Mode** (<kbd>Ctrl</kbd>+<kbd>2</kbd>): Full-height raw Markdown editor with syntax highlighting, synchronized line numbers, and tab-key indentation.
3. **Split Mode** (<kbd>Ctrl</kbd>+<kbd>3</kbd>): Synchronized side-by-side code editor and live preview. Features a **draggable vertical gutter** to customize split proportions (e.g. 40/60, 60/40).
4. **Architecture Studio** (<kbd>Ctrl</kbd>+<kbd>4</kbd>): Full-canvas interactive node and flowchart diagramming workspace.
5. **Presentation Slides** (<kbd>Ctrl</kbd>+<kbd>5</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>): Turns your Markdown document into a presentation slide deck.

### 5. Slide Presentation Deck Mode
- Automatically converts Markdown headings (`#`, `##`) and horizontal rules (`---`) into presentation slides.
- Fluid keyboard navigation with Arrow keys (<kbd>←</kbd> / <kbd>→</kbd>) or Spacebar.
- Fullscreen presentation support (<kbd>F11</kbd>), progress bar, and slide counter.

### 6. Window Resizing & Responsive Layout
- **Smart Breadcrumb Prioritization**: The header ensures the active document filename remains bold and legible. Parent folders and root prefixes collapse gracefully on narrower viewports.
- **Responsive Toolbar**: Action button text collapses to icons and stats pills tuck away on smaller screen widths, preventing toolbar overflow.
- **Window State Handling**: Smooth adaptation when maximizing, minimizing, unmaximizing, or snapping windows to split-screen layouts.

---

## Prerequisites & Dependencies

`md viewer` uses native GTK 3 and WebKit2GTK for hardware-accelerated rendering. Install the required packages for your distribution:

### Ubuntu / Debian / Linux Mint / Pop!_OS / Zorin
```bash
sudo apt update
sudo apt install -y python3 python3-gi python3-gi-cairo gir1.2-gtk-3.0 gir1.2-webkit2-4.1
```
*(On older releases such as Ubuntu 20.04 or Debian 11, replace `gir1.2-webkit2-4.1` with `gir1.2-webkit2-4.0`)*

### Fedora / RHEL / CentOS / Rocky / Alma / Nobara
```bash
sudo dnf install -y python3 python3-gobject gtk3 webkit2gtk4.1
```

### Arch Linux / Manjaro / EndeavourOS / Garuda
```bash
sudo pacman -S --needed python python-gobject gtk3 webkit2gtk-4.1
```

### openSUSE / SLES
```bash
sudo zypper install -y python3-gobject typelib-1_0-Gtk-3_0 typelib-1_0-WebKit2-4_1
```

### Alpine Linux
```bash
sudo apk add python3 py3-gobject3 gtk+3.0 webkit2gtk
```

### Void Linux
```bash
sudo xbps-install -S python3 python3-gobject gtk+3 webkit2gtk
```

---

## Installation

Run the universal installer script (`install.sh`):

```bash
chmod +x install.sh
./install.sh
```

### Installation Modes:
- **User Mode (Recommended, No root / sudo required)**:
  ```bash
  ./install.sh --user
  ```
  *Installs binaries to `~/.local/share/mdviewer`, creates the launcher at `~/.local/bin/mdviewer`, and registers `~/.local/share/applications/mdviewer.desktop`.*

- **System-Wide Mode (For all system users, requires sudo)**:
  ```bash
  sudo ./install.sh --system
  ```
  *Installs to `/opt/mdviewer`, links executable to `/usr/local/bin/mdviewer`, and registers desktop entry in `/usr/share/applications/`.*

- **Verify Dependencies Only**:
  ```bash
  ./install.sh --check
  ```

---

## Uninstallation

To cleanly remove `md viewer`, desktop shortcuts, and icons:

```bash
./uninstall.sh                # For user installation
sudo ./uninstall.sh --system  # For system-wide installation
```

---

## Usage & CLI Options

### Command Line Interface

```bash
# Launch with welcome screen (open / create file)
mdviewer

# Open a specific Markdown file
mdviewer README.md

# Open with Light Theme
mdviewer notes.md --theme light

# Open with High-Contrast Dark Theme
mdviewer notes.md --theme high-contrast

# Open directly in Architecture Studio
mdviewer architecture.md --arch

# Open directly in Split View
mdviewer draft.md --split

# Open directly in Raw Code View
mdviewer script.md --code

# Launch in local Chrome App window mode
mdviewer README.md --chrome

# Launch in default web browser
mdviewer README.md --web
```

### Desktop Integration

- Search for **md viewer** in your GNOME, KDE, XFCE, or Cinnamon application launcher.
- Right-click any `.md`, `.markdown`, or `.mdown` file and choose **Open With... -> md viewer**.
- Drag and drop any Markdown file directly into the running application window.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Save document changes directly to disk |
| <kbd>Ctrl</kbd> + <kbd>O</kbd> | Open file via native file dialog |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Find / Search in document with highlight navigation |
| <kbd>Ctrl</kbd> + <kbd>1</kbd> | Switch to **Preview** mode |
| <kbd>Ctrl</kbd> + <kbd>2</kbd> | Switch to **Code** editor mode |
| <kbd>Ctrl</kbd> + <kbd>3</kbd> | Switch to **Split** screen mode |
| <kbd>Ctrl</kbd> + <kbd>4</kbd> | Switch to **Architecture Studio** canvas |
| <kbd>Ctrl</kbd> + <kbd>5</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | Start **Presentation Slide Deck** mode |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> | Toggle Document Outline (Table of Contents) |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> | Copy raw Markdown text to clipboard |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Print or Export to PDF |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo in Architecture Studio |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Redo in Architecture Studio |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete selected block or connection line in Studio |
| <kbd>Esc</kbd> | Close search bar / Exit presentation mode |

---

## Project Architecture

```
md-viewer/
├── mdviewer.py          # Native GTK3 + WebKit2 core application, CLI & IPC bridge
├── install.sh           # Hardened multi-distro installer & desktop integration
├── uninstall.sh         # Clean uninstaller script
├── mdviewer.desktop     # FreeDesktop .desktop application launcher
├── README.md            # Comprehensive documentation
├── sample.md            # Feature demonstration & reference guide
└── assets/
    ├── index.html       # GitHub-styled UI layout, toolbar ribbon & modals
    ├── github.css       # Primer design system, themes & responsive stylesheets
    ├── app.js           # Document parser, WYSIWYG sync, Architecture Studio & TOC
    ├── icon.svg         # Application brand icon
    └── vendor/          # Bundled offline libraries
        ├── marked.min.js
        ├── prism.min.js
        ├── prism-components/
        ├── katex.min.js
        ├── katex.min.css
        ├── fonts/
        └── mermaid.min.js
```

---

## License

This project is licensed under the MIT License.
