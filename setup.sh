#!/usr/bin/env bash
set -euo pipefail

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
NC="\033[0m"

display_banner() {
  clear
  cat << "BANNER"
=================================================================
          Fedora Post-Install Script
=================================================================
  This script performs Fedora post-installation tasks selected by you.
  It bootstraps python3 and Charm gum, then runs an interactive TUI.

  Required dependencies to bootstrap:
  - python3 (for the Python payload execution)
  - gum (Charm TUI for interactive prompts and progress spinners)

  Proceed with dependency bootstrapping?
BANNER
}

echo ""
display_banner

while true; do
  read -rp "  Proceed? [Y/n]: " yn
  case "Y" in
    [Yy]*) echo "Proceeding..."; break ;;
    [Nn]*) echo "Aborted."; exit 1 ;;
    *) echo "Please answer yes (Y) or no (n)." ;;
  esac
done

if ! command -v python3 >/dev/null 2>&1 || ! command -v gum >/dev/null 2>&1; then
  sudo dnf5 install -y python3 gum || {
    if ! command -v gum >/dev/null 2>&1; then
      sudo dnf5 config-manager addrepo --from-repofile=https://repo.charm.sh/yum/fedora/charm.repo 2>/dev/null || true
      sudo dnf5 install -y gum || { echo "gum unavailable; falling back to release binary"; curl -fsSL https://github.com/charmbracelet/gum/releases/latest/download/gum_Linux_x86_64.tar.gz | tar -xz -C /tmp; sudo install /tmp/gum /usr/local/bin/gum; }
    fi
  }
fi

PYTEMP=$(mktemp /tmp/fed-up-payload-XXXXXX)

trap 'rm -f "$PYTEMP"' EXIT INT TERM

cat << 'EOF' > "$PYTEMP"
#!/usr/bin/env python3
import argparse, base64, json, os, subprocess, sys

parser = argparse.ArgumentParser(description="Fedora Post-Install Payload")
parser.add_argument("--metadata", required=True, help="Base64-encoded JSON metadata")
parser.add_argument("--mode", default="setup", help="Script mode")
args = parser.parse_args()

try:
    metadata = json.loads(base64.b64decode(args.metadata).decode("utf-8"))
except Exception as e:
    print(f"Invalid metadata: {e}")
    sys.exit(1)

fedora_version = "44"
try:
    with open("/etc/os-release", "r") as f:
        for line in f:
            if line.startswith("VERSION_ID="):
                fedora_version = line.split("=")[1].strip().strip(chr(34))
                break
except Exception:
    pass

def detect_desktop():
    desktop = os.environ.get("XDG_CURRENT_DESKTOP", "")
    if "GNOME" in desktop:
        return "gnome"
    if "KDE" in desktop:
        return "kde"
    if "XFCE" in desktop:
        return "xfce"
    return "any"

desktop = detect_desktop()

catalog = metadata.get("catalog", [])
selected_ids = metadata.get("selected", [])
by_id = {item["id"]: item for item in catalog if isinstance(item, dict)}
mode = args.mode or metadata.get("mode", "setup")

STATE_FILE = "/var/lib/fed-up/installed.json"

def gum_style(title, body):
    try:
        subprocess.run(["gum", "style", "--border", "rounded", "--padding", "1 2", "--margin", "1 0", title, body], check=True, text=True)
    except subprocess.CalledProcessError as e:
        print(f"gum style failed: {e}")

def gum_choose(options):
    if not options:
        return []
    try:
        result = subprocess.run(["gum", "choose", "--no-limit"] + options, check=True, text=True, capture_output=True)
        return [line.strip() for line in result.stdout.splitlines() if line.strip()]
    except subprocess.CalledProcessError as e:
        print(f"gum choose failed: {e}")
        return []

def run_dnf(cmd):
    try:
        subprocess.run(cmd, shell=True, check=True, text=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {cmd}\n{e}")
        return False

print(f"Fedora Post-Install Script - mode: {mode}")
print(f"Fedora release: {fedora_version}")
print(f"Desktop: {desktop}")

gum_style("Fedora Post-Install", f"Mode: {mode} Selected: {len(selected_ids)}")

if mode == "setup":
    if not selected_ids:
        opts = [f"{it['id']} - {it.get('label','')}" for it in catalog]
        picks = gum_choose(opts)
        selected_ids = [p.split(" - ", 1)[0] for p in picks]
    byid = by_id
    expanded = set(selected_ids)
    queue = list(selected_ids)
    while queue:
        cur = queue.pop(0)
        item = byid.get(cur)
        if not item:
            continue
        for dep in item.get("depends_on", []):
            if dep not in expanded:
                expanded.add(dep)
                queue.append(dep)
    ordered = []
    remaining = set(expanded)
    changed = True
    while remaining and changed:
        changed = False
        for rid in sorted(remaining):
            item = byid.get(rid)
            deps = set(item.get("depends_on", [])) if item else set()
            if deps.issubset(set(ordered)):
                ordered.append(rid)
                remaining.discard(rid)
                changed = True
    ordered.extend(sorted(remaining))
    newly = []
    for rid in ordered:
        item = byid.get(rid)
        if not item:
            continue
        cmd = item.get("command", "")
        if not cmd:
            continue
        gum_style("Installing", item.get("label", rid))
        spinner = subprocess.run(["gum", "spin", "--spinner", "dot", "--title", f"Installing {rid}...", "--", "bash", "-c", cmd], text=True)
        if spinner.returncode == 0:
            newly.append(rid)
            print(f"  installed {rid}")
        else:
            print(f"  failed {rid}")
    try:
        os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
        with open(STATE_FILE, "w") as f:
            json.dump({"newly_installed": newly}, f)
    except Exception as e:
        print(f"Could not write state: {e}")
    print(f"Installed {len(newly)} packages.")

elif mode == "cleanup":
    gum_style("Cleanup", "Cleaning caches and unused deps")
    run_dnf("sudo dnf5 clean all")
    run_dnf("sudo dnf5 autoremove -y")
    print("Cleanup complete.")

elif mode == "revert":
    newly = []
    try:
        with open(STATE_FILE) as f:
            newly = json.load(f).get("newly_installed", [])
    except Exception:
        newly = []
    gum_style("Revert", f"Removing {len(newly)} recorded packages")
    if newly:
        pkgs = " ".join(newly)
        run_dnf(f"sudo dnf5 remove -y {pkgs}")
    else:
        print("No recorded packages to revert.")
    print("Revert complete.")

else:
    print(f"Unknown mode: {mode}")
    sys.exit(1)
EOF

python3 "$PYTEMP" --metadata 'eyJtb2RlIjoic2V0dXAiLCJzZWxlY3RlZCI6W10sImNhdGFsb2ciOlt7ImlkIjoicnBtZnVzaW9uLWZyZWUiLCJjYXRlZ29yeSI6ImRuZiIsImxhYmVsIjoiUlBNIEZ1c2lvbiAoZnJlZSkiLCJkZXNjcmlwdGlvbiI6IkVuYWJsZSBSUE0gRnVzaW9uIGZyZWUgcmVwb3NpdG9yeS4iLCJkZXNrdG9wcyI6ImFueSIsInN1cHBvcnRlZF9mZWRvcmEiOltdLCJkZXBlbmRzX29uIjpbXSwiY29uZmxpY3RzX3dpdGgiOltdLCJzdGF0dXMiOiJyZWNvbW1lbmRlZCIsImNvbW1hbmQiOiJzdWRvIGRuZjUgaW5zdGFsbCAteSBodHRwczovL21pcnJvcnMucnBtZnVzaW9uLm9yZy9mcmVlL2ZlZG9yYS9ycG1mdXNpb24tZnJlZS1yZWxlYXNlLSQocnBtIC1FICVmZWRvcmEpLm5vYXJjaC5ycG0iLCJ0YWdzIjpbInJlcG8iXX0seyJpZCI6InJwbWZ1c2lvbi1ub25mcmVlIiwiY2F0ZWdvcnkiOiJkbmYiLCJsYWJlbCI6IlJQTSBGdXNpb24gKG5vbmZyZWUpIiwiZGVzY3JpcHRpb24iOiJFbmFibGUgUlBNIEZ1c2lvbiBub25mcmVlIHJlcG9zaXRvcnkuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6WyJycG1mdXNpb24tZnJlZSJdLCJjb25mbGljdHNfd2l0aCI6W10sInN0YXR1cyI6Im9wdGlvbmFsIiwiY29tbWFuZCI6InN1ZG8gZG5mNSBpbnN0YWxsIC15IGh0dHBzOi8vbWlycm9ycy5ycG1mdXNpb24ub3JnL25vbmZyZWUvZmVkb3JhL3JwbWZ1c2lvbi1ub25mcmVlLXJlbGVhc2UtJChycG0gLUUgJWZlZG9yYSkubm9hcmNoLnJwbSIsInRhZ3MiOlsicmVwbyJdfSx7ImlkIjoiZmxhdGh1YiIsImNhdGVnb3J5IjoiZG5mIiwibGFiZWwiOiJGbGF0aHViIiwiZGVzY3JpcHRpb24iOiJBZGQgRmxhdGh1YiByZW1vdGUgZm9yIEZsYXRwYWsuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6W10sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoicmVjb21tZW5kZWQiLCJjb21tYW5kIjoiZmxhdHBhayByZW1vdGUtYWRkIC0taWYtbm90LWV4aXN0cyBmbGF0aHViIGh0dHBzOi8vZmxhdGh1Yi5vcmcvcmVwby9mbGF0aHViLmZsYXRwYWtyZXBvIiwidGFncyI6WyJyZXBvIl19LHsiaWQiOiJjb2RlY3MiLCJjYXRlZ29yeSI6Im11bHRpbWVkaWEiLCJsYWJlbCI6Ik11bHRpbWVkaWEgY29kZWNzIiwiZGVzY3JpcHRpb24iOiJJbnN0YWxsIGZ1bGwgbXVsdGltZWRpYSBjb2RlYyBzZXQuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6WyJycG1mdXNpb24tZnJlZSIsInJwbWZ1c2lvbi1ub25mcmVlIl0sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoicmVjb21tZW5kZWQiLCJjb21tYW5kIjoic3VkbyBkbmY1IGluc3RhbGwgLXkgZ3N0cmVhbWVyMS1wbHVnaW5zLXtiYWQtKixnb29kLSosYmFzZX0gZ3N0cmVhbWVyMS1wbHVnaW4tb3BlbmgyNjQgZ3N0cmVhbWVyMS1saWJhdiAtLWV4Y2x1ZGU9Z3N0cmVhbWVyMS1wbHVnaW5zLWJhZC1mcmVlLWRldmVsIiwidGFncyI6WyJjb2RlY3MiXX0seyJpZCI6ImZmbXBlZyIsImNhdGVnb3J5IjoibXVsdGltZWRpYSIsImxhYmVsIjoiRkZtcGVnIiwiZGVzY3JpcHRpb24iOiJGRm1wZWcgd2l0aCBmdWxsIGNvZGVjIHN1cHBvcnQuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6WyJycG1mdXNpb24tZnJlZSIsInJwbWZ1c2lvbi1ub25mcmVlIl0sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoib3B0aW9uYWwiLCJjb21tYW5kIjoic3VkbyBkbmY1IGluc3RhbGwgLXkgZmZtcGVnIiwidGFncyI6WyJtZWRpYSJdfSx7ImlkIjoidmxjIiwiY2F0ZWdvcnkiOiJtdWx0aW1lZGlhIiwibGFiZWwiOiJWTEMiLCJkZXNjcmlwdGlvbiI6IlZMQyBtZWRpYSBwbGF5ZXIuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6W10sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoib3B0aW9uYWwiLCJjb21tYW5kIjoic3VkbyBkbmY1IGluc3RhbGwgLXkgdmxjIiwidGFncyI6WyJtZWRpYSJdfSx7ImlkIjoibXVsdGltZWRpYS1ncm91cCIsImNhdGVnb3J5IjoibXVsdGltZWRpYSIsImxhYmVsIjoiTXVsdGltZWRpYSBncm91cCB1cGRhdGUiLCJkZXNjcmlwdGlvbiI6IlVwZGF0ZSB0aGUgbXVsdGltZWRpYSBwYWNrYWdlIGdyb3VwLiIsImRlc2t0b3BzIjoiYW55Iiwic3VwcG9ydGVkX2ZlZG9yYSI6W10sImRlcGVuZHNfb24iOlsicnBtZnVzaW9uLWZyZWUiXSwiY29uZmxpY3RzX3dpdGgiOltdLCJzdGF0dXMiOiJyZWNvbW1lbmRlZCIsImNvbW1hbmQiOiJzdWRvIGRuZjUgdXBkYXRlIEBtdWx0aW1lZGlhIiwidGFncyI6WyJncm91cCJdfSx7ImlkIjoiZGV2LXRvb2xzIiwiY2F0ZWdvcnkiOiJkZXZlbG9wbWVudCIsImxhYmVsIjoiRGV2ZWxvcG1lbnQgdG9vbHMiLCJkZXNjcmlwdGlvbiI6IkJhc2UgZGV2ZWxvcG1lbnQgdG9vbGNoYWluLiIsImRlc2t0b3BzIjoiYW55Iiwic3VwcG9ydGVkX2ZlZG9yYSI6W10sImRlcGVuZHNfb24iOltdLCJjb25mbGljdHNfd2l0aCI6W10sInN0YXR1cyI6InJlY29tbWVuZGVkIiwiY29tbWFuZCI6InN1ZG8gZG5mNSBncm91cCBpbnN0YWxsIC15IFwiRGV2ZWxvcG1lbnQgVG9vbHNcIiIsInRhZ3MiOlsiZGV2Il19LHsiaWQiOiJnaXQiLCJjYXRlZ29yeSI6ImRldmVsb3BtZW50IiwibGFiZWwiOiJHaXQiLCJkZXNjcmlwdGlvbiI6IkdpdCB2ZXJzaW9uIGNvbnRyb2wuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6W10sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoicmVjb21tZW5kZWQiLCJjb21tYW5kIjoic3VkbyBkbmY1IGluc3RhbGwgLXkgZ2l0IiwidGFncyI6WyJkZXYiXX0seyJpZCI6Im5vZGVqcyIsImNhdGVnb3J5IjoiZGV2ZWxvcG1lbnQiLCJsYWJlbCI6Ik5vZGUuanMiLCJkZXNjcmlwdGlvbiI6Ik5vZGUuanMgTFRTIHJ1bnRpbWUuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6W10sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoib3B0aW9uYWwiLCJjb21tYW5kIjoic3VkbyBkbmY1IGluc3RhbGwgLXkgbm9kZWpzIiwidGFncyI6WyJkZXYiXX0seyJpZCI6InB5dGhvbi1kZXYiLCJjYXRlZ29yeSI6ImRldmVsb3BtZW50IiwibGFiZWwiOiJQeXRob24gZGV2IiwiZGVzY3JpcHRpb24iOiJQeXRob24gMyBkZXZlbG9wbWVudCBoZWFkZXJzIGFuZCBwaXAuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6W10sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoib3B0aW9uYWwiLCJjb21tYW5kIjoic3VkbyBkbmY1IGluc3RhbGwgLXkgcHl0aG9uMy1kZXZlbCBweXRob24zLXBpcCIsInRhZ3MiOlsiZGV2Il19LHsiaWQiOiJ2c2NvZGUiLCJjYXRlZ29yeSI6ImRldmVsb3BtZW50IiwibGFiZWwiOiJWUyBDb2RlIiwiZGVzY3JpcHRpb24iOiJWaXN1YWwgU3R1ZGlvIENvZGUuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6WyJycG1mdXNpb24tZnJlZSJdLCJjb25mbGljdHNfd2l0aCI6W10sInN0YXR1cyI6Im9wdGlvbmFsIiwiY29tbWFuZCI6InN1ZG8gZG5mNSBpbnN0YWxsIC15IGNvZGUiLCJ0YWdzIjpbImVkaXRvciJdfSx7ImlkIjoidHdlYWstZG5mIiwiY2F0ZWdvcnkiOiJ0d2Vha3MiLCJsYWJlbCI6IkRORiB0d2Vha3MiLCJkZXNjcmlwdGlvbiI6IkVuYWJsZSBmYXN0ZXN0IG1pcnJvciBhbmQgZGVsdGFycG0uIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6W10sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoicmVjb21tZW5kZWQiLCJjb21tYW5kIjoic3VkbyBkbmY1IGNvbmZpZy1tYW5hZ2VyIHNldG9wdCBmYXN0ZXN0bWlycm9yPVRydWU7IHN1ZG8gZG5mNSBjb25maWctbWFuYWdlciBzZXRvcHQgZGVsdGFycG09VHJ1ZSIsInRhZ3MiOlsidHdlYWsiXX0seyJpZCI6InR3ZWFrLXN3YXAiLCJjYXRlZ29yeSI6InR3ZWFrcyIsImxhYmVsIjoiWlJBTSBzd2FwIiwiZGVzY3JpcHRpb24iOiJFbmFibGUgenJhbSBzd2FwLiIsImRlc2t0b3BzIjoiYW55Iiwic3VwcG9ydGVkX2ZlZG9yYSI6W10sImRlcGVuZHNfb24iOltdLCJjb25mbGljdHNfd2l0aCI6W10sInN0YXR1cyI6Im9wdGlvbmFsIiwiY29tbWFuZCI6InN1ZG8gZG5mNSBpbnN0YWxsIC15IHpyYW0tZ2VuZXJhdG9yIiwidGFncyI6WyJ0d2VhayJdfSx7ImlkIjoiZ25vbWUtdHdlYWtzIiwiY2F0ZWdvcnkiOiJ0d2Vha3MiLCJsYWJlbCI6IkdOT01FIFR3ZWFrcyIsImRlc2NyaXB0aW9uIjoiR05PTUUgVHdlYWtzIHV0aWxpdHkuIiwiZGVza3RvcHMiOiJnbm9tZSIsInN1cHBvcnRlZF9mZWRvcmEiOltdLCJkZXBlbmRzX29uIjpbXSwiY29uZmxpY3RzX3dpdGgiOltdLCJzdGF0dXMiOiJvcHRpb25hbCIsImNvbW1hbmQiOiJzdWRvIGRuZjUgaW5zdGFsbCAteSBnbm9tZS10d2Vha3MiLCJ0YWdzIjpbImdub21lIl19LHsiaWQiOiJrZGUtYWRkb25zIiwiY2F0ZWdvcnkiOiJ0d2Vha3MiLCJsYWJlbCI6IktERSBhZGRvbnMiLCJkZXNjcmlwdGlvbiI6IktERSBQbGFzbWEgYWRkb25zLiIsImRlc2t0b3BzIjoia2RlIiwic3VwcG9ydGVkX2ZlZG9yYSI6W10sImRlcGVuZHNfb24iOltdLCJjb25mbGljdHNfd2l0aCI6W10sInN0YXR1cyI6Im9wdGlvbmFsIiwiY29tbWFuZCI6InN1ZG8gZG5mNSBpbnN0YWxsIC15IGtkZS1wbGFzbWEtYWRkb25zIiwidGFncyI6WyJrZGUiXX0seyJpZCI6ImZpcmV3YWxsIiwiY2F0ZWdvcnkiOiJ0d2Vha3MiLCJsYWJlbCI6IkZpcmV3YWxsIiwiZGVzY3JpcHRpb24iOiJFbnN1cmUgZmlyZXdhbGxkIGlzIGVuYWJsZWQuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6W10sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoicmVjb21tZW5kZWQiLCJjb21tYW5kIjoic3VkbyBkbmY1IGluc3RhbGwgLXkgZmlyZXdhbGxkIiwidGFncyI6WyJzZWN1cml0eSJdfSx7ImlkIjoic2VsaW51eCIsImNhdGVnb3J5IjoidHdlYWtzIiwibGFiZWwiOiJTRUxpbnV4IHRvb2xzIiwiZGVzY3JpcHRpb24iOiJTRUxpbnV4IG1hbmFnZW1lbnQgdG9vbHMuIiwiZGVza3RvcHMiOiJhbnkiLCJzdXBwb3J0ZWRfZmVkb3JhIjpbXSwiZGVwZW5kc19vbiI6W10sImNvbmZsaWN0c193aXRoIjpbXSwic3RhdHVzIjoib3B0aW9uYWwiLCJjb21tYW5kIjoic3VkbyBkbmY1IGluc3RhbGwgLXkgcG9saWN5Y29yZXV0aWxzLXB5dGhvbi11dGlscyBzZXRvb2xzLWNvbnNvbGUiLCJ0YWdzIjpbInNlY3VyaXR5Il19XSwiZ2VuZXJhdGVkX2F0IjoiMjAyNi0xMC0zMVQyMzowODoyMi4zNjhaIn0=' --mode setup

rm -f "$PYTEMP"
echo -e "${GREEN}Fedora Post-Install Script complete.${NC}"
