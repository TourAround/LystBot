# Install LystBot MCP in Cline

## Prerequisites

- Node.js 18 or later, with npm and npx available to Cline.
- The LystBot app and its API key from Settings → AI Agents. No LystBot account, email address or password is required.
- Network access to npm for installation and to `https://lystbot.com/api/v1` for tool calls.

## Log in

Open the LystBot app and copy your API key from **Settings → AI Agents**. The user must supply this key; don't invent one.

Run this as the same operating-system user that runs Cline:

```sh
npx lystbot login
```

Allow npm to install the `lystbot` package if prompted, then enter the key at the CLI's `API Key:` prompt. This stores the key in `~/.lystbot/config.json` and requests the user's lists to check access. No repository build is needed.

## Configure Cline

### Where the settings file lives

- Cline CLI: `~/.cline/data/settings/cline_mcp_settings.json`. If `CLINE_MCP_SETTINGS_PATH` is set, use the file it points to instead.
- VS Code extension: open Cline's MCP Servers panel, select Configure, then Configure MCP Servers to open `cline_mcp_settings.json`.

If the file is missing, create its parent directories and initialize it with `{"mcpServers":{}}`. Read the existing file before editing. Add only the `lystbot` key shown below to `mcpServers`; preserve all existing entries and other settings. Don't replace the whole file with this example:

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

The server runs locally over stdio and reads the saved login. No `env` entry is required. It doesn't read an API key from an environment variable. If you use a custom login file, `LYSTBOT_CONFIG` is supported and must point to that same file in both the login process and the server process.

## Verify

After saving the settings, Cline CLI loads the server only when a new session starts. Ask the user to start a new Cline CLI session, or, in VS Code, check the server list and available tools in the MCP Servers panel. Don't start the server manually from the shell to bypass this step.

Once Cline connects, call the LystBot tool `list_lists` with `{}` through Cline's MCP connection. It returns the accessible lists, or `No lists found.` if there are none. This check doesn't create or change data. A connected server alone doesn't prove that the key works; the tool call must succeed.

## Troubleshooting

- `Not logged in. Run: lystbot login <api-key>`: repeat the login step as Cline's operating-system user. Check that the saved config file is readable and contains the key. If `LYSTBOT_CONFIG` is set, check which file it selects.
- `npx` isn't found: make the Node.js installation available on Cline's process PATH, then reconnect the server.
- An API authentication error: copy the key again from Settings → AI Agents, repeat login, then retry `list_lists`.
- A network or HTTP error: check access to the API URL. `LYSTBOT_API_URL` overrides the URL saved at login; the default is `https://lystbot.com/api/v1`.

Cline's [MCP configuration guide](https://github.com/cline/cline/blob/main/docs/mcp/mcp-overview.mdx) documents the settings screen. The [Marketplace instructions](https://github.com/cline/mcp-marketplace#making-your-mcp-server-one-click-installable) describe how Cline uses this file.
