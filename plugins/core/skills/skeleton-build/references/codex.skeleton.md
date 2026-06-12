# Codex Plugin Skeleton Reference

## What Codex expects

Codex discovers a plugin via `.codex-plugin/plugin.json` at the project root. The `skills` field in the manifest points to a directory of skill folders. Each skill folder becomes invocable as `@<skill-name>` inside Codex.

## Primary folder structure

```text
.codex-plugin/
└── plugin.json
skills/
├── build-plugin/
│   └── SKILL.md
├── skill-create/
│   └── SKILL.md
└── plugin-validate/
    └── SKILL.md
```

## Manifest location

`.codex-plugin/plugin.json` — required, must be at the project root.

## Manifest fields

| field | required | description |
|---|---|---|
| `name` | yes | plugin identifier, kebab-case |
| `version` | yes | semver string |
| `description` | yes | short description |
| `skills` | yes | relative path to the skills directory (from project root) |
| `author` | no | object with `name` and `url` |
| `license` | no | SPDX license identifier |
| `interface` | no | UI metadata for Codex marketplace display |

## interface sub-fields (all optional)

| field | description |
|---|---|
| `displayName` | human-readable plugin name |
| `shortDescription` | one-line description for UI |
| `longDescription` | full description for marketplace |
| `developerName` | author display name |
| `category` | marketplace category (e.g. "Productivity") |
| `capabilities` | array of capability tags (e.g. `["Write"]`) |
| `websiteURL` | project homepage |
| `defaultPrompt` | array of strings injected into session context on load |

## Skill folder rules

Each subfolder inside the `skills` directory is one skill:

- Folder name becomes the `@<skill-name>` invocation handle
- Must contain `SKILL.md` as the skill definition file
- No nested skill folders — one level only
- No index or manifest file inside each skill folder; `SKILL.md` is sufficient

## Skills directory path

The `skills` value in `plugin.json` is relative to the **project root** (the parent of `.codex-plugin/`). Use `"./skills/"` if the skills folder is at the project root, or a relative path like `"./plugins/core/skills/"` if skills are nested.

## Key Rules

- `.codex-plugin/plugin.json` must be valid JSON — invalid JSON silently prevents Codex from loading the plugin
- The `skills` path must resolve to an existing directory at install time
- `defaultPrompt` strings are injected verbatim into Codex's session context — keep them concise and directive
- Skills are invoked as `@<folder-name>` — folder names must be valid identifiers (no spaces, no dots)
- Do not include `AGENTS.md` or `GEMINI.md` in this skeleton — they belong to other platforms
