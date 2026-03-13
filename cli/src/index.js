#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

const API_URL = process.env.LYSTBOT_API_URL || 'https://daffy.touraround.io/lystbot/api/v1';

program
  .name('lystbot')
  .description('LystBot CLI - Manage your lists from the terminal')
  .version('0.1.0');

program
  .command('login')
  .description('Authenticate with LystBot')
  .option('--token <api-key>', 'Set API key directly')
  .action((options) => {
    console.log('🔐 Login coming soon!');
    console.log(`   API: ${API_URL}`);
  });

program
  .command('list [name]')
  .description('Show your lists, or items in a specific list')
  .option('--json', 'Output as JSON')
  .action((name, options) => {
    if (name) {
      console.log(`📋 Showing list: ${name}`);
    } else {
      console.log('📋 Your Lists');
      console.log('─────────────');
    }
    console.log('   Coming soon!');
  });

program
  .command('add <list> <items...>')
  .description('Add items to a list (creates list if needed)')
  .action((list, items) => {
    console.log(`➕ Adding to "${list}":`);
    items.forEach(item => console.log(`   • ${item}`));
    console.log('   Coming soon!');
  });

program
  .command('check <list> <item>')
  .description('Mark an item as done')
  .action((list, item) => {
    console.log(`✅ Checking "${item}" in "${list}"`);
    console.log('   Coming soon!');
  });

program
  .command('uncheck <list> <item>')
  .description('Unmark an item')
  .action((list, item) => {
    console.log(`⬜ Unchecking "${item}" in "${list}"`);
    console.log('   Coming soon!');
  });

program
  .command('remove <list> <item>')
  .description('Remove an item from a list')
  .action((list, item) => {
    console.log(`🗑️  Removing "${item}" from "${list}"`);
    console.log('   Coming soon!');
  });

program
  .command('share <list>')
  .description('Generate a share code for a list')
  .action((list) => {
    console.log(`🔗 Sharing "${list}"`);
    console.log('   Coming soon!');
  });

program
  .command('join <code>')
  .description('Join a shared list using a share code')
  .action((code) => {
    console.log(`🤝 Joining list with code: ${code}`);
    console.log('   Coming soon!');
  });

program.parse();
