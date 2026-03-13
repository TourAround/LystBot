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

## 📚 Documentation

- 📡 **[API Reference](./docs/api/)** - Full endpoint docs with curl examples
- 💻 **[CLI Reference](./docs/cli/)** - Command-line interface docs

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Your Phone  │     │  Your AI    │     │   CLI       │
│  (LystBot)   │     │ (ChatGPT,   │     │  (npx       │
│              │     │  Claude...) │     │   lystbot)  │
└──────┬───────┘     └──────┬──────┘     └──────┬──────┘
       │                    │                    │
       │  X-Device-UUID     │  Bearer Token      │  Bearer Token
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                    ┌───────▼───────┐
                    │   LystBot API  │
                    │   (REST/JSON)  │
                    └───────────────┘
```

---

## 🚀 Getting Started

**As a user:** Download LystBot on [iOS](https://apps.apple.com/app/lystbot) or [Android](https://play.google.com/store/apps/details?id=io.touraround.lystbot) (coming soon)

**As a developer:** Check the [API docs](./docs/api/) and grab your Bearer token

**As an AI agent:** `Authorization: Bearer <your-key>` and you're in

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
