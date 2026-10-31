"""Catalog loading and label helpers shared by the TUI screens."""

from __future__ import annotations

import json
import sys
from pathlib import Path

SUPPORTED_FEDORA = ("43", "44")

DESKTOP_LABELS = {"gnome": "GNOME", "kde": "KDE PLASMA", "any": "GENERAL"}

# impact -> risk indicator (never exaggerate ordinary package-manager ops)
RISK_LABELS = {"low": "INFO", "medium": "CAUTION", "high": "WARNING"}

RISK_EXPLANATIONS = {
    "repo": "Adds a third-party software repository; its packages are not vetted by Fedora.",
    "remote-script": "Downloads and executes a script from the internet. Review the URL first.",
    "proprietary": "Installs proprietary software from a third-party source.",
    "system-config": "Changes system configuration or services.",
    "elevated": "Requires sudo/root privileges.",
}


def load_catalog(path: str | Path) -> list[dict]:
    """Load data.json and return a flat item list (category info merged in)."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    items: list[dict] = []
    for cat in data.get("categories", []):
        for it in cat.get("items", []):
            entry = dict(it)
            entry.setdefault("category_label", cat.get("label", cat.get("category", "")))
            entry.setdefault("category", cat.get("category", ""))
            items.append(entry)
    return items


def desktop_tag(item: dict) -> str:
    return DESKTOP_LABELS.get(item.get("desktops", "any"), "GENERAL")


def risk_tag(item: dict) -> str:
    tags = set(item.get("tags") or [])
    kind = item.get("kind", "rpm")
    if kind == "remote-script" or "remote-script" in tags:
        return "WARNING"
    if kind == "repo" or "repo" in tags or "proprietary" in tags:
        return "WARNING" if "proprietary" in tags else "CAUTION"
    if "user-experience" in tags or item.get("impact") == "high":
        return "CAUTION"
    return RISK_LABELS.get(item.get("impact", "low"), "INFO")


def risk_explanation(item: dict) -> str:
    kind = item.get("kind", "rpm")
    tags = set(item.get("tags") or [])
    if kind == "remote-script":
        return RISK_EXPLANATIONS["remote-script"]
    if kind == "repo" or "repo" in tags:
        return RISK_EXPLANATIONS["repo"]
    if "proprietary" in tags:
        return RISK_EXPLANATIONS["proprietary"]
    if "user-experience" in tags:
        return "This changes your login shell; log out and back in afterwards."
    if item.get("requires_sudo"):
        return ""
    return ""


def fedora_ok(item: dict) -> bool:
    supported = item.get("supported_fedora") or item.get("tested_fedora") or []
    return any(v in SUPPORTED_FEDORA for v in supported)


def verbose_text(item: dict) -> str:
    """Multi-line description used in verbose mode / item detail."""
    lines = [item.get("description", "").strip()]
    src = item.get("source_url") or ""
    method = item.get("kind", "rpm")
    lines.append(f"Method: {method}; command: {item.get('command','')}")
    if src:
        lines.append(f"Docs: {src}")
    lines.append(f"Desktop: {desktop_tag(item)}; supported Fedora: {', '.join(item.get('supported_fedora') or item.get('tested_fedora') or [])}")
    if item.get("packages"):
        lines.append("Packages: " + ", ".join(item["packages"]))
    expl = risk_explanation(item)
    if expl:
        lines.append(f"Risk note: {expl}")
    if not fedora_ok(item):
        lines.append("WARNING: not verified for Fedora 43/44.")
    return "\n".join(l for l in lines if l)


def detect_desktop() -> str:
    xdg = (sys.environ.get("XDG_CURRENT_DESKTOP") or "").upper()
    if "GNOME" in xdg:
        return "gnome"
    if "KDE" in xdg or "PLASMA" in xdg:
        return "kde"
    return "any"
