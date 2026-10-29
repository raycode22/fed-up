import test from 'node:test';
import assert from 'node:assert/strict';
import { shellQuote, topoSort, autoSelectDependencies, hasConflict, filterBySystem, isRecommended } from '../web/generator.js';

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
