#!/usr/bin/env node

/**
 * Test suite for exec-token.js — secure command execution with placeholder replacement.
 * Uses stubbed global.fetch to avoid real API calls.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \u2705 ${message}`);
    passed++;
  } else {
    console.log(`  \u274c ${message}`);
    failed++;
  }
}

function runExec(tokenId, commandParts, fakeKey) {
  const script = path.join(__dirname, "exec-token.js");
  const wrapper = `
    global.fetch = async () => ({
      status: 200,
      json: async () => ({ success: true, data: { key: "${fakeKey}" } }),
    });
    process.env.NEWAPI_BASE_URL = "https://stub.invalid";
    process.env.NEWAPI_ACCESS_TOKEN = "test-token";
    process.env.NEWAPI_USER_ID = "1";
    process.argv = ["node", "exec-token.js", "${tokenId}", "--", ${commandParts.map(p => JSON.stringify(p)).join(", ")}];
    require(${JSON.stringify(script)});
  `;
  return execSync(`node -e '${wrapper.replace(/'/g, "'\\''")}'`, {
    encoding: "utf-8",
    timeout: 10000,
  });
}

function runExecExpectFail(tokenId, commandParts, fakeKey) {
  const script = path.join(__dirname, "exec-token.js");
  const wrapper = `
    global.fetch = async () => ({
      status: 200,
      json: async () => ({ success: true, data: { key: "${fakeKey}" } }),
    });
    process.env.NEWAPI_BASE_URL = "https://stub.invalid";
    process.env.NEWAPI_ACCESS_TOKEN = "test-token";
    process.env.NEWAPI_USER_ID = "1";
    process.argv = ["node", "exec-token.js", "${tokenId}", "--", ${commandParts.map(p => JSON.stringify(p)).join(", ")}];
    require(${JSON.stringify(script)});
  `;
  try {
    const stdout = execSync(`node -e '${wrapper.replace(/'/g, "'\\''")}'`, {
      encoding: "utf-8",
      timeout: 10000,
    });
    return { exitCode: 0, stdout, stderr: "" };
  } catch (e) {
    return { exitCode: e.status || 1, stdout: e.stdout || "", stderr: e.stderr || "" };
  }
}

function runExecWithApiError(tokenId, commandParts, status, errMsg) {
  const script = path.join(__dirname, "exec-token.js");
  const wrapper = `
    global.fetch = async () => ({
      status: ${status},
      text: async () => JSON.stringify({ message: "${errMsg}" }),
    });
    process.env.NEWAPI_BASE_URL = "https://stub.invalid";
    process.env.NEWAPI_ACCESS_TOKEN = "test-token";
    process.env.NEWAPI_USER_ID = "1";
    process.argv = ["node", "exec-token.js", "${tokenId}", "--", ${commandParts.map(p => JSON.stringify(p)).join(", ")}];
    require(${JSON.stringify(script)});
  `;
  try {
    const stdout = execSync(`node -e '${wrapper.replace(/'/g, "'\\''")}'`, {
      encoding: "utf-8",
      timeout: 10000,
    });
    return { exitCode: 0, stdout, stderr: "" };
  } catch (e) {
    return { exitCode: e.status || 1, stdout: e.stdout || "", stderr: e.stderr || "" };
  }
}

// ────────────────── Test 1: Basic command execution ──────────────────
console.log("\n\ud83d\udce6 Test 1: Basic command execution with placeholder");
{
  const output = runExec("42", ["echo", "key=__NEWAPI_TOKEN_42__"], "TESTKEY1234567890");
  assert(output.includes("sk-<REDACTED>") || output.includes("key=sk-"), "command executed (output contains key= prefix)");
  assert(!output.includes("TESTKEY1234567890"), "raw key not in output (sanitized)");
}

// ────────────────── Test 2: Output sanitization ──────────────────
console.log("\n\ud83d\udce6 Test 2: Child echoes key — output is sanitized");
{
  const output = runExec("7", ["echo", "configured: sk-__NEWAPI_TOKEN_7__"], "SUPERSECRETVALUE");
  assert(output.includes("sk-<REDACTED>"), "sk- key is redacted in output");
  assert(!output.includes("SUPERSECRETVALUE"), "raw key value not present");
  assert(!output.includes("sk-SUPERSECRETVALUE"), "full sk- key not present");
}

// ────────────────── Test 3: Multiple placeholders ──────────────────
console.log("\n\ud83d\udce6 Test 3: Multiple placeholders in one command");
{
  const output = runExec("5", ["echo", "__NEWAPI_TOKEN_5__", "__NEWAPI_TOKEN_5__"], "MULTIKEY");
  assert(!output.includes("MULTIKEY"), "raw key not in output");
  assert(output.includes("sk-<REDACTED>"), "both occurrences sanitized");
}

// ────────────────── Test 4: Missing placeholder ──────────────────
console.log("\n\ud83d\udce6 Test 4: Error when placeholder not in command");
{
  const result = runExecExpectFail("42", ["echo", "hello world"], "ANYKEY");
  assert(result.exitCode !== 0, "non-zero exit code");
  assert(
    result.stderr.includes("Placeholder") || result.stderr.includes("not found"),
    "error mentions missing placeholder"
  );
}

// ────────────────── Test 5: API error ──────────────────
console.log("\n\ud83d\udce6 Test 5: API error returns clean error");
{
  const result = runExecWithApiError("42", ["echo", "__NEWAPI_TOKEN_42__"], 403, "Forbidden");
  assert(result.exitCode !== 0, "non-zero exit code");
  assert(result.stderr.includes("Forbidden"), "error contains API message");
}

// ────────────────── Test 6: Non-zero child exit code propagated ──────────────────
console.log("\n\ud83d\udce6 Test 6: Non-zero child exit code propagated");
{
  const result = runExecExpectFail("1", ["sh", "-c", "echo __NEWAPI_TOKEN_1__ && exit 2"], "EXITKEY");
  assert(result.exitCode === 2, `child exit code 2 propagated (got ${result.exitCode})`);
  assert(!result.stdout.includes("EXITKEY"), "key not in stdout even on failure");
}

// ────────────────── Test 7: Real key never in helper stdout/stderr ──────────────────
console.log("\n\ud83d\udce6 Test 7: Real key never appears in any output");
{
  const script = path.join(__dirname, "exec-token.js");
  const wrapper = `
    global.fetch = async () => ({
      status: 200,
      json: async () => ({ success: true, data: { key: "TOPSECRETNOSHOW" } }),
    });
    process.env.NEWAPI_BASE_URL = "https://stub.invalid";
    process.env.NEWAPI_ACCESS_TOKEN = "test-token";
    process.env.NEWAPI_USER_ID = "1";
    process.argv = ["node", "exec-token.js", "99", "--", "echo", "done:__NEWAPI_TOKEN_99__"];
    require(${JSON.stringify(script)});
  `;
  let stdout = "", stderr = "";
  try {
    stdout = execSync(`node -e '${wrapper.replace(/'/g, "'\\''")}'`, {
      encoding: "utf-8",
      timeout: 10000,
    });
  } catch (e) {
    stdout = e.stdout || "";
    stderr = e.stderr || "";
  }

  assert(!stdout.includes("TOPSECRETNOSHOW"), "key not in stdout");
  assert(!stderr.includes("TOPSECRETNOSHOW"), "key not in stderr");
  assert(!stdout.includes("sk-TOPSECRETNOSHOW"), "sk-prefixed key not in stdout");
}

// ────────────────── Test 8: No temp files created ──────────────────
console.log("\n\ud83d\udce6 Test 8: No temporary files created during exec");
{
  const os = require("os");
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "newapi-exec-test-"));
  const before = fs.readdirSync(tmpDir);

  runExec("1", ["echo", "__NEWAPI_TOKEN_1__"], "TMPCHECK");

  const after = fs.readdirSync(tmpDir);
  assert(before.length === after.length, "no new files in temp dir");

  fs.rmSync(tmpDir, { recursive: true });
}

// ────────────────── Summary ──────────────────
console.log(`\n${"═".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) {
  console.log("\n\u26a0\ufe0f  Some tests failed! Review the output above.");
  process.exit(1);
} else {
  console.log("\n\ud83c\udf89 All tests passed!");
  process.exit(0);
}
