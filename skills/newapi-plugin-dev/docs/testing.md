# Testing a plugin

## Get the plugin CLI

The `new-api` executable has a `plugin` subcommand (v1.0.0-rc.27 and later; use the latest release so new spec features are understood). Pick one:

- Release binary: download `new-api-<version>` (Linux x86-64), `new-api-arm64-<version>`, `new-api-macos-<version>` or the `.exe` from https://github.com/QuantumNous/new-api/releases/latest, then `chmod +x`.
- Docker: `docker run --rm -v "$PWD:/w" calciumion/new-api:latest plugin lint /w/plugin.js`
- Source checkout of https://github.com/QuantumNous/new-api: `go run . plugin lint /path/to/plugin.js`

## Lint

```bash
new-api plugin lint plugin.js
```

It compiles the plugin with the same registry a gateway uses and prints `plugin <key>@<version> is valid`. It also warns when `parseTaskResult` falls back to `IN_PROGRESS`. Lint does not check `README.md` or `CHANGELOG.md`; review them against `release-files.md`.

## Fixtures

```bash
new-api plugin test plugin.js --fixture fixture.json
```

A fixture replays synchronous hooks with given arguments and compares the results. It sends no network requests.

```json
{
  "cases": [
    {
      "name": "mapped model is sent upstream",
      "hook": "buildSubmitRequest",
      "args": [{
        "model": "public-alias",
        "upstreamModel": "example-video-1",
        "baseUrl": "https://api.example.com",
        "authHeader": "Bearer example-key",
        "requestBody": {"prompt": "A quiet garden"}
      }],
      "expected": {
        "url": "https://api.example.com/jobs",
        "method": "POST",
        "headers": {"Authorization": "Bearer example-key", "Content-Type": "application/json"},
        "body": {"model": "example-video-1", "prompt": "A quiet garden"}
      }
    },
    {
      "name": "reject an empty prompt",
      "hook": "buildSubmitRequest",
      "args": [{"requestBody": {"prompt": " "}}],
      "expectedError": "prompt must be a non-empty string"
    },
    {
      "name": "unknown status is not in progress",
      "hook": "parseTaskResult",
      "args": [{}, {"status": "unexpected"}, {"status": 200, "headers": {}}],
      "expected": {"status": "UNKNOWN"}
    }
  ]
}
```

Cover at least: model mapping, invalid input, the submit reply without a task id, every upstream status including an unknown one, success with outputs, failure with a reason, and usage facts (including explicit zeros). Build the upstream bodies in fixtures from the vendor's documented examples, not from guesses.

Keep fixtures out of the release directory if the user prefers a clean release; the marketplace only reads `plugin.js`, the release files and the optional icon.

## Try it on a gateway

When the user has a New API instance (Root account):

1. Open Task Plugins (`/task-plugins`), choose Upload Plugin, and select the local `plugin.js`. A key and version can hold only one source, so bump `meta.version` (for example `1.0.1-dev.1`) for each new upload while testing.
2. In the installed plugin's details, the Sandbox runs one hook with a JSON array of arguments. It does not send the request descriptor.
3. Add a Task Plugin (type 61) channel bound to the plugin, set model prices for its usage fields, and call the gateway endpoint from the README example. Check the task log and the charged usage.

Never print, log or commit real API keys while testing.
