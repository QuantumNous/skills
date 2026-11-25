# newapi-skills

<!-- yarkr:badges:start -->
[![Indexed on Yarkr](https://api.yarkr.com/functions/v1/api/api/v1/badges/repos/QuantumNous/skills/version.svg)](https://yarkr.com/arks/quantumnous/skills)
<!-- yarkr:badges:end -->

Skills for [new-api](https://github.com/QuantumNous/new-api) (open-source AI gateway).

| Skill | What it does |
| ----- | ------------ |
| [`newapi`](#newapi) | Manage your new-api resources — models, groups, tokens and balance |
| [`newapi-plugin-dev`](#newapi-plugin-dev) | Develop, test and publish New API plugins on the [newapi.ai](https://www.newapi.ai) community marketplace |

## newapi

### Installation

Use `npx` to install:

```bash
npx skills add https://github.com/QuantumNous/skills --skill newapi
```

<!-- yarkr:install:start -->
### Install with Yarkr

This repo is indexed on [Yarkr](https://yarkr.com/arks/quantumnous/skills) as the ark [quantumnous/skills](https://yarkr.com/arks/quantumnous/skills), so its skills install into Claude Code, Codex, Cursor and other agent harnesses with one command.

#### CLI

Install the whole ark, which Yarkr keeps equal to this repo:

```bash
npx yarkr-cli sync quantumnous/skills
```

Or add individual skills:

```bash
npx yarkr-cli add skill:quantumnous/skills/newapi
npx yarkr-cli add skill:quantumnous/skills/newapi-plugin-dev
```

No Node.js? `curl -fsSL https://yarkr.com/install.sh | sh` (macOS, Linux) or `irm https://yarkr.com/install.ps1 | iex` (Windows PowerShell) installs `yarkr` as a standalone binary; then type `yarkr` in place of `npx yarkr-cli`.

#### MCP

Connect your agent to the ark over MCP:

```bash
npx yarkr-cli mcp add quantumnous/skills
```

Or point any MCP client at `https://api.yarkr.com/functions/v1/api/mcp/o/quantumnous/skills`.
<!-- yarkr:install:end -->

### Configuration

Set the following three variables before using the skill. **Recommended: export as environment variables** (e.g. in your shell profile):

```bash
export NEWAPI_BASE_URL=https://your-newapi-instance.com
export NEWAPI_ACCESS_TOKEN=your-access-token
export NEWAPI_USER_ID=1
```

Alternatively, you can create a `.env` file in the project root or the skill directory. Make sure `.env` is in your `.gitignore`.

### Usage

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `models` | `/newapi models` | List available models |
| `groups` | `/newapi groups` | List user groups |
| `balance` | `/newapi balance` | Show account balance |
| `tokens` | `/newapi tokens` | List API tokens |
| `create-token` | `/newapi create-token <name> [--group=xxx]` | Create a new API token |
| `switch-group` | `/newapi switch-group <token_id> <group>` | Change a token's group |
| `copy-token` | `/newapi copy-token <token_id>` | Copy real key to clipboard (never shown) |
| `apply-token` | `/newapi apply-token <token_id> <file_path>` | Apply token key to a config file securely |
| `exec-token` | `/newapi exec-token <token_id> <command...>` | Execute a command with the token key securely substituted |
| `scan-config` | `/newapi scan-config <file_path>` | Inspect config structure with best-effort secret redaction |
| `help` | `/newapi help <question>` | Answer questions about newapi |

### Requirements

One of the following JS runtimes (the skill auto-detects):

- [Bun](https://bun.sh) (preferred)
- Node.js >= 18
- Deno

## newapi-plugin-dev

Guides an agent through writing a New API plugin (`plugin.js`), its `README.md` and `CHANGELOG.md`, validating it with `new-api plugin lint` and fixtures, and publishing it from your GitHub repository on the [newapi.ai community marketplace](https://www.newapi.ai/en/community).

### Installation

```bash
npx skills add https://github.com/QuantumNous/skills --skill newapi-plugin-dev
```

### Usage

Describe the plugin you want, for example:

> Use the newapi-plugin-dev skill to build a New API plugin for the Example video API (docs: https://example.com/docs). My GitHub username is alice.

The skill reads the [plugin API spec](https://github.com/QuantumNous/new-api/blob/main/docs/plugin-api/v1.md) and follows it. It needs no configuration; testing uses a [new-api release](https://github.com/QuantumNous/new-api/releases) binary or the `calciumion/new-api` Docker image.

## License

MIT
