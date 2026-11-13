---
name: newapi-plugin-dev
description: Develop, test and publish plugins for New API (new-api), the open-source AI gateway. A plugin is one plugin.js file that adapts an async task API (video, image, music generation), relays ordinary API requests on a Task Plugin channel, or processes requests on their way upstream. Use when the user asks to write, update, debug or publish a New API plugin, its plugin.js, README.md or CHANGELOG.md, or to fix a version tag the newapi.ai community marketplace rejected.
---

# SKILL: newapi-plugin-dev

New API plugins extend the [new-api](https://github.com/QuantumNous/new-api) gateway. A plugin is a single `plugin.js` file. The gateway owns HTTP, authentication, task storage, polling and billing; the plugin only transforms data and reports usage facts. Authors publish plugins from their own public GitHub repositories on the community marketplace at https://www.newapi.ai (also https://www.newapi.pro).

## Sources of truth

The plugin contract is still evolving. These files define it and win over this skill when they disagree. Fetch them; do not write from memory.

- Spec: https://raw.githubusercontent.com/QuantumNous/new-api/main/docs/plugin-api/v1.md (long: read the sections listed in `docs/plugin-basics.md` for the parts you build, plus Usage guide, Changelog and Marketplace checks)
- Types: https://raw.githubusercontent.com/QuantumNous/new-api/main/docs/plugin-api/v1.d.ts
- Schema: https://raw.githubusercontent.com/QuantumNous/new-api/main/docs/plugin-api/v1.schema.json
- Developer guide with a complete minimal task plugin: https://docs.newapi.ai/en/docs/plugins/development
- Official plugins to copy patterns from: https://github.com/QuantumNous/new-api-plugins/tree/main/plugins/tasks (each version directory holds `plugin.js` and `CHANGELOG.md`; each plugin directory holds `README.md`)

## Workflow

1. **Gather the facts.** You need the upstream API documentation, the models, the endpoints clients will call on the gateway, which endpoint clients call (the generic `/v1/tasks/<key>`, the vendor's own paths via `meta.routes`, or OpenAI-compatible video, image or Responses endpoints via `meta.protocols`), what one billable unit is (request, second, image, token, credit), and the user's GitHub username. Ask for whatever is missing instead of guessing; never invent upstream fields.
2. **Pick the parts and read the spec.** Follow `${CLAUDE_SKILL_DIR}/docs/plugin-basics.md`.
3. **Write `plugin.js`.** Start from the closest official plugin or the developer guide example.
4. **Write the release files** `README.md` and `CHANGELOG.md` next to `plugin.js`, plus `README.zh-CN.md` and `CHANGELOG.zh-CN.md` when the user wants Chinese. Follow `${CLAUDE_SKILL_DIR}/docs/release-files.md`.
5. **Validate** with `new-api plugin lint` and a fixture. Follow `${CLAUDE_SKILL_DIR}/docs/testing.md`. Fix every error before going on.
6. **Publish** on the community marketplace. Follow `${CLAUDE_SKILL_DIR}/docs/community-marketplace.md`. Commit, tag and push only after the user agrees.
7. **Report** to the user: `meta.key`, `meta.version`, the tag, the repository path to submit, and what a gateway administrator still has to do (channel setup, model prices for the usage fields).

## Rules that are easy to miss

- `plugin.js` is synchronous, self-contained ECMAScript: no `import`, `require`, `async`/`await`, global `fetch`, file system or environment variables. Hooks return request descriptors and the gateway sends them; the synchronous host tools on `utils` (signing, `utils.fetch` for an extra lookup) are listed in the spec under Host utilities. Keep the file under 1 MiB.
- `export const meta = { ... }` must be a plain literal: strings, numbers, booleans, `null`, arrays and objects only. No variables, function calls, spreads, computed keys or template literals, or the marketplace cannot read it.
- `meta.apiVersion` is `1`. A community plugin's `meta.key` is the author's lowercase GitHub username, an underscore, then a name (`alice_myvideo`), using only `a-z`, `0-9`, `_` and `-`, at most 30 characters in total (gateways reject longer keys). The key can never change after the first published version.
- `meta.version` is semver and equals the tag version. A published version never changes: fix a released version by publishing a new one.
- `meta.author.name` is required. Give `meta.name` and `meta.description` in English, plus Chinese when the user wants it; descriptions are short phrases without trailing punctuation and never mention vendor prices.
- Treat hook arguments as read-only and keep no request data in module globals; per-task data goes in the returned task data or `state`.
- `parseTaskResult` maps unknown upstream statuses to `UNKNOWN`, never to `IN_PROGRESS`.
- Report usage facts, never prices or quota. Do not turn missing usage into zero.
- `README.md` has no HTML and no images. `CHANGELOG.md` describes only the version it ships with.
