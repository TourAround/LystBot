#!/usr/bin/env node

const { Command } = require('commander');
const { randomUUID } = require('crypto');
const readline = require('readline');
const config = require('./config');
const api = require('./api');
const pkg = require('../package.json');

const program = new Command();

program
  .name('lystbot')
  .description('📋 LystBot CLI - Manage your lists from the terminal')
  .version(pkg.version)
  .option('--api <url>', 'Use custom API URL')
  .option('--config <path>', 'Use custom config file (for multi-agent setups)')
  .hook('preAction', () => {
    const opts = program.opts();
    if (opts.config) {
      config.setConfigPath(opts.config);
    }
    if (opts.api) {
      config.setCustomUrl(opts.api);
      console.log(`🔗 API: ${opts.api}\n`);
    }
  });

// ── login ──────────────────────────────────────────────
program
  .command('login')
  .description('Authenticate with your LystBot API key (from the app)')
  .argument('[api-key]', 'Your API key from the LystBot app')
  .action(async (apiKey) => {
    if (!apiKey) {
      // Interactive: ask for the key
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const ask = (q) => new Promise(resolve => rl.question(q, resolve));

      console.log('🔑 LystBot CLI Login\n');
      console.log('Open the LystBot app → Settings → AI Agents → copy your API key.\n');
      apiKey = await ask('API Key: ');
      rl.close();

      if (!apiKey.trim()) {
        console.error('❌ API key cannot be empty.');
        process.exit(1);
      }
      apiKey = apiKey.trim();
    }

    // Verify the key works
    config.write({ apiKey, apiUrl: config.getBaseUrl() });
    try {
      const lists = await api.request('GET', '/lists');
      const count = (lists.lists || lists).length;
      console.log(`✅ Logged in! Found ${count} list${count !== 1 ? 's' : ''} on your account.`);
      console.log('');
      console.log('💡 Set your bot name so users see who\'s making changes:');
      console.log('   lystbot profile --name "My Agent" --emoji "🤖"');
    } catch {
      // Key might still be valid but lists endpoint could fail for other reasons
      console.log('✅ API key stored. Run `lystbot lists` to verify.');
    }
  });

// ── profile ────────────────────────────────────────────
program
  .command('profile')
  .description('View or update your bot profile (name, emoji)')
  .option('--name <name>', 'Set bot display name')
  .option('--emoji <emoji>', 'Set bot emoji')
  .action(async (options) => {
    config.getApiKey();
    const updates = {};
    if (options.name) updates.name = options.name;
    if (options.emoji) updates.signature_emoji = options.emoji;

    if (Object.keys(updates).length === 0) {
      console.log('🤖 Bot Profile');
      console.log('');
      console.log('Set your name and emoji so users see who\'s making changes:');
      console.log('   lystbot profile --name "My Agent" --emoji "🤖"');
      console.log('');
      console.log('Without a name, you\'ll show up as "Bot" in the app.');
      return;
    }

    await api.request('PATCH', '/agents/me', updates);
    console.log(`✅ Profile updated!`);
    if (options.name) console.log(`   Name:  ${options.name}`);
    if (options.emoji) console.log(`   Emoji: ${options.emoji}`);
  });

// ── logout ─────────────────────────────────────────────
program
  .command('logout')
  .description('Remove stored credentials')
  .action(() => {
    if (config.remove()) {
      console.log('👋 Logged out. Config removed.');
    } else {
      console.log('ℹ️  Already logged out (no config found).');
    }
  });

// ── whoami ─────────────────────────────────────────────
program
  .command('whoami')
  .description('Show current auth info')
  .action(() => {
    const cfg = config.read();
    if (!cfg) {
      console.log('❌ Not logged in. Run: lystbot login');
      process.exit(1);
    }
    const masked = cfg.apiKey
      ? cfg.apiKey.slice(0, 12) + '...' + cfg.apiKey.slice(-4)
      : '(none)';
    console.log('👤 LystBot CLI');
    console.log(`   API URL:  ${cfg.apiUrl || config.getBaseUrl()}`);
    if (cfg.deviceName) console.log(`   Device:   ${cfg.deviceName}`);
    if (cfg.deviceUuid) console.log(`   UUID:     ${cfg.deviceUuid}`);
    console.log(`   API Key:  ${masked}`);
  });

// ── lists ──────────────────────────────────────────────
program
  .command('lists')
  .description('Show all your lists')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    config.getApiKey(); // ensure logged in
    const res = await api.request('GET', '/lists');
    const lists = res.lists || res;

    if (options.json) {
      console.log(JSON.stringify(lists, null, 2));
      return;
    }

    if (!lists.length) {
      console.log('📋 No lists yet. Create one: lystbot create "My List"');
      return;
    }

    console.log('📋 Your Lists\n');
    for (const l of lists) {
      const emoji = l.emoji || '📋';
      const shared = l.is_shared ? ' 👥' : '';
      const total = l.item_count || 0;
      const unchecked = l.unchecked_count || 0;
      const checked = total - unchecked;
      const count = `${checked}/${total}`;
      console.log(`  ${emoji} ${l.title || l.name}  (${count} done)${shared}`);
    }
    console.log(`\n  ${lists.length} list${lists.length === 1 ? '' : 's'} total`);
  });

// ── show ───────────────────────────────────────────────
program
  .command('show <list>')
  .description('Show items in a list')
  .option('--json', 'Output as JSON')
  .action(async (listQuery, options) => {
    config.getApiKey();
    const { detail } = await api.resolveList(listQuery, { withItems: true });

    if (options.json) {
      console.log(JSON.stringify(detail, null, 2));
      return;
    }

    const emoji = detail.emoji || '📋';
    const listTitle = detail.title || detail.name;
    const memberCount = Array.isArray(detail.members) ? detail.members.length : (detail.members || 0);
    const shared = detail.is_shared ? ` 👥 (${memberCount} member${memberCount === 1 ? '' : 's'})` : '';
    console.log(`\n${emoji} ${listTitle}${shared}\n`);

    const items = detail.items || [];
    const categories = Array.isArray(detail.categories)
      ? [...detail.categories].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      : [];

    if (!items.length) {
      console.log('  (empty list)');
      return;
    }

    // If categories exist, render sectioned view like the app.
    if (categories.length > 0) {
      const byCategory = new Map();
      for (const c of categories) byCategory.set(c.id, []);
      const other = [];

      for (const item of items) {
        const cid = item.category_id || null;
        if (cid && byCategory.has(cid)) byCategory.get(cid).push(item);
        else other.push(item);
      }

      for (const c of categories) {
        const sectionItems = byCategory.get(c.id) || [];
        console.log(`  ${c.name}`);
        if (sectionItems.length === 0) {
          console.log('    (empty)');
        } else {
          for (const item of sectionItems) {
            console.log(item.checked ? `    ✅ ~~${item.text}~~` : `    ⬜ ${item.text}`);
          }
        }
        console.log('');
      }

      if (other.length > 0) {
        console.log('  Other');
        for (const item of other) {
          console.log(item.checked ? `    ✅ ~~${item.text}~~` : `    ⬜ ${item.text}`);
        }
      }
    } else {
      // Flat view
      for (const item of items) {
        console.log(item.checked ? `  ✅ ~~${item.text}~~` : `  ⬜ ${item.text}`);
      }
    }

    const checked = items.filter(i => i.checked).length;
    console.log(`\n  ${checked}/${items.length} done`);
  });

// ── categories (read-only shortcut) ───────────────────
program
  .command('categories <list>')
  .description('Show categories in a list (including Other/uncategorized)')
  .option('--json', 'Output as JSON')
  .action(async (listQuery, options) => {
    config.getApiKey();
    const { list, detail } = await api.resolveList(listQuery, { withItems: true });

    const categories = Array.isArray(detail.categories)
      ? [...detail.categories].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      : [];
    const items = detail.items || [];

    if (options.json) {
      const otherCount = items.filter(i => !i.category_id).length;
      console.log(JSON.stringify({ list_id: list.id, categories, other_count: otherCount }, null, 2));
      return;
    }

    console.log(`\n${detail.emoji || '📋'} ${detail.title || detail.name} — Categories\n`);
    if (categories.length === 0) {
      console.log('  (no categories yet)');
    } else {
      for (const c of categories) {
        const count = items.filter(i => i.category_id === c.id).length;
        console.log(`  • ${c.name}  (${count} item${count === 1 ? '' : 's'})`);
      }
    }

    const otherCount = items.filter(i => !i.category_id).length;
    console.log(`  • Other  (${otherCount} item${otherCount === 1 ? '' : 's'})`);
  });

// ── category (manage) ─────────────────────────────────
const categoryCmd = program
  .command('category')
  .description('Manage list categories');

categoryCmd
  .command('add <list> <name>')
  .description('Create a category')
  .option('--position <n>', 'Insert position (default: end)')
  .action(async (listQuery, name, options) => {
    config.getApiKey();
    const { list } = await api.resolveList(listQuery);
    const body = { id: randomUUID(), name: name.trim() };
    if (options.position !== undefined) body.position = parseInt(options.position, 10);
    const res = await api.request('POST', `/lists/${list.id}/categories`, body);
    console.log(`✅ Category created: ${res.name} [id: ${res.id}]`);
  });

categoryCmd
  .command('rename <list> <category> <newName>')
  .description('Rename a category')
  .action(async (listQuery, categoryQuery, newName) => {
    config.getApiKey();
    const { list, detail } = await api.resolveList(listQuery, { withItems: true });
    const cat = api.findCategory(detail.categories || [], categoryQuery);
    if (!cat) {
      const names = (detail.categories || []).map(c => c.name).join(', ');
      console.error(`❌ Category '${categoryQuery}' not found. Categories: ${names || '(none)'}`);
      process.exit(1);
    }
    const res = await api.request('PUT', `/lists/${list.id}/categories/${cat.id}`, { name: newName.trim() });
    console.log(`✅ Category renamed: ${cat.name} → ${res.name}`);
  });

categoryCmd
  .command('delete <list> <category>')
  .description('Delete a category (items will move to Other)')
  .option('--force', 'Skip confirmation')
  .action(async (listQuery, categoryQuery, options) => {
    config.getApiKey();
    const { list, detail } = await api.resolveList(listQuery, { withItems: true });
    const cat = api.findCategory(detail.categories || [], categoryQuery);
    if (!cat) {
      const names = (detail.categories || []).map(c => c.name).join(', ');
      console.error(`❌ Category '${categoryQuery}' not found. Categories: ${names || '(none)'}`);
      process.exit(1);
    }

    if (!options.force) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise(resolve =>
        rl.question(`🗑️  Delete category '${cat.name}'? Items will be moved to Other. (y/N) `, resolve)
      );
      rl.close();
      if (answer.toLowerCase() !== 'y') {
        console.log('Cancelled.');
        process.exit(0);
      }
    }

    const res = await api.request('DELETE', `/lists/${list.id}/categories/${cat.id}`);
    console.log(`🗑️  Deleted category: ${cat.name} (moved ${res.moved_count ?? 0} item(s) to Other)`);
  });

categoryCmd
  .command('reorder <list>')
  .description('Reorder categories')
  .requiredOption('--order <csv>', 'Comma-separated category names or IDs in desired order')
  .action(async (listQuery, options) => {
    config.getApiKey();
    const { list, detail } = await api.resolveList(listQuery, { withItems: true });
    const categories = detail.categories || [];
    if (!categories.length) {
      console.error('❌ This list has no categories to reorder.');
      process.exit(1);
    }

    const parts = String(options.order)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      console.error('❌ --order cannot be empty');
      process.exit(1);
    }

    const resolved = [];
    for (const q of parts) {
      const cat = api.findCategory(categories, q);
      if (!cat) {
        console.error(`❌ Category '${q}' not found in list.`);
        process.exit(1);
      }
      resolved.push(cat);
    }

    // Require full order to avoid surprises
    const uniqueIds = new Set(resolved.map(c => c.id));
    if (uniqueIds.size !== categories.length) {
      console.error('❌ --order must include each category exactly once.');
      console.error(`   Expected ${categories.length} unique categories, got ${uniqueIds.size}.`);
      process.exit(1);
    }

    const order = resolved.map((c, idx) => ({ category_id: c.id, position: idx }));
    await api.request('PUT', `/lists/${list.id}/categories/reorder`, { order });
    console.log('✅ Categories reordered.');
  });

// ── add ────────────────────────────────────────────────
program
  .command('add <list> <items...>')
  .description('Add items to a list (supports comma-separated)')
  .option('--category <category>', 'Add items to a category (name or ID)')
  .option('--create-category', 'Auto-create the category if it does not exist (only works with --category name)')
  .action(async (listQuery, rawItems, options) => {
    config.getApiKey();

    // Smart parsing: each CLI argument is one item.
    // Within a single argument, split on ", " (comma+space) for batch input.
    // To include a literal comma+space in an item, use semicolons as separator instead.
    // e.g. "Milch; Eier; Brot" or "Käse, Wurst, Senf" both work as batch.
    // Single item with comma: pass as separate arg without comma+space pattern.
    const items = rawItems
      .flatMap(i => {
        // If argument contains semicolons, use those as separators (commas stay literal)
        if (i.includes(';')) return i.split(';');
        // Otherwise split on ", " (comma followed by space)
        return i.split(', ');
      })
      .map(i => i.trim())
      .filter(Boolean);

    if (!items.length) {
      console.error('❌ No items to add.');
      process.exit(1);
    }

    // Try to find the list
    const listsRes = await api.request('GET', '/lists');
    const lists = listsRes.lists || listsRes;
    let match = api.findList(lists, listQuery);

    // If not found, offer to create it
    if (!match) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise(resolve =>
        rl.question(`📋 List '${listQuery}' doesn't exist. Create it? (Y/n) `, resolve)
      );
      rl.close();

      if (answer.toLowerCase() === 'n') {
        console.log('Cancelled.');
        process.exit(0);
      }

      const emoji = api.autoEmoji(listQuery);
      const newId = randomUUID();
      await api.request('POST', '/lists', { id: newId, title: listQuery, type: 'generic', emoji });
      match = { id: newId, title: listQuery, emoji };
      console.log(`✨ Created list: ${emoji} ${listQuery}`);
    }

    // Resolve category (optional)
    let categoryId = null;
    if (options.category) {
      const detail = await api.request('GET', `/lists/${match.id}`);
      const cat = api.findCategory(detail.categories || [], options.category);
      if (!cat) {
        if (options.createCategory) {
          const created = await api.request('POST', `/lists/${match.id}/categories`, {
            id: randomUUID(),
            name: String(options.category).trim(),
          });
          categoryId = created.id;
          console.log(`✅ Created category: ${created.name}`);
        } else {
          const names = (detail.categories || []).map(c => c.name).join(', ');
          console.error(`❌ Category '${options.category}' not found. Categories: ${names || '(none)'}`);
          console.error('   Tip: Use --create-category to create it automatically.');
          process.exit(1);
        }
      } else {
        categoryId = cat.id;
      }
    }

    // Add items one by one (each needs a client-generated UUID)
    let added = 0;
    for (let idx = 0; idx < items.length; idx++) {
      await api.request('POST', `/lists/${match.id}/items`, {
        id: randomUUID(),
        text: items[idx],
        quantity: 1,
        unit: null,
        position: idx,
        category_id: categoryId,
      });
      added++;
    }

    const emoji = match.emoji || '📋';
    console.log(`➕ Added ${added} item${added === 1 ? '' : 's'} to ${emoji} ${match.title || match.name}`);
    for (const text of items) {
      console.log(`   • ${text}`);
    }
  });

// ── move (item category) ──────────────────────────────
program
  .command('move <list> <item>')
  .description('Move an item to a category (or to Other)')
  .requiredOption('--category <category>', 'Target category name/ID, or "other" to uncategorize')
  .action(async (listQuery, itemQuery, options) => {
    config.getApiKey();
    const { list, detail } = await api.resolveList(listQuery, { withItems: true });

    const item = api.findItem(detail.items || [], itemQuery);
    if (!item) {
      const names = (detail.items || []).map(i => i.text).join(', ');
      console.error(`❌ Item '${itemQuery}' not found in ${list.title || list.name}. Items: ${names || '(empty)'}`);
      process.exit(1);
    }

    const q = String(options.category).trim().toLowerCase();
    let categoryId = null;
    if (q === 'other' || q === 'uncategorized' || q === 'none' || q === 'null') {
      categoryId = null;
    } else {
      const cat = api.findCategory(detail.categories || [], options.category);
      if (!cat) {
        const names = (detail.categories || []).map(c => c.name).join(', ');
        console.error(`❌ Category '${options.category}' not found. Categories: ${names || '(none)'}`);
        process.exit(1);
      }
      categoryId = cat.id;
    }

    await api.request('PUT', `/lists/${list.id}/items/${item.id}`, { category_id: categoryId });
    console.log(`✅ Moved: ${item.text} → ${categoryId ? options.category : 'Other'}`);
  });

// ── check ──────────────────────────────────────────────
program
  .command('check <list> <item>')
  .description('Mark an item as done')
  .action(async (listQuery, itemQuery) => {
    config.getApiKey();
    const { list, detail } = await api.resolveList(listQuery, { withItems: true });

    const item = api.findItem(detail.items || [], itemQuery);
    if (!item) {
      const names = (detail.items || []).map(i => i.text).join(', ');
      console.error(`❌ Item '${itemQuery}' not found in ${list.title || list.name}. Items: ${names || '(empty)'}`);
      process.exit(1);
    }

    await api.request('PUT', `/lists/${list.id}/items/${item.id}`, { checked: true });
    console.log(`✅ Checked: ${item.text}`);
  });

// ── uncheck ────────────────────────────────────────────
program
  .command('uncheck <list> <item>')
  .description('Unmark an item')
  .action(async (listQuery, itemQuery) => {
    config.getApiKey();
    const { list, detail } = await api.resolveList(listQuery, { withItems: true });

    const item = api.findItem(detail.items || [], itemQuery);
    if (!item) {
      const names = (detail.items || []).map(i => i.text).join(', ');
      console.error(`❌ Item '${itemQuery}' not found in ${list.title || list.name}. Items: ${names || '(empty)'}`);
      process.exit(1);
    }

    await api.request('PUT', `/lists/${list.id}/items/${item.id}`, { checked: false });
    console.log(`⬜ Unchecked: ${item.text}`);
  });

// ── remove ─────────────────────────────────────────────
program
  .command('remove <list> <item>')
  .description('Remove an item from a list')
  .action(async (listQuery, itemQuery) => {
    config.getApiKey();
    const { list, detail } = await api.resolveList(listQuery, { withItems: true });

    const item = api.findItem(detail.items || [], itemQuery);
    if (!item) {
      const names = (detail.items || []).map(i => i.text).join(', ');
      console.error(`❌ Item '${itemQuery}' not found in ${list.title || list.name}. Items: ${names || '(empty)'}`);
      process.exit(1);
    }

    await api.request('DELETE', `/lists/${list.id}/items/${item.id}`);
    console.log(`🗑️  Removed: ${item.text}`);
  });

// ── clear ──────────────────────────────────────────────
program
  .command('clear <list>')
  .description('Remove all checked (completed) items from a list')
  .option('--force', 'Skip confirmation')
  .action(async (listQuery, options) => {
    config.getApiKey();
    const { list, detail } = await api.resolveList(listQuery, { withItems: true });
    const checked = (detail.items || []).filter(i => i.checked);

    if (checked.length === 0) {
      console.log(`✨ No checked items in ${list.emoji || '📋'} ${list.title || list.name}`);
      return;
    }

    if (!options.force) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise(resolve =>
        rl.question(`🧹 Remove ${checked.length} checked item(s) from '${list.emoji || ''} ${list.title || list.name}'? (y/N) `, resolve)
      );
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('Cancelled.');
        process.exit(0);
      }
    }

    const result = await api.request('DELETE', `/lists/${list.id}/items/checked`);
    console.log(`🧹 Cleared ${result.deleted_count} checked item(s) from ${list.emoji || '📋'} ${list.title || list.name}`);
  });

// ── create ─────────────────────────────────────────────
program
  .command('create <name>')
  .description('Create a new list')
  .option('--emoji <emoji>', 'List emoji')
  .option('--type <type>', 'List type (shopping|todo|packing|generic)', 'generic')
  .action(async (name, options) => {
    config.getApiKey();
    const emoji = options.emoji || api.autoEmoji(name);
    const list = await api.request('POST', '/lists', {
      id: randomUUID(),
      title: name,
      type: options.type,
      emoji,
    });
    console.log(`✨ Created: ${emoji} ${name}`);
  });

// ── delete ─────────────────────────────────────────────
program
  .command('delete <list>')
  .description('Delete a list')
  .option('--force', 'Skip confirmation')
  .action(async (listQuery, options) => {
    config.getApiKey();
    const { list } = await api.resolveList(listQuery);

    if (!options.force) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise(resolve =>
        rl.question(`🗑️  Delete '${list.emoji || ''} ${list.title || list.name}'? This cannot be undone. (y/N) `, resolve)
      );
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('Cancelled.');
        process.exit(0);
      }
    }

    await api.request('DELETE', `/lists/${list.id}`);
    console.log(`🗑️  Deleted: ${list.emoji || '📋'} ${list.title || list.name}`);
  });

// ── share ──────────────────────────────────────────────
program
  .command('share <list>')
  .description('Generate a share code for a list')
  .action(async (listQuery) => {
    config.getApiKey();
    const { list } = await api.resolveList(listQuery);

    const result = await api.request('POST', `/lists/${list.id}/share`);
    console.log(`\n🔗 Share code for ${list.emoji || '📋'} ${list.title || list.name}:\n`);
    console.log(`   ${result.share_code}\n`);
    console.log(`   Others can join with: lystbot join ${result.share_code}`);
  });

// ── join ───────────────────────────────────────────────
program
  .command('join <code>')
  .description('Join a shared list using a share code')
  .action(async (code) => {
    config.getApiKey();
    const list = await api.request('POST', '/lists/join', { code });
    console.log(`🤝 Joined: ${list.emoji || '📋'} ${list.title || list.name} (${list.item_count || 0} items)`);
  });

// ── mcp ────────────────────────────────────────────────
program
  .command('mcp')
  .description('Start MCP (Model Context Protocol) server for Claude Desktop, Cursor, etc.')
  .action(async () => {
    const { startMcpServer } = require('./mcp');
    await startMcpServer();
  });

program.parse();
