#!/usr/bin/env sh
set -eu

echo "Fed-up bootstrapper"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required" >&2
  exit 1
fi

# Install required Python dependencies if not available
for pkg in textual pyyaml; do
  import_name="$pkg"
  if [ "$pkg" = "pyyaml" ]; then
    import_name="yaml"
  fi
  if ! python3 -c "import $import_name" 2>/dev/null; then
    echo "Installing $pkg..." >&2
    python3 -m pip install --quiet "$pkg" || { echo "Failed to install $pkg" >&2; exit 1; }
  fi
done

TMPDIR=$(mktemp -d)
trap "rm -rf \"$TMPDIR\"" EXIT INT TERM

# copy the Python package and data.json into the sandbox
mkdir -p "$TMPDIR/fedup_tui"
cp -r "$(dirname "$0")/../fedup_tui"/* "$TMPDIR/fedup_tui/" 2>/dev/null || true

# Find data.json relative to the script location
DATA_JSON=""
if [ -f "$(dirname "$0")/../web/data.json" ]; then
  DATA_JSON="$(dirname "$0")/../web/data.json"
elif [ -f "$(dirname "$0")/data.json" ]; then
  DATA_JSON="$(dirname "$0")/data.json"
fi

if [ -z "$DATA_JSON" ]; then
  echo "Error: data.json not found. Please ensure it's in the web/ directory." >&2
  exit 1
fi

cp "$DATA_JSON" "$TMPDIR/data.json"

# check for a real terminal before launching the TUI
if [ -t 0 ]; then
  cd "$TMPDIR"
  exec python3 -m fedup_tui --config "$TMPDIR/data.json"
else
  echo "Fed-up needs an interactive terminal (or run with \"./install.sh --help\")." >&2
  exit 2
fi

# be nice – clean temp dir on normal exit
trap "rm -rf \"$TMPDIR\"" EXIT
