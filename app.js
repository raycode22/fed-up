import { CATALOG_ITEMS, SECTIONS } from './catalog.js';

export const FEDORA_VERSIONS = {
  41: { support: 'eol', label: 'Fedora Linux 41' },
  42: { support: 'eol', label: 'Fedora Linux 42' },
  43: { support: 'supported', label: 'Fedora Linux 43' },
  44: { support: 'current', label: 'Fedora Linux 44 (current)' },
};

export const RECOMMENDATIONS = {
  common: ['configure-dnf', 'dnf-autoupdate', 'rpmfusion-repos', 'multimedia-codecs', 'flatpak-update', 'flathub-replace', 'git', 'curl', 'wget', 'htop', 'btop', 'fastfetch', 'rsync', 'unzip', 'tmux'],
  gnome: ['gnome-tweaks', 'extension-manager', 'flatseal'],
  kde: ['kde-addons', 'flatseal'],
};

const STORAGE_KEYS = {
  theme: 'fed-up:theme',
  textSize: 'fed-up:script-text-size',
  selections: 'fed-up:selections',
};
const RISK_LABELS = { critical: 'Critical', high: 'High caution', caution: 'Caution', safe: 'Safe' };
const RISK_ICONS = { critical: 'i-critical', high: 'i-high', caution: 'i-caution', safe: 'i-safe' };
const SECTION_ICONS = {
  'system-config': 'i-system',
  'essential-apps': 'i-terminal',
  'internet-comm': 'i-web',
  'office-prod': 'i-office',
  'coding-devops': 'i-code',
  'ai-coding': 'i-sparkles',
  'media-graphics': 'i-play',
  'gaming-emulation': 'i-game',
  'remote-net': 'i-network',
  'file-sharing': 'i-folder',
  'system-tools': 'i-tools',
  customization: 'i-palette',
  'system-cleanup': 'i-clean',
};
const ITEM_TAG_ICONS = {
  ai: 'i-sparkles',
  appimage: 'i-apps',
  archive: 'i-folder',
  backup: 'i-backup',
  browser: 'i-web',
  chat: 'i-chat',
  cleanup: 'i-clean',
  cloud: 'i-cloud',
  codecs: 'i-audio',
  containers: 'i-box',
  dev: 'i-code',
  devops: 'i-tools',
  dnf: 'i-tools',
  download: 'i-download',
  editor: 'i-code',
  emulation: 'i-game',
  firmware: 'i-chip',
  flatpak: 'i-box',
  fonts: 'i-type',
  gaming: 'i-game',
  git: 'i-branch',
  gnome: 'i-system',
  graphics: 'i-image',
  mail: 'i-mail',
  media: 'i-play',
  mobile: 'i-phone',
  network: 'i-network',
  notes: 'i-document',
  office: 'i-office',
  password: 'i-key',
  pdf: 'i-document',
  power: 'i-power',
  privacy: 'i-shield',
  python: 'i-code',
  remote: 'i-network',
  repo: 'i-network',
  security: 'i-shield',
  sharing: 'i-share',
  shell: 'i-terminal',
  ssh: 'i-terminal',
  streaming: 'i-video',
  sync: 'i-sync',
  system: 'i-system',
  terminal: 'i-terminal',
  theme: 'i-palette',
  torrent: 'i-network',
  translate: 'i-chat',
  util: 'i-tools',
  video: 'i-video',
  virt: 'i-box',
  vpn: 'i-shield',
  webapp: 'i-web',
  wine: 'i-box',
};
const SPECIAL_ACTIONS = {
  'set-hostname': { type: 'hostname' },
  'configure-dnf': { type: 'configure-dnf' },
  'dnf-autoupdate': { type: 'dnf-autoupdate' },
  'flathub-replace': { type: 'flathub' },
  ssh: { type: 'ssh' },
  'firmware-update': { type: 'firmware' },
  'rpmfusion-repos': { type: 'rpmfusion' },
  'multimedia-codecs': { type: 'packages', manager: 'dnf', packages: ['gstreamer1-plugin-openh264', 'gstreamer1-libav', 'ffmpeg'] },
  'intel-codecs': { type: 'packages', manager: 'dnf', packages: ['intel-media-driver'] },
  'amd-codecs': { type: 'packages', manager: 'dnf', packages: ['mesa-va-drivers', 'mesa-vdpau-drivers'] },
  virtualization: { type: 'group', group: 'Virtualization' },
  'power-settings': { type: 'power-profile' },
  'nodejs-npm': { type: 'packages', manager: 'dnf', packages: ['nodejs', 'npm'] },
  'flatpak-update': { type: 'flatpak-update' },
  'wake-on-lan': { type: 'wake-on-lan' },
  'system-cleanup': { type: 'cleanup' },
};

const state = {
  selected: new Set(),
  inputs: {},
  version: '44',
  desktop: 'gnome',
  outputMode: 'quiet',
  theme: 'system',
  textSize: 1,
  activeScript: 'setup',
  expanded: false,
  pendingCritical: null,
  pendingSelection: [],
};

const elements = Object.fromEntries([
  'category-list', 'fedora-version', 'desktop-select', 'output-mode', 'risk-legend',
  'script-preview', 'script-code', 'script-expand', 'script-panel', 'risk-summary',
  'critical-banner', 'revert-warning', 'install-tab', 'revert-tab', 'copy-status',
  'bootstrap-note', 'item-count', 'search-options', 'search-count', 'no-results',
  'clear-search', 'theme-select', 'wrap-toggle', 'text-smaller', 'text-reset',
  'text-larger', 'fullscreen-script', 'copy-script', 'download-script',
  'mobile-selected-count', 'mobile-copy-script', 'mobile-expand-script',
  'conflict-notice',
].map((id) => [id, document.getElementById(id)]));

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be disabled by browser settings.
  }
}

function readSelections() {
  try {
    const saved = JSON.parse(readStorage(STORAGE_KEYS.selections, '[]'));
    if (Array.isArray(saved)) {
      for (const id of saved) {
        const item = CATALOG_ITEMS.find((entry) => entry.id === id);
        if (item && !item.needsVerification && itemAction(item)) state.selected.add(id);
      }
    }
  } catch {
    state.selected.clear();
  }
}

function svgIcon(symbol, className = 'icon') {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.classList.add(...className.split(' '));
  icon.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${symbol}`);
  icon.append(use);
  return icon;
}

function riskChip(risk, includeIcon = true, tooltip = '') {
  const chip = document.createElement('span');
  chip.className = `risk-chip risk-${risk}`;
  if (tooltip) chip.title = tooltip;
  if (includeIcon) chip.append(svgIcon(RISK_ICONS[risk]));
  chip.append(document.createTextNode(RISK_LABELS[risk]));
  return chip;
}

function userFacingRisk(item) {
  return `${item.riskReason}${item.risk === 'critical' ? ' This change may have lasting effects.' : ''}`;
}

function itemAction(item) {
  if (item.needsVerification) return null;
  if (SPECIAL_ACTIONS[item.id]) return SPECIAL_ACTIONS[item.id];
  if (item.installMethod === 'dnf') {
    const match = item.command.match(/^sudo dnf5 install -y ([A-Za-z0-9._+-]+(?: [A-Za-z0-9._+-]+)*)$/);
    if (match) return { type: 'packages', manager: 'dnf', packages: match[1].split(' ') };
  }
  if (item.installMethod === 'flatpak') {
    const match = item.command.match(/^flatpak install -y flathub ([A-Za-z0-9_.-]+)$/);
    if (match) return { type: 'packages', manager: 'flatpak', packages: [match[1]] };
  }
  return null;
}

function getRecommendations() {
  return new Set([...RECOMMENDATIONS.common, ...(RECOMMENDATIONS[state.desktop] || [])]);
}

function populateVersions() {
  const select = elements['fedora-version'];
  for (const [version, data] of Object.entries(FEDORA_VERSIONS)) {
    const option = document.createElement('option');
    option.value = version;
    option.textContent = data.support === 'eol' ? `${data.label} — End of life` : data.label;
    select.append(option);
  }
  select.value = state.version;
}

function renderRiskLegend() {
  const legend = elements['risk-legend'];
  legend.replaceChildren();
  const descriptions = {
    critical: 'System-level changes with potentially lasting consequences.',
    high: 'Changes important system defaults, services, or trust settings.',
    caution: 'May add third-party software, proprietary software, or persistent behavior.',
    safe: 'Routine software or system actions with limited expected impact.',
  };
  for (const risk of ['critical', 'high', 'caution', 'safe']) legend.append(riskChip(risk, true, descriptions[risk]));
}

function appendItemInput(container, item) {
  const type = item.requiresInput?.type;
  if (!type) return;
  const wrap = document.createElement('label');
  wrap.className = 'item-input';
  const controlId = `input-${item.id}`;
  const label = document.createElement('span');
  label.textContent = type === 'hostname' ? 'Hostname' : type === 'interface' ? 'Network interface' : 'Power profile';
  wrap.htmlFor = controlId;
  let control;
  if (type === 'power-profile') {
    control = document.createElement('select');
    control.append(new Option('Choose a power profile', ''));
    for (const [value, text] of [['balanced', 'Balanced'], ['power-saver', 'Power saver'], ['performance', 'Performance']]) {
      control.append(new Option(text, value));
    }
  } else {
    control = document.createElement('input');
    control.type = 'text';
    control.autocomplete = 'off';
    control.placeholder = type === 'hostname' ? 'e.g. fedora-desktop' : 'e.g. eno1';
    control.pattern = type === 'hostname'
      ? '[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
      : '[A-Za-z0-9][A-Za-z0-9_.:-]{0,14}';
  }
  control.id = controlId;
  control.name = controlId;
  control.value = state.inputs[item.id] || '';
  control.setAttribute('aria-describedby', `${controlId}-error`);
  const error = document.createElement('span');
  error.id = `${controlId}-error`;
  error.className = 'field-error';
  error.setAttribute('aria-live', 'polite');
  wrap.append(label, control, error);
  container.append(wrap);
}

function matchingItems(search) {
  const terms = search.trim().toLocaleLowerCase();
  if (!terms) return CATALOG_ITEMS;
  return CATALOG_ITEMS.filter((item) => {
    const text = `${item.label} ${item.description} ${item.section} ${item.risk} ${item.installSource}`.toLocaleLowerCase();
    return text.includes(terms);
  });
}

function renderCategories() {
  const list = elements['category-list'];
  const query = elements['search-options'].value;
  const filtered = new Set(matchingItems(query));
  const recommended = getRecommendations();
  list.replaceChildren();
  let visibleCount = 0;
  for (const section of SECTIONS) {
    const items = CATALOG_ITEMS.filter((item) => item.section === section.id && filtered.has(item));
    if (!items.length) continue;
    const sectionItems = CATALOG_ITEMS.filter((item) => item.section === section.id);
    visibleCount += items.length;
    const details = document.createElement('details');
    details.className = 'section-card';
    details.open = Boolean(query) || section.id === 'system-config' || section.id === 'essential-apps';
    details.dataset.section = section.id;
    const summary = document.createElement('summary');
    const title = document.createElement('span');
    title.className = 'section-title';
    title.append(svgIcon(SECTION_ICONS[section.id]), document.createTextNode(section.title));
    const summaryContent = document.createElement('span');
    summaryContent.className = 'section-summary';
    if (section.counter) {
      const count = document.createElement('span');
      count.className = 'badge';
      count.setAttribute('aria-live', 'polite');
      count.textContent = `${sectionItems.filter((item) => state.selected.has(item.id)).length} / ${sectionItems.length} selected`;
      summaryContent.append(count);
    }
    summaryContent.append(svgIcon('i-chevron', 'icon section-chevron'));
    summary.append(title, summaryContent);
    details.append(summary);
    const sectionActions = document.createElement('div');
    sectionActions.className = 'section-actions';
    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.className = 'button';
    selectButton.textContent = 'Select all';
    selectButton.dataset.action = 'section-select';
    selectButton.dataset.section = section.id;
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'button';
    clearButton.textContent = 'Clear';
    clearButton.dataset.action = 'section-clear';
    clearButton.dataset.section = section.id;
    sectionActions.append(selectButton, clearButton);
    details.append(sectionActions);
    const itemList = document.createElement('div');
    itemList.className = 'item-list';
    for (const item of items) {
      const row = document.createElement('div');
      row.className = 'item-row';
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.id = `item-${item.id}`;
      check.dataset.id = item.id;
      check.checked = state.selected.has(item.id);
      const compatible = item.desktopApplicability.includes(state.desktop);
      const available = Boolean(itemAction(item));
      check.disabled = !compatible || !available;
      check.setAttribute('aria-describedby', `desc-${item.id}`);
      const iconSymbol = item.icon || (item.tags || []).map((tag) => ITEM_TAG_ICONS[tag]).find(Boolean) || SECTION_ICONS[item.section] || 'i-info';
      const icon = svgIcon(iconSymbol, 'icon item-icon');
      const main = document.createElement('div');
      main.className = 'item-main';
      const itemTitle = document.createElement('label');
      itemTitle.className = 'item-title';
      itemTitle.htmlFor = check.id;
      itemTitle.append(document.createTextNode(item.label), riskChip(item.risk, false, item.riskReason));
      if (recommended.has(item.id) && item.risk !== 'critical') {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = 'Recommended';
        itemTitle.append(badge);
      }
      if (FEDORA_VERSIONS[state.version].support === 'eol') {
        const badge = document.createElement('span');
        badge.className = 'badge badge-eol';
        badge.textContent = 'End of life';
        itemTitle.append(badge);
      }
      const description = document.createElement('span');
      description.className = 'item-desc';
      description.id = `desc-${item.id}`;
      description.textContent = item.description;
      const source = document.createElement('span');
      source.className = 'item-source small-note';
      source.textContent = `Source: ${item.installSource}`;
      main.append(itemTitle, description, source);
      const reason = document.createElement('p');
      reason.className = `item-warning small-note risk-${item.risk}`;
      if (item.risk !== 'safe') reason.textContent = `${RISK_LABELS[item.risk]}: ${userFacingRisk(item)}`;
      if (item.needsVerification || !available) {
        const disabled = document.createElement('p');
        disabled.className = 'item-warning field-error';
        disabled.textContent = 'Needs verification: script generation is disabled until an official source and safe install method are confirmed.';
        main.append(disabled);
      }
      if (!compatible) {
        const disabled = document.createElement('p');
        disabled.className = 'item-warning small-note';
        disabled.textContent = item.notApplicableNote || `Not applicable to ${state.desktop === 'kde' ? 'KDE Plasma' : 'GNOME Workstation'}.`;
        main.append(disabled);
      }
      if (item.risk !== 'safe') main.append(reason);
      appendItemInput(main, item);
      row.append(check, icon, main);
      itemList.append(row);
    }
    details.append(itemList);
    list.append(details);
  }
  elements['no-results'].hidden = visibleCount > 0;
  elements['search-count'].textContent = query ? `${visibleCount} matching options.` : '';
  const count = state.selected.size;
  const itemCount = document.getElementById('item-count');
  if (itemCount) itemCount.textContent = `${count} selected`;
  elements['mobile-selected-count'].textContent = `${count} selected`;
}

function validateInput(item, value) {
  if (item.requiresInput.type === 'hostname') return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(value);
  if (item.requiresInput.type === 'interface') return /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,14}$/.test(value);
  return ['balanced', 'power-saver', 'performance'].includes(value);
}

function collectInputs() {
  const errors = [];
  for (const id of state.selected) {
    const item = CATALOG_ITEMS.find((entry) => entry.id === id);
    if (!item?.requiresInput) continue;
    const control = document.getElementById(`input-${id}`);
    const error = document.getElementById(`input-${id}-error`);
    const value = control?.value.trim() || '';
    const valid = validateInput(item, value);
    control?.setAttribute('aria-invalid', String(!valid));
    if (error) error.textContent = valid ? '' : `Enter a valid ${item.requiresInput.type === 'hostname' ? 'hostname' : item.requiresInput.type === 'interface' ? 'network interface name' : 'power profile'}.`;
    if (!valid) errors.push(item.label);
    else state.inputs[id] = value;
  }
  return errors;
}

function persistState() {
  writeStorage(STORAGE_KEYS.selections, JSON.stringify([...state.selected]));
  writeStorage(STORAGE_KEYS.textSize, String(state.textSize));
  writeStorage(STORAGE_KEYS.theme, state.theme);
}

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let faviconImage;
let faviconTheme = 'light';

function renderFavicon(theme) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (!context) {
    console.error('Unable to create a canvas context for the site favicon.');
    return;
  }
  context.drawImage(faviconImage, 0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = 'source-in';
  context.fillStyle = theme === 'dark' ? '#51a2da' : '#294172';
  context.fillRect(0, 0, canvas.width, canvas.height);
  document.getElementById('site-favicon').href = canvas.toDataURL('image/png');
}

function updateFavicon(theme) {
  faviconTheme = theme;
  if (faviconImage) {
    if (faviconImage.complete && faviconImage.naturalWidth > 0) renderFavicon(faviconTheme);
    return;
  }
  faviconImage = new Image();
  faviconImage.onload = () => renderFavicon(faviconTheme);
  faviconImage.onerror = () => console.error('Unable to load the site favicon from assets/Fed-up.svg.');
  faviconImage.src = 'assets/Fed-up.svg';
}

function applyTheme() {
  state.theme = elements['theme-select'].value;
  if (state.theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = state.theme;
  const resolved = state.theme === 'system' ? systemTheme() : state.theme;
  updateFavicon(resolved);
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    const active = meta.media.includes(resolved);
    if (active) meta.removeAttribute('media');
    else meta.media = 'not all';
  }
  const activeMeta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (activeMeta) activeMeta.content = resolved === 'dark' ? '#121820' : '#ffffff';
  persistState();
}

function actionFor(item) {
  return itemAction(item);
}

function installerDocs(item) {
  const docs = [];
  if (['dnf', 'service', 'cleanup'].includes(item.installMethod) || item.id === 'configure-dnf') {
    docs.push({
      label: 'Fedora DNF guide',
      url: 'https://docs.fedoraproject.org/en-US/quick-docs/dnf/',
    });
  }
  if (item.installMethod === 'service') {
    docs.push({
      label: 'systemctl documentation',
      url: 'https://www.freedesktop.org/software/systemd/man/latest/systemctl.html',
    });
  }
  if (item.installMethod === 'flatpak') {
    docs.push({ label: 'Flatpak usage documentation', url: 'https://docs.flatpak.org/en/latest/using-flatpak.html' });
    docs.push({ label: 'Flathub setup', url: 'https://flathub.org/setup' });
  }
  if (item.id === 'dnf-autoupdate') {
    docs.push({
      label: 'Fedora automatic updates guide',
      url: 'https://docs.fedoraproject.org/en-US/quick-docs/autoupdates/',
    });
  }
  if (item.id === 'rpmfusion-repos') {
    docs.push({ label: 'RPM Fusion configuration', url: 'https://rpmfusion.org/Configuration' });
  }
  if (item.id === 'firmware-update') {
    docs.push({ label: 'fwupd project', url: 'https://fwupd.org/' });
  }
  if (item.id === 'set-hostname') {
    docs.push({
      label: 'hostnamectl documentation',
      url: 'https://www.freedesktop.org/software/systemd/man/latest/hostnamectl.html',
    });
  }
  if (item.id === 'wake-on-lan') {
    docs.push({
      label: 'NetworkManager nmcli documentation',
      url: 'https://networkmanager.pages.freedesktop.org/NetworkManager/NetworkManager/nmcli.html',
    });
  }
  if (item.id === 'dnf-autoupdate') {
    docs.push({
      label: 'systemd timer documentation',
      url: 'https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html',
    });
  }
  return docs;
}

function buildOperation(item) {
  const action = actionFor(item);
  return {
    id: item.id,
    label: item.label,
    section: SECTIONS.find((section) => section.id === item.section)?.title || item.section,
    risk: item.risk,
    riskReason: userFacingRisk(item),
    reversible: item.revertible,
    revertReason: item.revertReason,
    description: item.description,
    source: item.installSource,
    docs: installerDocs(item),
    action,
    eligible: Boolean(action) && !item.needsVerification,
    unavailableReason: item.needsVerification
      ? 'Installation source or instructions still need verification.'
      : action ? '' : 'No verified install action is available.',
    inputType: item.requiresInput?.type || null,
    inputOptions: item.requiresInput?.type === 'power-profile'
      ? ['balanced', 'power-saver', 'performance']
      : [],
    input: state.inputs[item.id] || '',
    dependsOn: [...(item.depends_on || [])],
    conflictsWith: [...(item.conflicts_with || [])],
    desktopApplicability: [...(item.desktopApplicability || [])],
    supportedVersions: [...(item.supportedVersions || [])],
  };
}

function buildSelectedOperations() {
  return CATALOG_ITEMS.filter((item) => state.selected.has(item.id)).map(buildOperation);
}

function pythonPayload() {
  return String.raw`#!/usr/bin/env python3
import argparse
import base64
import json
import os
import re
import shutil
import subprocess
import sys

parser = argparse.ArgumentParser(description="Fed-up Fedora setup script")
parser.add_argument("--metadata-file", required=True)
parser.add_argument("--yes", action="store_true", help="Automatically approve confirmations")
output_group = parser.add_mutually_exclusive_group()
output_group.add_argument("--quiet", action="store_true", help="Suppress routine progress output")
output_group.add_argument("--verbose", action="store_true", help="Show command output")
parser.add_argument("--quit", action="store_true", help="Exit without running setup")
args = parser.parse_args()

try:
    with open(args.metadata_file, encoding="ascii") as metadata_file:
        encoded_metadata = metadata_file.read().strip()
    data = json.loads(base64.b64decode(encoded_metadata, validate=True).decode("utf-8"))
except (OSError, ValueError, UnicodeDecodeError, json.JSONDecodeError) as error:
    raise SystemExit(f"Invalid embedded configuration: {error}")

version = data["version"]
mode = data["mode"]
operations = data["operations"]
catalog = data.get("catalog", [])
default_state_dir = "/var/lib/fed-up" if os.geteuid() == 0 else os.path.join(os.path.expanduser("~"), ".local", "state", "fed-up")
state_file = os.path.join(os.environ.get("FED_UP_STATE_DIR", default_state_dir), "state.json")
verbose = args.verbose or (data["outputMode"] == "verbose" and not args.quiet)
quiet = args.quiet or (data["outputMode"] == "quiet" and not args.verbose)
auto_approve = args.yes

class ActionFailure(Exception):
    pass

def fail(message):
    raise SystemExit(message)

def run(argv, *, check=True, capture=False):
    try:
        options = {"check": False, "text": True}
        if capture or not verbose:
            options["capture_output"] = True
        result = subprocess.run(argv, **options)
        if not capture and verbose:
            if result.stdout:
                print(result.stdout, end="")
            if result.stderr:
                print(result.stderr, end="", file=sys.stderr)
        if check and result.returncode != 0:
            details = result.stderr.strip() if result.stderr else ""
            raise ActionFailure(f"Command failed ({result.returncode}): {argv[0]}{': ' + details if details else ''}")
        return result
    except FileNotFoundError as error:
        raise ActionFailure(f"Required command not found: {argv[0]}") from error

def require_root():
    if os.geteuid() != 0:
        fail("Selected operation requires administrator privileges. Review this script, then run it with sudo.")

def confirm(message):
    if auto_approve:
        return True
    if shutil.which("gum") and sys.stdin.isatty():
        result = subprocess.run(["gum", "confirm", message])
        return result.returncode == 0
    if not sys.stdin.isatty():
        fail("A confirmation is required; run interactively or pass --yes after reviewing the script.")
    try:
        return input(message + " [y/N] ").strip().lower() in ("y", "yes")
    except EOFError:
        return False

def fedora_release():
    try:
        values = {}
        with open("/etc/os-release", encoding="utf-8") as release:
            for line in release:
                if "=" in line:
                    key, value = line.rstrip().split("=", 1)
                    values[key] = value.strip('"')
        if values.get("ID") not in ("fedora",):
            fail("This script only supports Fedora Linux.")
        return values.get("VERSION_ID", "")
    except OSError as error:
        fail(f"Cannot read /etc/os-release: {error}")

def validate_data(candidates=None):
    if mode == "revert":
        return []
    errors = []
    for operation in (operations if candidates is None else candidates):
        action = operation["action"]
        if not action or not operation.get("eligible", True):
            errors.append(f"{operation['label']} has no verified install action; refusing to guess.")
        if operation.get("inputType") == "hostname" or operation["id"] == "set-hostname":
            value = operation["input"]
            if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?", value):
                errors.append(f"{operation['label']}: enter 1-63 letters, digits, or internal hyphens.")
        if operation.get("inputType") == "interface" or operation["id"] == "wake-on-lan":
            value = operation["input"]
            if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:-]{0,14}", value):
                errors.append(f"{operation['label']}: enter a valid network interface name.")
        if (operation.get("inputType") == "power-profile" or operation["id"] == "power-settings") and operation["input"] not in ("balanced", "power-saver", "performance"):
            errors.append(f"{operation['label']}: choose balanced, power-saver, or performance.")
    return errors

def load_state():
    try:
        with open(state_file, encoding="utf-8") as source:
            value = json.load(source)
        if isinstance(value, dict):
            return value
    except FileNotFoundError:
        return {}
    except (OSError, ValueError) as error:
        fail(f"Cannot read previous Fed-up state: {error}")
    return {}

def save_state(value):
    os.makedirs(os.path.dirname(state_file), mode=0o700, exist_ok=True)
    temporary = state_file + ".tmp"
    with open(temporary, "w", encoding="utf-8") as destination:
        json.dump(value, destination, indent=2, sort_keys=True)
    os.chmod(temporary, 0o600)
    os.replace(temporary, state_file)

def installed_rpm(package):
    return subprocess.run(["rpm", "-q", package], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0

def installed_flatpak(app_id):
    if not shutil.which("flatpak"):
        return False
    scope = "--system" if os.geteuid() == 0 else "--user"
    result = subprocess.run(["flatpak", "list", scope, "--app", "--columns=application"], capture_output=True, text=True)
    return result.returncode == 0 and app_id in result.stdout.splitlines()

def remember_package(prior, manager, name, scope=None):
    entry = {"manager": manager, "name": name}
    if scope:
        entry["scope"] = scope
    packages = prior.setdefault("packages", [])
    if not any(
        existing.get("manager") == manager
        and existing.get("name") == name
        and existing.get("scope", scope) == scope
        for existing in packages
    ):
        packages.append(entry)

def remember_new_packages(prior, manager, packages):
    for package, was_installed in packages:
        if was_installed:
            continue
        installed = installed_rpm(package) if manager == "dnf" else installed_flatpak(package)
        if installed:
            scope = "--system" if os.geteuid() == 0 else "--user"
            remember_package(prior, manager, package, scope if manager == "flatpak" else None)

def execute_action(operation, prior):
    action = operation["action"]
    kind = action["type"]
    if kind == "packages":
        manager = action["manager"]
        packages = action["packages"]
        existed = []
        for package in packages:
            was_installed = installed_rpm(package) if manager == "dnf" else installed_flatpak(package)
            existed.append((package, was_installed))
        try:
            if manager == "dnf":
                run(["dnf", "install", "-y", *packages])
            else:
                scope = "--system" if os.geteuid() == 0 else "--user"
                run(["flatpak", "install", scope, "-y", "flathub", *packages])
        except (ActionFailure, SystemExit):
            remember_new_packages(prior, manager, existed)
            raise
        remember_new_packages(prior, manager, existed)
    elif kind == "group":
        run(["dnf", "group", "install", "-y", action["group"]])
    elif kind == "hostname":
        old = run(["hostnamectl", "--static"], capture=True).stdout.strip()
        prior.setdefault("hostname", old)
        run(["hostnamectl", "set-hostname", operation["input"]])
    elif kind == "configure-dnf":
        run(["dnf", "config-manager", "setopt", "fastestmirror=True"])
        run(["dnf", "config-manager", "setopt", "deltarpm=True"])
    elif kind == "dnf-autoupdate":
        package = "dnf5-plugin-automatic"
        timer = "dnf-automatic.timer"
        before = installed_rpm(package)
        was_enabled = subprocess.run(["systemctl", "is-enabled", timer], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
        try:
            run(["dnf", "install", "-y", package])
        except (ActionFailure, SystemExit):
            remember_new_packages(prior, "dnf", [(package, before)])
            raise
        if not before:
            remember_package(prior, "dnf", package)
        try:
            run(["systemctl", "enable", "--now", timer])
        except (ActionFailure, SystemExit):
            if not was_enabled and subprocess.run(["systemctl", "is-enabled", timer], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
                prior.setdefault("services", []).append(timer)
            raise
        if not was_enabled:
            prior.setdefault("services", []).append(timer)
    elif kind == "flathub":
        scope = "--system" if os.geteuid() == 0 else "--user"
        result = subprocess.run(["flatpak", "remote-list", scope, "--columns=name"], capture_output=True, text=True)
        if result.returncode != 0:
            fail("Flatpak is unavailable; install it before adding Flathub.")
        if "flathub" not in result.stdout.splitlines():
            run(["flatpak", "remote-add", scope, "--if-not-exists", "flathub", "https://flathub.org/repo/flathub.flatpakrepo"])
            prior.setdefault("flatpak_remotes", []).append({"name": "flathub", "scope": scope})
    elif kind == "ssh":
        before = installed_rpm("openssh-server")
        was_enabled = subprocess.run(["systemctl", "is-enabled", "sshd.service"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
        try:
            run(["dnf", "install", "-y", "openssh-server"])
        except (ActionFailure, SystemExit):
            remember_new_packages(prior, "dnf", [("openssh-server", before)])
            raise
        if not before:
            remember_package(prior, "dnf", "openssh-server")
        try:
            run(["systemctl", "enable", "--now", "sshd.service"])
        except (ActionFailure, SystemExit):
            if not was_enabled and subprocess.run(["systemctl", "is-enabled", "sshd.service"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
                prior.setdefault("services", []).append("sshd.service")
            raise
        if not was_enabled:
            prior.setdefault("services", []).append("sshd.service")
    elif kind == "firmware":
        if not confirm("Firmware updates may be irreversible and can affect boot. Continue?"):
            raise ActionFailure("Firmware update confirmation declined.")
        run(["fwupdmgr", "refresh"])
        run(["fwupdmgr", "update", "--assume-yes"])
    elif kind == "rpmfusion":
        base = f"https://mirrors.rpmfusion.org/{{repo}}/fedora/rpmfusion-{{repo}}-release-{version}.noarch.rpm"
        print("RPM Fusion repository source: https://rpmfusion.org/Configuration")
        print(f"Packages: {base.format(repo='free')} and {base.format(repo='nonfree')}")
        print("Free repository key fingerprint: E9A4 91A3 DE24 7814 E7E0 67EA E06F 8ECD D651 FF2E")
        print("Nonfree repository key fingerprint: 79BD B88F 9BBF 7391 0FD4 095B 6A2A F961 9484 3C65")
        if not confirm("Trust the RPM Fusion repositories and their signing keys?"):
            raise ActionFailure("RPM Fusion repository confirmation declined.")
        had_free = installed_rpm("rpmfusion-free-release")
        had_nonfree = installed_rpm("rpmfusion-nonfree-release")
        try:
            run(["dnf", "install", "-y", base.format(repo="free"), base.format(repo="nonfree")])
        except (ActionFailure, SystemExit):
            remember_new_packages(prior, "dnf", [
                ("rpmfusion-free-release", had_free),
                ("rpmfusion-nonfree-release", had_nonfree),
            ])
            raise
        for package, was_installed in (("rpmfusion-free-release", had_free), ("rpmfusion-nonfree-release", had_nonfree)):
            if not was_installed:
                remember_package(prior, "dnf", package)
    elif kind == "power-profile":
        if not shutil.which("powerprofilesctl"):
            fail("powerprofilesctl is unavailable; install power-profiles-daemon first.")
        prior.setdefault("power_profile", run(["powerprofilesctl", "get"], capture=True).stdout.strip())
        run(["powerprofilesctl", "set", operation["input"]])
    elif kind == "flatpak-update":
        scope = "--system" if os.geteuid() == 0 else "--user"
        run(["flatpak", "update", scope, "-y"])
    elif kind == "wake-on-lan":
        if not shutil.which("nmcli"):
            fail("NetworkManager nmcli is required for Wake-on-LAN.")
        interface = operation["input"]
        result = run(["nmcli", "-g", "GENERAL.CONNECTION", "device", "show", interface], capture=True)
        connection = result.stdout.strip()
        if not connection or connection == "--":
            fail(f"No NetworkManager connection is associated with {interface}.")
        previous = run(["nmcli", "-g", "802-3-ethernet.wake-on-lan", "connection", "show", connection], capture=True).stdout.strip()
        prior.setdefault("wol", []).append({"connection": connection, "interface": interface, "previous": previous})
        run(["nmcli", "connection", "modify", connection, "802-3-ethernet.wake-on-lan", "magic"])
        run(["nmcli", "connection", "up", connection])
    elif kind == "cleanup":
        print("Cleanup removes DNF's cached package metadata and downloaded package files only.")
        if confirm("Clean the DNF package cache?"):
            run(["dnf", "clean", "all"])
        else:
            raise ActionFailure("DNF cleanup confirmation declined.")
    else:
        fail(f"Unsupported operation type: {kind}")

def choose_menu(title, choices):
    if not choices:
        return None
    if shutil.which("gum") and sys.stdin.isatty():
        try:
            result = subprocess.run(
                ["gum", "choose", "--header", title, *choices],
                text=True,
                stdout=subprocess.PIPE,
            )
        except FileNotFoundError:
            result = None
        if result is not None:
            return result.stdout.strip() if result.returncode == 0 else None
    if not sys.stdin.isatty():
        return None
    print(f"\n{title}")
    for index, choice in enumerate(choices, start=1):
        print(f"  {index}. {choice}")
    while True:
        try:
            answer = input("Choose a number (0 to go back): ").strip()
        except EOFError:
            return None
        if answer == "0":
            return None
        if answer.isdigit() and 1 <= int(answer) <= len(choices):
            return choices[int(answer) - 1]
        print(f"Enter a number from 1 to {len(choices)}, or 0 to go back.")

def ask_value(prompt, current=""):
    if shutil.which("gum") and sys.stdin.isatty():
        try:
            result = subprocess.run(
                ["gum", "input", "--prompt", f"{prompt}: ", "--value", current],
                text=True,
                stdout=subprocess.PIPE,
            )
        except FileNotFoundError:
            result = None
        if result is not None:
            return result.stdout.rstrip("\n") if result.returncode == 0 else None
    if not sys.stdin.isatty():
        return None
    try:
        return input(f"{prompt}{f' [{current}]' if current else ''}: ").strip() or current
    except EOFError:
        return None

def selectable(operation):
    return (
        operation.get("eligible", bool(operation.get("action")))
        and operation.get("action")
        and data["desktop"] in operation.get("desktopApplicability", ["gnome", "kde"])
        and version in operation.get("supportedVersions", [version])
    )

def input_is_valid(operation, value):
    input_type = operation.get("inputType")
    if input_type == "hostname" or operation["id"] == "set-hostname":
        return bool(re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?", value))
    if input_type == "interface" or operation["id"] == "wake-on-lan":
        return bool(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:-]{0,14}", value))
    if input_type == "power-profile" or operation["id"] == "power-settings":
        return value in ("balanced", "power-saver", "performance")
    return True

def edit_operation_input(operation):
    input_type = operation.get("inputType")
    if not input_type:
        return operation.get("input", "")
    if input_type == "power-profile":
        value = choose_menu(
            f"{operation['label']} — choose a power profile",
            operation.get("inputOptions") or ["balanced", "power-saver", "performance"],
        )
        return value
    prompt = {
        "hostname": "Hostname (1-63 letters, digits, or internal hyphens)",
        "interface": "Network interface name (up to 15 characters)",
    }.get(input_type, operation["label"])
    for attempt in range(1, 4):
        value = ask_value(prompt, operation.get("input", ""))
        if value is None:
            return None
        if input_is_valid(operation, value):
            operation["input"] = value
            return value
        print(f"Invalid value. Check the format and try again ({attempt}/3).")
    return None

def show_operation(operation):
    print(f"\n{operation['label']} — {operation['risk'].upper()} ({operation['section']})")
    print(operation.get("description") or "No additional description is available.")
    if operation.get("riskReason"):
        print(f"Risk: {operation['riskReason']}")
    print(f"Source: {operation.get('source') or 'Not specified'}")
    print(f"Reversibility: {operation.get('revertReason') or ('Reversible' if operation.get('reversible') else 'Not reliably reversible')}")
    lookup = {entry["id"]: entry for entry in catalog}
    requirements = [lookup[item_id]["label"] for item_id in operation.get("dependsOn", []) if item_id in lookup]
    if requirements:
        print("Required actions: " + ", ".join(requirements))
    conflicts = [lookup[item_id]["label"] for item_id in operation.get("conflictsWith", []) if item_id in lookup]
    if conflicts:
        print("Conflicts with: " + ", ".join(conflicts))
    if operation.get("inputType"):
        print(f"Current value: {operation.get('input') or '(not set)'}")
    docs = operation.get("docs", [])
    if docs:
        print("Documentation:")
        for document in docs:
            print(f"  {document['label']}: {document['url']}")
    else:
        print("Documentation: No curated official link is available for this item.")

def find_conflicts(selected):
    pairs = []
    seen = set()
    for operation in selected.values():
        for other_id in operation.get("conflictsWith", []):
            if other_id in selected:
                pair = tuple(sorted((operation["id"], other_id)))
                if pair not in seen:
                    seen.add(pair)
                    pairs.append(pair)
    for group in (
        ("firefox", "google-chrome", "chromium", "brave", "vivaldi", "microsoft-edge", "librewolf", "opera", "zen-browser"),
        ("libreoffice", "onlyoffice", "wps-office"),
        ("docker", "podman"),
    ):
        present = [item_id for item_id in group if item_id in selected]
        for index, left in enumerate(present):
            for right in present[index + 1:]:
                pair = tuple(sorted((left, right)))
                if pair not in seen:
                    seen.add(pair)
                    pairs.append(pair)
    return pairs

def remove_with_dependents(selected, ids):
    removing = set(ids)
    changed = True
    while changed:
        changed = False
        for operation in selected.values():
            if operation["id"] not in removing and any(item_id in removing for item_id in operation.get("dependsOn", [])):
                removing.add(operation["id"])
                changed = True
    for item_id in removing:
        selected.pop(item_id, None)
    return removing

def add_with_dependencies(selected, operation, visiting=None):
    if not selectable(operation):
        print(f"Unavailable: {operation['label']}: {operation.get('unavailableReason') or 'not supported for this setup'}.")
        return False
    visiting = set() if visiting is None else visiting
    if operation["id"] in visiting:
        fail(f"Catalog dependency cycle detected at {operation['label']}.")
    visiting.add(operation["id"])
    lookup = {entry["id"]: entry for entry in catalog}
    for dependency_id in operation.get("dependsOn", []):
        if dependency_id in selected:
            continue
        dependency = lookup.get(dependency_id)
        if dependency is None or not selectable(dependency):
            print(f"Cannot add {operation['label']}: required action {dependency_id} is unavailable.")
            visiting.remove(operation["id"])
            return False
        print(f"Adding required action: {dependency['label']}.")
        if dependency["risk"] == "critical" and not confirm(
            f"Required action is Critical: {dependency['label']}. Continue?"
        ):
            print(f"Keeping {operation['label']} unselected because its required action was declined.")
            visiting.remove(operation["id"])
            return False
        if not add_with_dependencies(selected, dict(dependency), visiting):
            visiting.remove(operation["id"])
            return False
    selected[operation["id"]] = dict(operation)
    visiting.remove(operation["id"])
    return True

def add_missing_dependencies(selected):
    lookup = {entry["id"]: entry for entry in catalog}
    added_any = False
    while True:
        missing = [
            dependency_id
            for operation in list(selected.values())
            for dependency_id in operation.get("dependsOn", [])
            if dependency_id not in selected
        ]
        if not missing:
            return added_any
        dependency_id = missing[0]
        dependency = lookup.get(dependency_id)
        if dependency is None or not selectable(dependency):
            fail(f"A selected action requires unavailable catalog action {dependency_id}.")
        print(f"Required by the current selection: {dependency['label']}.")
        if dependency["risk"] == "critical" and not confirm(
            f"Required action is Critical: {dependency['label']}. Continue?"
        ):
            fail(f"Cannot continue without required action {dependency['label']}.")
        if not add_with_dependencies(selected, dict(dependency)):
            fail(f"Could not add required action {dependency['label']}.")
        added_any = True

def choose_unavailable():
    unavailable = [
        operation for operation in catalog
        if not selectable(operation)
    ]
    print(f"\nUnavailable or unverified catalog actions: {len(unavailable)}")
    for operation in unavailable:
        reason = operation.get("unavailableReason") or "Not supported for the selected Fedora version or desktop."
        print(f"  - {operation['label']}: {reason}")
    if unavailable and sys.stdin.isatty():
        choose_menu("Unavailable actions are informational and cannot be selected.", ["Back"])

def review_catalog(selected, outcomes, attempt_counts):
    lookup = {entry["id"]: entry for entry in catalog}
    available = [entry for entry in catalog if selectable(entry)]
    while True:
        choices = []
        choice_ids = {}
        for operation in available:
            status = "ON" if operation["id"] in selected else "off"
            outcome = outcomes.get(operation["id"], {}).get("status")
            if outcome == "installed":
                status = "DONE"
            elif outcome in ("failed", "skipped"):
                remaining = max(0, 3 - attempt_counts.get(operation["id"], 0))
                status = outcome.upper() + (f" — {remaining} retries left" if remaining else " — attempt limit reached")
            label = f"[{status}] [{operation['risk'].upper()}] {operation['label']} — {operation['section']}"
            choices.append(label)
            choice_ids[label] = operation["id"]
        unavailable_label = f"View unavailable / unverified actions ({len(catalog) - len(available)})"
        choices.extend([unavailable_label, "Done reviewing"])
        choice = choose_menu("Review or change setup actions", choices)
        if choice is None or choice == "Done reviewing":
            return
        if choice == unavailable_label:
            choose_unavailable()
            continue
        operation_id = choice_ids.get(choice)
        operation = lookup.get(operation_id)
        if operation is None:
            continue
        show_operation(operation)
        actions = ["Toggle selection"]
        if operation.get("inputType"):
            actions.insert(0, "Edit value")
        actions.append("Back to action list")
        action = choose_menu(f"Action: {operation['label']}", actions)
        if action == "Edit value":
            value = edit_operation_input(operation)
            if value is not None:
                operation["input"] = value
                if operation_id in selected:
                    selected[operation_id]["input"] = value
        elif action == "Toggle selection":
            if operation_id in selected:
                removed = remove_with_dependents(selected, {operation_id})
                for removed_id in removed:
                    if outcomes.get(removed_id, {}).get("status") in ("failed", "skipped"):
                        outcomes.pop(removed_id, None)
                print("Removed: " + ", ".join(lookup[item_id]["label"] for item_id in removed if item_id in lookup))
            else:
                candidate = dict(operation)
                if candidate.get("inputType") and not input_is_valid(candidate, candidate.get("input", "")):
                    value = edit_operation_input(candidate)
                    if value is None:
                        print(f"{candidate['label']} remains unselected; a valid value is required.")
                        continue
                    candidate["input"] = value
                trial = dict(selected)
                before = set(trial)
                if not add_with_dependencies(trial, candidate):
                    continue
                changed_ids = (set(trial) - before) | {operation_id}
                conflicts = [pair for pair in find_conflicts(trial) if changed_ids.intersection(pair)]
                replace_allowed = True
                for left_id, right_id in conflicts:
                    displaced_id = right_id if left_id in changed_ids else left_id
                    displaced = lookup[displaced_id]
                    if not confirm(
                        f"{candidate['label']} conflicts with {displaced['label']}. Remove the conflicting action and its dependents?"
                    ):
                        replace_allowed = False
                        break
                    remove_with_dependents(trial, {displaced_id})
                if replace_allowed:
                    selected.clear()
                    selected.update(trial)
                    if outcomes.get(operation_id, {}).get("status") in ("failed", "skipped"):
                        outcomes.pop(operation_id, None)
                else:
                    print(f"{candidate['label']} was not added; the existing selection was kept.")

def ensure_flatpak(selected):
    needs_flatpak = any(
        operation["action"].get("manager") == "flatpak"
        or operation["action"]["type"] in ("flatpak-update", "flathub")
        for operation in selected.values()
    )
    if needs_flatpak and not shutil.which("flatpak"):
        require_root()
        print("Flatpak is required by the current selection; installing it from Fedora repositories.")
        run(["dnf", "--repo=fedora,updates", "install", "-y", "flatpak"])

def results_summary(outcomes):
    installed = [result for result in outcomes.values() if result["status"] == "installed"]
    skipped = [result for result in outcomes.values() if result["status"] == "skipped"]
    failed = [result for result in outcomes.values() if result["status"] == "failed"]
    unavailable = [operation for operation in catalog if not selectable(operation)]
    print("\nFed-up results")
    print(f"  Installed/completed: {len(installed)}")
    for result in installed:
        print(f"    - {result['label']}")
    print(f"  Skipped: {len(skipped)}")
    for result in skipped:
        print(f"    - {result['label']}: {result.get('reason', 'Skipped by user.')}")
    print(f"  Failed: {len(failed)}")
    for result in failed:
        print(f"    - {result['label']}: {result.get('reason', 'Unknown error.')}")
    print(f"  Unavailable or unverified catalog actions: {len(unavailable)}")
    for operation in unavailable[:5]:
        print(f"    - {operation['label']}: {operation.get('unavailableReason') or 'Not supported for this Fedora version or desktop.'}")
    if len(unavailable) > 5:
        print(f"    - ... and {len(unavailable) - 5} more; choose the unavailable-actions view from Review.")

def run_selected(selected, outcomes, attempt_counts):
    added_dependencies = add_missing_dependencies(selected)
    if added_dependencies:
        print("Required actions were added. Review the updated selection before starting.")
        return False
    conflicts = find_conflicts(selected)
    if conflicts:
        lookup = {entry["id"]: entry for entry in catalog}
        print("Resolve conflicting selections before running:")
        for left_id, right_id in conflicts:
            print(f"  - {lookup[left_id]['label']} conflicts with {lookup[right_id]['label']}.")
        return False
    missing_dependencies = [
        f"{operation['label']} requires {dependency_id}"
        for operation in selected.values()
        for dependency_id in operation.get("dependsOn", [])
        if dependency_id not in selected
    ]
    if missing_dependencies:
        print("Resolve missing required actions before running:")
        for message in missing_dependencies:
            print(f"  - {message}")
        return False
    errors = validate_data(selected.values())
    if errors:
        print("Fix these setup values before running:")
        for message in errors:
            print(f"  - {message}")
        return False
    pending = [
        operation for operation in selected.values()
        if outcomes.get(operation["id"], {}).get("status") not in ("installed", "skipped")
        and attempt_counts.get(operation["id"], 0) < 3
    ]
    if not pending:
        print("There are no unattempted selected actions.")
        return True
    needs_root = any(
        operation["action"]["type"] not in ("packages", "flatpak-update", "flathub")
        or operation["action"].get("manager") == "dnf"
        for operation in pending
    )
    if needs_root:
        require_root()
    ensure_flatpak({operation["id"]: operation for operation in pending})
    previous = load_state()
    stop_requested = False
    for operation in pending:
        incomplete_dependencies = [
            item_id for item_id in operation.get("dependsOn", [])
            if outcomes.get(item_id, {}).get("status") != "installed"
        ]
        if incomplete_dependencies:
            lookup = {entry["id"]: entry for entry in catalog}
            names = ", ".join(lookup[item_id]["label"] for item_id in incomplete_dependencies if item_id in lookup)
            outcomes[operation["id"]] = {
                "status": "skipped",
                "label": operation["label"],
                "reason": f"Required action did not complete: {names}.",
            }
            continue
        if operation["risk"] == "critical" and operation["id"] != "firmware-update" and not auto_approve:
            if not confirm(f"Critical change: {operation['label']}. Continue?"):
                outcomes[operation["id"]] = {
                    "status": "skipped", "label": operation["label"], "reason": "Critical confirmation declined.",
                }
                continue
        while attempt_counts.get(operation["id"], 0) < 3:
            attempt = attempt_counts.get(operation["id"], 0) + 1
            attempt_counts[operation["id"]] = attempt
            try:
                if not quiet:
                    print(f"Applying: {operation['label']} (attempt {attempt}/3)")
                execute_action(operation, previous)
                try:
                    save_state(previous)
                except OSError as state_error:
                    reason = f"Action may have completed, but Fed-up could not persist its revert state: {state_error}"
                    print(f"Error: {reason}", file=sys.stderr)
                    outcomes[operation["id"]] = {
                        "status": "failed", "label": operation["label"], "reason": reason,
                    }
                    stop_requested = True
                    break
                outcomes[operation["id"]] = {"status": "installed", "label": operation["label"]}
                break
            except (ActionFailure, SystemExit) as error:
                reason = str(error) or "The operation failed without an error message."
                print(f"Warning: {operation['label']} failed: {reason}", file=sys.stderr)
                try:
                    save_state(previous)
                except (OSError, PermissionError) as state_error:
                    print(f"Could not save partial Fed-up state: {state_error}", file=sys.stderr)
                if "confirmation declined" in reason.lower():
                    outcomes[operation["id"]] = {
                        "status": "skipped", "label": operation["label"], "reason": reason,
                    }
                    break
                choices = []
                if attempt < 3:
                    choices.append(f"Retry (attempt {attempt + 1}/3)")
                choices.extend(["Skip this action", "Quit installer"])
                decision = choose_menu(f"{operation['label']} failed after attempt {attempt}/3", choices)
                if decision and decision.startswith("Retry"):
                    continue
                if decision == "Quit installer":
                    outcomes[operation["id"]] = {
                        "status": "failed", "label": operation["label"], "reason": reason,
                    }
                    stop_requested = True
                    break
                if decision is None and sys.stdin.isatty():
                    outcomes[operation["id"]] = {
                        "status": "failed", "label": operation["label"], "reason": reason,
                    }
                    stop_requested = True
                    break
                outcomes[operation["id"]] = {
                    "status": "skipped" if decision == "Skip this action" or not sys.stdin.isatty() else "failed",
                    "label": operation["label"],
                    "reason": reason if decision == "Skip this action" or not sys.stdin.isatty() else "Installer stopped.",
                }
                break
        if stop_requested:
            break
    return True

def installer_menu():
    global auto_approve, quiet, verbose
    selected = {operation["id"]: dict(operation) for operation in operations}
    outcomes = {}
    attempt_counts = {}
    if not catalog or not sys.stdin.isatty():
        if catalog:
            errors = validate_data(selected.values())
            if errors:
                fail("; ".join(errors))
        try:
            valid = run_selected(selected, outcomes, attempt_counts)
        except (ActionFailure, SystemExit) as error:
            fail(str(error))
        if catalog:
            results_summary(outcomes)
        return valid and not any(result["status"] == "failed" for result in outcomes.values())
    while True:
        choices = [
            f"Output: {'verbose' if verbose else 'quiet'} (toggle)",
            f"Auto-approve confirmations: {'on' if auto_approve else 'off'} (toggle)",
            "Quit",
            "Review or change selections",
        ]
        if selected:
            choices.append(f"Run selected actions ({len(selected)})")
        choice = choose_menu("Fed-up installer — review changes before anything runs", choices)
        if choice is None or choice == "Quit":
            print("Fed-up setup cancelled; no further actions will run.")
            return True
        if choice == "Review or change selections":
            review_catalog(selected, outcomes, attempt_counts)
        elif choice.startswith("Run selected actions"):
            try:
                valid = run_selected(selected, outcomes, attempt_counts)
            except (ActionFailure, SystemExit) as error:
                print(f"Cannot run selected actions: {error}", file=sys.stderr)
                valid = False
            if valid:
                results_summary(outcomes)
                next_step = choose_menu("Setup pass complete", ["Return to menu", "Exit"])
                if next_step != "Return to menu":
                    return not any(result["status"] == "failed" for result in outcomes.values())
        elif choice.startswith("Output:"):
            verbose = not verbose
            quiet = not verbose
        elif choice.startswith("Auto-approve confirmations:"):
            auto_approve = not auto_approve

def do_revert():
    prior = load_state()
    if not prior:
        print("No changes recorded by Fed-up; nothing to revert.")
        return
    has_system_changes = (
        any(package["manager"] == "dnf" for package in prior.get("packages", []))
        or bool(prior.get("services"))
        or bool(prior.get("hostname"))
        or bool(prior.get("power_profile"))
        or bool(prior.get("wol"))
    )
    if has_system_changes:
        require_root()
    for service in reversed(prior.get("services", [])):
        run(["systemctl", "disable", "--now", service])
    for package in reversed(prior.get("packages", [])):
        if package["manager"] == "dnf":
            run(["dnf", "remove", "-y", package["name"]])
        elif package["manager"] == "flatpak":
            run(["flatpak", "uninstall", package.get("scope", "--user"), "-y", package["name"]])
    for remote in reversed(prior.get("flatpak_remotes", [])):
        run(["flatpak", "remote-delete", remote["scope"], "--force", remote["name"]])
    if prior.get("hostname"):
        run(["hostnamectl", "set-hostname", prior["hostname"]])
    if prior.get("power_profile"):
        run(["powerprofilesctl", "set", prior["power_profile"]])
    if prior.get("wol"):
        for setting in reversed(prior["wol"]):
            run(["nmcli", "connection", "modify", setting["connection"], "802-3-ethernet.wake-on-lan", setting["previous"]])
            run(["nmcli", "connection", "up", setting["connection"]])
    try:
        os.unlink(state_file)
    except FileNotFoundError:
        pass
    print("Revert steps finished. Firmware updates, cleanup, package updates, DNF settings, and some network changes cannot be reversed reliably.")

if args.quit:
    print("Fed-up setup cancelled.")
    raise SystemExit(0)

actual = fedora_release()
if actual != version:
    if not confirm(f"Selected Fedora {version}, but this system is Fedora {actual}. Continue anyway?"):
        fail("Fedora version mismatch; no changes were made.")

if mode == "revert":
    try:
        do_revert()
    except ActionFailure as error:
        fail(str(error))
elif mode == "setup":
    if not installer_menu():
        fail("One or more selected actions failed or could not be completed.")
else:
    fail(f"Unknown script mode: {mode}")

`;
}

function generatedScript(mode = state.activeScript) {
  if (mode === 'setup') {
    const invalid = collectInputs();
    if (invalid.length) return `# Complete valid input for: ${invalid.join(', ')}\n`;
  }
  const operations = buildSelectedOperations();
  const metadata = {
    version: state.version,
    desktop: state.desktop,
    outputMode: state.outputMode,
    mode,
    operations,
    catalog: mode === 'setup' ? CATALOG_ITEMS.map(buildOperation) : [],
  };
  const bytes = new TextEncoder().encode(JSON.stringify(metadata));
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  const encoded = btoa(binary);
  const names = operations.filter((operation) => operation.risk === 'critical' || operation.risk === 'high').map((operation) => `# - ${operation.label} (${RISK_LABELS[operation.risk]})`).join('\n') || '# - None';
  const irreversible = operations.filter((operation) => !operation.reversible).map((operation) => `# - ${operation.label}: ${operation.revertReason}`).join('\n') || '# - None';
  const payload = pythonPayload();
  const delimiter = 'FED_UP_PYTHON_PAYLOAD_8f12b7a4';
  if (payload.includes(delimiter)) throw new Error('Payload delimiter collision.');
  const bootstrapPackages = new Set(['python3']);
  const bootstrap = `# Bootstrap packages: ${[...bootstrapPackages].join(', ')}; optional: gum (Fedora repository only).\n# gum is presentation-only; the script works without it.\n`;
  return `#!/usr/bin/env bash
set -euo pipefail

for arg in "$@"; do
  if [[ "$arg" == "--quit" ]]; then
    echo "Fed-up setup cancelled."
    exit 0
  fi
  if [[ "$arg" == "--help" || "$arg" == "-h" ]]; then
    printf '%s\n' \
      "Usage: ./fed-up-install.sh [--quiet | --verbose] [--yes] [--quit]" \
      "  --quiet    Suppress routine progress; keep warnings and final results" \
      "  --verbose  Show command output" \
      "  --yes      Automatically approve confirmations" \
      "  --quit     Exit without checking prerequisites or changing the system"
    exit 0
  fi
done

# Fed-up standalone Fedora ${state.version} script
# Desktop: ${state.desktop === 'gnome' ? 'GNOME (Workstation)' : 'KDE Plasma'}
# Output mode: ${state.outputMode}
# Review this script before running it. It may change your system.
# Selected Critical and High caution operations:
${names}
# Operations that cannot be reliably reversed:
${irreversible}
${bootstrap}
if ! grep -q '^ID=fedora$' /etc/os-release 2>/dev/null; then
  echo "This script only supports Fedora Linux." >&2
  exit 1
fi

install_fedora_packages() {
  local repositories=()
  if [[ "\${1:-}" == "--fedora-repositories-only" ]]; then
    repositories=(--repo=fedora,updates)
    shift
  fi
  if [[ "$(id -u)" -eq 0 ]]; then dnf "\${repositories[@]}" install -y "$@"; else sudo dnf "\${repositories[@]}" install -y "$@"; fi
}

yes_mode=0
quiet_mode=0
for arg in "$@"; do
  if [[ "$arg" == "--yes" ]]; then yes_mode=1; fi
  if [[ "$arg" == "--quiet" ]]; then quiet_mode=1; fi
done

missing=()
command -v python3 >/dev/null 2>&1 || missing+=(python3)
if (("\${#missing[@]}" > 0)); then
  printf 'Missing required package(s): %s\\n' "\${missing[*]}"
  if ((yes_mode == 0)); then
    read -r -p "Install required prerequisites from Fedora repositories? [y/N] " answer
    [[ "$answer" == "y" || "$answer" == "Y" ]] || { echo "Prerequisite installation declined." >&2; exit 1; }
  fi
  install_fedora_packages --fedora-repositories-only "\${missing[@]}" || { echo "Could not install required prerequisites; check network access and Fedora repositories." >&2; exit 1; }
fi

if ! command -v gum >/dev/null 2>&1; then
  if ((yes_mode == 0 && quiet_mode == 0)) && [[ -t 0 ]] && dnf --repo=fedora,updates info gum >/dev/null 2>&1; then
      read -r -p "Install optional gum text UI from Fedora repositories? [y/N] " gum_answer
      if [[ "$gum_answer" == "y" || "$gum_answer" == "Y" ]]; then
        install_fedora_packages --fedora-repositories-only gum || echo "Optional gum installation failed; continuing with plain-text prompts."
      fi
  elif ((quiet_mode == 0)); then
    echo "Optional gum package is unavailable or not offered; plain-text prompts will be used."
  fi
fi

payload_file=$(mktemp)
metadata_file=$(mktemp)
trap 'rm -f "$payload_file" "$metadata_file"' EXIT
cat > "$payload_file" <<'${delimiter}'
${payload}
${delimiter}
cat > "$metadata_file" <<'FED_UP_METADATA_8f12b7a4'
${encoded}
FED_UP_METADATA_8f12b7a4
python3 "$payload_file" --metadata-file "$metadata_file" "\${@}"
`;
}

function updateScriptPreview() {
  const mode = state.activeScript;
  for (const tab of [elements['install-tab'], elements['revert-tab']]) {
    const active = tab.dataset.scriptTab === mode;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  const irreversible = CATALOG_ITEMS.filter((item) => state.selected.has(item.id) && !item.revertible);
  elements['revert-warning'].hidden = mode !== 'revert' || irreversible.length === 0;
  if (irreversible.length) {
    elements['revert-warning'].textContent = `Not reliably reversible: ${irreversible.map((item) => `${item.label} — ${item.revertReason}`).join(' ')}`;
  }
  elements['script-code'].textContent = generatedScript(mode);
  elements['script-preview'].classList.toggle('wrap', elements['wrap-toggle'].checked);
  elements['script-preview'].style.fontSize = `calc(var(--script-size) * ${state.textSize})`;
  const selected = CATALOG_ITEMS.filter((item) => state.selected.has(item.id));
  const counts = Object.fromEntries(['critical', 'high', 'caution', 'safe'].map((risk) => [risk, selected.filter((item) => item.risk === risk).length]));
  elements['risk-summary'].replaceChildren();
  for (const risk of Object.keys(RISK_LABELS)) {
    const count = document.createElement('span');
    count.className = `risk-chip risk-${risk}`;
    count.textContent = `${RISK_LABELS[risk]}: ${counts[risk]}`;
    elements['risk-summary'].append(count);
  }
  elements['critical-banner'].hidden = counts.critical === 0;
  const conflicts = detectConflicts();
  elements['conflict-notice'].hidden = conflicts.length === 0;
  elements['conflict-notice'].textContent = conflicts.length ? `Potential conflicts: ${conflicts.join(', ')}. Review before running.` : '';
  elements['bootstrap-note'].textContent = 'Bootstrap: python3 is required; Flatpak is installed from Fedora only if a chosen action needs it; gum is optional and sourced only from Fedora repositories when available.';
}

function refresh() {
  renderCategories();
  updateScriptPreview();
  persistState();
}

function setSelected(ids, selected) {
  const queue = [...ids];
  if (!selected) {
    const removing = new Set(queue);
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of CATALOG_ITEMS) {
        if (state.selected.has(item.id) && !removing.has(item.id) && (item.depends_on || []).some((id) => removing.has(id))) {
          removing.add(item.id);
          changed = true;
        }
      }
    }
    for (const id of removing) state.selected.delete(id);
    refresh();
    return;
  }
  const visited = new Set();
  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    const item = CATALOG_ITEMS.find((entry) => entry.id === id);
    if (!item || item.needsVerification || !itemAction(item) || !item.desktopApplicability.includes(state.desktop)) continue;
    state.selected.add(id);
    for (const dependency of item.depends_on || []) {
      const required = CATALOG_ITEMS.find((entry) => entry.id === dependency);
      if (required && required.risk !== 'critical') queue.push(dependency);
    }
  }
  refresh();
}

function openDialog(id, focusSelector) {
  const dialog = document.getElementById(id);
  if (!dialog.open) dialog.showModal();
  if (focusSelector) dialog.querySelector(focusSelector)?.focus();
}

function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog.open) dialog.close();
}

function setNavigationOpen(open) {
  const nav = document.querySelector('.site-header');
  const toggle = document.getElementById('nav-toggle');
  nav.classList.toggle('nav-open', open);
  toggle.setAttribute('aria-expanded', String(open));
}

function onCategoryChange(event) {
  const checkbox = event.target;
  if (!(checkbox instanceof HTMLInputElement) || checkbox.type !== 'checkbox') return;
  const item = CATALOG_ITEMS.find((entry) => entry.id === checkbox.dataset.id);
  if (!item) return;
  if (checkbox.checked && item.risk === 'critical') {
    checkbox.checked = false;
    state.pendingCritical = item.id;
    document.getElementById('critical-message').textContent = `${item.label}: ${userFacingRisk(item)} ${item.revertible ? 'The script records limited prior state, but some effects may not be restorable.' : item.revertReason}`;
    openDialog('critical-dialog', '#cancel-critical');
    return;
  }
  if (checkbox.checked && item.requiresInput) {
    state.inputs[item.id] = document.getElementById(`input-${item.id}`)?.value.trim() || '';
    if (!validateInput(item, state.inputs[item.id])) {
      checkbox.checked = false;
      const control = document.getElementById(`input-${item.id}`);
      control?.setAttribute('aria-invalid', 'true');
      document.getElementById(`input-${item.id}-error`).textContent = `Enter a valid ${item.requiresInput.type === 'hostname' ? 'hostname' : item.requiresInput.type === 'interface' ? 'network interface name' : 'power profile'}.`;
      return;
    }
  }
  setSelected([item.id], checkbox.checked);
}

function detectConflicts(ids = state.selected) {
  const selected = new Set(ids);
  const conflicts = [];
  for (const [left, right, label] of [
    ['docker', 'podman', 'Docker and Podman'],
    ['intel-codecs', 'amd-codecs', 'Intel and AMD codecs'],
  ]) {
    if (selected.has(left) && selected.has(right)) conflicts.push(label);
  }
  const browserIds = ['firefox', 'google-chrome', 'chromium', 'brave', 'vivaldi', 'microsoft-edge', 'librewolf', 'opera', 'zen-browser'];
  const officeIds = ['libreoffice', 'onlyoffice', 'wps-office'];
  if (browserIds.filter((id) => selected.has(id)).length > 1) conflicts.push('multiple browsers');
  if (officeIds.filter((id) => selected.has(id)).length > 1) conflicts.push('multiple office suites');
  return conflicts;
}

function init() {
  state.theme = readStorage(STORAGE_KEYS.theme, 'system');
  state.textSize = Math.min(1.25, Math.max(.85, Number(readStorage(STORAGE_KEYS.textSize, '1')) || 1));
  elements['theme-select'].value = ['system', 'light', 'dark'].includes(state.theme) ? state.theme : 'system';
  elements['desktop-select'].value = state.desktop;
  elements['output-mode'].value = state.outputMode;
  const search = elements['search-options'];
  readSelections();
  populateVersions();
  renderRiskLegend();
  applyTheme();
  renderCategories();
  updateScriptPreview();

  elements['category-list'].addEventListener('change', onCategoryChange);
  elements['category-list'].addEventListener('input', (event) => {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    const id = control.id.replace(/^input-/, '');
    const item = CATALOG_ITEMS.find((entry) => entry.id === id);
    if (!item?.requiresInput) return;
    state.inputs[id] = control.value.trim();
    if (control.value && validateInput(item, control.value.trim())) {
      control.setAttribute('aria-invalid', 'false');
      document.getElementById(`${control.id}-error`).textContent = '';
    }
    updateScriptPreview();
  });
  elements['category-list'].addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const items = CATALOG_ITEMS.filter((item) => item.section === button.dataset.section);
    const ids = items.map((item) => item.id);
    const selecting = button.dataset.action === 'section-select';
    const critical = selecting
      ? items.find((item) => item.risk === 'critical' && !state.selected.has(item.id) && !item.needsVerification && itemAction(item))
      : null;
    if (critical) {
      state.pendingCritical = critical.id;
      state.pendingSelection = ids;
      document.getElementById('critical-message').textContent = `${critical.label}: ${userFacingRisk(critical)} ${critical.revertible ? 'The script records limited prior state, but some effects may not be restorable.' : critical.revertReason}`;
      openDialog('critical-dialog', '#cancel-critical');
      return;
    }
    setSelected(ids, selecting);
  });
  document.getElementById('confirm-critical').addEventListener('click', () => {
    if (state.pendingSelection.length) setSelected(state.pendingSelection, true);
    else if (state.pendingCritical) state.selected.add(state.pendingCritical);
    state.pendingCritical = null;
    state.pendingSelection = [];
    closeDialog('critical-dialog');
    refresh();
  });
  document.getElementById('cancel-critical').addEventListener('click', () => {
    state.pendingCritical = null;
    state.pendingSelection = [];
    closeDialog('critical-dialog');
  });
  document.getElementById('select-recommended').addEventListener('click', () => {
    setSelected([...getRecommendations()].filter((id) => CATALOG_ITEMS.find((item) => item.id === id)?.risk !== 'critical'), true);
  });
  document.getElementById('select-all').addEventListener('click', () => {
    const critical = CATALOG_ITEMS.filter((item) => !item.needsVerification && itemAction(item) && item.risk === 'critical').length;
    const high = CATALOG_ITEMS.filter((item) => !item.needsVerification && itemAction(item) && item.risk === 'high').length;
    const possibleIds = CATALOG_ITEMS.map((item) => item.id);
    const conflicts = detectConflicts(possibleIds);
    document.getElementById('select-all-message').textContent = `This would include ${critical} Critical and ${high} High caution items.${conflicts.length ? ` Current conflicts: ${conflicts.join(', ')}.` : ''} Options needing verification remain disabled.`;
    openDialog('confirm-select-dialog', '#select-all-safe');
  });
  document.getElementById('select-all-safe').addEventListener('click', () => {
    for (const item of CATALOG_ITEMS) if (item.risk === 'critical') state.selected.delete(item.id);
    setSelected(CATALOG_ITEMS.filter((item) => item.risk !== 'critical').map((item) => item.id), true);
    closeDialog('confirm-select-dialog');
  });
  document.getElementById('select-all-everything').addEventListener('click', () => {
    setSelected(CATALOG_ITEMS.map((item) => item.id), true);
    closeDialog('confirm-select-dialog');
  });
  document.getElementById('cancel-select-all').addEventListener('click', () => closeDialog('confirm-select-dialog'));
  document.getElementById('clear-all').addEventListener('click', () => { state.selected.clear(); refresh(); });
  document.getElementById('expand-all').addEventListener('click', (event) => {
    const sections = [...elements['category-list'].querySelectorAll('details')];
    const expand = sections.some((section) => !section.open);
    sections.forEach((section) => { section.open = expand; });
    event.currentTarget.textContent = expand ? 'Collapse all' : 'Expand all';
  });
  document.getElementById('reset-selections').addEventListener('click', () => openDialog('reset-dialog', '#cancel-reset'));
  document.getElementById('confirm-reset').addEventListener('click', () => {
    state.selected.clear();
    state.inputs = {};
    state.theme = 'system';
    state.textSize = 1;
    for (const key of Object.values(STORAGE_KEYS)) {
      try { localStorage.removeItem(key); } catch { /* Storage can be disabled. */ }
    }
    elements['theme-select'].value = 'system';
    closeDialog('reset-dialog');
    applyTheme();
    refresh();
  });
  document.getElementById('cancel-reset').addEventListener('click', () => closeDialog('reset-dialog'));

  elements['fedora-version'].addEventListener('change', () => {
    state.version = elements['fedora-version'].value;
    document.getElementById('version-chip').hidden = FEDORA_VERSIONS[state.version].support !== 'eol';
    if (FEDORA_VERSIONS[state.version].support === 'eol') {
      document.getElementById('version-chip').hidden = false;
      const warning = document.getElementById('version-warning');
      warning.hidden = false;
      warning.textContent = `Fedora ${state.version} is end of life, no longer receives security updates, and may have unavailable repositories.`;
    } else {
      document.getElementById('version-warning').hidden = true;
      document.getElementById('search-count').textContent = `Fedora version set to ${state.version}.`;
    }
    refresh();
  });
  if (FEDORA_VERSIONS[state.version].support === 'eol') {
    const warning = document.getElementById('version-warning');
    warning.hidden = false;
    warning.textContent = `Fedora ${state.version} is end of life, no longer receives security updates, and may have unavailable repositories.`;
  } else document.getElementById('version-chip').hidden = true;
  elements['desktop-select'].addEventListener('change', () => {
    state.desktop = elements['desktop-select'].value;
    for (const id of state.selected) {
      const item = CATALOG_ITEMS.find((entry) => entry.id === id);
      if (item && !item.desktopApplicability.includes(state.desktop)) state.selected.delete(id);
    }
    refresh();
  });
  elements['output-mode'].addEventListener('change', () => { state.outputMode = elements['output-mode'].value; refresh(); });
  elements['theme-select'].addEventListener('change', applyTheme);
  let announceTimer;
  search.addEventListener('input', () => {
    renderCategories();
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { elements['search-count'].textContent = `${matchingItems(search.value).length} matching options.`; }, 180);
  });
  elements['clear-search'].addEventListener('click', () => { search.value = ''; renderCategories(); search.focus(); });
  elements['wrap-toggle'].addEventListener('change', updateScriptPreview);
  elements['install-tab'].addEventListener('click', () => { state.activeScript = 'setup'; updateScriptPreview(); });
  elements['revert-tab'].addEventListener('click', () => { state.activeScript = 'revert'; updateScriptPreview(); });
  elements['text-smaller'].addEventListener('click', () => changeTextSize(-.1));
  elements['text-larger'].addEventListener('click', () => changeTextSize(.1));
  elements['text-reset'].addEventListener('click', () => { state.textSize = 1; updateScriptPreview(); persistState(); });
  elements['script-expand'].addEventListener('click', toggleExpanded);
  elements['mobile-expand-script'].addEventListener('click', toggleExpanded);
  document.getElementById('nav-toggle').addEventListener('click', (event) => {
    setNavigationOpen(event.currentTarget.getAttribute('aria-expanded') !== 'true');
  });
  document.querySelectorAll('#nav-links a, #nav-links button').forEach((control) => {
    control.addEventListener('click', () => setNavigationOpen(false));
  });
  elements['theme-select'].addEventListener('change', () => setNavigationOpen(false));
  elements['fullscreen-script'].addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await elements['script-panel'].requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      elements['copy-status'].textContent = `Could not expand the script panel: ${error.message}`;
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.expanded) setExpanded(false);
    if (event.key === 'Escape' && document.getElementById('nav-toggle').getAttribute('aria-expanded') === 'true') {
      setNavigationOpen(false);
      document.getElementById('nav-toggle').focus();
    }
  });
  elements['copy-script'].addEventListener('click', async () => {
    await copyCurrentScript();
  });
  elements['mobile-copy-script'].addEventListener('click', copyCurrentScript);
  elements['download-script'].addEventListener('click', () => {
    const script = generatedScript(state.activeScript);
    if (script.startsWith('# Complete valid input')) {
      elements['copy-status'].textContent = 'Complete and validate required fields before downloading.';
      return;
    }
    const blob = new Blob([script], { type: 'text/x-shellscript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = state.activeScript === 'setup' ? 'fed-up-install.sh' : 'fed-up-revert.sh';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    elements['copy-status'].textContent = 'Script download started.';
  });
  document.getElementById('how-to-button').addEventListener('click', () => openDialog('how-to-dialog', '.dialog-close-row button'));
  document.getElementById('about-button').addEventListener('click', () => openDialog('about-dialog', '.dialog-close-row button'));
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (state.theme === 'system') applyTheme();
    });
  } catch {
    // Theme changes still apply when the browser lacks media-query events.
  }
}

async function copyCurrentScript() {
  const script = generatedScript(state.activeScript);
  if (script.startsWith('# Complete valid input')) {
    elements['copy-status'].textContent = 'Complete and validate required fields before copying.';
    return;
  }
  try {
    await navigator.clipboard.writeText(script);
    elements['copy-status'].textContent = 'Script copied to clipboard.';
  } catch (error) {
    elements['copy-status'].textContent = `Could not copy the script: ${error.message}`;
  }
}

function changeTextSize(delta) {
  state.textSize = Math.min(1.25, Math.max(.85, Math.round((state.textSize + delta) * 100) / 100));
  updateScriptPreview();
  persistState();
}

function setExpanded(expanded) {
  state.expanded = expanded;
  elements['script-panel'].classList.toggle('expanded', expanded);
  const button = elements['script-expand'];
  button.setAttribute('aria-label', expanded ? 'Close expanded script panel' : 'Expand script panel');
  button.replaceChildren(svgIcon(expanded ? 'i-close' : 'i-expand'));
}

function toggleExpanded() {
  setExpanded(!state.expanded);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
