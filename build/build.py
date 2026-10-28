from __future__ import annotations

import argparse
from pathlib import Path

try:
    from .validator import validate_complete_payload
    from .generator import build_data_payload, write_json
except ImportError:  # pragma: no cover - supports direct script execution
    from validator import validate_complete_payload
    from generator import build_data_payload, write_json


def parse_args(args: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build and validate Fedora automation configuration")
    parser.add_argument("--validate", action="store_true", help="validate configuration without generating output")
    parser.add_argument("--strict", action="store_true", help="require stricter validation rules")
    parser.add_argument("--config-dir", type=Path, default=Path("config"), help="directory containing YAML config files")
    parser.add_argument("--output", type=Path, default=Path("web/data.json"), help="path for the generated JSON dataset")
    return parser.parse_args(args)


import yaml

def main(args: list[str] | None = None) -> int:
    args = parse_args(args)
    config_dir = args.config_dir
    data = validate_complete_payload(config_dir, strict=args.strict)

    if args.validate:
        print(f"Validated {data['item_count']} items across {len(data['categories'])} categories.")
        return 0

    metadata = None
    metadata_path = config_dir.parent / "metadata.yaml" if config_dir.name == "config" else config_dir / "metadata.yaml"
    # also check inside config dir
    if not metadata_path.exists():
        metadata_path = config_dir / "metadata.yaml"
    if metadata_path.exists():
        with metadata_path.open("r", encoding="utf-8") as handle:
            metadata = yaml.safe_load(handle)

    payload = build_data_payload(data["categories"], metadata=metadata)
    write_json(payload, args.output)
    print(f"Generated {args.output} from {len(data['categories'])} config files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
