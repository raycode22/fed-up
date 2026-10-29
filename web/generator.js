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