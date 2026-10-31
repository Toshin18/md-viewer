#!/usr/bin/env bash
# ==============================================================================
# md viewer - Linux Universal Uninstaller
# Cleans up all installed binaries, desktop entries, icons, and application data
# ==============================================================================

set -euo pipefail

if [[ -t 1 ]]; then
    C_BLUE="$(printf '\033[1;34m')"
    C_GREEN="$(printf '\033[1;32m')"
    C_RED="$(printf '\033[1;31m')"
    C_BOLD="$(printf '\033[1m')"
    C_RESET="$(printf '\033[0m')"
else
    C_BLUE=''
    C_GREEN=''
    C_RED=''
    C_BOLD=''
    C_RESET=''
fi

log_info()    { echo -e "${C_BLUE}[INFO]${C_RESET} $*"; }
log_success() { echo -e "${C_GREEN}[OK]${C_RESET} $*"; }
log_error()   { echo -e "${C_RED}[ERROR]${C_RESET} $*" >&2; }

MODE="user"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --user)
            MODE="user"
            shift
            ;;
        --system)
            MODE="system"
            shift
            ;;
        -h|--help)
            echo "Usage: ./uninstall.sh [--user | --system]"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

if [[ $EUID -eq 0 && "$MODE" == "user" ]]; then
    MODE="system"
fi

echo -e "${C_BOLD}=== Uninstalling md viewer (${MODE} mode) ===${C_RESET}"

if [[ "$MODE" == "system" ]]; then
    APP_DIR="/opt/mdviewer"
    LAUNCHER="/usr/local/bin/mdviewer"
    DESKTOP_FILE="/usr/share/applications/mdviewer.desktop"
    ICON_FILE="/usr/share/icons/hicolor/scalable/apps/mdviewer.svg"
    DESKTOP_DIR="/usr/share/applications"
    ICON_DIR="/usr/share/icons/hicolor/scalable/apps"
else
    APP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/mdviewer"
    LAUNCHER="${HOME}/.local/bin/mdviewer"
    DESKTOP_FILE="${XDG_DATA_HOME:-$HOME/.local/share}/applications/mdviewer.desktop"
    ICON_FILE="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor/scalable/apps/mdviewer.svg"
    DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
    ICON_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor/scalable/apps"
fi

# Remove application directory
if [[ -d "$APP_DIR" ]]; then
    rm -rf "$APP_DIR"
    log_success "Removed application directory: $APP_DIR"
fi

# Remove launcher wrapper
if [[ -f "$LAUNCHER" ]]; then
    rm -f "$LAUNCHER"
    log_success "Removed executable launcher: $LAUNCHER"
fi

# Remove desktop entry
if [[ -f "$DESKTOP_FILE" ]]; then
    rm -f "$DESKTOP_FILE"
    log_success "Removed desktop entry: $DESKTOP_FILE"
fi

# Remove icon
if [[ -f "$ICON_FILE" ]]; then
    rm -f "$ICON_FILE"
    log_success "Removed icon: $ICON_FILE"
fi

# Refresh desktop & icon databases
if command -v update-desktop-database &>/dev/null; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

if command -v gtk-update-icon-cache &>/dev/null; then
    gtk-update-icon-cache -f -t "$(dirname "$ICON_DIR")" 2>/dev/null || true
fi

echo ""
log_success "${C_BOLD}md viewer has been completely uninstalled.${C_RESET}"
echo ""
