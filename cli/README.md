# LystBot CLI & MCP Server

Smart lists that your AI can actually use.

## CLI

```bash
npx lystbot login <your-api-key>
npx lystbot lists
npx lystbot add "Groceries" "Milk, Eggs, Butter"
npx lystbot check "Groceries" "Milk"
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
| `share_list` | Generate a share code |
| `join_list` | Join a shared list |

## Documentation

Full docs at [lystbot.com](https://lystbot.com) and [docs/](../docs/).
