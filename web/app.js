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
  state.selected = new Set(
    state.categories.flatMap((category) => category.items.map((item) => item.id)),
  );
  renderCategories();
}

function renderCategories() {
  const categoryTemplate = document.getElementById('category-template');
  const itemTemplate = document.getElementById('item-template');
  const fragment = document.createDocumentFragment();

  for (const category of state.categories) {
    const categoryElement = categoryTemplate.content.firstElementChild.cloneNode(true);
    categoryElement.dataset.category = category.category;
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

function generateScript() {
  const lines = [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
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

function updateView() {
  const selectedCount = state.selected.size;
  const totalCount = state.categories.reduce(
    (total, category) => total + category.items.length,
    0,
  );
  itemCount.textContent = `${selectedCount} of ${totalCount} selected`;
  selectAllButton.textContent =
    selectedCount === totalCount ? 'Clear selection' : 'Select all';
  scriptPreview.textContent = generateScript();
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
    await navigator.clipboard.writeText(generateScript());
    copyStatus.textContent = 'Script copied to clipboard.';
  } catch (error) {
    copyStatus.textContent = 'Could not copy the script. Check browser clipboard permissions.';
  }
});

document.getElementById('download-script').addEventListener('click', () => {
  const blob = new Blob([generateScript()], { type: 'application/x-shellscript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fedora-setup.sh';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

loadData().catch((error) => {
  scriptPreview.textContent = error.message;
  copyStatus.textContent = error.message;
});
