---
name: plugin-validate
description: Validates a generated plugin folder against validator.config.json rules — line limits, naming conventions, and skill-agent pairing.
input:
  plugin_path: absolute path to the generated plugin root folder
  config_path: absolute path to validator.config.json (defaults to plugins/core/scripts/validators/validator.config.json)
output:
  passed: boolean
  violations: array of objects — each with { file, rule, message, severity }
  summary: string — human-readable pass/fail summary
---

## What this skill does

Reads every artifact inside `plugin_path` and checks it against the rules defined in `validator.config.json`. Returns a structured report of all violations.

## Validation rules

### Rule 1 — Line limit (`max-lines`)
Every `.md` file inside `plugin_path` must not exceed the `max_lines` value in config (default: 150).

Count non-empty lines. If over limit → `severity: error`.

### Rule 2 — Skill naming (`skill-naming`)
Every skill folder under `<plugin_path>/skills/` must:
- Have a name in `kebab-case`
- Contain a `SKILL.md` file at its root
- Have a `name` field in `SKILL.md` frontmatter that matches the folder name exactly

Violations → `severity: error`

### Rule 3 — Agent naming (`agent-naming`)
Every agent file under `<plugin_path>/agents/` must:
- Be named in `kebab-case` with `.md` extension
- Contain a YAML frontmatter block with a `name` field
- Have the `name` value match the filename (without `.md`)

Violations → `severity: error`

### Rule 4 — Skill-agent pairing (`skill-agent-pairing`)
For each skill in `<plugin_path>/skills/`, there must be a corresponding agent file at `<plugin_path>/agents/<skill-name>.md` OR an agent that lists the skill name in its `skills` property.

If no agent references the skill → `severity: warning`.

### Rule 5 — Frontmatter presence (`frontmatter-required`)
Every `.md` file under `skills/` and `agents/` must contain a valid YAML frontmatter block (delimited by `---`).

Missing or malformed frontmatter → `severity: error`.

### Rule 6 — No generic descriptions (`no-generic-descriptions`)
Skill and agent `description` fields must not contain vague, filler language. The following are common examples of phrases to flag — use your judgment to catch similar patterns:
- "this skill", "this agent"
- "handles", "manages"
- "a tool that", "used to"

If a description reads as generic boilerplate rather than a specific, codebase-focused statement → `severity: warning`.

### Rule 7 — Command file presence (`command-file`)
If `plugin.json` declares entries in `commands`, each referenced file must exist on disk.

Missing file → `severity: error`.

### Rule 8 — Hook config validity (`hook-config`)
If `plugin.json` references a hooks config file, that file must exist and be valid JSON.

Invalid or missing → `severity: error`.

## Severity levels
- `error` — must be fixed before the plugin can be used
- `warning` — should be reviewed but does not block usage

## Output format

```json
{
  "passed": false,
  "violations": [
    {
      "file": "skills/auth-scanner/SKILL.md",
      "rule": "max-lines",
      "message": "File has 163 lines, exceeds limit of 150.",
      "severity": "error"
    },
    {
      "file": "agents/auth-scanner.md",
      "rule": "no-generic-descriptions",
      "message": "Description contains generic language: 'used to'.",
      "severity": "warning"
    }
  ],
  "summary": "2 violations found (1 error, 1 warning). Plugin did not pass validation."
}
```

`passed` is `true` only when there are zero `error`-severity violations.

## Constraints

- Read-only. No writes, no deletes.
- Must complete even if some files are missing — report missing files as violations, continue checking the rest.
- Do not execute any scripts inside the plugin folder.
