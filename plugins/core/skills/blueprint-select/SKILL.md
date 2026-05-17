---
name: blueprint-select
description: Searches all configured skill sources for a single technology and returns the best matching skill.
input:
  tech: single tech name (e.g. "nextjs")
  feedback: optional — reason a previous result was rejected, to guide a better pick
output:
  tech: string
  found: boolean
  source_id: string | null
  source_name: string | null
  skill_name: string | null
  installs: number | null
  url: string | null
---

## What this skill does

Searches one tech across all sources defined in `./resources/urls.json`. Returns the single best matching skill. Does not interact with the user.

## Normalization rules

- Lowercase the tech name before searching
- Strip residuals: `-runtime`, `-lang`, `-js`, `-ts`

## Detection steps

### 1. Read urls.json

Read `./resources/urls.json`. Parse the `sources` array.

### 2. Call the search API — mandatory first action

For each source, take the `search_url` value exactly as written, replace `{tech}` with the normalized tech name, and fetch that URL immediately. Do not browse the website. Do not guess alternative URLs. The API is the only entry point.

For `skills-sh` the call is:

```text
GET https://www.skills.sh/api/search?q={tech}
```

### 3. Pick the best result

From the API response, pick the skill with the highest `installs` count whose name or description best matches the tech. Extract the `source` field (org/repo format, e.g. `wshobson/agents`) and the skill `name` or `id` from the response.

If `feedback` is present, skip the previously returned skill and pick the next best match.

### 4. Not found

If the API returns no results, return `found: false` with all other fields as `null`. Do not attempt to browse the website as a fallback.

## Output format

```json
{
  "tech": "python",
  "found": true,
  "source_id": "skills-sh",
  "source_name": "Skills.sh — Agent Skills Directory",
  "skill_name": "python-testing-patterns",
  "installs": 20254,
  "url": "https://www.skills.sh/wshobson/agents/python-testing-patterns"
}
```

## URL construction

The `url` field MUST be the full direct URL to the specific skill page — never just `https://www.skills.sh` or any other root/generic URL.

Construct it as: `https://www.skills.sh/{source}/{skill_name}` where `source` is the org/repo returned by the API (e.g. `wshobson/agents`) and `skill_name` is the skill identifier.

If the API response does not contain enough information to construct the full URL, fetch `https://www.skills.sh/api/search?q={tech}` again and extract the `source` and `id`/`name` fields from the result.

## Constraints

- Read-only. No writes.
- Do not interact with the user.
- Do not fabricate values — only return data present in the API response.
- NEVER return a root or generic URL like `https://www.skills.sh` as the `url` field — this is always wrong.
