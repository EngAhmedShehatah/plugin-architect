---
name: blueprint-select
description: Searches all official blueprint sources for a single technology and returns the best matching artifact.
input:
  tech: single tech name (e.g. "nextjs")
  artifact_type: one of — skill | agent | command | hook
  blueprints_url: raw GitHub URL to blueprints.json
  feedback: optional — reason a previous result was rejected, to guide a better pick
output:
  tech: string
  found: boolean
  source_id: string | null
  source_name: string | null
  url: string | null
  raw_url: string | null
---

## What this skill does

Searches one tech across all fetchable blueprint sources. Returns one result. Does not interact with the user.

## Normalization rules

- Lowercase the tech name before searching
- Strip residuals: `-runtime`, `-lang`, `-js`, `-ts`
- Match against file names, folder names, and frontmatter `name` / `description` fields

## Detection steps

### 1. Fetch blueprints.json

Fetch the file at `blueprints_url`. Parse the `sources` array. Skip any source where `raw_base_url` is `null`.

### 2. Apply feedback if provided

If `feedback` is present, it means a previous result was rejected. Use it to skip that result and find a better alternative.

### 3. Search each source

For each fetchable source, try common path conventions:

- `<raw_base_url>/skills/<tech>/SKILL.md`
- `<raw_base_url>/<tech>/SKILL.md`
- `<raw_base_url>/agents/<tech>.md`

Use WebFetch to verify each path. First verified match wins.

### 4. Not found

If no source yields a match, return `found: false` with all URL fields as `null`.

## Output format

```json
{
  "tech": "nextjs",
  "found": true,
  "source_id": "anthropics-claude-plugins-official",
  "source_name": "Anthropic Claude Plugins Official",
  "url": "https://github.com/anthropics/claude-plugins-official/tree/main/skills/nextjs",
  "raw_url": "https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/skills/nextjs/SKILL.md"
}
```

## Constraints

- Read-only. No writes.
- Do not interact with the user.
- Do not fabricate URLs — only return URLs verified via WebFetch.
- skills.sh is not fetchable at runtime — skip it.
