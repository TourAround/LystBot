# 💻 LystBot CLI

The LystBot CLI manages your lists from the terminal. AI agents use it too.

## Install / run

```bash
npm install -g lystbot
lystbot login <YOUR_API_KEY>
```

You can also skip the install and prefix each command with `npx`, for example `npx lystbot login <YOUR_API_KEY>`. The examples below assume a global install.

Your API key is in the app under Settings → AI Agents.

## Core commands

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

# Attachments
lystbot attach-image "Groceries" "Milk" ./photo.jpg
lystbot attach-url "Groceries" "Milk" "https://example.com" "Recipe"
lystbot attachments "Groceries" "Milk"
lystbot detach <attachment-id>

# Sharing
lystbot share "Groceries"
lystbot join ABC123

# Reminders
lystbot reminders
lystbot reminder <id>
lystbot remind "Take vitamins" --at "tomorrow 09:00" --timezone "Europe/Berlin"
lystbot reminder-update <id> --title "Take supplements"
lystbot reminder-update <id> --at "tomorrow 09:00" --timezone "Europe/Berlin"
lystbot reminder-update <id> --enabled
lystbot reminder-update <id> --disabled
lystbot reminder-delete <id> --yes

# Agent identity
lystbot profile --name "TARS" --emoji "🤖"
```

The CLI parses natural item syntax before sending it. `250g Mehl` becomes text `Mehl` with quantity `1` and unit `250g`. `3x Milch` gets quantity `3`. `2 Flaschen Wein` gets unit `2 Flaschen`. Counts can also be written as `4 x` or the German `4 mal`. Units cover metric weight and volume (`g`, `kg`, `ml`, `l`), `lb`, `lbs`, `oz`, common German and English containers, and `6er Pack`.

`--quantity` takes a whole number from 1 to 99. `--quantity` and `--unit` override the parsed fields and are rejected when you add more than one item. Weight always goes into `unit`, not `quantity`.

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

## Attachments

Items can carry images and links. Image uploads accept JPEG, PNG or WebP up to 5 MiB. The server converts them to JPEG with a maximum long edge of 1600 px and creates thumbnails with a maximum long edge of 300 px. Links must use http/https and be at most 2048 bytes; optional titles may contain up to 255 characters. Links are stored without fetching or unfurling.

```bash
# Upload a local image file
lystbot attach-image "Groceries" "Milk" ./photo.jpg

# Attach a link (optional title)
lystbot attach-url "Groceries" "Milk" "https://example.com/recipe" "Recipe"

# Show all attachments of an item
lystbot attachments "Groceries" "Milk"
lystbot attachments "Groceries" "Milk" --json

# Delete an attachment by its ID
lystbot detach 0f3a1c9e-...
```

Notes:

- `attach-image` reads the file locally first, so a wrong path fails before any API call.
- `attach-url` only accepts `http` and `https` URLs.
- Attachment IDs are printed by `attach-image`, `attach-url`, and `attachments`.

## Reminders

```bash
# List and show
lystbot reminders
lystbot reminders --json
lystbot reminder <id>
lystbot reminder <id> --json

# Create
lystbot remind "Take vitamins" --at "tomorrow 09:00" --timezone "Europe/Berlin"
lystbot remind "Water plants" --at "tomorrow 18:00" --repeat weekly
lystbot remind "Draft report" --at "tomorrow 10:00" --disabled --json

# Update
lystbot reminder-update <id> --title "Take supplements"
lystbot reminder-update <id> --at "tomorrow 09:00" --timezone "Europe/Berlin"
lystbot reminder-update <id> --repeat monthly
lystbot reminder-update <id> --enabled
lystbot reminder-update <id> --disabled --json

# Delete
lystbot reminder-delete <id>
lystbot reminder-delete <id> --yes
lystbot reminder-delete <id> --yes --json
```

Reminder fields:

- `--at <datetime>` is required when you create a reminder.
- `--timezone <tz>` defaults to `Europe/Berlin` on `remind`.
- `--repeat <repeat>` accepts `none`, `daily`, `weekly`, `biweekly`, `monthly` and `yearly`.
- `--disabled` creates a reminder as disabled or disables an existing one.
- `--enabled` turns an existing reminder back on.
- `--json` works on `reminders`, `reminder`, `remind`, `reminder-update` and `reminder-delete`.

`lystbot reminder-delete <id>` asks before deleting. Use `--yes` to skip the question in scripts; without a terminal, the command refuses to delete unless `--yes` is set.

## Options

- `--json` prints JSON on most read commands, for scripting.
- `--api <url>` overrides the API base URL (default `https://lystbot.com/api/v1`).
- `--config <path>` uses a different config file, which helps when several agents share one machine.

The same settings can come from environment variables: `LYSTBOT_API_URL` for the API URL and `LYSTBOT_CONFIG` for the config file path.

## MCP server

Start the MCP server:

```bash
lystbot mcp
```

Attachment tools: `add_item_image` (either `image_path` for a local file, or `image_base64` plus `mime_type` and `filename`), `add_item_url`, `list_item_attachments` and `delete_item_attachment`.

The `add_items` tool accepts a delimited string or structured entries with `text`, an optional whole-number `quantity` (`1..99`) and an optional `unit` (string or `null`). Example: `[{"text":"Mehl","quantity":2,"unit":"500g"}]`. Natural prefixes in `text` are parsed first, and explicit structured fields override them.

See the [main README](../../README.md#-mcp-server) for the Claude Desktop and Cursor setup.
