# 💻 LystBot CLI

> ⏳ **Coming Soon** - The CLI is under active development. Star the repo to get notified!

<img src="https://img.shields.io/badge/status-coming%20soon-yellow.svg" alt="Coming Soon" />

The LystBot CLI lets you manage your lists from the terminal. Perfect for developers, power users, and AI agents that prefer a command-line workflow.

---

## Installation

```bash
npm install -g @lystbot/cli
```

---

## Authentication

```bash
lystbot login
```

This opens a browser flow or prompts for your API key. Your credentials are stored securely in `~/.lystbot/config.json`.

You can also set the API key directly:

```bash
lystbot login --token YOUR_API_KEY
```

Or use an environment variable:

```bash
export LYSTBOT_API_KEY=your-api-key
```

---

## Commands

### `lystbot add <list> <items...>`

Add items to a list. Creates the list if it doesn't exist.

```bash
# Add a single item
lystbot add "Groceries" "Oat milk"

# Add multiple items at once
lystbot add "Groceries" "Oat milk" "Bananas" "Coffee"

# Add to a new list (auto-creates it)
lystbot add "Weekend" "Clean garage" "Fix bike"
```

### `lystbot list [name]`

Show your lists, or show items in a specific list.

```bash
# Show all lists
lystbot list

# Show items in a specific list
lystbot list "Groceries"
```

**Example output:**

```
📋 Your Lists
─────────────
🛒 Groceries       (3/5 items checked)
📝 Weekend Tasks   (0/2 items checked)
🎁 Gift Ideas      (1/4 items checked)
```

### `lystbot check <list> <item>`

Mark an item as done.

```bash
lystbot check "Groceries" "Oat milk"
```

### `lystbot uncheck <list> <item>`

Unmark an item.

```bash
lystbot uncheck "Groceries" "Oat milk"
```

### `lystbot remove <list> <item>`

Remove an item from a list entirely.

```bash
lystbot remove "Groceries" "Oat milk"
```

### `lystbot share <list>`

Generate a share code for a list.

```bash
lystbot share "Groceries"
# => Share code: ABC123
# => Share this code with others to collaborate!
```

### `lystbot join <code>`

Join a shared list using a share code.

```bash
lystbot join ABC123
```

---

## Options

```
--json          Output as JSON (useful for piping / AI agents)
--api-url       Override API base URL
--version       Show version
--help          Show help
```

---

## Examples

```bash
# Morning routine: add today's tasks
lystbot add "Today" "Stand-up at 10" "Review PRs" "Deploy v2.1"

# Quick grocery check
lystbot list "Groceries" --json | jq '.items[] | select(.checked == false)'

# Share your list with a friend
lystbot share "Movie Night" 

# Check off items as you go
lystbot check "Today" "Stand-up at 10"
```

---

## Configuration

Config is stored in `~/.lystbot/config.json`:

```json
{
  "apiKey": "lystbot_ak_xxxxxxxxxxxxxxxxxxxx",
  "apiUrl": "https://daffy.touraround.io/lystbot/api/v1"
}
```

---

## See Also

- 📡 [API Reference](../api/) - Full REST API docs
- 🔌 [MCP Server](../mcp/) - Claude Desktop / AI agent integration
- 🏠 [Main README](../../) - Project overview
