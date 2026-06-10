---
name: sequential-flow
description: Full skill-based build orchestration for skill-only platforms. Executes scans and blueprint search sequentially.
platforms: ["Copilot", "Cursor", "Codex", "Windsurf", "Cline", "Continue", "Kilo Code", "Roo Code", "Augment Code", "Aider Desk", "Amp", "Bob", "Crush", "Devin", "Droid", "ForgeCode", "Goose", "iFlow CLI", "Kiro CLI", "Mistral Vibe", "OpenHands", "Qwen Code", "Atlassian Rovo Dev", "Tabnine CLI", "Trae", "Warp", "Replit Agent", "JetBrains Junie", "Qoder", "Google Antigravity"]
---

# sequential-flow — sequential orchestration

Use this flow on platforms that do *not* support agent-style parallel execution.

## Step 1: Greet and scan sequentially

Run these one at a time:

1. `git-detect`
2. `schema-scan`
3. `tech-stack-detect`

Show the result of each before moving to the next.

## Step 2: Classify techs

Split techs into:

- **skill-worthy**: frameworks, languages, runtimes, test runners, databases, build tools, core infra
- **utility/infra**: auth helpers, docs generators, analytics, minor libs, implementation details

Wait for user confirmation before blueprint search starts.

## Step 3: Monorepo and mode

Ask the monorepo question if needed, then ask for build mode:

- light
- medium
- deep

Show the expected folder shape after each answer and wait.

## Step 4: Sequential blueprint search

Search blueprints one tech at a time. After each result, show the row and ask the user to confirm or revise.

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

- **Claude Code / OpenCode**: the output plugin may include agents as installable surfaces.
- **Other single platforms**: keep the generated surface skill-first.
- **multi-platform**: copy the full plugin-architect / caveman-style infrastructure and include every supported file and folder surface.

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
