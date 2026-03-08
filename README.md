# newapi-skills

Skills for managing [new-api](https://www.newapi.ai) resources — models, groups, tokens and balance.

## Installation

Use `npx` to install:

```bash
npx skills add https://github.com/QuantumNous/skills --skill newapi
```

## Configuration

Set the following three variables before using the skill. **Recommended: export as environment variables** (e.g. in your shell profile):

```bash
export NEWAPI_BASE_URL=https://your-newapi-instance.com
export NEWAPI_ACCESS_TOKEN=your-access-token
export NEWAPI_USER_ID=1
```

Alternatively, you can create a `.env` file in the project root or the skill directory. Make sure `.env` is in your `.gitignore`.

## Usage

| Action | Usage | Description |
|--------|-------|-------------|
| `models` | `/newapi models` | List available models |
| `groups` | `/newapi groups` | List user groups |
| `balance` | `/newapi balance` | Show account balance |
| `tokens` | `/newapi tokens` | List API tokens |
| `create-token` | `/newapi create-token <name> [--group=xxx]` | Create a new API token |
| `switch-group` | `/newapi switch-group <token_id> <group>` | Change a token's group |
| `copy-token` | `/newapi copy-token <token_id>` | Copy real key to clipboard (never shown) |
| `apply-token` | `/newapi apply-token <token_id> <file_path>` | Inject token key into a config file securely |
| `scan-config` | `/newapi scan-config <file_path>` | View any config file with secrets redacted |
| `help` | `/newapi help <question>` | Answer questions about newapi |

## Requirements

One of the following JS runtimes (the skill auto-detects):

- [Bun](https://bun.sh) (preferred)
- Node.js >= 18
- Deno

## License

MIT
