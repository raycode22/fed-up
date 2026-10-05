const state = {
  selected: new Set(),
  categories: [],
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
    title: 'Generated setup script',
    description:
      'Select setup items to customize the script. The downloaded Bash script checks Fedora and required tools, then offers guided quiet or verbose installs, per-item confirmations, or a no-prompt install mode.',
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

function updateThemeToggle(theme) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  themeToggle.dataset.mode = theme;
  themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
  themeToggle.title = `Switch to ${nextTheme} mode`;
}

function getCurrentTheme() {
  return (
    document.documentElement.dataset.theme ||
    (systemTheme.matches ? 'dark' : 'light')
  );
}

updateThemeToggle(getCurrentTheme());
systemTheme.addEventListener('change', () => {
  if (!document.documentElement.dataset.theme) {
    updateThemeToggle(getCurrentTheme());
  }
});
themeToggle.addEventListener('click', () => {
  const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
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

  state.categories = payload.categories;
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
  return getAllItems().filter((item) => item.status === 'recommended');
}

function updateSelection(itemIds, selected) {
  for (const itemId of itemIds) {
    if (selected) {
      state.selected.add(itemId);
    } else {
      state.selected.delete(itemId);
    }
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
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      '',
      'printf "%s\\n" "No setup options selected. Nothing to install."',
    ].join('\n');
  }

  const selectedIds = new Set(selectedItems.map((item) => item.id));
  const conflictingPairs = new Set();
  const conflictMessages = [];
  const dependencyWarnings = [];

  for (const item of selectedItems) {
    for (const conflict of item.conflicts_with) {
      if (selectedIds.has(conflict)) {
        const pair = [item.id, conflict].sort().join(':');
        if (!conflictingPairs.has(pair)) {
          conflictingPairs.add(pair);
          const conflictingItem = selectedItems.find((selected) => selected.id === conflict);
          conflictMessages.push(
            `${item.label} conflicts with ${conflictingItem.label}.`,
          );
        }
      }
    }

    for (const dependency of item.depends_on) {
      if (!selectedIds.has(dependency)) {
        dependencyWarnings.push(
          `${item.label} depends on ${dependency}, which is not selected; it must already be available or this step may fail.`,
        );
      }
    }
  }

  const requiredCommands = ['dnf', 'rpm', 'sudo'];
  for (const command of ['curl', 'flatpak', 'systemctl', 'firewall-cmd', 'usermod']) {
    if (selectedItems.some((item) => new RegExp(`\\b${command}\\b`).test(item.command))) {
      requiredCommands.push(command);
    }
  }

  const lines = [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '',
    'RUN_MODE=guided',
    'OUTPUT_MODE=verbose',
    'AUTO_APPROVE=false',
    'MODE_SELECTED=false',
    'RUN_CANCELLED=false',
    'for argument in "$@"; do',
    '  case "$argument" in',
    '    --yes) AUTO_APPROVE=true ;;',
    '    --quiet) OUTPUT_MODE=quiet; MODE_SELECTED=true ;;',
    '    --verbose) OUTPUT_MODE=verbose; MODE_SELECTED=true ;;',
    '    --help)',
    '      printf "%s\\n" "Usage: $0 [--yes] [--quiet|--verbose]" "  --yes      Install every selected option without script prompts" "  --quiet    Confirm each option; hide successful command output" "  --verbose  Confirm each option; show command output"',
    '      exit 0',
    '      ;;',
    '    *) printf "Unknown option: %s\\n" "$argument" >&2; exit 2 ;;',
    '  esac',
    'done',
    '',
    'if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then',
    '  COLOR_RESET=$\'\\033[0m\'',
    '  COLOR_ACCENT=$\'\\033[1;36m\'',
    '  COLOR_SUCCESS=$\'\\033[1;32m\'',
    '  COLOR_WARNING=$\'\\033[1;33m\'',
    '  COLOR_ERROR=$\'\\033[1;31m\'',
    'else',
    '  COLOR_RESET=',
    '  COLOR_ACCENT=',
    '  COLOR_SUCCESS=',
    '  COLOR_WARNING=',
    '  COLOR_ERROR=',
    'fi',
    '',
    'show_header() {',
    '  printf "\\n%s╭──────────────────────────────────────────╮%s\\n" "$COLOR_ACCENT" "$COLOR_RESET"',
    '  printf "%s│          Fedora setup · Fed-up           │%s\\n" "$COLOR_ACCENT" "$COLOR_RESET"',
    '  printf "%s╰──────────────────────────────────────────╯%s\\n\\n" "$COLOR_ACCENT" "$COLOR_RESET"',
    '}',
    '',
    'show_header',
    'if [[ ! -f /etc/fedora-release ]]; then',
    '  printf "%s%s%s\\n" "$COLOR_ERROR" "This script is intended for Fedora Linux." "$COLOR_RESET" >&2',
    '  exit 1',
    'fi',
    '',
    `REQUIRED_COMMANDS=(${requiredCommands.map(shellQuote).join(' ')})`,
    'for required_command in "${REQUIRED_COMMANDS[@]}"; do',
    '  if ! command -v "$required_command" >/dev/null 2>&1; then',
    '    printf "%sRequired command is missing: %s%s\\n" "$COLOR_ERROR" "$required_command" "$COLOR_RESET" >&2',
    '    exit 1',
    '  fi',
    'done',
    'printf "%s✓%s Fedora %s detected; required tools are available.\\n" "$COLOR_SUCCESS" "$COLOR_RESET" "$(rpm -E %fedora)"',
    '',
    ...conflictMessages.flatMap((message) => [
      `printf "%sConflict:%s %s\\n" "$COLOR_ERROR" "$COLOR_RESET" ${shellQuote(message)}`,
      'exit 1',
    ]),
    ...dependencyWarnings.map((warning) =>
      `printf "%sNote:%s %s\\n" "$COLOR_WARNING" "$COLOR_RESET" ${shellQuote(warning)}`,
    ),
    '',
    `printf "\\nSelected setup options (%s):\\n" "${selectedItems.length}"`,
    ...selectedItems.map((item) => `printf "  • %s\\n" ${shellQuote(item.label)}`),
    '',
    'if [[ "$AUTO_APPROVE" == true ]]; then',
    '  RUN_MODE=all',
    'elif [[ "$MODE_SELECTED" == false ]]; then',
    '  if [[ ! -t 0 || ! -t 1 ]]; then',
    '    printf "%sRun this script in a terminal, or pass --yes to install without script prompts.%s\\n" "$COLOR_ERROR" "$COLOR_RESET" >&2',
    '    exit 2',
    '  fi',
    '  printf "\\nChoose how to run these options:\\n"',
    '  printf "  1) Guided, quiet output   — confirm each option; show details only on errors\\n"',
    '  printf "  2) Guided, verbose output — confirm each option; show command output\\n"',
    '  printf "  3) Install all now        — no further script prompts\\n"',
    '  printf "  q) Cancel\\n\\n"',
    '  while true; do',
    '    read -r -p "Select a mode [1/2/3/q]: " mode_choice </dev/tty || exit 2',
    '    case "$mode_choice" in',
    '      1) RUN_MODE=guided; OUTPUT_MODE=quiet; break ;;',
    '      2) RUN_MODE=guided; OUTPUT_MODE=verbose; break ;;',
    '      3) RUN_MODE=all; break ;;',
    '      q|Q) printf "Cancelled; nothing was installed.\\n"; exit 0 ;;',
    '      *) printf "Choose 1, 2, 3, or q.\\n" ;;',
    '    esac',
    '  done',
    'fi',
    '',
    'SUDO=(sudo)',
    'if [[ "$RUN_MODE" == all ]]; then',
    '  if ! sudo -n true 2>/dev/null; then',
    '    printf "%sNon-interactive install needs an active sudo session. Run sudo -v, then retry.%s\\n" "$COLOR_ERROR" "$COLOR_RESET" >&2',
    '    exit 1',
    '  fi',
    '  SUDO=(sudo -n)',
    'else',
    '  sudo -v',
    '  printf "\\nGuided install: each option can be installed, skipped, or cancelled.\\n"',
    '  read -r -p "Continue with guided install? [y/N]: " answer </dev/tty || exit 2',
    '  if [[ ! "$answer" =~ ^[Yy]$ ]]; then',
    '    printf "Cancelled; nothing was installed.\\n"',
    '    exit 0',
    '  fi',
    'fi',
    '',
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
    '    "${SUDO[@]}" install -d -m 0755 "$TRACKING_DIR"',
    '    {',
    '      if "${SUDO[@]}" test -f "$TRACKING_FILE"; then',
    '        "${SUDO[@]}" cat "$TRACKING_FILE"',
    '      fi',
    '      cat "$new_packages"',
    '    } | sort -u > "$combined_packages"',
    '    "${SUDO[@]}" install -m 0644 "$combined_packages" "$TRACKING_FILE"',
    '  fi',
    '  rm -f "$BEFORE_PACKAGES" "$current_packages" "$new_packages" "$combined_packages"',
    '  exit "$script_status"',
    '}',
    'trap record_new_packages EXIT',
    '',
    'run_item() {',
    '  local label="$1" item_command answer status log_file',
    '  item_command="$(cat)"',
    '  if [[ "$RUN_MODE" == all ]]; then',
    '    item_command="${item_command//sudo /sudo -n }"',
    '  fi',
    '  if [[ "$RUN_MODE" == guided ]]; then',
    '    while true; do',
    '      read -r -p "Install \\"$label\\"? [y]es / [n]o / [c]ancel: " answer </dev/tty || return 2',
    '      case "$answer" in',
    '        y|Y|yes|YES) break ;;',
    '        n|N|no|NO) printf "Skipped: %s\\n" "$label"; return 0 ;;',
    '      c|C|cancel|CANCEL) RUN_CANCELLED=true; return 0 ;;',
    '        *) printf "Choose y, n, or c.\\n" ;;',
    '      esac',
    '    done',
    '  fi',
    '  printf "%s▶%s %s\\n" "$COLOR_ACCENT" "$COLOR_RESET" "$label"',
    '  if [[ "$OUTPUT_MODE" == quiet ]]; then',
    '    log_file="$(mktemp)"',
    '    if bash -c "$item_command" >"$log_file" 2>&1; then',
    '      rm -f "$log_file"',
    '      printf "%s✓%s Completed: %s\\n" "$COLOR_SUCCESS" "$COLOR_RESET" "$label"',
    '    else',
    '      status=$?',
    '      cat "$log_file" >&2',
    '      rm -f "$log_file"',
    '      return "$status"',
    '    fi',
    '  else',
    '    bash -c "$item_command"',
    '  fi',
    '}',
    '',
    'item_status=0',
    '',
  ];

  for (const [index, item] of selectedItems.entries()) {
    lines.push(`if run_item ${shellQuote(item.label)} <<'FEDUP_COMMAND_${index}'`);
    lines.push(item.command);
    lines.push(`FEDUP_COMMAND_${index}`);
    lines.push('then');
    lines.push('  if [[ "$RUN_CANCELLED" == true ]]; then');
    lines.push('    printf "Cancelled; no more options will be processed.\\n"');
    lines.push('    exit 0');
    lines.push('  fi');
    lines.push('else');
    lines.push('  item_status=$?');
    lines.push(
      `  printf "%sFailed while processing: %s%s\\n" "$COLOR_ERROR" ${shellQuote(item.label)} "$COLOR_RESET" >&2`,
    );
    lines.push('  exit "$item_status"');
    lines.push('fi');
    lines.push('');
  }

  lines.push('printf "%s✓%s Setup run complete.\\n" "$COLOR_SUCCESS" "$COLOR_RESET"');
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
  renderScriptPreview(error.message);
  copyStatus.textContent = error.message;
});
