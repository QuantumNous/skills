# Action: `scan-config`

Inspect a config file's structure with best-effort secret redaction. Useful for understanding config layout without exposing secrets, but not guaranteed to catch every sensitive value in every file format.

Usage: `/newapi scan-config <file_path>`

## How it works

```bash
INJECT_SCRIPT="${CLAUDE_SKILL_DIR}/scripts/inject-key.js"
$RUNTIME "$INJECT_SCRIPT" --scan <file_path>
```

Outputs the file content with the following redactions (marked as `<REDACTED>`):

- `sk-xxx` token patterns
- `Bearer` tokens
- Credential-bearing connection strings such as `user:pass@host`
- Values of fields with sensitive names (password, apiKey, secret, token, credential, auth, private_key, access_key, client_secret, etc.)

Supports JSON, YAML, ENV, TOML, and similar key-value formats. Non-sensitive fields are shown as-is.

> **Disclaimer:** `scan-config` provides a best-effort structural view for safer inspection. It is not a formal parser and is not guaranteed to catch every sensitive value in every file format. Treat it as a risk-reduction measure, not an absolute security guarantee.

---

## Action: `apply-token`

Inject a token's real key into any config file securely. The key never enters the AI conversation context.

Usage: `/newapi apply-token <token_id> <file_path>`

## Workflow

**Step 1 — Scan the target file** (MANDATORY if the file already exists):

```bash
INJECT_SCRIPT="${CLAUDE_SKILL_DIR}/scripts/inject-key.js"
$RUNTIME "$INJECT_SCRIPT" --scan <file_path>
```

This outputs the file content with sensitive values redacted — `sk-xxx` tokens, Bearer tokens, credential-bearing connection strings, and values of fields with sensitive names (password, apiKey, secret, token, etc.) are all replaced with `<REDACTED>`. Use this sanitized output to understand the file structure. **NEVER read the target config file directly** — it may contain existing real keys or other secrets.

If the file does not exist yet, skip the scan and create it from scratch.

**Step 2 — Write the placeholder**:

Edit the file and set the API key field to `__NEWAPI_TOKEN_{token_id}__`. For example:

- JSON: `"apiKey": "__NEWAPI_TOKEN_42__"`
- YAML: `apiKey: __NEWAPI_TOKEN_42__`
- ENV:  `OPENAI_API_KEY=__NEWAPI_TOKEN_42__`
- TOML: `api_key = "__NEWAPI_TOKEN_42__"`

Also set the base URL field if needed — use the value from `NEWAPI_BASE_URL` environment variable with `/v1` appended (e.g., `https://api.example.com/v1`). The base URL is NOT a secret and can be written directly.

**Step 3 — Inject the real key**:

```bash
$RUNTIME "$INJECT_SCRIPT" <token_id> <file_path>
```

The script creates a backup next to the target file, writes the updated content to a temporary file in the same directory, and atomically replaces the original file.

On success: `已将 Token {token_id} 的密钥注入 {file_path}（已创建备份: ...）`

On failure: the original file is left in place, and the script returns a clear error message instead of partially overwriting the file.

> **Warning:** The `.bak` file contains the real injected key and is equally sensitive. Do not commit it to version control. After confirming the config works correctly, delete the backup or store it in a secure location.

**Step 4 — Confirm** to the user that the token has been configured.

## Security rules

- **NEVER** read the target file directly with Read/cat/etc. Always use `--scan` mode.
- **NEVER** write any `sk-` value into the file yourself. Only the placeholder is allowed.
- **NEVER** read the file after injection to verify the key — trust the script's success message.
- The placeholder format is strictly `__NEWAPI_TOKEN_{token_id}__` — no variations.
