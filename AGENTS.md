---
applyTo: "**"
---

# Plugin Architect — Agent Instructions

You are working with the plugin-architect project. This is a meta-plugin that developers use to generate custom, codebase-focused plugins for AI coding tools.

## Project structure

- `plugin.json` — Copilot manifest
- `plugins/core/` — Core plugin implementation
  - `skills/` — Skill definitions (each folder contains a `SKILL.md`)
  - `agents/` — Agent definitions
  - `commands/` — Slash commands (Claude Code only)
  - `scripts/` — Utility scripts
  - `.mcp.json` — MCP server configuration
- `.claude-plugin/` — Claude Code marketplace manifest

## Available skills

Each skill lives under `plugins/core/skills/<name>/SKILL.md` and is designed to be invoked by its description:

- `agent-create` — Creates a new agent markdown file
- `blueprint-select` — Searches for a skill blueprint matching a technology
- `git-detect` — Detects the project's git setup, hosting provider, and branching strategy
- `plugin-validate` — Validates a generated plugin folder against rules
- `schema-scan` — Detects monorepo structure, package manager, and workspaces
- `skeleton-build` — Builds a platform-specific plugin skeleton from the checked-in skeleton reference
- `skill-create` — Creates a new skill markdown file
- `tech-stack-detect` — Scans the project tech stack from manifests and config files

## Guidance

- Read the file before making assumptions about its structure
- Use the available skills when a task matches their purpose
- Do not create or modify files outside the project without user confirmation
- Refer to `plugins/core/.claude-plugin/plugin.json` for the full plugin declaration
