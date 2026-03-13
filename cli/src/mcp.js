const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
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
    list: { type: 'string', description: 'List name or ID' },
  }, async ({ list: query }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    const detail = await api('GET', `/lists/${match.id}`);
    const items = detail.items || [];

    let text = `${match.emoji || '📋'} ${match.title}\n`;
    text += `Type: ${match.type || 'generic'} | ${items.length} items\n\n`;

    if (items.length === 0) {
      text += '(empty)';
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
    title: { type: 'string', description: 'List title' },
    type: { type: 'string', description: 'List type: shopping, todo, packing, or generic (default: generic)' },
    emoji: { type: 'string', description: 'List emoji (optional, auto-picked if omitted)' },
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
    list: { type: 'string', description: 'List name or ID' },
  }, async ({ list: query }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);
    await api('DELETE', `/lists/${match.id}`);
    return { content: [{ type: 'text', text: `Deleted: ${match.emoji || '📋'} ${match.title}` }] };
  });

  server.tool('add_items', 'Add one or more items to a list', {
    list: { type: 'string', description: 'List name or ID' },
    items: { type: 'string', description: 'Items to add, separated by comma+space or semicolon. Example: "Milk, Eggs, Butter"' },
  }, async ({ list: query, items: itemsStr }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    // Split on ", " or ";"
    const texts = itemsStr.split(/;\s*|,\s+/).map(s => s.trim()).filter(Boolean);
    const added = [];

    for (const text of texts) {
      const id = uuid();
      await api('POST', `/lists/${match.id}/items`, { id, text });
      added.push(text);
    }

    return { content: [{ type: 'text', text: `Added ${added.length} item(s) to ${match.emoji || '📋'} ${match.title}:\n${added.map(t => `  + ${t}`).join('\n')}` }] };
  });

  server.tool('check_item', 'Check off (complete) an item', {
    list: { type: 'string', description: 'List name or ID' },
    item: { type: 'string', description: 'Item text (fuzzy match)' },
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
    list: { type: 'string', description: 'List name or ID' },
    item: { type: 'string', description: 'Item text (fuzzy match)' },
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
    list: { type: 'string', description: 'List name or ID' },
    item: { type: 'string', description: 'Item text (fuzzy match)' },
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

  server.tool('share_list', 'Generate a share code for a list', {
    list: { type: 'string', description: 'List name or ID' },
  }, async ({ list: query }) => {
    const all = await api('GET', '/lists');
    const match = findList(all.lists || all, query);
    if (!match) throw new Error(`List "${query}" not found`);

    const data = await api('POST', `/lists/${match.id}/share`);
    return { content: [{ type: 'text', text: `Share code for ${match.emoji || '📋'} ${match.title}: ${data.share_code}\nAnyone with this code can join the list.` }] };
  });

  server.tool('join_list', 'Join a shared list using a share code', {
    code: { type: 'string', description: 'The share code' },
  }, async ({ code }) => {
    const data = await api('POST', '/lists/join', { share_code: code });
    return { content: [{ type: 'text', text: `Joined list: ${data.emoji || '📋'} ${data.title || data.list_id}` }] };
  });

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

module.exports = { startMcpServer };
