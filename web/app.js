import { autoSelectDependencies, filterBySystem, isRecommended, buildBootstrapperScript } from './generator.js';

const state = {
  selected: new Set(),
  categories: [],
  desktop: 'any',
  allCategories: [],
};

const categoryList = document.getElementById('category-list');
const itemCount = document.getElementById('item-count');
const scriptPreview = document.getElementById('script-preview');
const selectRecommendedButton = document.getElementById('select-recommended');
const selectAllButton = document.getElementById('select-all');
const copyButton = document.getElementById('copy-script');
const copyStatus = document.getElementById('copy-status');
const scriptHeading = document.getElementById('script-heading');
const scriptDescription = document.getElementById('script-description');
const downloadButton = document.getElementById('download-script');
const themeToggle = document.getElementById('theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const TRACKING_FILE = '/var/lib/fed-up/installed-packages';
const SVG_NS = 'http://www.w3.org/2000/svg';
const CATEGORY_ICON_PATHS = {
  dnf: ['M4 7 12 3l8 4-8 4-8-4Z', 'M4 7v10l8 4 8-4V7', 'M12 11v10', 'M8 5l8 4'],
  multimedia: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm10 8 6 4-6 4V8Z'],
  tweaks: [
    'M10 2h4l.7 2.1a8 8 0 0 1 1.6.9l2.1-.7 2 3.4-1.4 1.7a8 8 0 0 1 0 1.8l1.4 1.7-2 3.4-2.1-.7a8 8 0 0 1-1.6.9L14 18h-4l-.7-2.1a8 8 0 0 1-1.6-.9l-2.1.7-2-3.4L5 10.6a8 8 0 0 1 0-1.8L3.6 7.1l2-3.4 2.1.7a8 8 0 0 1 1.6-.9L10 2Z',
    'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    'M17 13.5v1.1l-.8.5-.8-.3-.6.4-.2.8h-1.2l-.2-.8-.6-.4-.8.3-.8-.8.3-.8-.4-.6-.8-.2v-1.2l.8-.2.4-.6-.3-.8.8-.8.8.3.6-.4.2-.8h1.2l.2.8.6.4.8-.3.8.8-.3.8.4.6.8.2v1.2l-.8.2-.4.6.3.8',
    'M14 12.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  ],
  development: ['m8 8-4 4 4 4', 'm16 8 4 4-4 4', 'm14 5-4 14'],
};
const SCRIPT_MODES = {
  setup: {
    title: 'Generated Fed-up bootstrapper (install.sh)',
    description:
      'Self-contained POSIX script generated in your browser. It creates an isolated Python virtual environment, installs pinned dependencies (Textual), verifies them, then launches the interactive Fed-up TUI with your selections preloaded. Works under Bash, Zsh, or plain sh — review it before running: less fed-up-install.sh',
    filename: 'fed-up-install.sh',
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

function updateThemeToggle(theme) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  themeToggle.dataset.mode = theme;
  themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
  themeToggle.title = `Switch to ${nextTheme} mode`;
}

function getCurrentTheme() {
  let stored = null;
  try { stored = localStorage.getItem('fed-up-theme'); } catch (e) {}
  const base = stored || document.documentElement.dataset.theme || (systemTheme.matches ? 'dark' : 'light');
  return base;
}

let storedTheme = null;
try { storedTheme = localStorage.getItem('fed-up-theme'); } catch (e) {}
if (storedTheme) document.documentElement.dataset.theme = storedTheme;
updateThemeToggle(getCurrentTheme());
systemTheme.addEventListener('change', () => {
  if (!document.documentElement.dataset.theme) {
    updateThemeToggle(getCurrentTheme());
  }
});
themeToggle.addEventListener('click', () => {
  const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  try { localStorage.setItem('fed-up-theme', nextTheme); } catch (e) {}
  updateThemeToggle(nextTheme);
});

async function loadData() {
  const response = await fetch('./data.json');
  if (!response.ok) {
    throw new Error('Could not load setup options. Please try again later.');
  }

  const payload = await response.json();
  if (!Array.isArray(payload.categories)) {
    throw new Error('The setup options are not in the expected format.');
  }

  state.allCategories = payload.categories;
  state.categories = state.allCategories.map((category) => ({
    ...category,
    items: filterBySystem(category.items, { desktop: state.desktop }),
  }));
  state.selected = new Set();
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

function getAllItems() {
  return state.categories.flatMap((category) => category.items);
}

function getRecommendedItems() {
  return getAllItems().filter((item) => isRecommended(item, state.desktop));
}

function updateSelection(itemIds, selected) {
  if (selected) {
    const allItems = getAllItems();
    const expanded = new Set(itemIds);
    for (const id of itemIds) {
      for (const dep of autoSelectDependencies(allItems, [id])) {
        expanded.add(dep);
      }
    }
    for (const id of expanded) state.selected.add(id);
  } else {
    for (const itemId of itemIds) state.selected.delete(itemId);
  }

  for (const checkbox of categoryList.querySelectorAll('input[type="checkbox"]')) {
    checkbox.checked = state.selected.has(checkbox.dataset.id);
  }
  updateView();
}

function shellQuote(value) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function generateScript() {
  const selectedItems = getSelectedItems();
  if (selectedItems.length === 0) {
    return [
      '#!/usr/bin/env sh',
      'set -eu',
      '',
      'printf "%s\n" "No setup options selected. Nothing to install."',
    ].join('\n');
  }
  return buildBootstrapperScript(selectedItems);
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

function renderScriptPreview(script) {
  const fragment = document.createDocumentFragment();
  const tokens =
    /#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\$\{[^}\n]*\}|\$[A-Za-z_][\w]*|\b(?:if|then|else|elif|fi|for|in|do|done|case|esac|function|local|return|exit)\b|\b(?:sudo|dnf|rpm|printf|echo|read|command|flatpak|systemctl|curl|firewall-cmd|usermod)\b/g;
  let lastIndex = 0;

  for (const match of script.matchAll(tokens)) {
    const token = match[0];
    const index = match.index;
    if (index > lastIndex) {
      fragment.append(script.slice(lastIndex, index));
    }

    const tokenClass = token.startsWith('#')
      ? 'script-token-comment'
      : token.startsWith('$')
        ? 'script-token-variable'
        : token.startsWith('"') || token.startsWith("'")
          ? 'script-token-string'
          : /^(if|then|else|elif|fi|for|in|do|done|case|esac|function|local|return|exit)$/.test(
                token,
              )
            ? 'script-token-keyword'
            : 'script-token-command';
    const span = document.createElement('span');
    span.className = tokenClass;
    span.textContent = token;
    fragment.append(span);
    lastIndex = index + token.length;
  }

  fragment.append(script.slice(lastIndex));
  scriptPreview.replaceChildren(fragment);
}

function updateView() {
  const selectedCount = state.selected.size;
  const totalCount = getAllItems().length;
  itemCount.textContent = `${selectedCount} of ${totalCount} selected`;
  selectAllButton.textContent =
    selectedCount === totalCount ? 'Clear selection' : 'Select all';
  const recommendedItems = getRecommendedItems();
  const allRecommendedSelected = recommendedItems.every((item) =>
    state.selected.has(item.id),
  );
  selectRecommendedButton.querySelector('span').textContent = allRecommendedSelected
    ? 'Deselect recommended'
    : 'Select recommended';
  const mode = SCRIPT_MODES[scriptMode];
  scriptHeading.textContent = mode.title;
  scriptDescription.textContent = mode.description;
  downloadButton.download = mode.filename;
  renderScriptPreview(getCurrentScript());
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

  updateSelection([checkbox.dataset.id], checkbox.checked);
});

categoryList.addEventListener('click', (event) => {
  const toggleButton = event.target.closest('.inline-toggle');
  if (!toggleButton) {
    return;
  }

  const categoryElement = toggleButton.closest('.category-block');
  const checkboxes = categoryElement.querySelectorAll('input[type="checkbox"]');
  const shouldSelect = Array.from(checkboxes).some((checkbox) => !checkbox.checked);
  updateSelection(
    Array.from(checkboxes, (checkbox) => checkbox.dataset.id),
    shouldSelect,
  );
});

selectRecommendedButton.addEventListener('click', () => {
  const recommendedItems = getRecommendedItems();
  const allRecommendedSelected = recommendedItems.every((item) =>
    state.selected.has(item.id),
  );
  updateSelection(
    recommendedItems.map((item) => item.id),
    !allRecommendedSelected,
  );
});

selectAllButton.addEventListener('click', () => {
  const allItems = getAllItems();
  updateSelection(
    allItems.map((item) => item.id),
    state.selected.size !== allItems.length,
  );
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
  // Generate the script in-browser from the user's actual selections.
  const blob = new Blob([getCurrentScript()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = SCRIPT_MODES[scriptMode].filename;
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById('generate-cleanup').addEventListener('click', () => {
  setScriptMode('cleanup');
});

document.getElementById('generate-revert').addEventListener('click', () => {
  setScriptMode('revert');
});

const desktopSelect = document.getElementById('desktop-select');
if (desktopSelect) {
  desktopSelect.value = state.desktop;
  desktopSelect.addEventListener('change', () => {
    state.desktop = desktopSelect.value;
    if (state.allCategories.length) {
      state.categories = state.allCategories.map((category) => ({
        ...category,
        items: filterBySystem(category.items, { desktop: state.desktop }),
      }));
      state.selected = new Set();
      renderCategories();
    }
  });
}

loadData().catch((error) => {
  renderCategoryStatus(error.message);
  renderScriptPreview(error.message);
  copyStatus.textContent = error.message;
});
