const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const config = require('./config');

// --- API helper (non-exiting version for MCP) ---
async function api(method, path, body = null) {
  const baseUrl = config.getBaseUrl();
  const url = `${baseUrl}${path}`;
  const cfg = config.read();

  const headers = { 'Content-Type': 'application/json' };
  if (cfg?.apiKey) headers['Authorization'] = `Bearer ${cfg.apiKey}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function findList(lists, query) {
  const lower = query.toLowerCase();
  return lists.find(l => l.id === query)
    || lists.find(l => (l.title || '').toLowerCase() === lower)
    || lists.find(l => (l.title || '').toLowerCase().startsWith(lower))
    || lists.find(l => (l.title || '').toLowerCase().includes(lower))
    || null;
}

function findCategory(categories, query) {
  if (!Array.isArray(categories)) return null;
  const byId = categories.find(c => String(c.id) === String(query));
  if (byId) return byId;
  const lower = String(query).toLowerCase();
  return categories.find(c => (c.name || '').toLowerCase() === lower)
    || categories.find(c => (c.name || '').toLowerCase().startsWith(lower))
    || categories.find(c => (c.name || '').toLowerCase().includes(lower))
    || null;
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// --- MCP Server ---
async function startMcpServer() {
  const cfg = config.read();
  if (!cfg?.apiKey) {
    console.error('Not logged in. Run: lystbot login <api-key>');
    process.exit(1);
  }

  const server = new McpServer({
    name: 'lystbot',
    version: require('../package.json').version,
  });

  // --- Tools ---

  server.tool('list_lists', 'Get all lists', {}, async () => {
    const data = await api('GET', '/lists');
    const lists = data.lists || data;
    const text = lists.length === 0
      ? 'No lists found.'
      : lists.map(l => {
          const emoji = l.emoji || '📋';
          const count = l.item_count ?? '?';
          return `${emoji} ${l.title} (${count} items) [id: ${l.id}]`;
        }).join('\n');
    return { content: [{ type: 'text', text }] };
  });

  server.tool('get_list', 'Get a list with all its items', {
    list: z.string().describe('List name or ID'),
  }, async ({ list: query }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    const detail = await api('GET', `/lists/${match.id}`);
    const items = detail.items || [];
    const categories = Array.isArray(detail.categories)
      ? [...detail.categories].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      : [];

    let text = `${match.emoji || '📋'} ${match.title}\n`;
    text += `Type: ${match.type || 'generic'} | ${items.length} items\n\n`;

    if (items.length === 0) {
      text += '(empty)';
    } else if (categories.length > 0) {
      const byCategory = new Map();
      for (const c of categories) byCategory.set(c.id, []);
      const other = [];

      for (const i of items) {
        const cid = i.category_id || null;
        if (cid && byCategory.has(cid)) byCategory.get(cid).push(i);
        else other.push(i);
      }

      const renderItem = (i) => {
        const check = i.checked ? '✅' : '⬜';
        const qty = (i.quantity || 1) > 1 ? ` (${i.quantity}x)` : '';
        const unit = i.unit ? ` ${i.unit}` : '';
        return `${check} ${i.text}${qty}${unit}`;
      };

      for (const c of categories) {
        text += `${c.name}\n`;
        const sectionItems = byCategory.get(c.id) || [];
        if (sectionItems.length === 0) {
          text += '  (empty)\n\n';
        } else {
          text += sectionItems.map(i => `  ${renderItem(i)}`).join('\n') + '\n\n';
        }
      }
      if (other.length > 0) {
        text += `Other\n`;
        text += other.map(i => `  ${renderItem(i)}`).join('\n');
      }
    } else {
      text += items.map(i => {
        const check = i.checked ? '✅' : '⬜';
        const qty = (i.quantity || 1) > 1 ? ` (${i.quantity}x)` : '';
        const unit = i.unit ? ` ${i.unit}` : '';
        return `${check} ${i.text}${qty}${unit}`;
      }).join('\n');
    }

    return { content: [{ type: 'text', text }] };
  });

  server.tool('create_list', 'Create a new list', {
    title: z.string().describe('List title'),
    type: z.string().optional().describe('List type: shopping, todo, packing, or generic (default: generic)'),
    emoji: z.string().optional().describe('List emoji (optional, auto-picked if omitted)'),
  }, async ({ title, type, emoji }) => {
    const id = uuid();
    if (!emoji) {
      const lower = title.toLowerCase();
      const map = {
        grocer: '🛒', shopping: '🛍️', food: '🍕', todo: '✅', task: '📝',
        travel: '✈️', trip: '🧳', pack: '🧳', movie: '🎬', book: '📚',
        gift: '🎁', wish: '⭐', fitness: '💪', recipe: '👨‍🍳', clean: '🧹',
      };
      emoji = Object.entries(map).find(([k]) => lower.includes(k))?.[1] || '📋';
    }
    await api('POST', '/lists', { id, title, type: type || 'generic', emoji });
    return { content: [{ type: 'text', text: `Created: ${emoji} ${title} [id: ${id}]` }] };
  });

  server.tool('delete_list', 'Delete a list', {
    list: z.string().describe('List name or ID'),
  }, async ({ list: query }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);
    await api('DELETE', `/lists/${match.id}`);
    return { content: [{ type: 'text', text: `Deleted: ${match.emoji || '📋'} ${match.title}` }] };
  });

  server.tool('add_items', 'Add one or more items to a list', {
    list: z.string().describe('List name or ID'),
    items: z.string().describe('Items to add, separated by comma+space or semicolon. Example: "Milk, Eggs, Butter"'),
    category: z.string().optional().describe('Optional category name or ID. Use "other" to add uncategorized.'),
  }, async ({ list: query, items: itemsStr, category }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    const detail = await api('GET', `/lists/${match.id}`);
    const categories = detail.categories || [];

    let categoryId = null;
    if (typeof category === 'string' && category.trim() !== '') {
      const cQuery = category.trim();
      const lower = cQuery.toLowerCase();
      if (lower === 'other' || lower === 'uncategorized' || lower === 'none' || lower === 'null') {
        categoryId = null;
      } else {
        const cat = findCategory(categories, cQuery);
        if (!cat) throw new Error(`Category "${cQuery}" not found`);
        categoryId = cat.id;
      }
    }

    const texts = itemsStr.split(/;\s*|,\s+/).map(s => s.trim()).filter(Boolean);
    const added = [];

    for (const text of texts) {
      const id = uuid();
      await api('POST', `/lists/${match.id}/items`, { id, text, category_id: categoryId });
      added.push(text);
    }

    return { content: [{ type: 'text', text: `Added ${added.length} item(s) to ${match.emoji || '📋'} ${match.title}:\n${added.map(t => `  + ${t}`).join('\n')}` }] };
  });

  server.tool('check_item', 'Check off (complete) an item', {
    list: z.string().describe('List name or ID'),
    item: z.string().describe('Item text (fuzzy match)'),
  }, async ({ list: query, item: itemQuery }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    const detail = await api('GET', `/lists/${match.id}`);
    const items = detail.items || [];
    const lower = itemQuery.toLowerCase();
    const found = items.find(i => i.text.toLowerCase() === lower)
      || items.find(i => i.text.toLowerCase().includes(lower));
    if (!found) throw new Error(`Item "${itemQuery}" not found in ${match.title}`);

    await api('PUT', `/lists/${match.id}/items/${found.id}`, { checked: true });
    return { content: [{ type: 'text', text: `✅ Checked: ${found.text}` }] };
  });

  server.tool('uncheck_item', 'Uncheck (reopen) an item', {
    list: z.string().describe('List name or ID'),
    item: z.string().describe('Item text (fuzzy match)'),
  }, async ({ list: query, item: itemQuery }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    const detail = await api('GET', `/lists/${match.id}`);
    const items = detail.items || [];
    const lower = itemQuery.toLowerCase();
    const found = items.find(i => i.text.toLowerCase() === lower)
      || items.find(i => i.text.toLowerCase().includes(lower));
    if (!found) throw new Error(`Item "${itemQuery}" not found in ${match.title}`);

    await api('PUT', `/lists/${match.id}/items/${found.id}`, { checked: false });
    return { content: [{ type: 'text', text: `⬜ Unchecked: ${found.text}` }] };
  });

  server.tool('remove_item', 'Remove an item from a list', {
    list: z.string().describe('List name or ID'),
    item: z.string().describe('Item text (fuzzy match)'),
  }, async ({ list: query, item: itemQuery }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    const detail = await api('GET', `/lists/${match.id}`);
    const items = detail.items || [];
    const lower = itemQuery.toLowerCase();
    const found = items.find(i => i.text.toLowerCase() === lower)
      || items.find(i => i.text.toLowerCase().includes(lower));
    if (!found) throw new Error(`Item "${itemQuery}" not found in ${match.title}`);

    await api('DELETE', `/lists/${match.id}/items/${found.id}`);
    return { content: [{ type: 'text', text: `🗑️ Removed: ${found.text}` }] };
  });

  server.tool('clear_checked', 'Remove all checked (completed) items from a list', {
    list: z.string().describe('List name or ID'),
  }, async ({ list: query }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    const data = await api('DELETE', `/lists/${match.id}/items/checked`);
    return { content: [{ type: 'text', text: `🧹 Cleared ${data.deleted_count} checked item(s) from ${match.emoji || '📋'} ${match.title}` }] };
  });

  server.tool('share_list', 'Generate a share code for a list', {
    list: z.string().describe('List name or ID'),
  }, async ({ list: query }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    const data = await api('POST', `/lists/${match.id}/share`);
    return { content: [{ type: 'text', text: `Share code for ${match.emoji || '📋'} ${match.title}: ${data.share_code}\nAnyone with this code can join the list.` }] };
  });

  server.tool('join_list', 'Join a shared list using a share code', {
    code: z.string().describe('The share code'),
  }, async ({ code }) => {
    const data = await api('POST', '/lists/join', { code });
    return { content: [{ type: 'text', text: `Joined list: ${data.emoji || '📋'} ${data.title || data.list_id}` }] };
  });

  // --- Categories ---

  server.tool('list_categories', 'List categories for a list (includes Other/uncategorized count)', {
    list: z.string().describe('List name or ID'),
  }, async ({ list: query }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);
    const detail = await api('GET', `/lists/${match.id}`);
    const categories = (detail.categories || []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const items = detail.items || [];

    if (categories.length === 0) {
      const otherCount = items.filter(i => !i.category_id).length;
      return { content: [{ type: 'text', text: `No categories in ${match.emoji || '📋'} ${match.title}.\nOther: ${otherCount} item(s)` }] };
    }

    const lines = categories.map(c => {
      const count = items.filter(i => i.category_id === c.id).length;
      return `- ${c.name} (${count} item(s)) [id: ${c.id}]`;
    });
    const otherCount = items.filter(i => !i.category_id).length;
    lines.push(`- Other (${otherCount} item(s))`);
    return { content: [{ type: 'text', text: lines.join('\n') }] };
  });

  server.tool('create_category', 'Create a category', {
    list: z.string().describe('List name or ID'),
    name: z.string().describe('Category name'),
    position: z.number().optional().describe('Optional position (default: end)'),
  }, async ({ list: query, name, position }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);
    const id = uuid();
    const body = { id, name };
    if (typeof position === 'number') body.position = position;
    const res = await api('POST', `/lists/${match.id}/categories`, body);
    return { content: [{ type: 'text', text: `Created category: ${res.name} [id: ${res.id}]` }] };
  });

  server.tool('rename_category', 'Rename a category', {
    list: z.string().describe('List name or ID'),
    category: z.string().describe('Category name or ID'),
    name: z.string().describe('New category name'),
  }, async ({ list: query, category, name }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);
    const detail = await api('GET', `/lists/${match.id}`);
    const cat = findCategory(detail.categories || [], category);
    if (!cat) throw new Error(`Category "${category}" not found`);
    const res = await api('PUT', `/lists/${match.id}/categories/${cat.id}`, { name });
    return { content: [{ type: 'text', text: `Renamed category: ${cat.name} → ${res.name}` }] };
  });

  server.tool('delete_category', 'Delete a category (items will move to Other)', {
    list: z.string().describe('List name or ID'),
    category: z.string().describe('Category name or ID'),
  }, async ({ list: query, category }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);
    const detail = await api('GET', `/lists/${match.id}`);
    const cat = findCategory(detail.categories || [], category);
    if (!cat) throw new Error(`Category "${category}" not found`);
    const res = await api('DELETE', `/lists/${match.id}/categories/${cat.id}`);
    return { content: [{ type: 'text', text: `Deleted category: ${cat.name} (moved ${res.moved_count ?? 0} item(s) to Other)` }] };
  });

  server.tool('reorder_categories', 'Reorder categories', {
    list: z.string().describe('List name or ID'),
    order: z.array(z.string()).describe('Desired order as an array of category names or IDs (must include each category exactly once)'),
  }, async ({ list: query, order }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);
    const detail = await api('GET', `/lists/${match.id}`);
    const categories = detail.categories || [];
    if (categories.length === 0) throw new Error('This list has no categories');

    const resolved = order.map(q => {
      const cat = findCategory(categories, q);
      if (!cat) throw new Error(`Category "${q}" not found`);
      return cat;
    });

    const unique = new Set(resolved.map(c => c.id));
    if (unique.size !== categories.length) {
      throw new Error(`order must include each category exactly once (expected ${categories.length}, got ${unique.size})`);
    }

    const payload = resolved.map((c, idx) => ({ category_id: c.id, position: idx }));
    await api('PUT', `/lists/${match.id}/categories/reorder`, { order: payload });
    return { content: [{ type: 'text', text: 'Categories reordered.' }] };
  });

  server.tool('move_item', 'Move an item to a category (or to Other)', {
    list: z.string().describe('List name or ID'),
    item: z.string().describe('Item text (fuzzy match)'),
    category: z.string().describe('Target category name/ID, or "other" to uncategorize'),
  }, async ({ list: query, item: itemQuery, category }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);
    const detail = await api('GET', `/lists/${match.id}`);
    const items = detail.items || [];
    const lower = itemQuery.toLowerCase();
    const found = items.find(i => i.text.toLowerCase() === lower)
      || items.find(i => i.text.toLowerCase().includes(lower));
    if (!found) throw new Error(`Item "${itemQuery}" not found in ${match.title}`);

    const cLower = String(category).trim().toLowerCase();
    let categoryId = null;
    if (cLower === 'other' || cLower === 'uncategorized' || cLower === 'none' || cLower === 'null') {
      categoryId = null;
    } else {
      const cat = findCategory(detail.categories || [], category);
      if (!cat) throw new Error(`Category "${category}" not found`);
      categoryId = cat.id;
    }

    await api('PUT', `/lists/${match.id}/items/${found.id}`, { category_id: categoryId });
    return { content: [{ type: 'text', text: `Moved: ${found.text} → ${categoryId ? category : 'Other'}` }] };
  });

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

module.exports = { startMcpServer };
