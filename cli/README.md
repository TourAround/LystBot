# LystBot CLI & MCP Server

Smart lists and reminders that your AI can actually use.

## CLI

```bash
npx lystbot login <your-api-key>
npx lystbot lists
npx lystbot add "Groceries" "Milk, Eggs, Butter"
npx lystbot add "Groceries" "250g Mehl; 3x Milch; 3 Bananen; 2 Flaschen Wein"
npx lystbot add "Groceries" "Mehl" --quantity 2 --unit "500g"
npx lystbot check "Groceries" "Milk"

# Categories
npx lystbot categories "Groceries"
npx lystbot category add "Groceries" "Fruits"
npx lystbot add "Groceries" "Bananas" --category "Fruits"
npx lystbot move "Groceries" "Bananas" --category other

# Attachments
npx lystbot attach-image "Groceries" "Milk" ./photo.jpg
npx lystbot attach-url "Groceries" "Milk" "https://example.com" "Recipe"
npx lystbot attachments "Groceries" "Milk"
npx lystbot detach <attachment-id>

# Reminders
npx lystbot reminders
npx lystbot reminder <id>
npx lystbot remind "Take vitamins" --at "2026-05-08 09:00" --timezone "Europe/Berlin"
npx lystbot reminder-update <id> --title "Take supplements"
npx lystbot reminder-update <id> --at "2026-05-09 09:00" --enabled
npx lystbot reminder-update <id> --disabled
npx lystbot reminder-delete <id> --yes
```

Natural prefixes are stored as structured fields: `250g Mehl` becomes text `Mehl`, quantity `1`, unit `250g`; `3x Milch` or `3 Bananen` becomes quantity `3`; and `2 Flaschen Wein` uses unit `2 Flaschen`. `--quantity` accepts integer counts from 1 to 99. Explicit `--quantity`/`--unit` flags only work for a single item.

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
| `add_items` | Add natural-syntax strings or structured `{text, quantity?, unit?}` items |
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
| `add_item_image` | Attach an image to an item (`image_path`, or `image_base64` + `mime_type` + `filename`) |
| `add_item_url` | Attach an http(s) link to an item |
| `list_item_attachments` | List all attachments of an item |
| `delete_item_attachment` | Delete an attachment by ID |
| `list_reminders` | Get all reminders |
| `get_reminder` | Get one reminder |
| `create_reminder` | Create a reminder |
| `update_reminder` | Update a reminder |
| `delete_reminder` | Delete a reminder |

Natural strings such as `3 Bananen` become quantity `3` with unit null. For precise agent calls, `add_items` accepts structured input such as `[{"text":"Mehl","quantity":2,"unit":"500g"}]`. Weight is a `unit`, so `250g` means quantity `1` and unit `250g`, never quantity `250`.

## Documentation

Full docs at [lystbot.com](https://lystbot.com) and [docs/](../docs/).
