#!/bin/sh
set -eu

echo "Fed-up bootstrapper"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required" >&2
  exit 1
fi

# Install textual if not available
if ! python3 -c "import textual" 2>/dev/null; then
  echo "Installing textual..." >&2
  python3 -m pip install --quiet textual || { echo "Failed to install textual" >&2; exit 1; }
fi

TMPDIR=$(mktemp -d)
trap "rm -rf "$TMPDIR"" EXIT INT TERM

# copy the Python package and data.json into the sandbox (much simpler than base64)
mkdir -p "$TMPDIR/fedup_tui"
cp -r "$(dirname "$0")/../fedup_tui"/* "$TMPDIR/fedup_tui/" 2>/dev/null || true
cp "/home/dev/Development/fed-up/web/data.json" "$TMPDIR/data.json"

# check for a real terminal before launching the TUI
if [ -t 0 ]; then
  cd "$TMPDIR"
  exec python3 -m fedup_tui --config "$TMPDIR/data.json"
else
  echo "Fed-up needs an interactive terminal (or run with "./install.sh --help")." >&2
  exit 2
fi

# be nice – clean temp dir on normal exit
trap "rm -rf "$TMPDIR"" EXIT
