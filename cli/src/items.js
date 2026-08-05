const germanContainer = /^(\d+)\s+(P[aä]ckchen|Packung(?:en)?|Paket(?:e)?|Kasten|K[aä]sten|Flasche[n]?|Dose[n]?|Becher|Glas|Gl[aä]ser|Beutel|T[uü]te[n]?|Tafel[n]?|Stange[n]?|Bund|Kiste[n]?|Scheibe[n]?|Rolle[n]?|St[uü]ck)\s+(.+)$/i;
const englishContainer = /^(\d+)\s+(packs?|bottles?|cans?|box(?:es)?|bags?|jars?|cartons?|bunch|rolls?|slices?|pieces?|cases?|dozen)\s+(.+)$/i;

function parseItem(input) {
  const value = String(input).trim();
  let match;

  if ((match = value.match(/^(\d+)er(?:\s+|-)pack\s+(.+)$/i))) {
    return { text: match[2].trim(), quantity: 1, unit: `${match[1]}er Pack` };
  }
  if ((match = value.match(/^(\d+)\s*(?:x|mal)\s+(.+)$/i))) {
    return { text: match[2].trim(), quantity: Number(match[1]), unit: null };
  }
  if ((match = value.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)\s+(.+)$/i))
      || (match = value.match(/^(\d+(?:\.\d+)?)\s*(lbs?|oz)\s+(.+)$/i))) {
    return { text: match[3].trim(), quantity: 1, unit: `${match[1]}${match[2].toLowerCase()}` };
  }
  if ((match = value.match(germanContainer))) {
    return { text: match[3].trim(), quantity: 1, unit: `${match[1]} ${match[2]}` };
  }
  if ((match = value.match(englishContainer))) {
    return { text: match[3].trim(), quantity: 1, unit: `${match[1]} ${match[2].toLowerCase()}` };
  }
  if ((match = value.match(/^([1-9]\d?)\s+(.+)$/))) {
    return { text: match[2].trim(), quantity: Number(match[1]), unit: null };
  }
  return { text: value, quantity: 1, unit: null };
}

function splitItems(inputs) {
  return (Array.isArray(inputs) ? inputs : [inputs]).flatMap(input => {
    const value = String(input);
    return (value.includes(';') ? value.split(';') : value.split(', '))
      .map(item => item.trim())
      .filter(Boolean);
  });
}

function normalizeItem(item, overrides = {}) {
  const source = typeof item === 'string' ? { text: item } : item;
  if (!source || typeof source !== 'object' || typeof source.text !== 'string') {
    throw new Error('Item text must be a string.');
  }

  const parsed = parseItem(source.text);
  const explicit = { ...source, ...overrides };
  const quantity = Object.hasOwn(explicit, 'quantity') ? explicit.quantity : parsed.quantity;
  const unit = Object.hasOwn(explicit, 'unit') ? explicit.unit : parsed.unit;

  if (!parsed.text) throw new Error('Item text cannot be blank.');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error('Quantity must be an integer from 1 to 99.');
  }
  if (unit !== null && typeof unit !== 'string') {
    throw new Error('Unit must be a string or null.');
  }

  return { text: parsed.text, quantity, unit: unit?.trim() || null };
}

function normalizeItems(items, overrides = {}) {
  const entries = typeof items === 'string'
    ? items.split(/;\s*|,\s+/).map(item => item.trim()).filter(Boolean)
    : Array.isArray(items) && items.every(item => typeof item === 'string')
      ? splitItems(items)
      : items;
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('No items to add.');
  if (Object.keys(overrides).length > 0 && entries.length !== 1) {
    throw new Error('Explicit quantity and unit can only be used with one item.');
  }
  return entries.map(item => normalizeItem(item, overrides));
}

module.exports = { parseItem, splitItems, normalizeItem, normalizeItems };
