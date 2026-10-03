from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Dict, Iterable, List


REQUIRED_FIELDS = {
    "id",
    "label",
    "description",
    "command",
    "requires_sudo",
    "tested_fedora",
    "depends_on",
    "conflicts_with",
    "tags",
    "status",
    "impact",
    "install_order",
}

ALLOWED_IMPACT = {"low", "medium", "high"}
ALLOWED_STATUS = {"recommended", "optional"}


class ValidationError(ValueError):
    pass


def _ensure_string(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{field_name} must be a non-empty string")
    return value.strip()


def validate_config(data: Dict[str, Any], source_file: str) -> None:
    if not isinstance(data, dict):
        raise ValidationError(f"{source_file}: top-level YAML must be a mapping")

    if "category" not in data or "items" not in data:
        raise ValidationError(f"{source_file}: missing category or items block")

    category = _ensure_string(data["category"], "category")
    label = _ensure_string(data["label"], "label")
    if not label:
        raise ValidationError(f"{source_file}: category label is required")

    items = data["items"]
    if not isinstance(items, list):
        raise ValidationError(f"{source_file}: items must be a list")

    seen_ids: set[str] = set()
    for index, item in enumerate(items, start=1):
        if not isinstance(item, dict):
            raise ValidationError(f"{source_file}: item {index} must be an object")

        missing = sorted(REQUIRED_FIELDS - item.keys())
        if missing:
            raise ValidationError(f"{source_file}: item {index} missing fields: {', '.join(missing)}")

        item_id = _ensure_string(item["id"], f"{source_file} item {index} id")
        if item_id in seen_ids:
            raise ValidationError(f"{source_file}: duplicate item id '{item_id}'")
        seen_ids.add(item_id)

        _ensure_string(item["label"], f"{source_file} item {item_id} label")
        _ensure_string(item["description"], f"{source_file} item {item_id} description")
        _ensure_string(item["command"], f"{source_file} item {item_id} command")

        if not isinstance(item["requires_sudo"], bool):
            raise ValidationError(f"{source_file} item {item_id}: requires_sudo must be a boolean")

        tested = item["tested_fedora"]
        if not isinstance(tested, list) or not tested:
            raise ValidationError(f"{source_file} item {item_id}: tested_fedora must be a non-empty list")

        for version in tested:
            if not isinstance(version, str) or not re.fullmatch(r"\d+", version):
                raise ValidationError(f"{source_file} item {item_id}: invalid Fedora version '{version}'")

        for dep in item["depends_on"]:
            if not isinstance(dep, str) or not dep.strip():
                raise ValidationError(f"{source_file} item {item_id}: invalid dependency '{dep}'")

        for conflict in item["conflicts_with"]:
            if not isinstance(conflict, str) or not conflict.strip():
                raise ValidationError(f"{source_file} item {item_id}: invalid conflict '{conflict}'")

        if item["status"] not in ALLOWED_STATUS:
            raise ValidationError(f"{source_file} item {item_id}: status must be one of {sorted(ALLOWED_STATUS)}")

        if item["impact"] not in ALLOWED_IMPACT:
            raise ValidationError(f"{source_file} item {item_id}: impact must be one of {sorted(ALLOWED_IMPACT)}")

        if not isinstance(item["tags"], list) or not item["tags"]:
            raise ValidationError(f"{source_file} item {item_id}: tags must be a non-empty list")

        if not isinstance(item["install_order"], int):
            raise ValidationError(f"{source_file} item {item_id}: install_order must be an integer")

        if not item["command"].strip().startswith(("sudo ", "curl ", "flatpak ", "wget ", "echo ", "dnf ", "rpm ", "systemctl ", "chsh ", "firewall-cmd ", "git ", "python ")) and "&&" not in item["command"]:
            raise ValidationError(f"{source_file} item {item_id}: command has an unexpected shell pattern")

    return None


def load_yaml_files(config_dir: Path) -> List[Dict[str, Any]]:
    files = sorted(config_dir.glob("*.yaml"))
    if not files:
        raise ValidationError(f"No YAML configuration files found in {config_dir}")

    payload: List[Dict[str, Any]] = []
    for yaml_file in files:
        if yaml_file.name == "metadata.yaml":
            continue
        import yaml  # local import to keep optional dependency loading light

        with yaml_file.open("r", encoding="utf-8") as handle:
            parsed = yaml.safe_load(handle)
        if parsed is None:
            raise ValidationError(f"{yaml_file}: file is empty")
        validate_config(parsed, str(yaml_file))
        payload.append(parsed)

    return payload


def validate_complete_payload(config_dir: Path, strict: bool = False) -> Dict[str, Any]:
    payload = load_yaml_files(config_dir)
    all_items = []
    seen: set[str] = set()

    for category in payload:
        for item in category["items"]:
            item_id = item["id"]
            if item_id in seen:
                raise ValidationError(f"Duplicate item id across configs: {item_id}")
            seen.add(item_id)
            all_items.append(item)

    if len(all_items) < 30:
        raise ValidationError(f"At least 30 items are required; found {len(all_items)}")

    if strict:
        for item in all_items:
            if not item["description"].endswith("."):
                raise ValidationError(f"Strict mode: description must end with a period for '{item['id']}'")

    return {"categories": payload, "item_count": len(all_items)}
