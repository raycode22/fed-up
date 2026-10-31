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
  const catalogData = {
    selected: selectedIds,
    categories: [],
  };
  const categoriesMap = new Map();
  for (const item of selectedItems) {
    const cat = item.category || "default";
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, []);
    }
    categoriesMap.get(cat).push({
      id: item.id,
      label: item.label,
      command: item.command,
    });
  }
  for (const [catName, catItems] of categoriesMap) {
    catalogData.categories.push({
      name: catName,
      items: catItems,
    });
  }
  const catalogJson = Buffer.from(JSON.stringify(catalogData)).toString("base64");
  let script = "#!/usr/bin/env sh
";
  script += "set -euo pipefail
";
  script += "
";
  script += "# Fed-up generated script
";
  script += "# Generated: " + generatedAt + "
";
  script += "#
";
  script += "TEMP_PY=$(mktemp)
";
  script += "cat << 'FEDUP_CATALOG_EOF' > $TEMP_PY
";
  script += catalogJson + "
";
  script += "FEDUP_CATALOG_EOF
";
  script += "
";
  script += "python3 $TEMP_PY " + JSON.stringify(metadata) + "
";
  script += "rm -f $TEMP_PY
";
  return script;
}

export function getCurrentScript(selections, catalogItems) {
  const selectedIds = selections.map((s) => s.id);
  return buildBootstrapperScript(catalogItems, { generated_at: new Date().toISOString() });
}

export const CATALOG_ITEMS = [];

export const CATALOG_META = {
  site: {
    name: "Fed-up",
    tagline: "Build a custom Fedora workstation setup with one click.",
    description: "Generate a personalized Fedora Linux setup script from a curated set of package, media, and system tweaks.",
    version: "1.0.0",
    author: "Ray Code",
    default_branch: "main",
    target_fedora_versions: ["43", "44"],
    license: "MIT",
    repo_url: "https://github.com/raycode22/fed-up",
    homepage: "https://raycode22.github.io/fed-up/"
  },
  ui: {
    title: "Fed-up",
    subtitle: "System Setup Shell Script Builder for Fedora Linux",
    script_name: "fedora-setup.sh"
  },
  build: {
    output_json: "web/data.json",
    validate_on_run: true,
    strict_mode: false
  }
};

// State management
const state = {
  selected: new Set(),
  categories: [],
  desktop: "any",
  allCategories: [],
};

const SCRIPT_MODES = {
  setup: {
    title: "Generated Fed-up installer (fed-up.sh)",
    description:
      "Self-contained POSIX script generated in your browser. It creates an isolated Python virtual environment, installs pinned dependencies (Textual), verifies them, then launches the interactive Fed-up TUI with your selections preloaded. Works under Bash, Zsh, or plain sh -- review it before running: less fed-up.sh",
    filename: "fed-up.sh",
  },
  cleanup: {
    title: "Generated cleanup script",
    description:
      "Clears DNF caches, then asks DNF to propose unused dependencies, which may be unrelated to Fed-up. Review the list and cancel if unsure.",
    filename: "fedora-cleanup.sh",
  },
  revert: {
    title: "Generated Fed-up revert script",
    description:
      "Removes only RPM packages recorded as newly installed by a current Fed-up setup script. Earlier scripts did not create a package manifest. DNF asks for confirmation; repositories, settings, Flatpaks, and personal files are not changed.",
    filename: "fed-up-revert.sh",
  },
};

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  setTheme("light");
  
  const categoryList = document.getElementById("category-list");
  const itemCount = document.getElementById("item-count");
  const scriptPreview = document.getElementById("script-preview");
  const selectRecommendedButton = document.getElementById("select-recommended");
  const selectAllButton = document.getElementById("select-all");
  const copyButton = document.getElementById("copy-script");
  const copyStatus = document.getElementById("copy-status");
  const scriptHeading = document.getElementById("script-heading");
  const scriptDescription = document.getElementById("script-description");
  const downloadButton = document.getElementById("download-script");
  const downloadFilename = document.getElementById("download-filename");
  const themeToggle = document.getElementById("theme-toggle");
  const setupForm = document.getElementById("setup-form");
  const scriptModeSelect = document.getElementById("script-mode");
  
  // Event listeners
  document.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", (event) => {
      updateSelection([cb.dataset.id], cb.checked);
    });
  });
  
  document.addEventListener("click", (event) => {
    const toggleButton = event.target.closest(".inline-toggle");
    if (!toggleButton) return;
    const categoryElement = toggleButton.closest(".category-block");
    const checkboxes = categoryElement.querySelectorAll("input[type=checkbox]");
    const shouldSelect = Array.from(checkboxes).some((cb) => !cb.checked);
    updateSelection(
      Array.from(checkboxes, (cb) => cb.dataset.id),
      shouldSelect,
    );
  });
  
  if (selectRecommendedButton) {
    selectRecommendedButton.addEventListener("click", () => {
      const recommendedItems = getRecommendedItems();
      const allRecommendedSelected = recommendedItems.every((item) => state.selected.has(item.id));
      updateSelection(
        recommendedItems.map((item) => item.id),
        !allRecommendedSelected,
      );
    });
  }
  
  if (selectAllButton) {
    selectAllButton.addEventListener("click", () => {
      const allItems = getAllItems();
      updateSelection(
        allItems.map((item) => item.id),
        state.selected.size !== allItems.length,
      );
    });
  }
  
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getCurrentScript(getSelections(), CATALOG_ITEMS));
      copyStatus.textContent = "Script copied to clipboard.";
    } catch (error) {
      copyStatus.textContent = "Could not copy the script.";
    }
  });
  
  downloadButton.addEventListener("click", () => {
    const blob = new Blob([getCurrentScript(getSelections(), CATALOG_ITEMS)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = SCRIPT_MODES[scriptModeSelect.value].filename;
    link.click();
    URL.revokeObjectURL(url);
  });
  
  scriptModeSelect.addEventListener("change", () => {
    const mode = scriptModeSelect.value;
    setScriptMode(mode);
  });
  
  const desktopSelect = document.getElementById("desktop-select");
  if (desktopSelect) {
    desktopSelect.value = state.desktop;
    desktopSelect.addEventListener("change", () => {
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
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const nextTheme = theme === "dark" ? "light" : "dark";
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.dataset.mode = theme;
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    themeToggle.title = `Switch to ${nextTheme} mode`;
  }
}

function setScriptMode(mode) {
  const scriptModeSelect = document.getElementById("script-mode");
  if (scriptModeSelect) scriptModeSelect.value = mode;
  const modeConfig = SCRIPT_MODES[mode];
  if (!modeConfig) return;
  const scriptHeading = document.getElementById("script-heading");
  const scriptDescription = document.getElementById("script-description");
  const downloadFilename = document.getElementById("download-filename");
  if (scriptHeading) scriptHeading.textContent = modeConfig.title;
  if (scriptDescription) scriptDescription.textContent = modeConfig.description;
  if (downloadFilename) downloadFilename.textContent = modeConfig.filename;
  const scriptPreview = document.getElementById("script-preview");
  renderScriptPreview(getCurrentScript(getSelections(), CATALOG_ITEMS), scriptPreview);
}

function getSelections() {
  const selectedIds = new Set(state.selected);
  return CATALOG_ITEMS.filter((item) => selectedIds.has(item.id));
}

function getAllItems() {
  return CATALOG_ITEMS;
}

function getRecommendedItems() {
  return CATALOG_ITEMS.filter((item) => isRecommended(item, state.desktop));
}

function updateSelection(ids, selected) {
  if (selected) {
    ids.forEach((id) => state.selected.add(id));
  } else {
    ids.forEach((id) => state.selected.delete(id));
  }
  renderCategories();
  const scriptPreview = document.getElementById("script-preview");
  renderScriptPreview(getCurrentScript(getSelections(), CATALOG_ITEMS), scriptPreview);
}

function renderCategories() {
  const selectedItems = getSelections();
  const selectedIds = new Set(selectedItems.map((i) => i.id));
  const categoryList = document.getElementById("category-list");
  const itemCount = document.getElementById("item-count");
  
  if (!categoryList || !itemCount) return;
  
  categoryList.innerHTML = "";
  
  state.categories.forEach((category) => {
    const catHeader = document.createElement("summary");
    catHeader.className = "category-header";
    const allSelected = category.items.every((item) => selectedIds.has(item.id));
    catHeader.innerHTML = `
      <span class="category-icon" aria-hidden="true"></span>
      <h3>${category.name}</h3>
      <span class="category-hint">Show setup items</span>
      <button type="button" class="inline-toggle" aria-pressed="${allSelected}">${allSelected ? "Deselect all" : "Select all"}</button>
    `;
    catHeader.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        const shouldSelect = !category.items.every((item) => selectedIds.has(item.id));
        updateSelection(category.items.map((item) => item.id), shouldSelect);
      }
    });
    const itemsList = document.createElement("ul");
    itemsList.className = "item-list";
    category.items.forEach((item) => {
      const isSelected = selectedIds.has(item.id);
      const li = document.createElement("li");
      li.innerHTML = `<label class="item-row">
        <input type="checkbox" data-id="${item.id}" ${isSelected ? "checked" : ""} />
        <span class="item-text">
          <span class="item-title">${item.label}</span>
          <span class="item-desc">${item.description || ""}</span>
        </span>
        <span class="tag">${item.tags?.join(" ") || ""}</span>
      </label>`;
      itemsList.appendChild(li);
    });
    categoryList.appendChild(catHeader);
    categoryList.appendChild(itemsList);
  });
  
  const totalSelected = selectedIds.size;
  itemCount.textContent = `${totalSelected} item${totalSelected !== 1 ? 's' : ''} selected`;
}

function renderScriptPreview(script, previewElement) {
  if (!previewElement) return;
  if (script && script.trim()) {
    previewElement.innerHTML = `<pre class="script-code"><code>${escapeHtml(script)}</code></pre>`;
  } else {
    previewElement.innerHTML = "<p>Make your selections to generate the script.</p>";
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """)
    .replace(/'/g, "&#039;");
}

async function loadData() {
  try {
    const response = await fetch('web/data.json', { cache: 'force-cache' });
    if (response.ok) {
      const data = await response.json();
      CATALOG_ITEMS = data.items || [];
    } else {
      CATALOG_ITEMS = generateFallbackCatalog();
    }
    renderCategories();
    setScriptMode('setup');
  } catch (error) {
    console.warn('Failed to load catalog, using fallback:', error);
    CATALOG_ITEMS = generateFallbackCatalog();
    renderCategories();
    setScriptMode('setup');
  }
}

function generateFallbackCatalog() {
  return [
    { id: 'rpmfusion-free', label: 'Enable RPM Fusion free repo', description: 'Add the RPM Fusion free repository for audio, video and open-source codecs.', command: 'sudo dnf5 install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm', requires_sudo: true, tested_fedora: ['43', '44'], supported_fedora: ['43', '44'], desktops: 'any', arch: 'any', tags: ['repo', 'multimedia', 'rpmfusion'], category: 'dnf' },
    { id: 'python-tools', label: 'Install Python toolchain', description: 'Install Python, pip and common command-line utilities.', command: 'sudo dnf5 install -y python3 python3-pip python3-virtualenv python3-devel', requires_sudo: true, tested_fedora: ['43', '44'], supported_fedora: ['43', '44'], desktops: 'any', arch: 'any', tags: ['python', 'dev'], category: 'development' },
    { id: 'git', label: 'Install Git', description: 'Add Git for version control and source code management.', command: 'sudo dnf5 install -y git', requires_sudo: true, tested_fedora: ['43', '44'], supported_fedora: ['43', '44'], desktops: 'any', arch: 'any', tags: ['git', 'version-control'], category: 'development' },
    { id: 'vlc', label: 'Install VLC', description: 'Play media files with the popular VLC media player.', command: 'sudo dnf5 install -y vlc', requires_sudo: true, tested_fedora: ['43', '44'], supported_fedora: ['43', '44'], desktops: 'any', arch: 'any', tags: ['media', 'player'], category: 'multimedia' },
  ];
}
