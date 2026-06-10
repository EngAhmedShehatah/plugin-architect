---
name: agent-flow
description: Full agent-based build orchestration for Claude Code and OpenCode. Uses parallel scans and parallel blueprint search.
platforms: ["Claude Code", "OpenCode"]
---

# agent-flow — parallel orchestration

Use this flow only when the host platform can run agents in parallel.

## Step 1: Greet and scan

Run the three discovery agents in parallel:

- `git-detector`
- `schema-scanner`
- `tech-stack-detector`

Show the three reports, then summarize them.

## Step 2: Classify techs

Split techs into:

- **skill-worthy**: frameworks, languages, runtimes, test runners, databases, build tools, core infra
- **utility/infra**: auth helpers, docs generators, analytics, minor libs, implementation details

Wait for the user to confirm the split before moving on.

## Step 3: Monorepo and mode

Ask the monorepo question if needed, then ask for build mode:

- light
- medium
- deep

After each answer, show the expected folder shape and wait for confirmation.

## Step 4: Parallel blueprint search

Run one `blueprint-selector` agent per confirmed skill-worthy tech in parallel.

Show the table, then allow replace / skip / re-search.

## Step 5: Choose target platform

Ask for the target platform. The available options are:

- Claude Code
- OpenCode
- Codex
- Copilot
- Cursor
- Windsurf
- Cline
- Continue
- Kilo Code
- Roo Code
- Augment Code
- Aider Desk
- Amp
- Bob
- Crush
- Devin
- Droid
- ForgeCode
- Goose
- iFlow CLI
- Kiro CLI
- Mistral Vibe
- OpenHands
- Qwen Code
- Atlassian Rovo Dev
- Tabnine CLI
- Trae
- Warp
- Replit Agent
- JetBrains Junie
- Qoder
- Google Antigravity
- multi-platform

### Platform rules

- **Claude Code / OpenCode**: keep agent generation enabled.
- **Other single platforms**: generate skills; keep agents out of that surface.
- **multi-platform**: copy the full plugin-architect / caveman-style infrastructure, including every supported file and folder surface.

## Step 6: Build the skeleton

- Reuse an existing platform skeleton if plugin-architect already supports it.
- If it does not, search the latest docs / internet for the current layout.
- Do not use the old skeleton-detector path.
- For `multi-platform`, generate the complete cross-platform tree instead of a single-surface skeleton.

## Step 7: Generate skills and agents

- Generate skills for every target.
- Generate agents only for targets that support them (`Claude Code` or `OpenCode`).
- For `multi-platform`, keep the platform-specific outputs separated cleanly so the final plugin can install on every supported surface.

## Step 8: Create the pilot command

Create `pilot.md` from the canonical pilot template and adjust it to the chosen mode and target platform.

## Step 9: Validate, install, test, publish

Validate the output, help with install, guide the first test, then help publish it.

## Step 10: Summary

Return a concise summary of what was generated.
