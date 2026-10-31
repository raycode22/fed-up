"""Command-line entry point for the Fed-up TUI (``python -m fedup_tui``)."""

from __future__ import annotations

import argparse
import logging
import os
import sys
from pathlib import Path

from .app import FedUpApp
from .catalog import load_catalog


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="fedup-tui",
        description="Fed-up interactive installer for Fedora 43/44",
    )
    parser.add_argument("--config", help="Path to data.json catalog")
    parser.add_argument("--items", default="", help="Comma-separated list of item ids to preselect")
    parser.add_argument("--verbose", action="store_true", help="Start with verbose descriptions enabled")
    parser.add_argument("--log-dir", default=None, help="Directory for diagnostic logs")
    return parser


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
        filename=os.environ.get("FEDUP_LOGFILE"),
    )

    config_path = args.config or str(Path(__file__).resolve().parent / "data.json")
    items: list[dict] = []
    try:
        items = load_catalog(config_path)
    except (OSError, ValueError) as exc:
        print(f"Error loading catalog {config_path}: {exc}", file=sys.stderr)
        return 1

    if args.items:
        wanted = {x.strip() for x in args.items.split(",") if x.strip()}
        items = [it for it in items if it.get("id") in wanted]

    log_dir = Path(args.log_dir) if args.log_dir else None
    app = FedUpApp(items=items, verbose=args.verbose, log_dir=log_dir)
    app.run()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
