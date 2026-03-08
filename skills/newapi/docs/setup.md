## Setup

### Configuration

Configuration is loaded in the following priority order (higher overrides lower):

1. **Environment variables** (highest priority)
2. **Skill directory `.env`** (next to SKILL.md)
3. **Project root `.env`** — project-level config

Required variables:

```
NEWAPI_BASE_URL=https://api.example.com
NEWAPI_ACCESS_TOKEN=your-32-char-access-token
NEWAPI_USER_ID=1
```

Make sure `.env` is in `.gitignore` to avoid leaking credentials.

### Authentication

Every API request uses Access Token auth with these headers:

```
Authorization: Bearer <NEWAPI_ACCESS_TOKEN>
New-Api-User: <NEWAPI_USER_ID>
```

### Runtime Detection

The API script is at `${CLAUDE_SKILL_DIR}/scripts/api.js` (plain JS, zero dependencies, native `fetch` + `JSON`). Before first use, detect the available JS runtime and reuse it for the session:

```bash
API_SCRIPT="${CLAUDE_SKILL_DIR}/scripts/api.js"

# Detect runtime (prefer bun > node > deno)
if command -v bun &>/dev/null; then RUNTIME="bun"; \
elif command -v node &>/dev/null; then RUNTIME="node"; \
elif command -v deno &>/dev/null; then RUNTIME="deno run --allow-net --allow-read --allow-env"; \
else echo "ERROR: No JS runtime found (need bun, node, or deno)" >&2; exit 1; fi
```

Then call the API script as:

```bash
$RUNTIME "$API_SCRIPT" <METHOD> <PATH> [JSON_BODY]
```

### Error Handling

- If the API returns a non-success response, display the error message clearly
- If authentication fails (401/403), suggest checking the environment variables
- If a resource is not found (404), say so clearly
