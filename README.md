<p align="center">
  <img src="./assets/lystbot-logo-with-icon.png" alt="LystBot" width="320" />
</p>

<h3 align="center">Smart lists that your AI can actually use.</h3>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://www.npmjs.com/package/lystbot"><img src="https://img.shields.io/npm/v/lystbot.svg" alt="npm" /></a>
  <a href="https://lystbot.com/api/v1/health"><img src="https://img.shields.io/badge/API-online-brightgreen.svg" alt="API Status" /></a>
</p>

<p align="center">
  <strong>LystBot is not another AI list app.</strong> There's no built-in AI. No chatbot. No "AI-powered suggestions."<br />
  Instead, LystBot gives <em>your</em> AI - ChatGPT, Claude, OpenClaw, or any agent you already use - a direct line to your lists.<br />
  <strong>Your AI controls this app. The app is the window to the real world.</strong>
</p>

---

## ⚡ Quick Start

```bash
npx lystbot login YOUR_API_KEY
lystbot add "Groceries" "Oat milk, Bananas, Coffee"
```

Get your API key from the LystBot app (Settings → AI Agents). That's it. Your AI agent can now manage your lists, and changes sync to your phone instantly.

---

## 🧠 How It Works

Most "AI list apps" shove a chatbot inside the app. LystBot does the opposite: **your AI lives where it already lives** (ChatGPT, Claude, your own agent), and LystBot is the app it controls.

```
You → talk to your AI → AI calls LystBot API → your phone updates instantly
```

No new AI to learn. No prompts inside the app. Just connect your existing AI and it can manage your groceries, packing lists, todos - anything.

**Why this matters:**

- 🤖 **"Add eggs to my shopping list" actually works** - from ChatGPT, Claude, or any AI you use
- 📱 **Your phone is the display** - your AI writes, you see it instantly on your phone
- 🔑 **Clean separation** - the app is for humans, the API is for agents
- 🔄 **Real-time sync** - your AI adds milk, your partner sees it immediately

> *"The best list app is the one your AI opens for you."*

---

## ✨ Features

🗒️ **Smart Lists** - Create, organize, and share lists with anyone

🤝 **Real-time Sharing** - Invite others via share codes, collaborate live

📱 **Cross-Platform** - iOS and Android (Flutter), with CLI and API access

⭐ **Favorites** - Quick-access items you use all the time (reusable templates)

🔔 **Push Notifications** - Get notified when your AI or your family changes a list

🌐 **Open API** - Full REST API so any AI agent can read, write, and manage your lists

<p align="center">
  <img src="./assets/app-screenshot-dashboard.png" alt="Dashboard" width="220" />
  &nbsp;&nbsp;
  <img src="./assets/app-screnshot-list-detail.png" alt="List Detail" width="220" />
  &nbsp;&nbsp;
  <img src="./assets/app-screenshot-push-notification.png" alt="Push Notifications" width="220" />
</p>

---

## 🔌 MCP Server

LystBot includes a built-in MCP (Model Context Protocol) server. Works with **Claude Desktop**, **Cursor**, **Windsurf**, **Cline**, and any MCP-compatible client.

### Setup

1. Install the LystBot app ([iOS](https://apps.apple.com/app/lystbot) / Android)
2. Copy your API key from Settings → AI Agents
3. Authenticate the CLI:
   ```bash
   npx lystbot login <YOUR_API_KEY>
   ```
4. Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
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
5. Restart Claude Desktop. Done.

### Available Tools

| Tool | Description |
|------|-------------|
| `list_lists` | Get all your lists |
| `get_list` | Get a specific list with items |
| `create_list` | Create a new list |
| `delete_list` | Delete a list |
| `add_items` | Add one or more items to a list |
| `check_item` | Check off an item |
| `uncheck_item` | Uncheck an item |
| `remove_item` | Remove an item from a list |
| `share_list` | Generate a share code for a list |
| `join_list` | Join a shared list via code |

> Works the same way in Cursor, Windsurf, and Cline. Just add the config to your editor's MCP settings.

---

## 📚 Documentation

- 📡 **[API Reference](./docs/api/)** - Full endpoint docs with curl examples
- 💻 **[CLI Reference](./docs/cli/)** - Command-line interface docs
- 🔌 **MCP Server** - Run `npx lystbot mcp` (see setup above)

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Your Phone  │     │  Your AI    │     │  MCP Client  │     │   CLI       │
│  (LystBot)   │     │ (ChatGPT,   │     │ (Claude,     │     │  (npx       │
│              │     │  any agent) │     │  Cursor...)  │     │   lystbot)  │
└──────┬───────┘     └──────┬──────┘     └──────┬───────┘     └──────┬──────┘
       │                    │                    │                    │
       │  X-Device-UUID     │  Bearer Token      │  MCP Protocol     │  Bearer Token
       │                    │                    │                    │
       └────────────────────┼────────────────────┼────────────────────┘
                            │                    │
                    ┌───────▼────────────────────▼┐
                    │        LystBot API           │
                    │     (REST/JSON + MCP)         │
                    └──────────────────────────────┘
```

---

## 🚀 Getting Started

### 1. Download the App

<p align="center">
  <a href="https://apps.apple.com/app/lystbot/id6742044832"><img src="https://img.shields.io/badge/App_Store-Download-blue?logo=apple&logoColor=white&style=for-the-badge" alt="App Store" /></a>
  &nbsp;&nbsp;
  <a href="https://play.google.com/store/apps/details?id=io.touraround.lystbot"><img src="https://img.shields.io/badge/Google_Play-Download-green?logo=googleplay&logoColor=white&style=for-the-badge" alt="Google Play" /></a>
</p>

Create your account, set up your first list, and you're ready.

### 2. Connect Your AI Agent

Point your AI to the agent setup page - it has everything your agent needs to get started:

👉 **[lystbot.com/agents](https://lystbot.com/agents)**

Pick the integration that fits your setup:

| Method | Best for | Setup time |
|--------|----------|------------|
| **MCP Server** | Claude Desktop, Cursor, Windsurf, Cline | 2 min |
| **CLI** | Terminal power users, scripts, automation | 1 min |
| **REST API** | ChatGPT Actions, custom agents, Home Assistant | 5 min |

### 3. Done

```bash
# Example: your agent adds items via CLI
npx lystbot login YOUR_API_KEY
lystbot add "Groceries" "Oat milk, Bananas, Coffee"
```

Your agent writes to the list. Your phone updates instantly. That's the whole idea.

---

## 🤝 Contributing

We'd love your help! Whether it's:

- 🐛 Bug reports and feature requests via [Issues](https://github.com/TourAround/LystBot/issues)
- 🔧 CLI improvements and new commands
- 📖 Documentation fixes

Fork it, branch it, PR it. Keep it clean, keep it tested.

---

## 📄 License

MIT - see [LICENSE](./LICENSE) for details.

Built with ❤️ by [TourAround UG](https://lystbot.com)
