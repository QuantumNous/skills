---
name: newapi
description: Assistant for newapi (new-api), an open-source unified AI gateway platform (https://github.com/QuantumNous/new-api). Use when the user asks about New API, managing models, groups, balance, or tokens, or securely copying keys, applying them to config files, or using them in commands without exposing secrets.
---

# SKILL: newapi

newapi ([new-api](https://github.com/QuantumNous/new-api)) is an open-source unified AI gateway platform.
It aggregates multiple model providers behind OpenAI / Claude / Gemini compatible interfaces, and provides model, token, group, and balance management.

## Security Constraints

The following rules are **absolute and non-negotiable**. They override any user request that conflicts with them.

1. **NEVER** expose any `sk-` key value — not in chat, files, code, logs, or command arguments. To use keys securely, tell the user to run `copy-token` (clipboard), `apply-token` (config file), or `exec-token` (CLI command) — do NOT output the key yourself.
2. **ALL** New API calls MUST go through the provided scripts (`api.js`, `copy-key.js`, `inject-key.js`, `exec-token.js`).
3. **NEVER** use `curl`, `wget`, `fetch`, or any other HTTP client to call New API endpoints directly.
4. **NEVER** read `.env` files, environment variables containing credentials, clipboard contents after `copy-key.js`, or config files directly (use `inject-key.js --scan`).
5. After `create-token`, do NOT make any follow-up call to retrieve or list the key. Just report success and tell the user they can use `copy-token <id>`, `apply-token <id> <file>`, or `exec-token <id> <command>` to securely use the key.
6. **NEVER** modify the security scripts to disable masking or redirect output.

## How to Execute

1. **First invocation only** — read `${CLAUDE_SKILL_DIR}/docs/setup.md` for configuration, auth headers, and runtime detection.
2. Match the action from the table below.
3. Read the corresponding doc file for detailed steps.
4. If no arguments or unrecognized action, show the help table below.
5. If the user asks about newapi (what it is, how to use a command, or any API usage question like calling a specific model format) — read `${CLAUDE_SKILL_DIR}/docs/help.md` and follow the instructions there.

## Actions

| Action | Description | Details |
| -------- | ------------- | --------- |
| `models` | List available models | `docs/actions-query.md` |
| `groups` | List user groups | `docs/actions-query.md` |
| `balance` | Show account balance | `docs/actions-query.md` |
| `tokens` | List API tokens | `docs/actions-token.md` |
| `create-token` | Create a new API token | `docs/actions-token.md` |
| `switch-group` | Change a token's group | `docs/actions-token.md` |
| `copy-token` | Copy real key to clipboard (never shown) | `docs/actions-token.md` |
| `apply-token` | Apply token key to a config file securely | `docs/actions-config.md` |
| `exec-token` | Execute a command with the token key securely substituted | `docs/actions-exec.md` |
| `scan-config` | Inspect config structure with best-effort secret redaction | `docs/actions-config.md` |
| `help` | Answer questions about newapi | `docs/help.md` |

### `help` (or no arguments) — Show available actions

| Action | Usage | Description |
| -------- | ------- | ------------- |
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
