const state = {
  selected: new Set(),
  categories: [],
};

const categoryList = document.getElementById('category-list');
const itemCount = document.getElementById('item-count');
const scriptPreview = document.getElementById('script-preview');
const selectAllButton = document.getElementById('select-all');

async function loadData() {
  const response = await fetch('./data.json');
  if (!response.ok) {
    throw new Error('Could not load generated config. Run `python build/build.py` first.');
  }

  const payload = await response.json();
  state.categories = payload.categories || [];
  renderCategories();
  selectAll();
}

function renderCategories() {
  categoryList.innerHTML = '';

  for (const category of state.categories) {
    const template = document.getElementById('category-template');
    const clone = template.content.firstElementChild.cloneNode(true);
    const heading = clone.querySelector('h3');
    heading.textContent = category.label;

    const itemList = clone.querySelector('.item-list');
    for (const item of category.items) {
      const row = document.createElement('label');
      row.className = 'item-row';
      row.innerHTML = `
        <input type="checkbox" data-id="${item.id}" ${state.selected.has(item.id) ? 'checked' : ''} />
        <div class="item-text">
          <span class="item-title">${item.label}</span>
          <span class="item-desc">${item.description}</span>
        </div>
        <span class="tag">${item.impact}</span>
      `;

      row.addEventListener('change', (event) => {
        const checkbox = event.target;
        if (checkbox.checked) {
          state.selected.add(item.id);
        } else {
          state.selected.delete(item.id);
        }
        updateScript();
        updateCount();
      });

      itemList.appendChild(row);
    }

    const toggleButton = clone.querySelector('.inline-toggle');
    toggleButton.addEventListener('click', () => {
      const itemCheckboxes = Array.from(itemList.querySelectorAll('input[type="checkbox"]'));
      const shouldEnable = itemCheckboxes.some((checkbox) => !checkbox.checked);
      for (const checkbox of itemCheckboxes) {
        checkbox.checked = shouldEnable;
        if (shouldEnable) {
          state.selected.add(checkbox.dataset.id);
        } else {
          state.selected.delete(checkbox.dataset.id);
        }
      }
      updateScript();
      updateCount();
    });

    categoryList.appendChild(clone);
  }

  updateCount();
  updateScript();
}

function getSelectedItems() {
  const items = [];
  for (const category of state.categories) {
    for (const item of category.items) {
      if (state.selected.has(item.id)) {
        items.push(item);
      }
    }
  }
  return items;
}

function generateScript() {
  const selectedItems = getSelectedItems();
  const lines = [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '',
    'echo "Running Fedora setup script..."',
    'sudo true',
    '',
  ];

  for (const item of selectedItems) {
    lines.push(`# --- ${item.label} ---`);
    lines.push(item.command);
    lines.push('');
  }

  lines.push('echo "Setup complete."');
  return lines.join('\n');
}

function updateScript() {
  scriptPreview.textContent = generateScript();
}

function updateCount() {
  const count = state.selected.size;
  itemCount.textContent = `${count} selected`;
}

function selectAll() {
  for (const category of state.categories) {
    for (const item of category.items) {
      state.selected.add(item.id);
    }
  }
  renderCategories();
}

selectAllButton.addEventListener('click', () => {
  const currentCount = state.selected.size;
  const totalCount = state.categories.reduce((sum, category) => sum + category.items.length, 0);
  if (currentCount < totalCount) {
    selectAll();
  } else {
    state.selected.clear();
    renderCategories();
  }
});

document.getElementById('copy-script').addEventListener('click', async () => {
  const script = generateScript();
  await navigator.clipboard.writeText(script);
  document.getElementById('copy-script').textContent = 'Copied!';
  setTimeout(() => {
    document.getElementById('copy-script').textContent = 'Copy';
  }, 1000);
});

document.getElementById('download-script').addEventListener('click', () => {
  const script = generateScript();
  const blob = new Blob([script], { type: 'application/x-shellscript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fedora-setup.sh';
  link.click();
  URL.revokeObjectURL(url);
});

loadData().catch((error) => {
  scriptPreview.textContent = error.message;
});
