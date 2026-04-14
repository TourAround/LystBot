const config = require('./config');

async function request(method, path, body = null) {
  const baseUrl = config.getBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers = { 'Content-Type': 'application/json' };

  // Some endpoints don't need auth (device registration)
  const cfg = config.read();
  if (cfg && cfg.apiKey) {
    headers['Authorization'] = `Bearer ${cfg.apiKey}`;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    console.error(`❌ Network error: ${err.message}`);
    process.exit(1);
  }

  if (res.status === 204) return null;

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      console.error(`❌ HTTP ${res.status}: ${res.statusText}`);
      process.exit(1);
    }
    return null;
  }

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || JSON.stringify(data);
    console.error(`❌ ${msg}`);
    process.exit(1);
  }

  return data;
}

// Unauthenticated request with custom headers
async function rawRequest(method, path, body = null, extraHeaders = {}) {
  const baseUrl = config.getBaseUrl();
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    console.error(`❌ Network error: ${err.message}`);
    process.exit(1);
  }

  if (res.status === 204) return null;

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      console.error(`❌ HTTP ${res.status}: ${res.statusText}`);
      process.exit(1);
    }
    return null;
  }

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || JSON.stringify(data);
    console.error(`❌ ${msg}`);
    process.exit(1);
  }

  return data;
}

// Fuzzy match: find a list by name or ID from an array of lists
function findList(lists, query) {
  // Try exact ID match
  const byId = lists.find(l => String(l.id) === String(query));
  if (byId) return byId;

  // Try exact name match (case-insensitive)
  const lower = query.toLowerCase();
  const exact = lists.find(l => (l.title || l.name || '').toLowerCase() === lower);
  if (exact) return exact;

  // Try startsWith
  const starts = lists.find(l => (l.title || l.name || '').toLowerCase().startsWith(lower));
  if (starts) return starts;

  // Try includes
  const includes = lists.find(l => (l.title || l.name || '').toLowerCase().includes(lower));
  if (includes) return includes;

  return null;
}

// Fuzzy match an item by text
function findItem(items, query) {
  const lower = query.toLowerCase();
  const exact = items.find(i => i.text.toLowerCase() === lower);
  if (exact) return exact;

  const starts = items.find(i => i.text.toLowerCase().startsWith(lower));
  if (starts) return starts;

  const includes = items.find(i => i.text.toLowerCase().includes(lower));
  if (includes) return includes;

  return null;
}

// Fuzzy match: find a category by name or ID from an array of categories
function findCategory(categories, query) {
  if (!Array.isArray(categories)) return null;

  // Try exact ID match
  const byId = categories.find(c => String(c.id) === String(query));
  if (byId) return byId;

  const lower = String(query).toLowerCase();
  const exact = categories.find(c => (c.name || '').toLowerCase() === lower);
  if (exact) return exact;

  const starts = categories.find(c => (c.name || '').toLowerCase().startsWith(lower));
  if (starts) return starts;

  const includes = categories.find(c => (c.name || '').toLowerCase().includes(lower));
  if (includes) return includes;

  return null;
}

// Resolve a list query to {list, detail} - fetches all lists then the specific one
async function resolveList(query, { withItems = false } = {}) {
  const res = await request('GET', '/lists');
  const lists = res.lists || res;
  const match = findList(lists, query);
  if (!match) {
    const names = lists.map(l => `${l.emoji || '📋'} ${l.title || l.name}`).join(', ');
    console.error(`❌ List '${query}' not found. Your lists: ${names || '(none)'}`);
    process.exit(1);
  }
  if (withItems) {
    const detail = await request('GET', `/lists/${match.id}`);
    return { list: match, detail };
  }
  return { list: match };
}

// Pick an emoji based on list name
function autoEmoji(name) {
  const lower = name.toLowerCase();
  const map = {
    grocer: '🛒', shopping: '🛍️', food: '🍕', meal: '🍽️',
    todo: '✅', task: '📝', work: '💼', home: '🏠',
    travel: '✈️', trip: '🧳', pack: '🧳', vacation: '🏖️',
    book: '📚', read: '📖', movie: '🎬', watch: '📺',
    music: '🎵', gift: '🎁', wish: '⭐', fitness: '💪',
    recipe: '👨‍🍳', cook: '🍳', clean: '🧹', garden: '🌱',
    pet: '🐾', baby: '👶', school: '🎓', project: '🚀',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji;
  }
  return '📋';
}

module.exports = { request, rawRequest, findList, findItem, findCategory, resolveList, autoEmoji };
