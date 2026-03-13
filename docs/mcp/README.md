# 🔌 LystBot MCP Server

> ⏳ **Coming Soon** - The MCP server is under active development. Star the repo to get notified!

<img src="https://img.shields.io/badge/status-coming%20soon-yellow.svg" alt="Coming Soon" />

---

## What is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that lets AI assistants connect to external tools and data sources. Think of it as USB-C for AI - one standard, many connections.

With the LystBot MCP server, any MCP-compatible AI assistant can manage your lists directly.

---

## Installation

```bash
npm install -g @lystbot/mcp
```

---

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lystbot": {
      "command": "npx",
      "args": ["@lystbot/mcp"],
      "env": {
        "LYSTBOT_API_KEY": "your-api-key"
      }
    }
  }
}
```

### OpenClaw

Add to your OpenClaw MCP config:

```json
{
  "mcpServers": {
    "lystbot": {
      "command": "npx",
      "args": ["@lystbot/mcp"],
      "env": {
        "LYSTBOT_API_KEY": "your-api-key"
      }
    }
  }
}
```

---

## Available Tools

Once connected, your AI assistant will have access to these tools:

### `lystbot_get_lists`
Get all your lists with item counts and status.

### `lystbot_get_list`
Get a specific list with all its items. Parameters: `listId`

### `lystbot_create_list`
Create a new list. Parameters: `name`, `emoji` (optional)

### `lystbot_add_item`
Add an item to a list. Parameters: `listId`, `text`

### `lystbot_check_item`
Mark an item as checked. Parameters: `listId`, `itemId`

### `lystbot_uncheck_item`
Unmark an item. Parameters: `listId`, `itemId`

### `lystbot_remove_item`
Remove an item from a list. Parameters: `listId`, `itemId`

### `lystbot_share_list`
Generate a share code for a list. Parameters: `listId`

### `lystbot_join_list`
Join a shared list. Parameters: `shareCode`

---

## Usage Examples

Once configured, just talk to your AI naturally:

> *"Add milk and eggs to my grocery list"*

> *"What's on my weekend todo list?"*

> *"Check off 'Buy birthday cake' from my party list"*

> *"Share my movie watchlist with me"*

The AI will use the MCP tools behind the scenes - no commands to remember.

---

## See Also

- 📡 [API Reference](../api/) - Full REST API docs
- 💻 [CLI Reference](../cli/) - Command-line interface
- 🏠 [Main README](../../) - Project overview
