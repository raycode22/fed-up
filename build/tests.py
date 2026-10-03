from __future__ import annotations

import json
from pathlib import Path

import yaml

try:
    from build.validator import validate_complete_payload
except ImportError:  # pragma: no cover
    from validator import validate_complete_payload


def test_yaml_files_load_and_validate() -> None:
    data = validate_complete_payload(Path("config"), strict=False)
    assert data["item_count"] >= 30
    assert len(data["categories"]) >= 4


def test_metadata_yaml_has_required_sections() -> None:
    with open("config/metadata.yaml", "r", encoding="utf-8") as handle:
        metadata = yaml.safe_load(handle)
    assert metadata["site"]["name"] == "Fed-up"
    assert metadata["build"]["output_json"] == "web/data.json"


def test_generated_json_matches_schema() -> None:
    import build.build as build_module

    build_module.main([])
    with open("web/data.json", "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    assert "categories" in payload
    assert sum(len(category["items"]) for category in payload["categories"]) >= 30
    assert [category["label"] for category in payload["categories"]] == [
        "DNF & Repositories",
        "Audio, Video & Codecs",
        "System Tweaks",
        "Development Tools",
    ]
