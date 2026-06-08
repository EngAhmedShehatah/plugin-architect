---
name: build-plugin
description: Orchestrates the full plugin build journey. Detects platform capability, scans the codebase, selects blueprints, generates skills and agents, and delivers a ready-to-install plugin.
input:
  project_path: absolute path to the target project root
output:
  marketplace: path to the generated marketplace folder
---

## What this skill does

Builds a custom plugin for the user's project. Detects which platform you're on, routes to the appropriate build flow, and guides through all 13 steps from scanning to deployment.

## How to execute this skill

### Step 1: Detect your platform

Identify which platform you are running on:

| Platform | Capability |
|---|---|
| Claude Code, OpenCode | Agent-capable (parallel subagents) |
| Copilot, Cursor, Codex | Skill-only (sequential execution) |

### Step 2: Route to the appropriate flow

#### If Agent-capable

Follow the detailed agent flow at `references/agent-flow.md`:

- Parallel subagent execution for faster scanning
- Full orchestration capabilities
- All 13 steps with optimal performance

#### If Skill-only

Follow the detailed sequential flow at `references/sequential-flow.md`:

- Sequential skill execution (no parallel subagents)
- Same 13 steps adapted for your platform
- Full functionality, step-by-step

### What both flows produce

Once complete:

1. A `marketplace/` folder is created at the project root
2. Inside: fully scaffolded, validated plugin ready to install
3. User installs and tests locally (pilot phase)
4. Finally pushes to a live git repo

Both flows produce identical output — the only difference is execution strategy.

## Output format

Return a JSON object with:

```json
{
  "marketplace": "path/to/marketplace",
  "platform": "claude-code",
  "execution": "agent-flow | sequential-flow",
  "summary": "Short summary of what was built"
}
```

## Constraints

- Do not narrate platform detection to the user — route silently
- The first output the user sees must be the greeting from the chosen flow
- Both flows must produce identical output structure
- Only create files inside the generated marketplace
- Never modify files outside the project root
