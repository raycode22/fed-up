from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Dict, List


REQUIRED_FIELDS = {
    "id", "label", "description", "command", "requires_sudo",
    "tested_fedora", "depends_on", "conflicts_with", "tags",
    "status", "impact", "install_order",
}

ALLOWED_IMPACT = {"low", "medium", "high"}
ALLOWED_STATUS = {"recommended", "optional"}
ALLOWED_DESKTOPS = {"any", "gnome", "kde"}
ALLOWED_ARCH = {"any", "x86_64", "aarch64"}
ALLOWED_KINDS = {"rpm", "repo", "setting", "service", "flatpak", "remote-script"}
DEPRECATED_DNF_FLAGS = {"--add-repo", "--set-disabled", "--save"}


class ValidationError(ValueError):
    pass


def _ensure_string(value, field_name):
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{field_name} must be a non-empty string")
    return value.strip()


def _check_deprecated_flags(command, item_id, source_file):
    for flag in DEPRECATED_DNF_FLAGS:
        if flag in command:
            raise ValidationError(f"{source_file} item {item_id}: deprecated DNF4 flag '{flag}'")
    if "dnf-plugins-core" in command:
        raise ValidationError(f"{source_file} item {item_id}: use dnf5-plugins")


def validate_config(data, source_file):
    if not isinstance(data, dict):
        raise ValidationError(f"{source_file}: top-level YAML must be a mapping")
    if "category" not in data or "items" not in data:
        raise ValidationError(f"{source_file}: missing category or items block")
    _ensure_string(data["category"], "category")
    _ensure_string(data["label"], "label")
    items = data["items"]
    if not isinstance(items, list):
        raise ValidationError(f"{source_file}: items must be a list")
    seen_ids = set()
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
        command = _ensure_string(item["command"], f"{source_file} item {item_id} command")
        if not isinstance(item["requires_sudo"], bool):
            raise ValidationError(f"{source_file} item {item_id}: requires_sudo must be a boolean")
        tested = item["tested_fedora"]
        if not isinstance(tested, list) or not tested:
            raise ValidationError(f"{source_file} item {item_id}: tested_fedora must be a non-empty list")
        for version in tested:
            if not isinstance(version, str) or not re.fullmatch(r"\d+", version):
                raise ValidationError(f"{source_file} item {item_id}: invalid Fedora version '{version}'")
        if "supported_fedora" in item:
            sf = item["supported_fedora"]
            if not isinstance(sf, list) or not sf:
                raise ValidationError(f"{source_file} item {item_id}: supported_fedora must be a non-empty list")
        if "desktops" in item and item["desktops"] not in ALLOWED_DESKTOPS:
            raise ValidationError(f"{source_file} item {item_id}: invalid desktops")
        if "arch" in item:
            a = item["arch"]
            if isinstance(a, str):
                if a not in ALLOWED_ARCH:
                    raise ValidationError(f"{source_file} item {item_id}: invalid arch")
            elif isinstance(a, list):
                for x in a:
                    if x not in ALLOWED_ARCH:
                        raise ValidationError(f"{source_file} item {item_id}: invalid arch")
            else:
                raise ValidationError(f"{source_file} item {item_id}: invalid arch")
        if "kind" in item and item["kind"] not in ALLOWED_KINDS:
            raise ValidationError(f"{source_file} item {item_id}: invalid kind")
        if "packages" in item and not isinstance(item["packages"], list):
            raise ValidationError(f"{source_file} item {item_id}: packages must be a list")
        if "verified_on" in item and not isinstance(item["verified_on"], str):
            raise ValidationError(f"{source_file} item {item_id}: verified_on must be a string")
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
        kind = item.get("kind", "rpm")
        if "curl" in command and "| sh" in command and kind != "remote-script":
            raise ValidationError(f"{source_file} item {item_id}: remote-script pipe requires kind: remote-script")
        _check_deprecated_flags(command, item_id, source_file)
    return None


def load_yaml_files(config_dir):
    files = sorted(config_dir.glob("*.yaml"))
    if not files:
        raise ValidationError(f"No YAML configuration files found in {config_dir}")
    payload = []
    for yaml_file in files:
        if yaml_file.name == "metadata.yaml":
            continue
        import yaml
        with yaml_file.open("r", encoding="utf-8") as handle:
            parsed = yaml.safe_load(handle)
        if parsed is None:
            raise ValidationError(f"{yaml_file}: file is empty")
        validate_config(parsed, str(yaml_file))
        payload.append(parsed)
    return payload


def validate_complete_payload(config_dir, strict=False):
    payload = load_yaml_files(config_dir)
    all_items = []
    seen = set()
    id_to_item = {}
    for category in payload:
        for item in category["items"]:
            item_id = item["id"]
            if item_id in seen:
                raise ValidationError(f"Duplicate item id across configs: {item_id}")
            seen.add(item_id)
            all_items.append(item)
            id_to_item[item_id] = item
    for item in all_items:
        for dep in item["depends_on"]:
            if dep not in id_to_item:
                raise ValidationError(f"Unknown dependency '{dep}' for '{item['id']}'")
        for c in item["conflicts_with"]:
            if c not in id_to_item:
                raise ValidationError(f"Unknown conflict '{c}' for '{item['id']}'")
    for item in all_items:
        for c in item["conflicts_with"]:
            if item["id"] not in id_to_item[c]["conflicts_with"]:
                raise ValidationError(f"Conflicts not symmetric: '{item['id']}' vs '{c}'")
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {i["id"]: WHITE for i in all_items}
    def dfs(node, stack):
        color[node] = GRAY
        stack.append(node)
        for dep in id_to_item[node]["depends_on"]:
            if color[dep] == GRAY:
                raise ValidationError(f"Dependency cycle detected: {' -> '.join(stack + [dep])}")
            if color[dep] == WHITE:
                dfs(dep, stack)
        stack.pop()
        color[node] = BLACK
    for item in all_items:
        if color[item["id"]] == WHITE:
            dfs(item["id"], [])
    if strict:
        for item in all_items:
            if not item["description"].endswith("."):
                raise ValidationError(f"Strict mode: description must end with a period for '{item['id']}'")
    return {"categories": payload, "item_count": len(all_items)}
