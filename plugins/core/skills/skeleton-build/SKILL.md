---
name: skeleton-build
description: Builds a platform-specific plugin skeleton from the checked-in official skeleton reference for that platform.
input:
  platform: one of "claude-code" or "github-copilot" — determines which skeleton to build
  user_name: author name for plugin.json
  user_email: author email for plugin.json
  surfaces: comma-separated list of surfaces to include (optional — defaults to all surfaces for the platform)
output:
  folder_structure: the full skeleton tree
  files: map of file paths to their content
---

## What this skill does

Reads the checked-in skeleton reference for the requested platform, parses the official skeleton structure recorded there, and produces a ready-to-use single-platform plugin skeleton folder with all required files and their content.

The skeleton reference files were created from official docs during plugin-architect implementation. Runtime execution must not call Context7.

## How to execute this skill

### Step 1: Select the platform reference

Choose the reference file from `platform`:

| platform | reference file | default surfaces |
|---|---|---|
| `claude-code` | `./claude-code.skeleton.md` | `cli`, `desktop`, `vscode-extension` |
| `github-copilot` | `./github-copilot.skeleton.md` | `cli`, `vscode-extension` |

If `platform` is not one of the supported values, stop and report:

```text
[BLOCKER] Unsupported platform: {platform}.
Supported platforms: claude-code, github-copilot.
```

### Step 2: Read the reference file

Read the selected reference file from the same folder as this `SKILL.md`.

If the selected file is missing or unreadable, stop and report:

```text
[BLOCKER] Missing skeleton reference: {reference_file}.
Cannot build {platform} skeleton without the checked-in reference file.
```

Do not call Context7 at runtime. Do not use memory or guessed structure if the reference file is missing.

### Step 3: Determine surfaces

Use the platform default surfaces unless the optional `surfaces` input is provided.

When `surfaces` is provided:

1. Split the comma-separated value
2. Trim whitespace
3. Validate each surface against the platform's default surface list
4. Stop if any surface is unsupported

Unsupported surface report:

```text
[BLOCKER] Unsupported surface for {platform}: {surface}.
Supported surfaces: {supported_surfaces}.
```

### Step 4: Parse the reference

From the selected reference file, extract:

- The primary folder structure code block
- Required manifest location
- Supported plugin directories
- Manifest fields and supported path fields
- Platform-specific rules under `Key Rules`

Use only content from the reference file. Do not add directories, files, manifest fields, or platform behavior that are not present in the reference.

### Step 5: Build the skeleton

Construct the generated skeleton from the parsed reference.

For `claude-code`, preserve the marketplace wrapper plus the nested plugin root. The nested plugin keeps the documented `.claude-plugin/plugin.json` manifest location and root-level plugin component folders under `marketplace/plugins/core/`.

For `github-copilot`, preserve the documented root-level `plugin.json`, `AGENTS.md`, and Copilot customization paths.

Generate the minimal useful skeleton for the selected platform and surfaces:

- `plugin.json` files: use only fields documented in the selected reference
- Author identity: use `user_name` and `user_email`
- Empty directories: add `.gitkeep` entries when needed
- `README.md`: include a minimal title and install/use placeholder text
- `AGENTS.md`: only for platforms whose reference documents it

### Step 6: Return the skeleton

Return the complete skeleton as a JSON object:

```json
{
  "platform": "claude-code",
  "surfaces": ["cli", "desktop", "vscode-extension"],
  "folder_structure": "marketplace/\n├── ...",
  "files": {
    "marketplace/.claude-plugin/plugin.json": "{...}",
    "marketplace/README.md": "# ..."
  },
  "reference_file": "./claude-code.skeleton.md"
}
```

## Output format

Always return a JSON object with:

- `platform`: the platform this skeleton was built for
- `surfaces`: list of surfaces included
- `folder_structure`: ASCII tree of the generated skeleton
- `files`: map of relative file paths to file contents
- `reference_file`: local skeleton reference file used

## Constraints

- **Never call Context7 at runtime** — the checked-in reference file is the source of truth
- **Never guess or fabricate** platform docs — only use the selected skeleton reference file
- **Single-platform output** — this skill generates one platform skeleton per invocation
- **Keep plugin.json minimal** — only include fields the platform supports
- **Use `user_name` and `user_email`** for author fields, never hardcoded values
