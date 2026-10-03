const state = {
  selected: new Set(),
  categories: [],
};

const categoryList = document.getElementById('category-list');
const itemCount = document.getElementById('item-count');
const scriptPreview = document.getElementById('script-preview');
const selectAllButton = document.getElementById('select-all');
const copyButton = document.getElementById('copy-script');
const copyStatus = document.getElementById('copy-status');
const scriptHeading = document.getElementById('script-heading');
const scriptDescription = document.getElementById('script-description');
const downloadButton = document.getElementById('download-script');
const TRACKING_FILE = '/var/lib/fed-up/installed-packages';
const SVG_NS = 'http://www.w3.org/2000/svg';
const ITEM_MARKS = {
  'rpmfusion-free': 'RPM',
  'rpmfusion-nonfree': 'RPM+',
  'fedora-copr': 'COPR',
  'faster-dnf': 'DNF',
  'exclude-fedora-updates-testing': '🧪',
  'dnf-automatic': '↻',
  'gnome-tweaks': 'GNOME',
  'gnome-extensions-app': 'GN+',
  'firewall-default': '🛡️',
  timeshift: 'TS',
  flatpak: 'FLAT',
  'google-chrome': 'CHRM',
  vlc: 'VLC',
  ffmpeg: 'FF',
  'gstreamer-plugins': 'GST',
  steam: 'STEAM',
  'obs-studio': 'OBS',
  'kde-multimedia': 'KDE',
  spotify: 'SPOT',
  libreoffice: 'LIBRE',
  'adobe-reader': 'PDF',
  handbrake: 'HB',
  zsh: 'ZSH',
  'power-profiles-daemon': '⚡',
  tlp: 'TLP',
  'ntfs-support': '💾',
  virtualbox: 'VBOX',
  'libreoffice-fonts': 'Aa',
  'firewall-cockpit': 'CKPT',
  criu: 'CRIU',
  git: 'GIT',
  gh: 'GH',
  'python-tools': 'PY',
  nodejs: 'NODE',
  'java-jdk': 'JAVA',
  rust: 'RUST',
  docker: 'DOCKER',
  kubectl: 'K8S',
  ansible: 'ANS',
  terraform: 'TF',
  'postgresql-client': 'PG',
  'sqlite-tools': 'SQL',
};
const ITEM_ICON_IDS = new Set([
  'exclude-fedora-updates-testing',
  'dnf-automatic',
  'firewall-default',
  'power-profiles-daemon',
  'ntfs-support',
]);
const CATEGORY_ICON_PATHS = {
  dnf: ['M4 7 12 3l8 4-8 4-8-4Z', 'M4 7v10l8 4 8-4V7', 'M12 11v10', 'M8 5l8 4'],
  multimedia: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm10 8 6 4-6 4V8Z'],
  tweaks: [
    'M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64',
    'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    'M19 12a7 7 0 0 0-.08-1l1.55-1.2-1.5-2.6-1.86.62a7 7 0 0 0-1.73-1L15.1 5h-3l-.28 1.82a7 7 0 0 0-1.73 1l-1.86-.62-1.5 2.6L8.28 11a7 7 0 0 0 0 2l-1.55 1.2 1.5 2.6 1.86-.62a7 7 0 0 0 1.73 1L12.1 19h3l.28-1.82a7 7 0 0 0 1.73-1l1.86.62 1.5-2.6L18.92 13a7 7 0 0 0 .08-1Z',
  ],
  development: ['m8 8-4 4 4 4', 'm16 8 4 4-4 4', 'm14 5-4 14'],
};
const SCRIPT_MODES = {
  setup: {
    title: 'Generated setup script',
    description:
      'Select setup items to customize the script. New RPM packages installed by this script are recorded for the Fed-up revert option.',
    filename: 'fedora-setup.sh',
  },
  cleanup: {
    title: 'Generated cleanup script',
    description:
      'Clears DNF caches, then asks DNF to propose unused dependencies, which may be unrelated to Fed-up. Review the list and cancel if unsure.',
    filename: 'fedora-cleanup.sh',
  },
  revert: {
    title: 'Generated Fed-up revert script',
    description:
      'Removes only RPM packages recorded as newly installed by a current Fed-up setup script. Earlier scripts did not create a package manifest. DNF asks for confirmation; repositories, settings, Flatpaks, and personal files are not changed.',
    filename: 'fed-up-revert.sh',
  },
};
let scriptMode = 'setup';

function getDefaultSelectedItems(categories) {
  return new Set(
    categories.flatMap((category) =>
      category.items
        .filter((item) => item.status === 'recommended')
        .map((item) => item.id),
    ),
  );
}

async function loadData() {
  const response = await fetch('./data.json');
  if (!response.ok) {
    throw new Error('Could not load setup options. Please try again later.');
  }

  const payload = await response.json();
  if (!Array.isArray(payload.categories)) {
    throw new Error('The setup options are not in the expected format.');
  }

  state.categories = payload.categories;
  state.selected = getDefaultSelectedItems(state.categories);
  renderCategories();
}

function createCategoryIcon(categoryId) {
  const paths = CATEGORY_ICON_PATHS[categoryId];
  if (!paths) {
    return null;
  }

  const icon = document.createElementNS(SVG_NS, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('focusable', 'false');
  icon.classList.add('category-symbol');

  for (const pathData of paths) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', pathData);
    icon.appendChild(path);
  }

  return icon;
}

function renderCategoryStatus(message) {
  const status = document.createElement('p');
  status.className = 'category-status';
  status.setAttribute('role', 'status');
  status.textContent = message;
  categoryList.replaceChildren(status);
}

function renderCategories() {
  const categoryTemplate = document.getElementById('category-template');
  const itemTemplate = document.getElementById('item-template');
  const fragment = document.createDocumentFragment();

  for (const category of state.categories) {
    const categoryElement = categoryTemplate.content.firstElementChild.cloneNode(true);
    categoryElement.dataset.category = category.category;
    const icon = createCategoryIcon(category.category);
    if (icon) {
      categoryElement.querySelector('.category-icon').appendChild(icon);
    }
    categoryElement.querySelector('h3').textContent = category.label;
    categoryElement.querySelector('.category-item-count').textContent =
      `${category.items.length} items`;

    const itemList = categoryElement.querySelector('.item-list');
    for (const item of category.items) {
      const itemElement = itemTemplate.content.firstElementChild.cloneNode(true);
      const checkbox = itemElement.querySelector('input');
      checkbox.dataset.id = item.id;
      checkbox.checked = state.selected.has(item.id);
      const itemMark = itemElement.querySelector('.item-mark');
      itemMark.textContent =
        ITEM_MARKS[item.id] ??
        item.label
          .split(/\s+/)
          .slice(0, 2)
          .map((word) => word[0])
          .join('')
          .toUpperCase();
      itemMark.classList.toggle('item-mark-icon', ITEM_ICON_IDS.has(item.id));
      itemElement.querySelector('.item-title').textContent = item.label;
      itemElement.querySelector('.item-desc').textContent = item.description;
      itemElement.querySelector('.tag').textContent = item.impact;
      itemList.appendChild(itemElement);
    }

    fragment.appendChild(categoryElement);
  }

  categoryList.replaceChildren(fragment);
  updateView();
}

function getSelectedItems() {
  return state.categories.flatMap((category) =>
    category.items.filter((item) => state.selected.has(item.id)),
  );
}

function generateScript() {
  const lines = [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '',
    '# Record RPM packages newly installed while this setup script runs.',
    `TRACKING_FILE='${TRACKING_FILE}'`,
    'TRACKING_DIR="$(dirname "$TRACKING_FILE")"',
    'BEFORE_PACKAGES="$(mktemp)"',
    'rpm -qa --qf \'%{NAME}\\n\' | sort -u > "$BEFORE_PACKAGES"',
    'record_new_packages() {',
    '  local script_status=$?',
    '  trap - EXIT',
    '  local current_packages new_packages combined_packages',
    '  current_packages="$(mktemp)"',
    '  new_packages="$(mktemp)"',
    '  combined_packages="$(mktemp)"',
    '  rpm -qa --qf \'%{NAME}\\n\' | sort -u > "$current_packages"',
    '  comm -13 "$BEFORE_PACKAGES" "$current_packages" > "$new_packages"',
    '  if [[ -s "$new_packages" ]]; then',
    '    sudo install -d -m 0755 "$TRACKING_DIR"',
    '    {',
    '      if sudo test -f "$TRACKING_FILE"; then',
    '        sudo cat "$TRACKING_FILE"',
    '      fi',
    '      cat "$new_packages"',
    '    } | sort -u > "$combined_packages"',
    '    sudo install -m 0644 "$combined_packages" "$TRACKING_FILE"',
    '  fi',
    '  rm -f "$BEFORE_PACKAGES" "$current_packages" "$new_packages" "$combined_packages"',
    '  exit "$script_status"',
    '}',
    'trap record_new_packages EXIT',
    '',
    'echo "Running Fedora setup script..."',
    'sudo true',
    '',
  ];

  for (const item of getSelectedItems()) {
    lines.push(`# --- ${item.label} ---`);
    lines.push(item.command);
    lines.push('');
  }

  lines.push('echo "Setup complete."');
  return lines.join('\n');
}

function generateCleanupScript() {
  return [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '',
    'echo "Cleaning Fedora package manager caches..."',
    'sudo dnf clean all',
    '',
    'echo "DNF may propose unrelated unused dependencies. Review the list and cancel if unsure."',
    'sudo dnf autoremove',
    '',
    'echo "Fedora cleanup complete."',
  ].join('\n');
}

function generateRevertScript() {
  return [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '',
    `TRACKING_FILE='${TRACKING_FILE}'`,
    'if ! sudo test -s "$TRACKING_FILE"; then',
    '  echo "No Fed-up package manifest found. Nothing to remove."',
    '  exit 0',
    'fi',
    '',
    'mapfile -t tracked_packages < <(sudo cat "$TRACKING_FILE")',
    'installed_packages=()',
    'for package in "${tracked_packages[@]}"; do',
    '  [[ -n "$package" ]] || continue',
    '  if [[ ! "$package" =~ ^[A-Za-z0-9._+-]+$ ]]; then',
    '    echo "Invalid package name in Fed-up manifest; refusing to continue." >&2',
    '    exit 1',
    '  fi',
    '  if rpm -q --quiet "$package"; then',
    '    installed_packages+=("$package")',
    '  fi',
    'done',
    '',
    'if ((${#installed_packages[@]} == 0)); then',
    '  echo "No tracked Fed-up RPM packages are currently installed."',
    '  exit 0',
    'fi',
    '',
    'printf "The following Fed-up-tracked RPM packages will be offered for removal:\\n"',
    'printf "  %s\\n" "${installed_packages[@]}"',
    'printf "\\nDNF may also propose removing dependencies. Review its transaction carefully.\\n"',
    'read -r -p "Type remove to continue: " confirmation',
    'if [[ "$confirmation" != "remove" ]]; then',
    '  echo "Cancelled. No packages were removed."',
    '  exit 0',
    'fi',
    '',
    'sudo dnf remove "${installed_packages[@]}"',
    `sudo rm -f '${TRACKING_FILE}'`,
    'echo "Fed-up package rollback complete."',
  ].join('\n');
}

function getCurrentScript() {
  if (scriptMode === 'cleanup') {
    return generateCleanupScript();
  }
  if (scriptMode === 'revert') {
    return generateRevertScript();
  }
  return generateScript();
}

function updateView() {
  const selectedCount = state.selected.size;
  const totalCount = state.categories.reduce(
    (total, category) => total + category.items.length,
    0,
  );
  itemCount.textContent = `${selectedCount} of ${totalCount} selected`;
  selectAllButton.textContent =
    selectedCount === totalCount ? 'Clear selection' : 'Select all';
  const mode = SCRIPT_MODES[scriptMode];
  scriptHeading.textContent = mode.title;
  scriptDescription.textContent = mode.description;
  downloadButton.download = mode.filename;
  scriptPreview.textContent = getCurrentScript();
}

function setScriptMode(mode) {
  scriptMode = mode;
  updateView();
}

categoryList.addEventListener('change', (event) => {
  const checkbox = event.target;
  if (!(checkbox instanceof HTMLInputElement) || checkbox.type !== 'checkbox') {
    return;
  }

  if (checkbox.checked) {
    state.selected.add(checkbox.dataset.id);
  } else {
    state.selected.delete(checkbox.dataset.id);
  }
  updateView();
});

categoryList.addEventListener('click', (event) => {
  const toggleButton = event.target.closest('.inline-toggle');
  if (!toggleButton) {
    return;
  }

  const categoryElement = toggleButton.closest('.category-block');
  const checkboxes = categoryElement.querySelectorAll('input[type="checkbox"]');
  const shouldSelect = Array.from(checkboxes).some((checkbox) => !checkbox.checked);

  for (const checkbox of checkboxes) {
    checkbox.checked = shouldSelect;
    if (shouldSelect) {
      state.selected.add(checkbox.dataset.id);
    } else {
      state.selected.delete(checkbox.dataset.id);
    }
  }
  updateView();
});

selectAllButton.addEventListener('click', () => {
  const totalCount = state.categories.reduce(
    (total, category) => total + category.items.length,
    0,
  );

  if (state.selected.size === totalCount) {
    state.selected.clear();
  } else {
    for (const category of state.categories) {
      for (const item of category.items) {
        state.selected.add(item.id);
      }
    }
  }

  for (const checkbox of categoryList.querySelectorAll('input[type="checkbox"]')) {
    checkbox.checked = state.selected.has(checkbox.dataset.id);
  }
  updateView();
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(getCurrentScript());
    copyStatus.textContent = 'Script copied to clipboard.';
  } catch (error) {
    copyStatus.textContent = 'Could not copy the script. Check browser clipboard permissions.';
  }
});

document.getElementById('download-script').addEventListener('click', () => {
  const blob = new Blob([getCurrentScript()], { type: 'application/x-shellscript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = SCRIPT_MODES[scriptMode].filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.getElementById('generate-cleanup').addEventListener('click', () => {
  setScriptMode('cleanup');
});

document.getElementById('generate-revert').addEventListener('click', () => {
  setScriptMode('revert');
});

loadData().catch((error) => {
  renderCategoryStatus(error.message);
  scriptPreview.textContent = error.message;
  copyStatus.textContent = error.message;
});
