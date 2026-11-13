# Publishing on the newapi.ai community marketplace

The community marketplace at https://www.newapi.ai (same catalog on https://www.newapi.pro) reads plugins from the release tags of the author's public GitHub repositories. Gateways install them from there.

## Requirements

- A community account with a linked GitHub account and a verified email: https://www.newapi.ai/en/community (Chinese: https://www.newapi.pro/zh/community).
- A public repository owned by that GitHub account (organization repositories are not accepted yet).
- `meta.key` starts with the lowercase GitHub username and `_`, for example `alice_examplevideo`, and is at most 30 characters. The key is fixed after the first published version.

## Layout and tags

- `plugin.js` at the repository root: submit `owner/repo`, tag versions `v1.2.0` or `1.2.0`.
- `plugin.js` in a subdirectory `path`: submit `owner/repo/path`, tag versions `path/v1.2.0` or `path/1.2.0`. One repository can hold several plugins this way.
- The tag version must equal `meta.version`. A GitHub release creates its tag, so publishing a release works too.
- `README.md` and `CHANGELOG.md` sit next to `plugin.js` at the tagged commit (see `release-files.md`).

## First submission

1. Commit `plugin.js`, the release files and the optional icon.
2. With the user's approval, create the version tag on that commit and push the branch and the tag.
3. The user (or you, if you can drive their browser session) opens the community account page, enters the repository path in "Submit plugin" and submits.
4. The plugin page shows each tag: published, or rejected with the reason and, for README/CHANGELOG problems, the file, line and rule.

## New versions

Bump `meta.version`, replace `CHANGELOG.md` (and translations) with the notes for the new version, update the README when setup, models, endpoints or billing changed, commit, tag and push. The site checks for new tags about once an hour; the author can also trigger a check from the plugin page.

## Rejected tags

| Reason | Fix |
| --- | --- |
| `not_found` | `plugin.js` is not at the tagged commit under the submitted path. |
| `too_large`, `not_utf8`, `bom` | Save `plugin.js` as UTF-8 without BOM and keep it small. |
| `meta_unreadable` | Write `export const meta = {...}` as a plain literal (no variables, calls, spreads or template literals). |
| `api_version` | Set `meta.apiVersion` to `1`. |
| `version_mismatch` | Make `meta.version` equal the tag version. |
| `key_invalid`, `key_prefix` | Use `<lowercase GitHub username>_<name>` with `a-z`, `0-9`, `_`, `-`. Keep it within 30 characters: the marketplace accepts up to 64, but gateways reject keys over 30. |
| `key_reserved`, `key_taken` | Pick another name after the prefix (only before the first published version). |
| `key_changed` | Restore the key the plugin was first published with. |
| `allowed_hosts_invalid`, `base_url_invalid`, `auth_invalid`, `icon_invalid` | Fix that `meta` field per the spec's Manifest section. |
| `no_parts` | Export a task, provider or request processing hook (see `plugin-basics.md`). |
| `readme_missing`, `readme_invalid`, `changelog_missing`, `changelog_invalid` | Fix the file at the reported line (see `release-files.md`). |
| `content_changed` | A published version cannot change. Publish a new version instead of moving its tag. |
| `fetch_failed` | Temporary GitHub error; the site retries. |

To fix a rejected version, publish a new tag, or move the rejected tag to the corrected commit. Moving a tag that was already accepted does not change the published version.
