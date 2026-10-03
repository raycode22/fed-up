from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List


CATEGORY_ORDER = ("dnf", "multimedia", "tweaks", "development")


def build_data_payload(configs: List[Dict[str, Any]]) -> Dict[str, Any]:
    categories = []
    for config in sorted(
        configs,
        key=lambda entry: CATEGORY_ORDER.index(entry["category"])
        if entry["category"] in CATEGORY_ORDER
        else len(CATEGORY_ORDER),
    ):
        category = {
            "category": config["category"],
            "label": config["label"],
            "items": [],
        }
        for item in sorted(config["items"], key=lambda entry: entry["install_order"]):
            category["items"].append({
                "id": item["id"],
                "label": item["label"],
                "description": item["description"],
                "command": item["command"],
                "requires_sudo": item["requires_sudo"],
                "tested_fedora": item["tested_fedora"],
                "depends_on": item["depends_on"],
                "conflicts_with": item["conflicts_with"],
                "tags": item["tags"],
                "status": item["status"],
                "impact": item["impact"],
                "install_order": item["install_order"],
            })
        categories.append(category)

    return {
        "generated_at": "",
        "categories": categories,
    }


def write_json(payload: Dict[str, Any], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
