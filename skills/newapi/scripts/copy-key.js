/**
 * Secure token-key-to-clipboard copier for new-api
 * Usage: <runtime> copy-key.js <token_id>
 *
 * Fetches the real key for the given token and copies it directly to the
 * system clipboard. The key NEVER appears on stdout or stderr — it is
 * written exclusively through a child-process pipe to the clipboard
 * utility, so it cannot be captured by the calling LLM context.
 *
 * Exit codes:
 *   0 — success (key copied)
 *   1 — usage / config / network error
 */

const { execSync } = require("child_process");
const { BASE_URL, ACCESS_TOKEN, USER_ID } = require("./env");

// --- Args ---

const tokenId = process.argv[2];
if (!tokenId || !/^\d+$/.test(tokenId)) {
  console.error("Usage: copy-key.js <token_id>  (token_id must be a number)");
  process.exit(1);
}

// --- Clipboard utility detection ---

function detectClipboard() {
  if (process.platform === "darwin") return "pbcopy";
  try {
    execSync("command -v xclip", { stdio: "ignore" });
    return "xclip -selection clipboard";
  } catch {}
  try {
    execSync("command -v xsel", { stdio: "ignore" });
    return "xsel --clipboard --input";
  } catch {}
  return null;
}

// --- Main ---

async function main() {
  const clipCmd = detectClipboard();
  if (!clipCmd) {
    console.error("ERROR: No clipboard utility found (need pbcopy / xclip / xsel)");
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

  try {
    execSync(clipCmd, { input: fullKey, stdio: ["pipe", "ignore", "ignore"] });
  } catch {
    console.error("ERROR: Failed to write to clipboard");
    process.exit(1);
  }

  console.log(`Token ${tokenId} 的密钥已复制到剪贴板。`);
}

main().catch(() => {
  console.error("ERROR: Unexpected failure");
  process.exit(1);
});
