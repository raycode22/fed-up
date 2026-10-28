from __future__ import annotations

import json
import tempfile
from pathlib import Path

import yaml

try:
    from build.validator import validate_complete_payload
except ImportError:  # pragma: no cover
    from validator import validate_complete_payload


ROOT = Path(__file__).resolve().parent.parent


def test_yaml_files_load_and_validate() -> None:
    data = validate_complete_payload(ROOT / "config", strict=False)
    assert data["item_count"] >= 30
    assert len(data["categories"]) >= 4


def test_metadata_yaml_has_required_sections() -> None:
    with open(ROOT / "config" / "metadata.yaml", "r", encoding="utf-8") as handle:
        metadata = yaml.safe_load(handle)
    assert metadata["site"]["name"] == "Fed-up"
    assert metadata["build"]["output_json"] == "web/data.json"


def test_generated_json_matches_schema() -> None:
    import build.build as build_module

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "data.json"
        build_module.main(["--config-dir", str(ROOT / "config"), "--output", str(out)])
        with open(out, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        assert "categories" in payload
        assert "metadata" in payload
        assert sum(len(category["items"]) for category in payload["categories"]) >= 30
        assert [category["label"] for category in payload["categories"]] == [
            "DNF & Repositories",
            "Audio, Video & Codecs",
            "System Tweaks",
            "Development Tools",
        ]
        assert Path(ROOT / "web/assets/logo/Base_fed_up_icon.svg").is_file()


def test_zsh_install_uses_noninteractive_shell_change() -> None:
    data = validate_complete_payload(ROOT / "config")
    zsh_item = next(
        item
        for category in data["categories"]
        for item in category["items"]
        if item["id"] == "zsh"
    )
    assert "usermod --shell" in zsh_item["command"]
    assert "chsh" not in zsh_item["command"]
