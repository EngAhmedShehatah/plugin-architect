# GitHub Copilot — Skeleton Reference

Source: Context7 — `/websites/code_visualstudio_copilot` (official docs)
Surfaces: CLI, VS Code Extension

## Project Structure with Copilot Customizations

The official Copilot customization layout inside a project:

```text
your-project/
  .github/
    copilot-instructions.md          # Project-wide coding standards
    instructions/
      react.instructions.md          # React-specific conventions
    prompts/
      create-component.prompt.md     # Reusable component scaffolding
    skills/
      update-readme/
        SKILL.md                     # README updater workflow
```

## Skill-Only Skeleton for plugin-architect

For plugin-architect's current Copilot target, generate a single-platform, skill-only skeleton. Do not include Claude Code command or marketplace concepts.

```text
<output-root>/
├── plugin.json
├── AGENTS.md
├── .github/
│   ├── copilot-instructions.md
│   ├── instructions/
│   ├── prompts/
│   └── skills/
│       └── <skill-name>/
│           └── SKILL.md
├── .mcp.json
├── README.md
└── LICENSE
```

## Copilot Skill Format

Copilot skills are folders that contain a `SKILL.md` file.

```markdown
---
name: update-readme
description: Update the project README to reflect recent code changes. Whenever code changes are made, this skill reviews the changes and updates the README with new features, usage instructions, and API references.
---
# Update README

When updating the README:
1. Review recent code changes to identify new or modified features
2. Update the relevant sections (installation, usage, API reference)
3. Add entries for new configuration options or environment variables
4. Remove documentation for deleted or deprecated features
5. Keep the existing tone, structure, and formatting conventions
```

## plugin.json Schema

For plugin-architect's current Copilot support plan, the root `plugin.json` uses only these fields:

```json
{
  "name": "plugin-name",
  "description": "Brief plugin description",
  "version": "1.0.0",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "skills": ["./.github/skills/<skill-name>"],
  "mcpServers": "./.mcp.json"
}
```

Do not include `commands` or `agents` in this file for Copilot.

## Key Rules

- Copilot customization files live under `.github/`
- Project-wide instructions use `.github/copilot-instructions.md`
- Domain-specific instructions live under `.github/instructions/`
- Reusable prompts live under `.github/prompts/`
- Skills live under `.github/skills/<skill-name>/SKILL.md`
- Root `plugin.json` includes only `name`, `description`, `version`, `author`, `skills`, and `mcpServers`
- Do not generate `commands/` for Copilot in this project
- Do not include `commands` in Copilot `plugin.json`
- Do not include `agents` in Copilot `plugin.json`
- Do not generate Claude Code `.claude-plugin/` folders for Copilot
