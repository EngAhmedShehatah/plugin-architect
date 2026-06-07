---
name: build-plugin
description: Routes to the appropriate build flow (agent-based or sequential skill-only) based on platform capabilities. Orchestrates the full plugin build journey — scans the codebase, selects blueprints, generates skills and agents, and delivers a ready-to-install plugin.
---

# build-plugin — Platform-aware router

## Overview

This command detects your platform's capabilities and routes you to the appropriate build flow:

- **Agent-capable platforms** (Claude Code, OpenCode) → `commands/references/agent-flow.md`
- **Skill-only platforms** (Copilot, Cursor, Codex) → `commands/references/sequential-flow.md`

## Step 1: Detect your platform

Before proceeding, identify which platform you're using:

**Agent-capable?** (can spawn subagents in parallel)

- Claude Code ✅
- OpenCode ✅
- Copilot ❌
- Cursor ❌
- Codex ❌

## Step 2: Follow the appropriate flow

### If you have Agent capability (Claude Code, OpenCode)

Follow the **Agent Flow** at `commands/references/agent-flow.md`:

- Parallel subagent execution for faster scanning
- Full orchestration capabilities
- All 13 steps with optimal performance

### If you're skill-only (Copilot, Cursor, Codex)

Follow the **Sequential Flow** at `commands/references/sequential-flow.md`:

- Sequential skill execution (no parallel subagents)
- Same 13 steps adapted for your platform
- Full functionality, step-by-step

## What happens next

Once you follow the appropriate flow and complete all 13 steps:

1. A `marketplace/` folder is created at your project root
2. Inside: fully scaffolded, validated plugin ready to install
3. You'll install and test it locally (pilot phase)
4. Finally push to a live git repo

Both flows produce identical output — the only difference is **how** you get there (parallel vs sequential).

## Which should I follow?

**Unsure?** Start with your platform name above. If you see a ✅, use Agent Flow. If you see ❌, use Sequential Flow.

Need more detail on what each step does? Check the relevant flow file — they're extensively documented.
