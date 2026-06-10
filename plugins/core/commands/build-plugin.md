---
name: build-plugin
description: Agent-capable build router for Claude Code and OpenCode. Uses parallel scans, supports the full caveman platform list, and can switch to a multi-platform skeleton when requested.
---

# build-plugin — command flow

Use this command on *agent-capable* surfaces. It keeps the orchestration explicit and sends you to the right build path.

## What this command does

- Scans the project in parallel
- Classifies techs before blueprint search
- Lets you choose a target platform from the full caveman-supported list
- Supports a `multi-platform` option that generates the full plugin-architect/caveman-style skeleton
- Keeps agents installable only where they make sense: *Claude Code* and *OpenCode*

## Step 1: Greet and scan

Run these in parallel:

- `git-detector`
- `schema-scanner`
- `tech-stack-detector`

Show each result, then summarize them for the user.

## Step 2: Classify techs

Split the detected techs into:

- **skill-worthy** — frameworks, languages, test runners, databases, build tools, runtimes, core infra
- **utility/infra** — auth helpers, docs generators, analytics, minor libs, implementation details

Ask the user to confirm the split before blueprint search starts.

## Step 3: Monorepo questions

If the project is a monorepo, ask whether the user wants:

- one plugin for all packages
- one plugin per package
- a shared core plugin to avoid duplication

Show the top-level folder shape after the answer, then wait.

## Step 4: Choose mode

Ask for the build mode:

- light
- medium
- deep

Show the expected folder shape for that mode, then wait.

## Step 5: Search blueprints

Search blueprints in parallel, one per confirmed skill-worthy tech.

Show the results, ask for confirmation, and allow replacement / skip / re-search.

## Step 6: Choose target platform

Ask the user:

```text
Which platform do you want this plugin to target?
```

Options:

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
- `multi-platform`

### Platform rules

- If the selected target is *Claude Code* or *OpenCode*, include agents in the generated plugin.
- If the selected target is any other single platform, generate skills first and keep agents out of that platform surface.
- If the selected target is `multi-platform`, generate the full plugin-architect/caveman-style skeleton with every supported surface laid out.

## Step 7: Build the skeleton

- If the target already has a known plugin-architect skeleton, reuse it.
- If the target does not, search the latest docs / web for the current platform structure.
- If `multi-platform` was selected, copy the whole infrastructure pattern: shared core, per-platform surfaces, and the full folder tree.
- Do **not** bring in the old skeleton-detector path.

## Step 8: Generate skills and agents

- Generate skills for every target.
- Generate agents only when the selected target supports them (`Claude Code` or `OpenCode`).
- For `multi-platform`, keep the platform-specific surfaces separate and include all supported layouts.

## Step 9: Create the pilot command

Create the `pilot.md` command from the canonical pilot template and tailor it to the selected mode and target platform.

## Step 10: Validate

Validate the generated plugin, then show the results clearly.

## Step 11: Install and test

Guide the user through installation and a first test run.

## Step 12: Publish

Help the user push the generated plugin to their repo when they are satisfied.

## Step 13: Summary

Return a short summary of what was built and what remains to be tested.
