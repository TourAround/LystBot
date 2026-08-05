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
lystbot add "Groceries" "250g Mehl; 3x Milch; 2 Flaschen Wein"
lystbot add "Groceries" "Mehl" --quantity 2 --unit "500g"
lystbot check "Groceries" "Milk"
lystbot uncheck "Groceries" "Milk"
lystbot remove "Groceries" "Milk"
lystbot clear "Groceries" --force

# Sharing
lystbot share "Groceries"
lystbot join ABC123

# Reminders
lystbot reminders
lystbot reminder <id>
lystbot remind "Take vitamins" --at "2026-05-08 09:00" --timezone "Europe/Berlin"
lystbot reminder-update <id> --title "Take supplements"
lystbot reminder-update <id> --at "2026-05-09 09:00" --timezone "Europe/Berlin"
lystbot reminder-update <id> --enabled
lystbot reminder-update <id> --disabled
lystbot reminder-delete <id> --yes

# Agent identity
lystbot profile --name "TARS" --emoji "🤖"
```

Natural item syntax is normalized before sending: `250g Mehl` becomes text `Mehl`, quantity `1`, unit `250g`; `3x Milch` becomes quantity `3`; and `2 Flaschen Wein` becomes unit `2 Flaschen`. Counts also support `4 x` and German `4 mal`; units support metric weight/volume, `lb`/`lbs`/`oz`, German/English containers, and `6er Pack`.

`--quantity` accepts an integer from 1 to 99. `--quantity` and `--unit` override parsed fields and are rejected for batch calls. Weight always belongs in `unit`, not in `quantity`.

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

## Reminders

```bash
# List and show
lystbot reminders
lystbot reminders --json
lystbot reminder <id>
lystbot reminder <id> --json

# Create
lystbot remind "Take vitamins" --at "2026-05-08 09:00" --timezone "Europe/Berlin"
lystbot remind "Water plants" --at "2026-05-08 18:00" --repeat weekly
lystbot remind "Draft report" --at "2026-05-08 10:00" --disabled --json

# Update
lystbot reminder-update <id> --title "Take supplements"
lystbot reminder-update <id> --at "2026-05-09 09:00" --timezone "Europe/Berlin"
lystbot reminder-update <id> --repeat monthly
lystbot reminder-update <id> --enabled
lystbot reminder-update <id> --disabled --json

# Delete
lystbot reminder-delete <id>
lystbot reminder-delete <id> --yes
lystbot reminder-delete <id> --yes --json
```

Reminder fields:

- `--at <datetime>` is required when creating a reminder
- `--timezone <tz>` defaults to `Europe/Berlin`
- `--repeat <repeat>` accepts `none`, `daily`, `weekly`, `biweekly`, `monthly`, `yearly`
- `--disabled` creates or updates a reminder as disabled
- `--enabled` re-enables an existing reminder
- `--json` is available on reminder list, show, create, update, and delete commands

`lystbot reminder-delete <id>` prompts before deleting. Use `--yes` to skip the prompt in scripts.

## Options

- `--json` on some commands for scripting
- `--api <url>` to override API base URL
- `--config <path>` to use a custom config file (multi-agent setups)

## MCP Server

Start the MCP server:

```bash
lystbot mcp
```

The `add_items` tool accepts the existing delimited string or structured entries with `text`, optional integer `quantity` (`1..99`), and optional string/null `unit`. Example: `[{"text":"Mehl","quantity":2,"unit":"500g"}]`. Natural prefixes in `text` are parsed first; explicit structured fields override them.

See the main README for Claude Desktop / Cursor configuration.
