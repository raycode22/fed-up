import base64
import json
import os
from pathlib import Path


def build_bootstrapper(output_path, payload_dir, data_json_path=None):
    files = {}
    for root, _, fs in os.walk(payload_dir):
        for f in fs:
            if f.endswith(".py"):
                p = Path(root) / f
                rel = p.relative_to(payload_dir).as_posix()
                files[rel] = p.read_text(encoding="utf-8")

    payload = base64.b64encode(json.dumps(files).encode()).decode()
    data_b64 = ""
    if data_json_path and os.path.exists(data_json_path):
        data_content = Path(data_json_path).read_text(encoding="utf-8")
        data_b64 = base64.b64encode(data_content.encode()).decode()

    script = (
        "#!/bin/sh\n"
        "set -eu\n\n"
        'echo "Fed-up bootstrapper"\n'
        "if ! command -v python3 >/dev/null 2>&1; then\n"
        '  echo "python3 is required" >&2\n'
        "  exit 1\n"
        "fi\n\n"
        "TMPDIR=$(mktemp -d)\n"
        'trap \'rm -rf "$TMPDIR"\' EXIT INT TERM\n\n'
        'mkdir -p "$TMPDIR/fedup_tui"\n'
        'python3 - "$TMPDIR/fedup_tui" "' + data_b64 + '" <<' + "'PY'" + "\n"
        "import base64, json, sys, os\n"
        f'data = base64.b64decode("{payload}")\n'
        "files = json.loads(data)\n"
        "base = sys.argv[1]\n"
        "for rel, content in files.items():\n"
        "    path = os.path.join(base, rel)\n"
        "    os.makedirs(os.path.dirname(path), exist_ok=True)\n"
        '    with open(path, "w", encoding="utf-8") as f:\n'
        "        f.write(content)\n"
        "data_b64 = sys.argv[2] if len(sys.argv) > 2 else ''\n"
        "if data_b64:\n"
        "    with open(os.path.join(os.path.dirname(base), 'data.json'), 'w', encoding='utf-8') as f:\n"
        "        f.write(base64.b64decode(data_b64).decode())\n"
        "PY\n\n"
        'cd "$TMPDIR"\n'
    )
    if data_b64:
        script += 'python3 -m fedup_tui --config "$TMPDIR/data.json" "$@"\n'
    else:
        script += 'python3 -m fedup_tui "$@"\n'

    Path(output_path).write_text(script, encoding="utf-8")
    os.chmod(output_path, 0o755)
    return output_path


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", required=True)
    ap.add_argument("--payload-dir", default="fedup_tui")
    ap.add_argument("--data-json", default=None)
    ns = ap.parse_args()
    build_bootstrapper(ns.output, ns.payload_dir, ns.data_json)
    print(f"Generated {ns.output}")
