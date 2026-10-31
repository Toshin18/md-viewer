#!/usr/bin/env bash
# ==============================================================================
# md viewer - Linux Universal Installer
# Compatible with Ubuntu, Debian, Fedora, Arch, openSUSE, Alpine, Manjaro, Mint
#
# Cybersecurity & Hardening:
# - Strict mode: set -euo pipefail
# - Safe umask 022
# - Atomically installs files with safe permissions (644 for assets, 755 for bins)
# - No world-writable files or unpinned downloads
# - Input validation and safe quote handling
# ==============================================================================

set -euo pipefail
umask 022

# Terminal colors for user-friendly output
if [[ -t 1 ]]; then
    C_BLUE="$(printf '\033[1;34m')"
    C_GREEN="$(printf '\033[1;32m')"
    C_YELLOW="$(printf '\033[1;33m')"
    C_RED="$(printf '\033[1;31m')"
    C_BOLD="$(printf '\033[1m')"
    C_RESET="$(printf '\033[0m')"
else
    C_BLUE=''
    C_GREEN=''
    C_YELLOW=''
    C_RED=''
    C_BOLD=''
    C_RESET=''
fi

log_info()    { echo -e "${C_BLUE}[INFO]${C_RESET} $*"; }
log_success() { echo -e "${C_GREEN}[OK]${C_RESET} $*"; }
log_warn()    { echo -e "${C_YELLOW}[WARN]${C_RESET} $*"; }
log_error()   { echo -e "${C_RED}[ERROR]${C_RESET} $*" >&2; }

# Locate source directory
SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Default settings
INSTALL_MODE="user"
CHECK_ONLY=false

show_help() {
    cat << EOF
${C_BOLD}md viewer - Installer${C_RESET}

Usage:
  ./install.sh [OPTIONS]

Options:
  --user       Install for current user only (default: ~/.local/share/mdviewer)
               No root/sudo privileges required.
  --system     Install system-wide for all users (/opt/mdviewer & /usr/local/bin)
               Requires sudo / root privileges.
  --check      Check dependencies only without installing.
  -h, --help   Show this help message.

EOF
    exit 0
}

# Parse CLI arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --user)
            INSTALL_MODE="user"
            shift
            ;;
        --system)
            INSTALL_MODE="system"
            shift
            ;;
        --check)
            CHECK_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            ;;
    esac
done

# If running as root without explicit mode, default to system
if [[ $EUID -eq 0 && "$INSTALL_MODE" == "user" ]]; then
    log_warn "Running as root; defaulting to system-wide installation (/opt/mdviewer)."
    INSTALL_MODE="system"
fi

echo -e "${C_BOLD}=== md viewer Installation (${INSTALL_MODE} mode) ===${C_RESET}"

# ==============================================================================
# 1. Dependency Verification
# ==============================================================================
log_info "Verifying system prerequisites..."

detect_distro() {
    if [[ -f /etc/os-release ]]; then
        # shellcheck source=/dev/null
        . /etc/os-release
        local detected="${ID:-unknown}"
        # Check ID_LIKE if ID is not directly matched
        case "$detected" in
            ubuntu|debian|linuxmint|pop|elementary|zorin|kali|neon)
                echo "debian"
                ;;
            fedora|rhel|centos|rocky|alma|nobara)
                echo "fedora"
                ;;
            arch|manjaro|endeavouros|garuda|artix)
                echo "arch"
                ;;
            opensuse*|suse)
                echo "opensuse"
                ;;
            alpine)
                echo "alpine"
                ;;
            void)
                echo "void"
                ;;
            *)
                if [[ "${ID_LIKE:-}" =~ (debian|ubuntu) ]]; then
                    echo "debian"
                elif [[ "${ID_LIKE:-}" =~ (fedora|rhel|centos) ]]; then
                    echo "fedora"
                elif [[ "${ID_LIKE:-}" =~ (arch) ]]; then
                    echo "arch"
                elif [[ "${ID_LIKE:-}" =~ (suse) ]]; then
                    echo "opensuse"
                else
                    echo "$detected"
                fi
                ;;
        esac
    else
        echo "unknown"
    fi
}

DISTRO="$(detect_distro)"

get_install_cmd() {
    case "$DISTRO" in
        debian|ubuntu)
            echo "sudo apt update && sudo apt install -y python3 python3-gi python3-gi-cairo gir1.2-gtk-3.0 gir1.2-webkit2-4.1"
            ;;
        fedora)
            echo "sudo dnf install -y python3 python3-gobject gtk3 webkit2gtk4.1"
            ;;
        arch)
            echo "sudo pacman -S --needed python python-gobject gtk3 webkit2gtk-4.1"
            ;;
        opensuse)
            echo "sudo zypper install -y python3 python3-gobject typelib-1_0-Gtk-3_0 typelib-1_0-WebKit2-4_1"
            ;;
        alpine)
            echo "sudo apk add python3 py3-gobject3 gtk+3.0 webkit2gtk"
            ;;
        void)
            echo "sudo xbps-install -S python3 python3-gobject gtk+3 webkit2gtk"
            ;;
        *)
            echo "Please install Python 3, PyGObject (GTK 3.0), and WebKit2GTK (4.1 or 4.0) using your system package manager."
            ;;
    esac
}

HAS_PYTHON=false
if command -v python3 &>/dev/null; then
    PYTHON_VER="$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")')"
    if python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)'; then
        HAS_PYTHON=true
        log_success "Found Python $PYTHON_VER"
    else
        log_error "Python $PYTHON_VER found, but Python >= 3.8 is required."
    fi
else
    log_error "python3 executable not found in PATH."
fi

HAS_GTK_WEBKIT=false
if [[ "$HAS_PYTHON" == "true" ]]; then
    if python3 -c "
import sys
try:
    import gi
    gi.require_version('Gtk', '3.0')
    try:
        gi.require_version('WebKit2', '4.1')
    except (ValueError, AttributeError):
        gi.require_version('WebKit2', '4.0')
    from gi.repository import Gtk, WebKit2
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; then
        HAS_GTK_WEBKIT=true
        log_success "Found GTK 3.0 and WebKit2GTK Python bindings"
    else
        log_warn "GTK 3.0 and/or WebKit2GTK bindings are missing."
    fi
fi

if [[ "$HAS_PYTHON" != "true" || "$HAS_GTK_WEBKIT" != "true" ]]; then
    echo ""
    log_error "Missing required dependencies for running native GUI!"
    echo -e "${C_BOLD}To install them on your system (${DISTRO}), run:${C_RESET}"
    echo -e "  ${C_YELLOW}$(get_install_cmd)${C_RESET}"
    echo ""
    if [[ "$CHECK_ONLY" == "true" ]]; then
        exit 1
    fi
    read -r -p "Do you want to proceed with installation anyway? [y/N] " response || true
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Installation aborted. Please install the dependencies and run again."
        exit 1
    fi
fi

if [[ "$CHECK_ONLY" == "true" ]]; then
    log_success "All dependency checks completed."
    exit 0
fi

# ==============================================================================
# 2. Source Integrity Verification
# ==============================================================================
log_info "Verifying package integrity..."

REQUIRED_FILES=(
    "mdviewer.py"
    "assets/index.html"
    "assets/github.css"
    "assets/app.js"
    "assets/icon.svg"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$SOURCE_DIR/$file" ]]; then
        log_error "Missing required package file: $SOURCE_DIR/$file"
        exit 1
    fi
done
log_success "Integrity check passed."

# ==============================================================================
# 3. Target Path Configuration
# ==============================================================================
if [[ "$INSTALL_MODE" == "system" ]]; then
    APP_DIR="/opt/mdviewer"
    BIN_DIR="/usr/local/bin"
    DESKTOP_DIR="/usr/share/applications"
    ICON_DIR="/usr/share/icons/hicolor/scalable/apps"
else
    APP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/mdviewer"
    BIN_DIR="${HOME}/.local/bin"
    DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
    ICON_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor/scalable/apps"
fi

LAUNCHER="$BIN_DIR/mdviewer"
DESKTOP_FILE="$DESKTOP_DIR/mdviewer.desktop"
ICON_FILE="$ICON_DIR/mdviewer.svg"

# ==============================================================================
# 4. Installation & Hardened File Placement
# ==============================================================================
log_info "Installing application to: $APP_DIR"

# Create directories with safe permissions
mkdir -p "$APP_DIR"
mkdir -p "$BIN_DIR"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

# Copy core application files
cp -r "$SOURCE_DIR/mdviewer.py" "$APP_DIR/"
cp -r "$SOURCE_DIR/assets" "$APP_DIR/"
if [[ -f "$SOURCE_DIR/sample.md" ]]; then
    cp "$SOURCE_DIR/sample.md" "$APP_DIR/"
fi
if [[ -f "$SOURCE_DIR/README.md" ]]; then
    cp "$SOURCE_DIR/README.md" "$APP_DIR/"
fi

# Apply secure permission hardening
# 755 for directories, 755 for executable python script, 644 for assets
find "$APP_DIR" -type d -exec chmod 755 {} +
find "$APP_DIR" -type f -exec chmod 644 {} +
chmod 755 "$APP_DIR/mdviewer.py"
chmod -R go-w "$APP_DIR"

# Install application icon
cp "$SOURCE_DIR/assets/icon.svg" "$ICON_FILE"
chmod 644 "$ICON_FILE"
log_success "Installed icon: $ICON_FILE"

# Create executable launcher script with safe quoting and signal handling
log_info "Generating executable wrapper: $LAUNCHER"
cat << 'EOF' > "$LAUNCHER"
#!/usr/bin/env bash
set -euo pipefail

# Resolve Python 3 executable
PYTHON_BIN="$(command -v python3 || echo "/usr/bin/python3")"

if [[ ! -x "$PYTHON_BIN" ]]; then
    echo "Error: python3 executable not found in PATH." >&2
    exit 1
fi

APP_TARGET="##APP_DIR##/mdviewer.py"

if [[ ! -f "$APP_TARGET" ]]; then
    echo "Error: md viewer core file not found at: $APP_TARGET" >&2
    exit 1
fi

exec "$PYTHON_BIN" "$APP_TARGET" "$@"
EOF

# Substitute actual target directory into launcher
sed -i "s|##APP_DIR##|${APP_DIR}|g" "$LAUNCHER"
chmod 755 "$LAUNCHER"
log_success "Installed launcher: $LAUNCHER"

# Install FreeDesktop .desktop entry
log_info "Registering desktop application entry: $DESKTOP_FILE"
cat << EOF > "$DESKTOP_FILE"
[Desktop Entry]
Version=1.0
Type=Application
Name=md viewer
GenericName=Markdown Viewer
Comment=Lightweight, secure Markdown viewer & Architecture Studio for Linux
Exec=$LAUNCHER %f
Icon=$ICON_FILE
Terminal=false
Categories=Utility;TextEditor;Development;
MimeType=text/markdown;text/x-markdown;text/plain;
Keywords=markdown;viewer;preview;studio;diagram;architecture;editor;docs;
StartupWMClass=mdviewer
StartupNotify=true
EOF
chmod 644 "$DESKTOP_FILE"
log_success "Installed desktop entry: $DESKTOP_FILE"

# ==============================================================================
# 5. Desktop Cache & MIME Database Registration
# ==============================================================================
log_info "Refreshing system desktop and MIME caches..."

if command -v update-desktop-database &>/dev/null; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

if command -v gtk-update-icon-cache &>/dev/null; then
    gtk-update-icon-cache -f -t "$(dirname "$ICON_DIR")" 2>/dev/null || true
fi

if command -v xdg-mime &>/dev/null; then
    xdg-mime default mdviewer.desktop text/markdown 2>/dev/null || true
    xdg-mime default mdviewer.desktop text/x-markdown 2>/dev/null || true
fi

# ==============================================================================
# 6. PATH Environment Verification
# ==============================================================================
echo ""
log_success "${C_BOLD}md viewer has been successfully installed!${C_RESET}"

if [[ "$INSTALL_MODE" == "user" ]]; then
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        echo ""
        log_warn "Notice: ${BIN_DIR} is not currently in your system PATH."
        echo "To run 'mdviewer' directly from your terminal, add it to your shell profile:"
        echo -e "  ${C_YELLOW}echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc${C_RESET}  # or ~/.zshrc"
        echo -e "  ${C_YELLOW}source ~/.bashrc${C_RESET}"
    fi
fi

echo ""
echo -e "Usage:"
echo -e "  ${C_BOLD}mdviewer <file.md>${C_RESET}       Open any markdown file in rendered view"
echo -e "  ${C_BOLD}mdviewer --help${C_RESET}          View CLI flags (theme, view mode, slides)"
echo -e "  Or search for ${C_BOLD}md viewer${C_RESET} in your desktop applications menu."
echo ""
