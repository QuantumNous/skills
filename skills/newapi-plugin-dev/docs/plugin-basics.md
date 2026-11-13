# Plugin basics: parts, spec sections, manifest

## Choose the parts

A plugin has one or more parts. The gateway detects them from what `plugin.js` exports; the marketplace rejects a file with none (`no_parts`).

| Part | Pick it when | Detected by |
| --- | --- | --- |
| Task | The upstream runs jobs: submit, then poll until done (video, image, music, 3D). Also synchronous image APIs that answer at once. | `export function buildSubmitRequest` |
| Provider | Ordinary API requests (chat, responses, messages, embeddings) should reach a vendor through a "Task Plugin" (type 61) channel, optionally with converters or credentials the plugin manages. | a non-empty `meta.relay` |
| Request processing | Requests on any channel should be checked or changed on their way upstream or back (redaction, moderation, parameter rewrites, reports). | exporting `ingress`, `request`, `outbound`, `egress`, `reply` or `report` |

Most marketplace plugins are task plugins. A plugin without a task part must not declare task fields (`routes`, `protocols`, `fetchMode`, `usageSchema`, `usageExamples`, `usageProfiles`, `auth`, `channelTypes`, `upstreams`).

## Read these spec sections

Spec: https://raw.githubusercontent.com/QuantumNous/new-api/main/docs/plugin-api/v1.md. Signatures are in `v1.d.ts`, machine-readable shapes in `v1.schema.json`, and the lifecycle overview in https://raw.githubusercontent.com/QuantumNous/new-api/main/docs/plugin-api/README.md.

- Every plugin: Manifest, LocalizedText with "Description writing and translation conventions", Host utilities and capabilities, Hook arguments and results, Error contract, Usage guide (README), Changelog, Marketplace checks.
- Task part: Usage profiles by model, Request body, Request building, Persisted data and driver hooks, Polling contract, Immediate completion and submission streams. Add Native surface, Host protocols and Protocol names when clients should call vendor-style paths or OpenAI-compatible image, video or Responses endpoints.
- Provider part: Provider part with Relay routes, Channel config, Credentials, Request hooks, Converters, Streams and Balance as needed.
- Request processing part: Request processing part with Instances and order, Stages, Context and request, Results, Effects, Failures, and Reply check or Report when used.
- Host-specific members: when the plugin reads channels, user groups or other new-api-only data.

## Manifest checklist

```js
export const meta = {
  apiVersion: 1,
  key: "alice_examplevideo",          // <lowercase GitHub username>_<name>
  name: "Example Video",
  version: "1.0.0",                    // equals the release tag version
  author: {name: "Alice", url: "https://github.com/alice"},
  description: {en: "Video generation via the Example API", zh: "通过 Example 接口生成视频"},
  models: ["example-video-1"],
  fetchMode: "per_task",               // or "batch"
  baseUrl: "https://api.example.com",  // default channel Base URL
  usageSchema: {
    seconds: {type: "number", unit: "second", description: {en: "Video generation unit price", zh: "视频生成单价"}},
  },
  usageExamples: [{label: "5-second video", facts: {seconds: 5}}],
};
```

- `key` is at most 30 characters; `author.name` is required.
- Write `meta` as a plain literal; the marketplace reads it without running the code. No variables, function calls, spreads, computed keys or template literals inside it.
- `allowedHosts` lists extra hosts that may receive the channel credentials. Add only hosts that really need them.
- `icon` takes a LobeHub icon name (`Sora.Color`) or `text`. For a custom logo put `icon.svg` or `icon.png` (at most 512 KiB, no scripts or remote references) next to `plugin.js`; never inline image data.
- Usage fields describe quantities (`second`, `count`, `token`, `credit`, booleans, enums). Prices are set by each gateway administrator with billing expressions such as `u("seconds")`, so field keys are part of your compatibility promise: renaming one later needs a `Migration` note.

## Task part essentials

- `buildSubmitRequest(ctx)` validates `ctx.requestBody` and returns `{url, method, headers, body}`. Build URLs from `ctx.baseUrl`, send `ctx.upstreamModel || ctx.model`, and put `ctx.authHeader` (or the auth the vendor needs) in the headers.
- `parseSubmitResponse(ctx, response)` returns `{taskId, taskData}` from the upstream reply (or a terminal `immediate` result for synchronous APIs). Throw a clear `Error` when the reply has no task id.
- `buildQueryRequest(ctx)` uses `ctx.taskId` (the upstream id). `parseTaskResult(ctx, body, response)` maps upstream statuses to `NOT_START`, `SUBMITTED`, `QUEUED`, `IN_PROGRESS`, `SUCCESS`, `FAILURE` or `UNKNOWN`; anything unrecognized is `UNKNOWN`.
- `extractUsage` and the `extractUsageOnSubmit` / `extractUsageOnComplete` variants return usage facts with the keys of `usageSchema`. Keep explicit zeros; never fake missing usage.
- Data needed across polls goes in `taskData` or `state`, never in module variables.
- Expose outputs with `listArtifacts` and `buildContentRequest` together when clients download results through the gateway.
