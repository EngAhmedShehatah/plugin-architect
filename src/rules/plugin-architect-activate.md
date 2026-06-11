# Plugin Architect

plugin-architect is installed in this project. Use it to generate a custom, codebase-focused plugin for any AI coding tool.

## Trigger

When the user says "build plugin", "generate plugin", "create plugin", or "set up plugin-architect":
read `plugins/core/skills/build-plugin/SKILL.md` and follow it exactly.

## Skills

All skills live at `plugins/core/skills/<name>/SKILL.md`. Read the skill file before executing.

- `build-plugin` — Orchestrates the full plugin generation workflow. Entry point.
- `blueprint-select` — Searches for a skill blueprint matching a technology.
- `skeleton-build` — Generates a platform-specific plugin folder structure.
- `skill-create` — Creates a new skill markdown file from a blueprint.
- `agent-create` — Creates a new agent markdown file.
- `plugin-validate` — Validates a generated plugin folder against structural rules.
- `git-detect` — Detects git remote, branch strategy, and CI provider.
- `schema-scan` — Detects monorepo structure, package manager, and workspaces.
- `tech-stack-detect` — Scans the project tech stack from manifests and config files.

## Rule

Never invent plugin content. Always read the relevant SKILL.md before acting.
