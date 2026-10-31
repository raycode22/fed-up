// Pure, DOM-free helpers for generating Fedora setup scripts.
export function shellQuote(value) {
  if (value === null || value === undefined) return "''";
  const str = String(value);
  if (str === '') return "''";
  if (/^[A-Za-z0-9_./:=+-]+$/.test(str)) return str;
  return "'" + str.replace(/'/g, "'\''") + "'";
}

export function topoSort(items, selectedIds) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const selected = new Set(selectedIds);
  const expanded = new Set(selected);
  const queue = [...selected];
  while (queue.length) {
    const id = queue.shift();
    const item = byId.get(id);
    if (!item) continue;
    for (const dep of item.depends_on || []) {
      if (!expanded.has(dep)) {
        expanded.add(dep);
        queue.push(dep);
      }
    }
  }
  const inDeg = new Map();
  for (const id of expanded) {
    const deps = (byId.get(id)?.depends_on || []).filter((d) => expanded.has(d));
    inDeg.set(id, deps.length);
  }
  const adj = new Map();
  for (const id of expanded) adj.set(id, []);
  for (const id of expanded) {
    for (const dep of byId.get(id)?.depends_on || []) {
      if (expanded.has(dep)) adj.get(dep).push(id);
    }
  }
  const q = [...expanded].filter((id) => inDeg.get(id) === 0).sort();
  const order = [];
  while (q.length) {
    const id = q.shift();
    order.push(id);
    for (const n of (adj.get(id) || []).sort()) {
      inDeg.set(n, inDeg.get(n) - 1);
      if (inDeg.get(n) === 0) q.push(n);
      q.sort();
    }
  }
  if (order.length !== expanded.size) {
    throw new Error('Dependency cycle detected');
  }
  return order.map((id) => byId.get(id));
}

export function autoSelectDependencies(items, selectedIds) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const result = new Set(selectedIds);
  const queue = [...selectedIds];
  while (queue.length) {
    const id = queue.shift();
    const item = byId.get(id);
    if (!item) continue;
    for (const dep of item.depends_on || []) {
      if (!result.has(dep)) {
        result.add(dep);
        queue.push(dep);
      }
    }
  }
  return [...result];
}

export function hasConflict(items, a, b) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const ia = byId.get(a);
  const ib = byId.get(b);
  if (!ia || !ib) return false;
  return (ia.conflicts_with || []).includes(b) || (ib.conflicts_with || []).includes(a);
}

export function filterBySystem(items, { fedora, desktop, arch } = {}) {
  return items.filter((item) => {
    const supported = item.supported_fedora || item.tested_fedora || [];
    if (fedora && supported.length && !supported.includes(String(fedora))) return false;
    if (desktop && item.desktops && item.desktops !== 'any' && item.desktops !== desktop) return false;
    if (arch && item.arch && item.arch !== 'any' && !(Array.isArray(item.arch) ? item.arch.includes(arch) : item.arch === arch)) return false;
    return true;
  });
}

export function isRecommended(item, desktop = 'any') {
  if (!item || item.status !== 'recommended') return false;
  const recommendedOn = Array.isArray(item.recommended_on)
    ? item.recommended_on
    : [item.desktops || 'any'];
  if (recommendedOn.length && !recommendedOn.includes(desktop) && recommendedOn.includes('any') === false) return false;
  return true;
}

export function validateSelectedIds(selectedIds) {
  const validPattern = /^[A-Za-z0-9._-]+$/;
  return selectedIds.filter((id) => validPattern.test(id));
}

export function buildBootstrapperScript(items, metadata) {
  const selectedIds = validateSelectedIds(items.filter((i) => i.selected || i.checked).map((i) => i.id));
  const selectedItems = topoSort(items, selectedIds);
  const generatedAt = metadata.generated_at || new Date().toISOString();
  const catalogData = { selected: selectedIds, categories: [], generated_at: generatedAt };
  const categoriesMap = new Map();
  for (const item of selectedItems) {
    const cat = item.category || 'default';
    if (!categoriesMap.has(cat)) categoriesMap.set(cat, []);
    categoriesMap.get(cat).push({ id: item.id, label: item.label, command: item.command, description: item.description || '' });
  }
  for (const [catName, catItems] of categoriesMap) {
    catalogData.categories.push({ name: catName, items: catItems });
  }
  const catalogJson = JSON.stringify(catalogData);
  const catalogB64 = btoa(unescape(encodeURIComponent(catalogJson)));

  let script = '#!/usr/bin/env bash\n';
  script += 'set -euo pipefail\n';
  script += '\n';
  script += '# =============================================================================\n';
  script += '# Fed-up Post-Install Script Generator\n';
  script += '# Target: Fedora 43/44\n';
  script += '# Package Manager: dnf5 exclusive\n';
  script += '# =============================================================================\n';
  script += '\n';
  script += 'RED="\\033[0;31m"\n';
  script += 'GREEN="\\033[0;32m"\n';
  script += 'YELLOW="\\033[1;33m"\n';
  script += 'CYAN="\\033[0;36m"\n';
  script += 'NC="\\033[0m"\n';
  script += '\n';
  script += '# =============================================================================\n';
  script += '# Pre-Flight Welcome Banner and Consent Prompt\n';
  script += '# =============================================================================\n';
  script += '\n';
  script += 'display_banner() {\n';
  script += '  clear\n';
  script += '  cat << "BANNER"\n';
  script += '=================================================================\n';
  script += '          Fed-up Post-Install Script Generator\n';
  script += '=================================================================\n';
  script += '  This script will generate a custom Fedora Linux post-installation\n';
  script += '  shell script. It will bootstrap required dependencies (python3\n';
  script += "  and Charm's gum TUI tool) and then present a TUI for selecting\n";
  script += '  packages, codecs, development tools, and system tweaks.\n';
  script += '\n';
  script += '  The generated script uses dnf5 exclusively (no legacy yum).\n';
  script += '  Selected packages will be installed via sudo privileges.\n';
  script += '\n';
  script += '  Required dependencies to bootstrap:\n';
  script += '  - python3 (for the Python payload execution)\n';
  script += '  - gum (Charm TUI for interactive prompts and progress spinners)\n';
  script += '\n';
  script += '  Proceed with dependency bootstrapping and script generation?\n';
  script += 'BANNER\n';
  script += '}\n';
  script += '\n';
  script += 'echo ""\n';
  script += 'display_banner\n';
  script += '\n';
  script += 'while true; do\n';
  script += '  read -rp "  Proceed? [Y/n]: " yn\n';
  script += '  case "${yn:-Y}" in\n';
  script += '    [Yy]*) echo "Proceeding..."; break ;;&\n';
  script += '    [Nn]*) echo "Aborted."; exit 1 ;;&\n';
  script += '    *) echo "Please answer yes (Y) or no (n)." ;;&\n';
  script += '  esac\n';
  script += 'done\n';
  script += '\n';
  script += '# =============================================================================\n';
  script += '# Elevated Bootstrapper: Install python3 and gum if not present\n';
  script += '# =============================================================================\n';
  script += '\n';
  script += 'check_and_bootstrap() {\n';
  script += '  if ! command -v python3 &>/dev/null; then\n';
  script += '    echo -e "${CYAN}Bootstrapping python3...${NC}"\n';
  script += '    sudo dnf5 install -y python3 2>/dev/null || {\n';
  script += '      echo -e "${RED}Failed to install python3. Aborting.${NC}"\n';
  script += '      exit 1\n';
  script += '    }\n';
  script += '  fi\n';
  script += '\n';
  script += '  if ! command -v gum &>/dev/null; then\n';
  script += '    echo -e "${CYAN}Bootstrapping gum (Charm TUI)...${NC}"\n';
  script += '    sudo dnf5 install -y gum 2>/dev/null || {\n';
  script += '      echo -e "${RED}Failed to install gum. Aborting.${NC}"\n';
  script += '      exit 1\n';
  script += '    }\n';
  script += '  fi\n';
  script += '}\n';
  script += '\n';
  script += 'check_and_bootstrap\n';
  script += '\n';
  script += '# =============================================================================\n';
  script += '# Python Payload Generation (single-quoted heredoc)\n';
  script += '# =============================================================================\n';
  script += '\n';
  script += 'PYTEMP=$(mktemp /tmp/fed-up-payload-XXXXXX)\n';
  script += '\n';
  script += "trap 'rm -f \"$PYTEMP\"' EXIT INT TERM\n";
  script += '\n';
  script += "cat << 'PYEOF' > \"$PYTEMP\"\n";
  script += '#!/usr/bin/env python3\n';
  script += '"""Fed-up Python Payload"""';
  script += '\n';
  script += 'import sys\n';
  script += 'import subprocess\n';
  script += 'import json\n';
  script += 'import signal\n';
  script += 'import os\n';
  script += 'import argparse\n';
  script += '\n';
  script += 'parser = argparse.ArgumentParser(description="Fed-up Post-Install Payload")\n';
  script += 'parser.add_argument("--metadata", required=True, help="JSON metadata")\n';
  script += 'args = parser.parse_args()\n';
  script += '\n';
  script += 'try:\n';
  script += '    metadata = json.loads(args.metadata)\n';
  script += 'except json.JSONDecodeError:\n';
  script += '    print("Invalid metadata JSON")\n';
  script += '    sys.exit(1)\n';
  script += '\n';
  script += 'fedora_version = "44"\n';
  script += 'try:\n';
  script += '    with open("/etc/os-release", "r") as f:\n';
  script += '        release_info = f.read()\n';
  script += '    for line in release_info.split("\\n"):\n';
  script += '        if line.startswith("VERSION_ID="):\n';
  script += "            fedora_version = line.split(chr(61))[1].strip(chr(34))" + chr(92) + "n\n";
  script += '            break\n';
  script += 'except Exception:\n';
  script += '    pass\n';
  script += '\n';
  script += 'def detect_desktop():\n';
  script += '    desktop = os.environ.get("XDG_CURRENT_DESKTOP", "")\n';
  script += '    if "GNOME" in desktop or "ubuntu:GNOME" in desktop:\n';
  script += '        return "gnome"\n';
  script += '    elif "KDE" in desktop or "KDE neon" in desktop:\n';
  script += '        return "kde"\n';
  script += '    elif "XFCE" in desktop:\n';
  script += '        return "xfce"\n';
  script += '    return "any"\n';
  script += '\n';
  script += 'desktop = detect_desktop()\n';
  script += '\n';
  script += 'selected_packages = metadata.get("selected", [])\n';
  script += 'categories = metadata.get("categories", [])\n';
  script += '\n';
  script += 'print("Fed-up Python Payload starting...")\n';
  script += 'print("Fedora release: {fedora_version}")\n';
  script += 'print("Desktop environment: {desktop}")\n';
  script += 'print("Selected packages: {len(selected_packages)}")\n';
  script += '\n';
  script += 'installed = []\n';
  script += 'failed = []\n';
  script += '\n';
  script += 'for pkg_info in selected_packages:\n';
  script += '    pkg_id = pkg_info.get("id", "")\n';
  script += '    cmd = pkg_info.get("command", "")\n';
  script += '    \n';
  script += '    if not cmd:\n';
  script += '        continue\n';
  script += '    \n';
  script += '    try:\n';
  script += '        print("Installing {pkg_id}...")\n';
  script += '        result = subprocess.run(\n';
  script += '            cmd,\n';
  script += '            shell=True,\n';
  script += '            check=True,\n';
  script += '            text=True,\n';
  script += '            capture_output=True\n';
  script += '        )\n';
  script += '        installed.append(pkg_id)\n';
  script += '        print("  ✓ {pkg_id} installed successfully")\n';
  script += '    except subprocess.CalledProcessError as e:\n';
  script += '        print("  ✗ {pkg_id} failed: {e.stderr[:200]}")\n';
  script += '        failed.append((pkg_id, e.stderr[:200]))\n';
  script += '\n';
  script += 'print("\\n")\n';
  script += 'print("Installed: {len(installed)} packages")\n';
  script += 'if failed:\n';
  script += '    print("Failed: {len(failed)} packages")\n';
  script += '    for pid, err in failed[:5]:\n';
  script += '        print("  - {pid}: {err}")\n';
  script += '\n';
  script += 'print("Fed-up Python Payload complete.")\n';
  script += "PYEOF\n";
  script += '\n';
  script += '# Execute the Python payload\n';
  script += 'python3 "$PYTEMP" --metadata "' + catalogB64 + '"\n';
  script += '\n';
  script += 'rm -f "$PYTEMP"\n';
  script += '\n';
  script += 'echo -e "${GREEN}Fed-up script generation and execution complete.${NC}"\n';

  return script;
}

export function getCurrentScript(selections, catalogItems) {
  const selectedIds = selections.map((s) => s.id);
  return buildBootstrapperScript(catalogItems, { generated_at: new Date().toISOString() });
}