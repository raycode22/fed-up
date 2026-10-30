#!/usr/bin/env python3
"""Build an tiny install.sh that bootstraps the Fed-up curses TUI."""

import base64
import json
import os
import sys
from pathlib import Path


def needs_curses():
    try:
        import curses
        return False
    except ImportError:
        return True


def build_bootstrapper(output_path: Path, payload_dir: Path,
                       data_json_path: Path) -> None:
    files = {}
    for root, _, fs in os.walk(payload_dir):
        for f in fs:
            if f.endswith(".py"):
                p = Path(root) / f
                rel = p.relative_to(payload_dir).as_posix()
                files[rel] = p.read_text(encoding="utf-8")

    script_lines = [
        "#!/bin/sh",
        "set -eu",
        "",
        "echo \"Fed-up bootstrapper\"",
        "",
        'if ! command -v python3 >/dev/null 2>&1; then',
        '  echo "python3 is required" >&2',
        "  exit 1",
        "fi",
        "",
        "TMPDIR=$(mktemp -d)",
        'trap "rm -rf \"$TMPDIR\"" EXIT INT TERM',
        "",
        "mkdir -p \"$TMPDIR/fedup_tui\"",
        '# copy the real data.json into the sandbox (much simpler than base64)',
        f'cp "{Path("web/data.json").resolve()}" "$TMPDIR/data.json"',
        "",
        "# check for a real terminal before launching the TUI",
        'if [ -t 0 ]; then',
        '  exec python3 -m fedup_tui --config "$TMPDIR/data.json"',
        "else",
        '  echo "Fed-up needs an interactive terminal (or run with \"./install.sh --help\")." >&2',
        '  exit 2',
        "fi",
        "",
        '# be nice – clean temp dir on normal exit',
        'trap "rm -rf \"$TMPDIR\"" EXIT',
    ]

    script = "\n".join(script_lines) + "\n"
    output_path.write_text(script, encoding="utf-8")
    os.chmod(output_path, 0o755)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Fed-up bootstrapper builder")
    parser.add_argument("--output", required=True,
                        help="path for the generated install.sh")
    parser.add_argument("--payload-dir", default="fedup_tui",
                        help="directory containing the Python package")
    parser.add_argument("--data-json", required=True,
                        help="path to web/data.json (the generated config)")

    ns = parser.parse_args()

    if needs_curses():
        sys.stderr.write("Error: this Python build lacks curses support.\n")
        sys.exit(1)

    data_json_path = Path(ns.data_json)
    if not data_json_path.is_file():
        sys.stderr.write(f"Error: {data_json_path} not found.\n")
        sys.exit(1)

    build_bootstrapper(Path(ns.output), Path(ns.payload_dir), data_json_path)
    print(f"Generated {ns.output}")


