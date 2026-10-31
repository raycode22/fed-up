import sys
import argparse
from .app import FedUpApp

if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog="fedup-tui", description="Fed-up terminal installer")
    parser.add_argument("--config", help="Path to data.json")
    parser.add_argument("--items", default="", help="Comma-separated list of item ids")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args()
    
    app = FedUpApp(config_path=args.config, items=None)
    raise SystemExit(app.run())