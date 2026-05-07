# LystBot CLI & MCP Server

Smart lists and reminders that your AI can actually use.

## CLI

```bash
npx lystbot login <your-api-key>
npx lystbot lists
npx lystbot add "Groceries" "Milk, Eggs, Butter"
npx lystbot check "Groceries" "Milk"

# Categories
npx lystbot categories "Groceries"
npx lystbot category add "Groceries" "Fruits"
npx lystbot add "Groceries" "Bananas" --category "Fruits"
npx lystbot move "Groceries" "Bananas" --category other

# Reminders
npx lystbot reminders
npx lystbot reminder <id>
npx lystbot remind "Take vitamins" --at "2026-05-08 09:00" --timezone "Europe/Berlin"
npx lystbot reminder-update <id> --title "Take supplements"
npx lystbot reminder-update <id> --at "2026-05-09 09:00" --enabled
npx lystbot reminder-update <id> --disabled
npx lystbot reminder-delete <id> --yes
```

## MCP Server (Claude Desktop, Cursor, Windsurf)

LystBot includes a built-in MCP server. Add it to your AI tool:

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lystbot": {
      "command": "npx",
      "args": ["lystbot", "mcp"]
    }
  }
}
```

### Cursor / Windsurf

Add to `.cursor/mcp.json` or `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "lystbot": {
      "command": "npx",
      "args": ["lystbot", "mcp"]
    }
  }
}
```

### Setup

1. Install the app: [lystbot.com](https://lystbot.com)
2. Copy your API key from Settings
3. Run `npx lystbot login <your-api-key>`
4. Add the MCP config above
5. Ask Claude: "What's on my grocery list?"

### Available Tools

| Tool | Description |
|------|-------------|
| `list_lists` | Get all your lists |
| `get_list` | Get a list with all items |
| `create_list` | Create a new list |
| `delete_list` | Delete a list |
| `add_items` | Add items (comma-separated) |
| `check_item` | Check off an item |
| `uncheck_item` | Reopen a checked item |
| `remove_item` | Delete an item |
| `clear_checked` | Remove all checked (completed) items from a list |
| `share_list` | Generate a share code |
| `join_list` | Join a shared list |
| `list_categories` | List categories for a list |
| `create_category` | Create a category |
| `rename_category` | Rename a category |
| `delete_category` | Delete a category |
| `reorder_categories` | Reorder categories |
| `move_item` | Move an item to a category (or Other) |
| `list_reminders` | Get all reminders |
| `get_reminder` | Get one reminder |
| `create_reminder` | Create a reminder |
| `update_reminder` | Update a reminder |
| `delete_reminder` | Delete a reminder |

## Documentation

Full docs at [lystbot.com](https://lystbot.com) and [docs/](../docs/).
