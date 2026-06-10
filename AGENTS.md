---
applyTo: "**"
---

# Plugin Architect — Agent Instructions

You are working in the `plugin-architect` repo, which builds custom plugins for AI coding surfaces.

## Project structure

- `plugin.json` — repo-level manifest
- `.claude-plugin/` — marketplace manifest for Claude Code
- `plugins/core/` — core plugin implementation
  - `skills/` — skill definitions
  - `agents/` — agent definitions
  - `commands/` — command entrypoints and flow references
  - `scripts/` — utility scripts
  - `.mcp.json` — MCP server config

## Build entrypoints

- Use the **command flow** on agent-capable surfaces: **Claude Code** and **OpenCode**
- Use the **sequential build skill** on skill-only surfaces
- The target platform chooser must include the full caveman-supported surface list plus `multi-platform`
- Agents are installable only for **Claude Code** and **OpenCode** surfaces

## Available build-related skills

- `agent-create` — create a new agent markdown file
- `blueprint-select` — find a blueprint for a tech
- `build-plugin` — sequential build flow for skill-only surfaces
- `git-detect` — detect git setup
- `plugin-validate` — validate a generated plugin folder
- `schema-scan` — detect monorepo structure and workspaces
- `skill-create` — create a new skill markdown file
- `tech-stack-detect` — scan the project tech stack

## Guidance

- Read the file before making assumptions about its structure
- Follow the existing flow files instead of inventing a new build path
- Keep agent generation limited to Claude Code and OpenCode surfaces
- Avoid the old skeleton-detector path when implementing the build flow
- Refer to `plugins/core/.claude-plugin/plugin.json` for the core plugin declaration
