#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Fed-up Post-Install Script Generator - Shell Wrapper
# =============================================================================
# Target: Fedora 43/44
# Package Manager: dnf5 exclusive
# =============================================================================

RED="[0;31m"
GREEN="[0;32m"
YELLOW="[1;33m"
CYAN="[0;36m"
NC="[0m"

# Consent prompt
display_banner() {
  clear
  cat << "BANNER"
=================================================================
          Fed-up Post-Install Script Generator
=================================================================
  This script will generate a custom Fedora Linux post-installation
  shell script. It will bootstrap required dependencies (python3
  and Charm's gum TUI tool) and then present a TUI for selecting
  packages, codecs, development tools, and system tweaks.

  The generated script uses dnf5 exclusively (no legacy yum).
  Selected packages will be installed via sudo privileges.

  Required dependencies to bootstrap:
  - python3 (for the Python payload execution)
  - gum (Charm TUI for interactive prompts and progress spinners)

  Proceed with dependency bootstrapping and script generation?
BANNER
}

echo ""
display_banner

while true; do
  read -rp "  Proceed? [Y/n]: " yn
  case "${yn:-Y}" in
    [Yy]*) echo "Proceeding..."; break ;;
    [Nn]*) echo "Aborted."; exit 1 ;;
    *) echo "Please answer yes (Y) or no (n)." ;;
  esac
done

# =============================================================================
# Elevated Bootstrapper: Install python3 and gum if not present
# =============================================================================

check_and_bootstrap() {
  if ! command -v python3 &>/dev/null; then
    echo -e "${CYAN}Bootstrapping python3...${NC}"
    sudo dnf5 install -y python3 2>/dev/null || {
      echo -e "${RED}Failed to install python3. Aborting.${NC}"
      exit 1
    }
  fi

  if ! command -v gum &>/dev/null; then
    echo -e "${CYAN}Bootstrapping gum (Charm TUI)...${NC}"
    sudo dnf5 install -y gum 2>/dev/null || {
      echo -e "${RED}Failed to install gum. Aborting.${NC}"
      exit 1
    }
  fi
}

check_and_bootstrap

# =============================================================================
# Python Payload Generation (single-quoted heredoc)
# =============================================================================

PYTEMP=$(mktemp /tmp/fed-up-payload-XXXXXX)

trap 'rm -f "$PYTEMP"' EXIT INT TERM

cat << 'PYEOF' > "$PYTEMP"
#!/usr/bin/env python3
import sys
import subprocess
import json
import signal
import os
import argparse

parser = argparse.ArgumentParser(description="Fed-up Post-Install Payload")
parser.add_argument("--metadata", required=True, help="JSON metadata")
args = parser.parse_args()

try:
    metadata = json.loads(args.metadata)
except json.JSONDecodeError:
    print("Invalid metadata JSON")
    sys.exit(1)

fedora_version = "44"
try:
    with open("/etc/os-release", "r") as f:
        release_info = f.read()
    for line in release_info.split("
"):
        if line.startswith("VERSION_ID="):
            fedora_version = line.split("=")[1].strip('"')
            break
except Exception:
    pass

def detect_desktop():
    desktop = os.environ.get("XDG_CURRENT_DESKTOP", "")
    if "GNOME" in desktop or "ubuntu:GNOME" in desktop:
        return "gnome"
    elif "KDE" in desktop or "KDE neon" in desktop:
        return "kde"
    elif "XFCE" in desktop:
        return "xfce"
    return "any"

desktop = detect_desktop()

selected_packages = metadata.get("selected", [])
categories = metadata.get("categories", [])

print(f"Fed-up Python Payload starting...")
print(f"Fedora release: {fedora_version}")
print(f"Desktop environment: {desktop}")
print(f"Selected packages: {len(selected_packages)}")

installed = []
failed = []

for pkg_info in selected_packages:
    pkg_id = pkg_info.get("id", "")
    cmd = pkg_info.get("command", "")
    
    if not cmd:
        continue
    
    try:
        print(f"Installing {pkg_id}...")
        result = subprocess.run(
            cmd,
            shell=True,
            check=True,
            text=True,
            capture_output=True
        )
        installed.append(pkg_id)
        print(f"  ✓ {pkg_id} installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"  ✗ {pkg_id} failed: {e.stderr[:200]}")
        failed.append((pkg_id, e.stderr[:200]))

print("
")
print(f"Installed: {len(installed)} packages")
if failed:
    print(f"Failed: {len(failed)} packages")
    for pid, err in failed[:5]:
        print(f"  - {pid}: {err}")

print("Fed-up Python Payload complete.")
PYEOF

# Execute the Python payload
python3 "$PYTEMP" --metadata "${CATALOG_JSON:-{}}"

rm -f "$PYTEMP"

echo -e "${GREEN}Fed-up script generation and execution complete.${NC}"
