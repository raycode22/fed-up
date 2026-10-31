import test from 'node:test';
import assert from 'node:assert/strict';
import { shellQuote, topoSort, autoSelectDependencies, hasConflict, filterBySystem, isRecommended, validateSelectedIds, buildBootstrapperScript } from '../web/generator.js';

test('shellQuote simple', () => {
  assert.equal(shellQuote('abc'), 'abc');
  assert.equal(shellQuote("it's"), "'it'\\''s'");
  assert.equal(shellQuote(''), "''");
});

test('autoSelectDependencies transitive', () => {
  const items = [
    { id: 'a', depends_on: [] },
    { id: 'b', depends_on: ['a'] },
    { id: 'c', depends_on: ['b'] },
  ];
  assert.deepEqual(autoSelectDependencies(items, ['c']).sort(), ['a','b','c']);
});

test('topoSort orders deps first', () => {
  const items = [
    { id: 'a', depends_on: [] },
    { id: 'b', depends_on: ['a'] },
  ];
  const ordered = topoSort(items, ['b']).map((i) => i.id);
  assert.deepEqual(ordered, ['a','b']);
});

test('hasConflict symmetric', () => {
  const items = [
    { id: 'x', conflicts_with: ['y'] },
    { id: 'y', conflicts_with: ['x'] },
  ];
  assert.equal(hasConflict(items, 'x', 'y'), true);
  assert.equal(hasConflict(items, 'x', 'z'), false);
});

test('filterBySystem', () => {
  const items = [
    { id: 'i', supported_fedora: ['43'], desktops: 'gnome', arch: 'x86_64' },
    { id: 'j', supported_fedora: ['43','44'], desktops: 'any', arch: 'any' },
  ];
  const r = filterBySystem(items, { fedora: '44', desktop: 'kde', arch: 'aarch64' }).map(i=>i.id);
  assert.deepEqual(r, ['j']);
});

test('isRecommended desktop-specific', () => {
  const item = { id: 't', status: 'recommended', desktops: 'gnome', recommended_on: ['gnome'] };
  assert.equal(isRecommended(item, 'gnome'), true);
  assert.equal(isRecommended(item, 'kde'), false);
  const anyItem = { id: 'a', status: 'recommended', desktops: 'any' };
  assert.equal(isRecommended(anyItem, 'kde'), true);
});

test('validateSelectedIds rejects injection', () => {
  assert.deepEqual(validateSelectedIds(['git', 'bad;rm', 'a b', "x'y", 'ok.id-1']),
    ['git', 'ok.id-1']);
});

test('buildBootstrapperScript is POSIX and embeds selections', () => {
  const items = [
    { id: 'git', label: 'Git', command: 'sudo dnf5 install -y git' },
    { id: 'htop', label: 'htop', command: 'sudo dnf5 install -y htop' },
  ];
  const script = buildBootstrapperScript(items, { generated_at: 'FIXED' });
  assert.ok(script.startsWith('#!/usr/bin/env sh'));
  assert.ok(!script.includes('[['));           // no bash-isms
  assert.ok(!script.includes('mapfile'));
  assert.ok(script.includes('textual==1.0.0')); // pinned dependency
  assert.ok(script.includes('-m venv'));        // isolated env
  assert.ok(script.includes('--config "$TMPD/catalog.json"'));
  // deterministic for fixed timestamp
  assert.equal(script, buildBootstrapperScript(items, { generated_at: 'FIXED' }));
  // embedded payload round-trips
  const m = script.match(/<<'FEDUP_CATALOG_EOF'\n([\s\S]*?)\nFEDUP_CATALOG_EOF/);
  const json = Buffer.from(m[1].replace(/\n/g, ''), 'base64').toString();
  const parsed = JSON.parse(json);
  assert.deepEqual(parsed.selected, ['git', 'htop']);
  assert.equal(parsed.categories[0].items.length, 2);
});

test('buildBootstrapperScript drops unsafe ids from payload', () => {
  const items = [{ id: 'ev$(il)', label: 'evil' }, { id: 'safe', label: 'ok' }];
  const script = buildBootstrapperScript(items, { generated_at: 'FIXED' });
  const m = script.match(/<<'FEDUP_CATALOG_EOF'\n([\s\S]*?)\nFEDUP_CATALOG_EOF/);
  const parsed = JSON.parse(Buffer.from(m[1].replace(/\n/g, ''), 'base64').toString());
  assert.deepEqual(parsed.selected, ['safe']);
});
