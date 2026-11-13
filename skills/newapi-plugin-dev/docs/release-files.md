# Release files: README.md and CHANGELOG.md

Every published version ships `README.md` and `CHANGELOG.md` in the same directory as `plugin.js`, at the commit of its version tag. The marketplace rejects the tag when one is missing or breaks a rule below. The full rules are the spec sections "Usage guide (README)" and "Changelog".

```text
plugin.js
icon.svg              # optional
README.md
README.zh-CN.md       # optional translation
CHANGELOG.md
CHANGELOG.zh-CN.md    # optional translation
```

Both files: UTF-8 without a byte order mark, at most 256 KiB. Link targets are `http:`, `https:`, `mailto:` or relative.

## README.md (usage guide)

Write for the administrator who installs the plugin:

- Channel setup: the channel type to choose, the key format, the default API address and when to change it.
- The models and the gateway endpoints clients call.
- Billing: what each usage field charges for and how its quantity is measured. No vendor prices.
- One request example sent to the gateway (use `sk-...` as the key).
- Limits worth knowing before installing.

Format:

- Optional YAML front matter between `---` lines on the first line; its only keys are `locale` and `translations`.
- `README.md` is English and the fallback (`locale: en` if set). Only it may declare `translations`, mapping a tag other than `en` to a sibling file: `zh-CN: README.zh-CN.md` (at most 10). Every listed file must exist and pass the same checks. A translation may set its own `locale`.
- The body starts with a level-1 heading, usually the plugin name.
- Allowed: headings, paragraphs, lists, block quotes, code blocks, tables, thematic breaks, emphasis, strong, strikethrough, inline code, line breaks, links.
- Not allowed: any raw HTML (comments included), images, footnotes. Link to screenshots instead.

```markdown
---
translations:
  zh-CN: README.zh-CN.md
---
# Example Video

Generates short videos with Example's video models.

## Channel setup

Choose the Task Plugin channel type, bind Example Video, and paste the API key from the Example console.
The default API address is `https://api.example.com`.

## Models and endpoints

| Endpoint | Models |
| --- | --- |
| `POST /v1/video/generations` | `example-video-1` |

## Billing

`seconds` is the requested video duration. Set a price per second for each model.

## Example

    curl https://gateway.example.com/v1/video/generations \
      -H "Authorization: Bearer sk-..." \
      -H "Content-Type: application/json" \
      -d '{"model": "example-video-1", "prompt": "A cat on a windowsill", "seconds": 5}'
```

## CHANGELOG.md (this version only)

```markdown
---
changelogVersion: 1
plugin: "alice_examplevideo"
version: "1.0.0"
locale: "en"
translations:
  zh-CN: CHANGELOG.zh-CN.md
---
# Changelog

## [1.0.0]

### Added

- Generate 5 to 10 second videos with the `example-video-1` model.
```

- Front matter is required, plain YAML, unknown keys are errors: `changelogVersion: 1`, `plugin` = `meta.key`, `version` = `meta.version`, `locale` (`en` for `CHANGELOG.md`), optional `translations` in `CHANGELOG.md` only (sibling `CHANGELOG.<tag>.md`, at most 10).
- Body: exactly one `# Changelog`, then one `## [<version>]` matching the metadata.
- Categories are `###` headings named exactly `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`, `Migration`, in that order; omit empty ones. At least one category other than `Migration` has an entry.
- Each category holds one bullet list. Each entry is one paragraph of inline Markdown: no images, HTML, nested lists, tables, headings, reference-style links or strikethrough.
- A translation repeats plugin, version and categories in the same order with its own `locale`; headings and keys stay in English, only entries are translated.

Writing: natural sentences for users and administrators, one change per entry, leading with what users can do or what behaves differently. An initial release describes what the plugin can do. Add `Migration` only when users must act, with required price changes first (name the models and the new prices or expressions). Leave out test reports and generic upgrade steps.

## Before tagging, check

- `plugin` and `version` in every changelog equal `meta.key` and `meta.version`.
- Every file listed in `translations` exists next to `plugin.js`.
- No `<` HTML tags, `<!-- -->` comments or `![...](...)` images in any README.
- The first body line of each README is a `# ` heading; each changelog has `# Changelog` then `## [<version>]`.
