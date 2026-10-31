// Pure, DOM-free helpers for generating Fedora setup scripts.
// Usable from both the browser (web/app.js) and Node tests.

export function shellQuote(value) {
  if (value === null || value === undefined) return "''";
  const str = String(value);
  if (str === '') return "''";
  if (/^[A-Za-z0-9_./:=+-]+$/.test(str)) return str;
  return "'" + str.replace(/'/g, "'\\''") + "'";
}

export function topoSort(items, selectedIds) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const selected = new Set(selectedIds);
  // expand dependencies transitively
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
  // Kahn's algorithm
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
  if (recommendedOn.length === 0) return true;
  return recommendedOn.includes('any') || recommendedOn.includes(desktop);
}

export function buildScript(items) {
  const lines = ['#!/usr/bin/env bash', 'set -u', ''];
  for (const item of items) {
    lines.push('# ' + item.id);
    lines.push(item.command);
  }
  return lines.join('\n') + '\n';
}

// --- Bootstrapper generation (browser side, mirrors build/bootstrap_template.py) ---
// Produces a POSIX-compatible, self-preparing install.sh that embeds the
// selected catalog as a base64 payload and installs Python dependencies in
// an isolated virtual environment before launching the Textual TUI.

const ID_SAFE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function validateSelectedIds(ids) {
  return ids.filter((id) => ID_SAFE_RE.test(id));
}

export function buildBootstrapperScript(selectedItems, catalogMeta = {}) {
  const ids = validateSelectedIds(selectedItems.map((i) => i.id)).sort();
  const embeddedCatalog = {
    generated_at: catalogMeta.generated_at || new Date().toISOString(),
    source: 'fed-up web generator',
    selected: ids,
    categories: [{
      category: 'selected',
      label: 'Your selections',
      items: selectedItems.filter((i) => ID_SAFE_RE.test(i.id)),
    }],
  };
  const json = JSON.stringify(embeddedCatalog, null, 2);
  // Base64 encode without Buffer/btoa unicode pitfalls.
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  const b64 = (typeof btoa === 'function')
    ? btoa(bin)
    : Buffer.from(bytes).toString('base64');
  const wrapped = b64.match(/.{1,76}/g).join('\n');

  const headerLines = [
    '#!/usr/bin/env sh',
    '# Fed-up bootstrapper — POSIX shell (bash/zsh/sh/dash compatible).',
    '# Generated entirely in your browser from your selections.',
    'set -eu',
    '',
    'echo "Fed-up bootstrapper"',
    'if ! command -v python3 >/dev/null 2>&1; then',
    '  echo "Error: python3 (>=3.10) is required." >&2; exit 1',
    'fi',
    'VENV="${FEDUP_VENV_DIR:-$HOME/.local/share/fed-up/venv}"',
    'if [ ! -x "$VENV/bin/python" ] || ! "$VENV/bin/python" -c "import textual" >/dev/null 2>&1; then',
    '  echo "Preparing Python environment at $VENV ..." >&2',
    '  rm -rf "${VENV}.new"',
    '  mkdir -p "$(dirname "$VENV")"',
    '  if ! python3 -m venv "${VENV}.new" >/dev/null 2>&1; then',
    '    echo "Error: python3 -m venv failed. Try: sudo dnf5 install -y python3-virtualenv" >&2; exit 1',
    '  fi',
    '  if ! "${VENV}.new/bin/python" -m pip install --disable-pip-version-check -q textual==1.0.0; then',
    '    echo "Error: dependency installation failed." >&2; rm -rf "${VENV}.new"; exit 1',
    '  fi',
    '  "${VENV}.new/bin/python" -c "import textual" || { rm -rf "${VENV}.new"; echo "Error: textual missing after install." >&2; exit 1; }',
    '  rm -rf "$VENV"; mv "${VENV}.new" "$VENV"',
    'fi',
    'TMPD=$(mktemp -d "${TMPDIR:-/tmp}/fed-up.XXXXXX")',
    'trap \'rm -rf "$TMPD"\' EXIT INT TERM',
    'cat > "$TMPD/catalog.b64" <<\'FEDUP_CATALOG_EOF\'',
    wrapped,
    'FEDUP_CATALOG_EOF',
    '"$VENV/bin/python" - "$TMPD" <<\'FEDUP_UNPACK_EOF\'',
    'import base64, pathlib, sys',
    'dest = pathlib.Path(sys.argv[1])',
    '(dest / "catalog.json").write_bytes(base64.b64decode((dest / "catalog.b64").read_bytes()))',
    'FEDUP_UNPACK_EOF',
    'if [ ! -t 0 ] || [ ! -t 1 ]; then',
    '  echo "Fed-up needs an interactive terminal." >&2; exit 2',
    'fi',
    'exec "$VENV/bin/python" -m fedup_tui --config "$TMPD/catalog.json"',
  ];
  return headerLines.join('\n') + '\n';
}