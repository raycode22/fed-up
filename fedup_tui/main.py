import argparse
import os
import sys

from . import __version__
from .logging import setup_logging


def parse_args(argv):
    parser = argparse.ArgumentParser(prog="fedup-tui", description="Fed-up terminal installer")
    parser.add_argument("--items", help="Comma-separated item ids to install", default="")
    parser.add_argument("--config", help="Path to data.json", default="")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--noninteractive", action="store_true", help="Non-interactive mode")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv or [])
    logger = setup_logging(verbose=args.verbose)
    logger.info("fedup_tui started version=%s", __version__)

    if not sys.stdin.isatty() and not args.noninteractive:
        print("fedup-tui requires an interactive terminal (or --noninteractive).", file=sys.stderr)
        return 2

    try:
        import curses
    except Exception as exc:  # pragma: no cover
        print(f"curses is unavailable: {exc}", file=sys.stderr)
        return 3

    from .ui import run_ui

    try:
        return run_ui(args, logger)
    except KeyboardInterrupt:
        logger.info("interrupted by user")
        return 130
    except Exception as exc:
        logger.exception("fatal error: %s", exc)
        print(f"Fatal error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
