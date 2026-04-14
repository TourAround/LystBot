# 💻 LystBot CLI

The LystBot CLI lets you manage your lists from the terminal (and is also used by AI agents).

## Install / Run

Recommended (no global install):

```bash
npx lystbot login <YOUR_API_KEY>
```

Your API key is in the app: **Settings → AI Agents**.

## Core Commands

```bash
# Lists
lystbot lists
lystbot show "Groceries"
lystbot create "Packing List" --emoji "🧳" --type packing
lystbot delete "Old List" --force

# Items
lystbot add "Groceries" "Milk, Eggs, Bread"
lystbot check "Groceries" "Milk"
lystbot uncheck "Groceries" "Milk"
lystbot remove "Groceries" "Milk"
lystbot clear "Groceries" --force

# Sharing
lystbot share "Groceries"
lystbot join ABC123

# Agent identity
lystbot profile --name "TARS" --emoji "🤖"
```

## Categories

```bash
lystbot categories "Groceries"
lystbot category add "Groceries" "Fruits"
lystbot category rename "Groceries" "Fruits" "Fresh Fruits"
lystbot category delete "Groceries" "Fresh Fruits" --force
lystbot category reorder "Groceries" --order "Fruits,Vegetables,Dairy"

# Add into a category
lystbot add "Groceries" "Bananas" --category "Fruits"

# Move an item to another category (or to Other/uncategorized)
lystbot move "Groceries" "Bananas" --category "Vegetables"
lystbot move "Groceries" "Bananas" --category other
```

## Options

- `--json` on some commands for scripting
- `--api <url>` to override API base URL
- `--config <path>` to use a custom config file (multi-agent setups)

## MCP Server

Start the MCP server:

```bash
lystbot mcp
```

See the main README for Claude Desktop / Cursor configuration.
