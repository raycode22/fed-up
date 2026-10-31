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
// Catalog data (embedded fallback)
export const CATALOG_ITEMS = [
  { id: 'rpmfusion-free', label: 'Enable RPM Fusion free repo', description: 'Add the RPM Fusion free repository for audio, video and open-source codecs.', command: 'sudo dnf5 install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm', requires_sudo: true, tested_fedora: ['43', '44'], supported_fedora: ['43', '44'], desktops: 'any', arch: 'any', tags: ['repo', 'multimedia', 'rpmfusion'], category: 'dnf', status: 'recommended' },
  { id: 'git', label: 'Install Git', description: 'Add Git for version control and source code management.', command: 'sudo dnf5 install -y git', requires_sudo: true, tested_fedora: ['43', '44'], supported_fedora: ['43', '44'], desktops: 'any', arch: 'any', tags: ['git', 'version-control'], category: 'development', status: 'recommended' },
];
const state = { selected: new Set(), categories: [], desktop: 'any', allCategories: [] };
const SCRIPT_MODES = {
  setup: { title: 'Generated Fed-up installer (fed-up.sh)', description: 'Self-contained POSIX script generated in your browser.', filename: 'fed-up.sh' },
  cleanup: { title: 'Generated cleanup script', description: 'Clears DNF caches, then asks DNF to propose unused dependencies.', filename: 'fedora-cleanup.sh' },
  revert: { title: 'Generated Fed-up revert script', description: 'Removes only RPM packages recorded as newly installed.', filename: 'fed-up-revert.sh' },
};
const categoryList = document.getElementById('category-list');
const itemCount = document.getElementById('item-count');
const scriptPreview = document.getElementById('script-preview');
const copyButton = document.getElementById('copy-script');
function getSelections() { const ids = new Set(state.selected); return CATALOG_ITEMS.filter((i) => ids.has(i.id)); }
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  if (themeToggle) {
    themeToggle.dataset.mode = theme;
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
    themeToggle.title = `Switch to ${nextTheme} mode`;
  }
}
function init() {
  if (categoryList) {
    categoryList.addEventListener('change', (event) => {
      const checkbox = event.target;
      if (!(checkbox instanceof HTMLInputElement) || checkbox.type !== 'checkbox') return;
      updateSelection([checkbox.dataset.id], checkbox.checked);
    });
  }
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(getCurrentScript(getSelections(), CATALOG_ITEMS));
        if (copyStatus) copyStatus.textContent = 'Script copied to clipboard.';
      } catch (error) {
        if (copyStatus) copyStatus.textContent = 'Could not copy the script.';
      }
    });
  }
  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      const blob = new Blob([getCurrentScript(getSelections(), CATALOG_ITEMS)], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = SCRIPT_MODES[scriptModeSelect?.value || 'setup'].filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  }
  if (scriptModeSelect) {
    scriptModeSelect.addEventListener('change', () => {
      setScriptMode(scriptModeSelect.value);
    });
  }
  if (desktopSelect) {
    desktopSelect.addEventListener('change', () => {
      state.desktop = desktopSelect.value;
    });
  }
  renderCategories();
  setScriptMode('setup');
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
function updateSelection(ids, selected) {
  if (selected) ids.forEach((id) => state.selected.add(id));
  else ids.forEach((id) => state.selected.delete(id));
  renderCategories();
  renderScriptPreview(getCurrentScript(getSelections(), CATALOG_ITEMS));
}
function renderCategories() {
  if (!categoryList) return;
  const selectedIds = new Set(state.selected);
  categoryList.innerHTML = '';
  const categoryNames = { dnf: 'Repositories & Codecs', multimedia: 'Audio & Video', development: 'Development Tools', tweaks: 'System Tweaks' };
  const categoryMap = {};
  for (const item of CATALOG_ITEMS) {
    const cat = item.category || 'default';
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(item);
  }
  Object.keys(categoryNames).forEach((cat) => {
    const category = { name: categoryNames[cat], items: categoryMap[cat] || [] };
    const block = document.createElement('div');
    block.className = 'category-block';
    const summary = document.createElement('summary');
    summary.className = 'category-header';
    summary.innerHTML = `<span class="category-icon" aria-hidden="true"></span><h3>${category.name}</h3><span class="category-hint">Show setup items</span>`;
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'inline-toggle';
    const allSel = category.items.length > 0 && category.items.every((i) => selectedIds.has(i.id));
    toggleBtn.textContent = allSel ? 'Deselect all' : 'Select all';
    toggleBtn.addEventListener('click', () => {
      const shouldSelect = !category.items.every((i) => selectedIds.has(i.id));
      updateSelection(category.items.map((i) => i.id), shouldSelect);
    });
    summary.appendChild(toggleBtn);
    const content = document.createElement('div');
    content.className = 'category-content';
    const itemsList = document.createElement('ul');
    itemsList.className = 'item-list';
    category.items.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<label class="item-row"><input type="checkbox" data-id="${item.id}" ${selectedIds.has(item.id) ? 'checked' : ''} /><span class="item-text"><span class="item-title">${item.label}</span><span class="item-desc">${item.description || ''}</span></span><span class="tag">${item.tags?.join(' ') || ''}</span></label>`;
      itemsList.appendChild(li);
    });
    content.appendChild(itemsList);
    block.appendChild(summary);
    block.appendChild(content);
    categoryList.appendChild(block);
  });
  if (itemCount) itemCount.textContent = `${state.selected.size} item${state.selected.size !== 1 ? 's' : ''} selected`;
}
function renderScriptPreview(script) {
  if (!scriptPreview) return;
  if (script && script.trim()) {
    scriptPreview.innerHTML = `<pre class="script-code"><code>${escapeHtml(script)}</code></pre>`;
  } else {
    scriptPreview.innerHTML = '<p>Make your selections to generate the script.</p>';
  }
}
function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function setScriptMode(mode) {
  if (scriptModeSelect) scriptModeSelect.value = mode;
  const modeConfig = SCRIPT_MODES[mode];
  if (!modeConfig) return;
  const heading = document.getElementById('script-heading');
  const desc = document.getElementById('script-description');
  if (heading) heading.textContent = modeConfig.title;
  if (desc) desc.textContent = modeConfig.description;
  if (downloadFilename) downloadFilename.textContent = modeConfig.filename;
  renderScriptPreview(getCurrentScript(getSelections(), CATALOG_ITEMS));
}
const copyStatus = document.getElementById('copy-status');
const downloadButton = document.getElementById('download-script');
const downloadFilename = document.getElementById('download-filename');
const themeToggle = document.getElementById('theme-toggle');
const scriptModeSelect = document.getElementById('script-mode');
const desktopSelect = document.getElementById('desktop-select');
