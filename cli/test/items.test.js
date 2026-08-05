const test = require('node:test');
const assert = require('node:assert/strict');
const { parseItem, normalizeItem, normalizeItems } = require('../src/items');

test('parses documented German and English item prefixes', () => {
  const cases = [
    ['250g Mehl', { text: 'Mehl', quantity: 1, unit: '250g' }],
    ['1,5kg Mehl', { text: 'Mehl', quantity: 1, unit: '1,5kg' }],
    ['1.5kg flour', { text: 'flour', quantity: 1, unit: '1.5kg' }],
    ['2lbs apples', { text: 'apples', quantity: 1, unit: '2lbs' }],
    ['16oz beans', { text: 'beans', quantity: 1, unit: '16oz' }],
    ['3x Milch', { text: 'Milch', quantity: 3, unit: null }],
    ['4 x Eier', { text: 'Eier', quantity: 4, unit: null }],
    ['4 mal Äpfel', { text: 'Äpfel', quantity: 4, unit: null }],
    ['2 Flaschen Wein', { text: 'Wein', quantity: 1, unit: '2 Flaschen' }],
    ['3 bottles wine', { text: 'wine', quantity: 1, unit: '3 bottles' }],
    ['6er Pack Wasser', { text: 'Wasser', quantity: 1, unit: '6er Pack' }],
    ['6er-Pack Wasser', { text: 'Wasser', quantity: 1, unit: '6er Pack' }],
    ['3 Bananen', { text: 'Bananen', quantity: 3, unit: null }],
    ['3 bananas', { text: 'bananas', quantity: 3, unit: null }],
  ];
  for (const [input, expected] of cases) assert.deepEqual(parseItem(input), expected);
});

test('keeps plain text and existing batch separators', () => {
  assert.deepEqual(parseItem('Brot'), { text: 'Brot', quantity: 1, unit: null });
  for (const input of ['0 Bananen', '100 Bananen', '3.5 Bananen', '3,5 Bananen']) {
    assert.deepEqual(parseItem(input), { text: input, quantity: 1, unit: null });
  }
  assert.deepEqual(normalizeItems('Milk, Eggs, Bread').map(item => item.text), ['Milk', 'Eggs', 'Bread']);
  assert.deepEqual(normalizeItems('Milch; Eier; Brot').map(item => item.text), ['Milch', 'Eier', 'Brot']);
  assert.deepEqual(normalizeItems('Milk, Eggs; Bread').map(item => item.text), ['Milk', 'Eggs', 'Bread']);
  assert.deepEqual(normalizeItems(['Cheese, Ham; Mustard']).map(item => item.text), ['Cheese, Ham', 'Mustard']);
});

test('normalizes request fields and lets explicit values override parsed values', () => {
  assert.deepEqual(normalizeItem({ text: '250g Mehl', quantity: 2, unit: '500g' }), {
    text: 'Mehl', quantity: 2, unit: '500g',
  });
  assert.deepEqual(normalizeItems(['3x Milch'], { quantity: 2, unit: 'Packung' }), [{
    text: 'Milch', quantity: 2, unit: 'Packung',
  }]);
});

test('rejects invalid quantities, blank text, and invalid units', () => {
  for (const quantity of [0, 100, 1.5, '2']) {
    assert.throws(() => normalizeItem({ text: 'Milk', quantity }), /integer from 1 to 99/);
  }
  assert.throws(() => normalizeItem('   '), /cannot be blank/);
  assert.throws(() => normalizeItem({ text: 'Milk', unit: 2 }), /string or null/);
  assert.throws(() => normalizeItem('100x Milk'), /integer from 1 to 99/);
  assert.throws(() => normalizeItems([]), /No items/);
  assert.throws(() => normalizeItems('Milk, Eggs', { quantity: 2 }), /only be used with one item/);
});
