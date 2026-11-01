export const CATALOG_ITEMS = [
  { id: 'rpmfusion-free', category: 'dnf', label: 'RPM Fusion (free)', description: 'Enable RPM Fusion free repository.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'recommended', command: 'sudo dnf5 install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm', tags: ['repo'] },
  { id: 'rpmfusion-nonfree', category: 'dnf', label: 'RPM Fusion (nonfree)', description: 'Enable RPM Fusion nonfree repository.', desktops: 'any', supported_fedora: [], depends_on: ['rpmfusion-free'], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm', tags: ['repo'] },
  { id: 'flathub', category: 'dnf', label: 'Flathub', description: 'Add Flathub remote for Flatpak.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'recommended', command: 'flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo', tags: ['repo'] },
  { id: 'codecs', category: 'multimedia', label: 'Multimedia codecs', description: 'Install full multimedia codec set.', desktops: 'any', supported_fedora: [], depends_on: ['rpmfusion-free', 'rpmfusion-nonfree'], conflicts_with: [], status: 'recommended', command: 'sudo dnf5 install -y gstreamer1-plugins-{bad-*,good-*,base} gstreamer1-plugin-openh264 gstreamer1-libav --exclude=gstreamer1-plugins-bad-free-devel', tags: ['codecs'] },
  { id: 'ffmpeg', category: 'multimedia', label: 'FFmpeg', description: 'FFmpeg with full codec support.', desktops: 'any', supported_fedora: [], depends_on: ['rpmfusion-free', 'rpmfusion-nonfree'], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y ffmpeg', tags: ['media'] },
  { id: 'vlc', category: 'multimedia', label: 'VLC', description: 'VLC media player.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y vlc', tags: ['media'] },
  { id: 'multimedia-group', category: 'multimedia', label: 'Multimedia group update', description: 'Update the multimedia package group.', desktops: 'any', supported_fedora: [], depends_on: ['rpmfusion-free'], conflicts_with: [], status: 'recommended', command: 'sudo dnf5 update @multimedia', tags: ['group'] },
  { id: 'dev-tools', category: 'development', label: 'Development tools', description: 'Base development toolchain.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'recommended', command: 'sudo dnf5 group install -y "Development Tools"', tags: ['dev'] },
  { id: 'git', category: 'development', label: 'Git', description: 'Git version control.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'recommended', command: 'sudo dnf5 install -y git', tags: ['dev'] },
  { id: 'nodejs', category: 'development', label: 'Node.js', description: 'Node.js LTS runtime.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y nodejs', tags: ['dev'] },
  { id: 'python-dev', category: 'development', label: 'Python dev', description: 'Python 3 development headers and pip.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y python3-devel python3-pip', tags: ['dev'] },
  { id: 'vscode', category: 'development', label: 'VS Code', description: 'Visual Studio Code.', desktops: 'any', supported_fedora: [], depends_on: ['rpmfusion-free'], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y code', tags: ['editor'] },
  { id: 'tweak-dnf', category: 'tweaks', label: 'DNF tweaks', description: 'Enable fastest mirror and deltarpm.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'recommended', command: 'sudo dnf5 config-manager setopt fastestmirror=True; sudo dnf5 config-manager setopt deltarpm=True', tags: ['tweak'] },
  { id: 'tweak-swap', category: 'tweaks', label: 'ZRAM swap', description: 'Enable zram swap.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y zram-generator', tags: ['tweak'] },
  { id: 'gnome-tweaks', category: 'tweaks', label: 'GNOME Tweaks', description: 'GNOME Tweaks utility.', desktops: 'gnome', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y gnome-tweaks', tags: ['gnome'] },
  { id: 'kde-addons', category: 'tweaks', label: 'KDE addons', description: 'KDE Plasma addons.', desktops: 'kde', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y kde-plasma-addons', tags: ['kde'] },
  { id: 'firewall', category: 'tweaks', label: 'Firewall', description: 'Ensure firewalld is enabled.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'recommended', command: 'sudo dnf5 install -y firewalld', tags: ['security'] },
  { id: 'selinux', category: 'tweaks', label: 'SELinux tools', description: 'SELinux management tools.', desktops: 'any', supported_fedora: [], depends_on: [], conflicts_with: [], status: 'optional', command: 'sudo dnf5 install -y policycoreutils-python-utils setools-console', tags: ['security'] }
];

export function shellQuote(value) {
  if (value === null || value === undefined) return "''";
  const str = String(value);
  if (str === '') return "''";
  if (/^[A-Za-z0-9_./:=+-]+$/.test(str)) return str;
  return "'" + str.replace(/'/g, "'\\''") + "'";
}

export function topoSort(items, selectedIds) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const expanded = new Set(selectedIds);
  const queue = [...selectedIds];
  while (queue.length) {
    const id = queue.shift();
    const item = byId.get(id);
    if (!item) continue;
    for (const dep of item.depends_on || []) { if (!expanded.has(dep)) { expanded.add(dep); queue.push(dep); } }
  }
  const inDeg = new Map();
  for (const id of expanded) { const deps = (byId.get(id)?.depends_on || []).filter((d) => expanded.has(d)); inDeg.set(id, deps.length); }
  const adj = new Map();
  for (const id of expanded) adj.set(id, []);
  for (const id of expanded) { for (const dep of byId.get(id)?.depends_on || []) { if (expanded.has(dep)) adj.get(dep).push(id); } }
  const q = [...expanded].filter((id) => inDeg.get(id) === 0).sort();
  const order = [];
  while (q.length) { const id = q.shift(); order.push(id); for (const n of (adj.get(id) || []).sort()) { inDeg.set(n, inDeg.get(n) - 1); if (inDeg.get(n) === 0) q.push(n); q.sort(); } }
  if (order.length !== expanded.size) throw new Error('Dependency cycle detected');
  return order.map((id) => byId.get(id));
}

export function autoSelectDependencies(items, selectedIds) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const result = new Set(selectedIds);
  const queue = [...selectedIds];
  while (queue.length) { const id = queue.shift(); const item = byId.get(id); if (!item) continue; for (const dep of item.depends_on || []) { if (!result.has(dep)) { result.add(dep); queue.push(dep); } } }
  return [...result];
}

export function hasConflict(items, a, b) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const ia = byId.get(a); const ib = byId.get(b);
  if (!ia || !ib) return false;
  return (ia.conflicts_with || []).includes(b) || (ib.conflicts_with || []).includes(a);
}

export function filterBySystem(items, { fedora, desktop, arch } = {}) {
  return items.filter((item) => {
    const supported = item.supported_fedora || [];
    if (fedora && supported.length && !supported.includes(String(fedora))) return false;
    if (desktop && item.desktops && item.desktops !== 'any' && item.desktops !== desktop) return false;
    if (arch && item.arch && item.arch !== 'any' && !(Array.isArray(item.arch) ? item.arch.includes(arch) : item.arch === arch)) return false;
    return true;
  });
}

export function validateSelectedIds(selectedIds) {
  const validPattern = /^[A-Za-z0-9._-]+$/;
  return selectedIds.filter((id) => validPattern.test(id));
}

const SCRIPT_MODES = {
  setup: { title: 'Setup script (setup.sh)', description: 'Install selected packages.', filename: 'setup.sh' },
  cleanup: { title: 'Cleanup script (fedora-cleanup.sh)', description: 'Clean caches and remove unused dependencies.', filename: 'fedora-cleanup.sh' },
  revert: { title: 'Revert script (fed-up-revert.sh)', description: 'Removes only packages recorded as newly installed.', filename: 'fed-up-revert.sh' }
};

const state = { selected: new Set(), desktop: 'any', fedora: '41' };

function escapeHtml(text) { return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

function buildMetadata(mode, selectedItems) {
  const selectedIds = validateSelectedIds(selectedItems.map((i) => i.id));
  const data = { mode, selected: selectedIds, catalog: CATALOG_ITEMS, generated_at: new Date().toISOString() };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

export function buildBootstrapperScript(items, metadata) {
  const selectedIds = validateSelectedIds((items || []).map((i) => i.id));
  const selectedItems = topoSort(CATALOG_ITEMS, selectedIds);
  const generatedAt = metadata?.generated_at || new Date().toISOString();
  const mode = metadata?.mode || 'setup';
  const metadataB64 = metadata?.metadataB64 || buildMetadata(mode, selectedItems);
  let script = '#!/usr/bin/env bash\n';
  script += 'set -euo pipefail\n\n';
  script += '# =============================================================================\n';
  script += '# Fedora Post-Install Script\n';
  script += '# Target: Fedora 43/44\n';
  script += '# Package Manager: dnf5 exclusive\n';
  script += '# =============================================================================\n\n';
  script += 'RED="\\033[0;31m"\nGREEN="\\033[0;32m"\nYELLOW="\\033[1;33m"\nCYAN="\\033[0;36m"\nNC="\\033[0m"\n\n';
  script += 'display_banner() {\n  clear\n  cat << "BANNER"\n=================================================================\n          Fedora Post-Install Script\n=================================================================\n  This script performs Fedora post-installation tasks selected by you.\n  It bootstraps python3 and Charm gum, then runs an interactive TUI.\n\n  Required dependencies to bootstrap:\n  - python3 (for the Python payload execution)\n  - gum (Charm TUI for interactive prompts and progress spinners)\n\n  Proceed with dependency bootstrapping?\nBANNER\n}\n\n';
  script += 'echo ""\ndisplay_banner\n\n';
  script += 'while true; do\n  read -rp "  Proceed? [Y/n]: " yn\n  case "${yn:-Y}" in\n    [Yy]*) echo "Proceeding..."; break ;;\n    [Nn]*) echo "Aborted."; exit 1 ;;\n    *) echo "Please answer yes (Y) or no (n)." ;;\n  esac\ndone\n\n';
  script += '# Elevated Bootstrapper: single call after consent\n';
  script += 'if ! command -v python3 >/dev/null 2>&1 || ! command -v gum >/dev/null 2>&1; then\n';
  script += '  sudo dnf5 install -y python3 gum || {\n';
  script += '    if ! command -v gum >/dev/null 2>&1; then\n';
  script += '      sudo dnf5 config-manager addrepo --from-repofile=https://repo.charm.sh/yum/fedora/charm.repo 2>/dev/null || true\n';
  script += '      sudo dnf5 install -y gum || { echo "gum unavailable; falling back to release binary"; curl -fsSL https://github.com/charmbracelet/gum/releases/latest/download/gum_Linux_x86_64.tar.gz | tar -xz -C /tmp; sudo install /tmp/gum /usr/local/bin/gum; }\n';
  script += '    fi\n';
  script += '  }\n';
  script += 'fi\n\n';
  script += 'PYTEMP=$(mktemp /tmp/fed-up-payload-XXXXXX)\n\n';
  script += "trap 'rm -f \"$PYTEMP\"' EXIT INT TERM\n\n";
  script += "cat << 'EOF' > \"$PYTEMP\"\n";
  script += pythonPayload();
  script += 'EOF\n\n';
  script += `python3 "$PYTEMP" --metadata ${shellQuote(metadataB64)} --mode ${shellQuote(mode)}\n\n`;
  script += 'rm -f "$PYTEMP"\n';
  script += 'echo -e "${GREEN}Fedora Post-Install Script complete.${NC}"\n';
  return script;
}

function pythonPayload() {
  return `#!/usr/bin/env python3
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
`;
}

export function getCurrentScript(selections, items) {
  const mode = (document.getElementById('script-mode')?.value) || 'setup';
  return buildBootstrapperScript(selections || [], { generated_at: new Date().toISOString(), mode, metadataB64: buildMetadata(mode, selections || []) });
}

const categoryList = document.getElementById('category-list');
const itemCount = document.getElementById('item-count');
const scriptPreview = document.getElementById('script-preview');
const copyButton = document.getElementById('copy-script');
const copyStatus = document.getElementById('copy-status');
const downloadButton = document.getElementById('download-script');
const downloadFilename = document.getElementById('download-filename');
const themeToggle = document.getElementById('theme-toggle');
const scriptModeSelect = document.getElementById('script-mode');
const desktopSelect = document.getElementById('desktop-select');
const fedoraInput = document.getElementById('fedora-version');

function getSelections() { const ids = new Set(state.selected); return CATALOG_ITEMS.filter((i) => ids.has(i.id)); }

const THEME_STORAGE_KEY = 'fed-up:theme';
function readStoredTheme() {
  try { return localStorage.getItem(THEME_STORAGE_KEY); } catch { return null; }
}
function writeStoredTheme(theme) {
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* ignore */ }
}
function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function setTheme(theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  if (persist) writeStoredTheme(theme);
  const next = theme === 'dark' ? 'light' : 'dark';
  if (themeToggle) { themeToggle.dataset.mode = theme; themeToggle.setAttribute('aria-label', `Switch to ${next} mode`); themeToggle.title = `Switch to ${next} mode`; themeToggle.textContent = theme === 'dark' ? '☀' : '☾'; }
}

function renderCategories() {
  if (!categoryList) return;
  categoryList.textContent = '';
  const selectedIds = new Set(state.selected);
  const filtered = filterBySystem(CATALOG_ITEMS, { fedora: state.fedora, desktop: state.desktop });
  const byCat = {};
  for (const item of filtered) { (byCat[item.category] ||= []).push(item); }
  for (const cat of ['dnf', 'multimedia', 'development', 'tweaks']) {
    const items = byCat[cat] || [];
    const block = document.createElement('div');
    block.className = 'category-block';
    const header = document.createElement('div');
    header.className = 'category-header';
    const title = document.createElement('span');
    title.className = 'category-title';
    title.textContent = cat.toUpperCase();
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'inline-toggle';
    toggle.dataset.cat = cat;
    toggle.textContent = 'Toggle all';
    header.append(title, toggle);
    block.append(header);
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none'; ul.style.padding = '0'; ul.style.margin = '0';
    for (const item of items) {
      const li = document.createElement('li');
      li.className = 'item-row';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.id = item.id;
      cb.checked = selectedIds.has(item.id);
      const text = document.createElement('span');
      text.className = 'item-text';
      const t = document.createElement('span');
      t.className = 'item-title';
      t.textContent = item.label;
      const d = document.createElement('span');
      d.className = 'item-desc';
      d.textContent = item.description || '';
      text.append(t, d);
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = (item.tags || []).join(' ');
      li.append(cb, text, tag);
      ul.append(li);
    }
    block.append(ul);
    categoryList.append(block);
  }
  if (itemCount) itemCount.textContent = `${state.selected.size} item${state.selected.size !== 1 ? 's' : ''} selected`;
}

function renderScriptPreview(script) {
  if (!scriptPreview) return;
  scriptPreview.textContent = '';
  if (script && script.trim()) {
    const pre = document.createElement('pre');
    pre.className = 'script-code';
    const code = document.createElement('code');
    code.textContent = script;
    pre.append(code);
    scriptPreview.append(pre);
  } else {
    const p = document.createElement('p');
    p.textContent = 'Make your selections to generate the script.';
    scriptPreview.append(p);
  }
}

function setScriptMode(mode) {
  if (scriptModeSelect) scriptModeSelect.value = mode;
  const cfg = SCRIPT_MODES[mode];
  if (!cfg) return;
  const heading = document.getElementById('script-heading');
  const desc = document.getElementById('script-description');
  if (heading) heading.textContent = cfg.title;
  if (desc) desc.textContent = cfg.description;
  if (downloadFilename) downloadFilename.textContent = cfg.filename;
  renderScriptPreview(getCurrentScript(getSelections(), CATALOG_ITEMS));
}

function updateSelection(ids, selected) {
  if (selected) ids.forEach((id) => state.selected.add(id));
  else ids.forEach((id) => state.selected.delete(id));
  if (selected) {
    const deps = autoSelectDependencies(CATALOG_ITEMS, [...state.selected]);
    deps.forEach((d) => state.selected.add(d));
  }
  renderCategories();
  renderScriptPreview(getCurrentScript(getSelections(), CATALOG_ITEMS));
}

function init() {
  if (categoryList) {
    categoryList.addEventListener('change', (event) => {
      const cb = event.target;
      if (!(cb instanceof HTMLInputElement) || cb.type !== 'checkbox') return;
      updateSelection([cb.dataset.id], cb.checked);
    });
    categoryList.addEventListener('click', (event) => {
      const btn = event.target.closest('.inline-toggle');
      if (!btn) return;
      const block = btn.closest('.category-block');
      if (!block) return;
      const cbs = block.querySelectorAll('input[type="checkbox"]');
      const should = Array.from(cbs).some((x) => !x.checked);
      updateSelection(Array.from(cbs, (x) => x.dataset.id), should);
    });
  }
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(getCurrentScript(getSelections(), CATALOG_ITEMS)); if (copyStatus) copyStatus.textContent = 'Script copied to clipboard.'; }
      catch { if (copyStatus) copyStatus.textContent = 'Could not copy the script.'; }
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
  if (scriptModeSelect) scriptModeSelect.addEventListener('change', () => setScriptMode(scriptModeSelect.value));
  if (desktopSelect) desktopSelect.addEventListener('change', () => { state.desktop = desktopSelect.value; renderCategories(); renderScriptPreview(getCurrentScript(getSelections(), CATALOG_ITEMS)); });
  if (fedoraInput) fedoraInput.addEventListener('change', () => { state.fedora = fedoraInput.value; renderCategories(); renderScriptPreview(getCurrentScript(getSelections(), CATALOG_ITEMS)); });
  if (themeToggle) themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || systemTheme();
    setTheme(current === 'dark' ? 'light' : 'dark', true);
  });
  const stored = readStoredTheme();
  setTheme(stored === 'light' || stored === 'dark' ? stored : systemTheme(), false);
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if (readStoredTheme()) return; // manual override takes precedence
      setTheme(systemTheme(), false);
    });
  } catch { /* ignore */ }
  renderCategories();
  setScriptMode('setup');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
