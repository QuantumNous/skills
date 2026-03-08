/**
 * Secure token key injector for config files.
 *
 * Two modes:
 *
 * Scan mode:   inject-key.js --scan <file_path>
 *   Outputs file content with sensitive values redacted so the AI can
 *   understand structure without seeing real keys. Sanitizes:
 *   - sk-xxx token patterns
 *   - Bearer tokens
 *   - Values of fields whose names suggest secrets (password, apiKey, etc.)
 *
 * Inject mode: inject-key.js <token_id> <file_path>
 *   Fetches the real key for token_id, replaces __NEWAPI_TOKEN_{id}__
 *   placeholder in the file with the real key. The key never appears
 *   on stdout or stderr.
 *
 * Exit codes:
 *   0 — success
 *   1 — usage / network / file error
 *   2 — config missing (from env.js)
 */

const fs = require("fs");
const path = require("path");

// --- Scan mode (no API config needed) ---

const SENSITIVE_KEYWORDS = [
  "password", "passwd", "secret", "token", "credential",
  "apikey", "api_key", "api-key", "api_secret",
  "auth", "auth_token", "authorization",
  "private_key", "private-key", "privatekey",
  "access_key", "access-key", "accesskey",
  "client_secret", "client-secret",
];

const SENSITIVE_PATTERN = new RegExp(
  "(" + SENSITIVE_KEYWORDS.join("|") + ")",
  "i"
);

function sanitize(content) {
  // Rule 1: sk- prefixed tokens
  let result = content.replace(/sk-[A-Za-z0-9_\-]{4,}/g, "sk-<REDACTED>");

  // Rule 2: Bearer tokens
  result = result.replace(/Bearer\s+[A-Za-z0-9_.\-\/+=]{4,}/g, "Bearer <REDACTED>");

  // Rule 3: Values of sensitive-named fields (line-by-line)
  result = result
    .split("\n")
    .map((line) => {
      // JSON: "key": "value"  or  "key": "value",
      const jsonMatch = line.match(
        /^(\s*"([^"]+)"\s*:\s*)"([^"]*)"(.*)$/
      );
      if (jsonMatch) {
        const [, prefix, key, , suffix] = jsonMatch;
        if (SENSITIVE_PATTERN.test(key)) {
          return `${prefix}"<REDACTED>"${suffix}`;
        }
        return line;
      }

      // YAML: key: value  (unquoted or quoted)
      const yamlMatch = line.match(
        /^(\s*([\w.\-]+)\s*:\s*)(.+)$/
      );
      if (yamlMatch) {
        const [, prefix, key, value] = yamlMatch;
        if (SENSITIVE_PATTERN.test(key) && value.trim() !== "" && value.trim() !== "|" && value.trim() !== ">") {
          return `${prefix}<REDACTED>`;
        }
        return line;
      }

      // ENV / TOML: KEY=value  or  KEY = "value"
      const envMatch = line.match(
        /^(\s*([\w.\-]+)\s*=\s*)(.+)$/
      );
      if (envMatch) {
        const [, prefix, key] = envMatch;
        if (SENSITIVE_PATTERN.test(key)) {
          return `${prefix}<REDACTED>`;
        }
        return line;
      }

      return line;
    })
    .join("\n");

  return result;
}

if (process.argv[2] === "--scan") {
  const filePath = process.argv[3];
  if (!filePath) {
    console.error("Usage: inject-key.js --scan <file_path>");
    process.exit(1);
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`ERROR: File not found: ${resolved}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolved, "utf-8");
  console.log(sanitize(content));
  process.exit(0);
}

// --- Inject mode ---

const { BASE_URL, ACCESS_TOKEN, USER_ID } = require("./env");

const tokenId = process.argv[2];
const filePath = process.argv[3];

if (!tokenId || !/^\d+$/.test(tokenId) || !filePath) {
  console.error("Usage: inject-key.js <token_id> <file_path>");
  console.error("       inject-key.js --scan <file_path>");
  process.exit(1);
}

const placeholder = `__NEWAPI_TOKEN_${tokenId}__`;

async function main() {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`ERROR: File not found: ${resolved}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolved, "utf-8");

  if (!content.includes(placeholder)) {
    console.error(`ERROR: Placeholder ${placeholder} not found in ${filePath}`);
    process.exit(1);
  }

  const res = await fetch(`${BASE_URL}/api/token/${tokenId}/key`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "New-Api-User": USER_ID,
    },
  });

  if (res.status >= 400) {
    const errText = await res.text();
    let msg = `HTTP ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.message) msg = errJson.message;
    } catch {}
    console.error(`ERROR: ${msg}`);
    process.exit(1);
  }

  const body = await res.json();

  if (!body.success && !body.data) {
    console.error(`ERROR: ${body.message || "Unknown API error"}`);
    process.exit(1);
  }

  const rawKey = body.data?.key;
  if (!rawKey) {
    console.error("ERROR: API response did not contain a key");
    process.exit(1);
  }

  const fullKey = "sk-" + rawKey;
  const updated = content.split(placeholder).join(fullKey);

  fs.writeFileSync(resolved, updated, "utf-8");
  console.log(`已将 Token ${tokenId} 的密钥注入 ${filePath}`);
}

main().catch(() => {
  console.error("ERROR: Unexpected failure");
  process.exit(1);
});
