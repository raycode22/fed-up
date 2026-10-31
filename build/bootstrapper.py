#!/usr/bin/env python3
"""Build a self-contained, POSIX-compatible install.sh for the Fed-up TUI.

The generated script embeds:
  * the fedup_tui Python package (base64 JSON payload)
  * the selected data.json catalog
so it runs on any machine with Python >= 3.10 — no repo checkout, no
external files, and no dependence on the user's interactive shell (Bash,
Zsh or plain sh all work because the script is pure POSIX).

It prepares its own virtual environment, installs pinned dependencies,
verifies them, and only then launches the Textual TUI.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
import sys
from pathlib import Path

TEXTUAL_PIN = "1.0.0"
FEDUP_VERSION = "2.0.0"
_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")


def collect_payload(payload_dir: Path, data_json_path: Path) -> dict[str, str]:
    """Return {relative-path: file-content} for the embedded payload."""
    files: dict[str, str] = {}
    for root, _, fs in os_walk(payload_dir):
        for f in sorted(fs):
            if not f.endswith(".py"):
                continue
            p = Path(root) / f
            rel = p.relative_to(payload_dir).as_posix()
            files[f"fedup_tui/{rel}"] = p.read_text(encoding="utf-8")
    if not any(k.startswith("fedup_tui/__main__.py") for k in files):
        raise ValueError("payload directory must contain __main__.py")
    files["data.json"] = data_json_path.read_text(encoding="utf-8")
    return files


def os_walk(directory: Path):
    import os

    for root, dirs, fs in os.walk(directory):
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        yield root, dirs, fs


def validate_selected_ids(ids: list[str]) -> list[str]:
    clean = []
    for i in ids:
        i = i.strip()
        if not i:
            continue
        if not _ID_RE.match(i):
            raise ValueError(f"Invalid item id refused: {i!r}")
        clean.append(i)
    return sorted(set(clean))


def build_bootstrapper(output_path: Path, payload_dir: Path,
                       data_json_path: Path,
                       selected_ids: list[str] | None = None) -> str:
    template = (Path(__file__).parent / "bootstrap_template.py").read_text(
        encoding="utf-8")

    files = collect_payload(payload_dir, data_json_path)
    payload_bytes = json.dumps(files, sort_keys=True).encode("utf-8")
    payload_b64 = base64.b64encode(payload_bytes).decode("ascii")
    # wrap base64 at 76 chars so heredocs and diff tools stay happy
    payload_wrapped = "\n".join(
        payload_b64[i:i + 76] for i in range(0, len(payload_b64), 76))

    digest = hashlib.sha256(payload_bytes).hexdigest()[:16]
    ids = validate_selected_ids(selected_ids or [])
    selected = " ".join(ids)
    if "'" in selected:  # defensive; regex already prevents this
        raise ValueError("unsafe characters in selection")

    script = (
        template
        .replace("@@VERSION@@", FEDUP_VERSION)
        .replace("@@SELECTED@@", selected)
        .replace("@@HASH@@", digest)
        .replace("@@TEXTUAL_PIN@@", TEXTUAL_PIN)
        .replace("@@PAYLOAD_B64@@", payload_wrapped)
    )
    output_path.write_text(script, encoding="utf-8")
    output_path.chmod(0o755)
    return script


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Fed-up bootstrapper builder")
    parser.add_argument("--output", required=True, help="path for install.sh")
    parser.add_argument("--payload-dir", default="fedup_tui")
    parser.add_argument("--data-json", required=True)
    parser.add_argument("--selected", default="",
                        help="comma-separated item ids to preselect")
    ns = parser.parse_args(argv)

    data_json_path = Path(ns.data_json)
    if not data_json_path.is_file():
        sys.stderr.write(f"Error: {data_json_path} not found.\n")
        return 1
    try:
        build_bootstrapper(Path(ns.output), Path(ns.payload_dir),
                           data_json_path,
                           ns.selected.split(",") if ns.selected else [])
    except ValueError as exc:
        sys.stderr.write(f"Error: {exc}\n")
        return 1
    print(f"Generated {ns.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
