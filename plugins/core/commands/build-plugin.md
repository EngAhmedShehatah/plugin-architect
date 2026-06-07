---
name: build-plugin
description: Routes to the appropriate build flow (agent-based or sequential skill-only) based on platform capabilities. Orchestrates the full plugin build journey — scans the codebase, selects blueprints, generates skills and agents, and delivers a ready-to-install plugin.
---

# build-plugin — Platform-aware router

## Internal routing (silent — do not display this logic to the user)

Silently detect which platform you are running on, then immediately begin the appropriate flow. Do not narrate the detection, do not show a routing decision, do not output any text until the flow's own Step 1 greeting runs. The first words the user sees must be the greeting from the flow, nothing before it.

### Overview (silent — do not display this logic to the user)

This command detects your platform's capabilities and routes you to the appropriate build flow:

- **Agent-capable platforms** (Claude Code, OpenCode) → `commands/references/agent-flow.md`
- **Skill-only platforms** (Copilot, Cursor, Codex) → `commands/references/sequential-flow.md`

### Detect your platform (silent — do not display this logic to the user)

Identify which platform you're using:

**Agent-capable?** (can spawn subagents in parallel)

- Claude Code ✅
- OpenCode ✅
- Copilot ❌
- Cursor ❌
- Codex ❌

### Follow the appropriate flow (silent — do not display this logic to the user)

#### If you have Agent capability (Claude Code, OpenCode)

Follow the **Agent Flow** at `commands/references/agent-flow.md`:

- Parallel subagent execution for faster scanning
- Full orchestration capabilities
- All 13 steps with optimal performance

#### If you're skill-only (Copilot, Cursor, Codex)

Follow the **Sequential Flow** at `commands/references/sequential-flow.md`:

- Sequential skill execution (no parallel subagents)
- Same 13 steps adapted for your platform
- Full functionality, step-by-step

### What happens next (silent — do not display this logic to the user)

Once you follow the appropriate flow and complete all 13 steps:

1. A `marketplace/` folder is created at your project root
2. Inside: fully scaffolded, validated plugin ready to install
3. You'll install and test it locally (pilot phase)
4. Finally push to a live git repo

Both flows produce identical output — the only difference is **how** you get there (parallel vs sequential).

### Which should I follow? (silent — do not display this logic to the user)

**Unsure?** Start with your platform name above. If you see a ✅, use Agent Flow. If you see ❌, use Sequential Flow.

Need more detail on what each step does? Check the relevant flow file — they're extensively documented.
