---
name: build-plugin
description: Sequential build workflow for skill-only surfaces. Mirrors the command flow step-by-step, but every phase names the exact skill to use so routing is explicit.
---

# build-plugin — definitive sequential skill flow

Use this skill when the host platform cannot run the command-based parallel router. This skill mirrors the command flow, but it never relies on the model to guess which helper to use: every step names the exact skill to invoke.

## Parity with the command flow

This skill follows the same overall journey as `plugins/core/commands/build-plugin.md`:

1. greet and frame the work
2. run the repo / schema / tech scans
3. classify detected tech
4. confirm monorepo shape and folder structure
5. choose the build mode
6. search blueprints for the confirmed tech list
7. choose the target platform, including `multi-platform`
8. build from the GitHub repo skeleton only
9. generate the plugin artifacts
10. validate the result
11. guide install / test / iterate / publish

The difference is the execution style:

- the command flow can fan out in parallel with agents
- this skill flow is strictly sequential
- each step below names the exact helper skill to use so the model does not have to infer routing

## Required skills by step

### Step 1 — greet and set expectations

- No helper skill is needed here.
- Greet the user by name.
- Tell them the build will start with repository scanning.
- Make it clear that this is the sequential, skill-driven path.

### Step 2 — scan the repository

Use these skills in order:

1. `git-detect`
   - confirm the repo, remote, branch, and general Git setup
   - report the scan result back before moving on
2. `schema-scan`
   - inspect the project shape and determine whether it is a monorepo
   - keep the repo layout details for later structure questions
3. `tech-stack-detect`
   - detect frameworks, languages, test runners, databases, build tools, runtimes, and core infra

Do not compress these into one vague scan step. Run them as three named skills, in that order.

### Step 2.5 — classify tech detections before blueprint search

Take the output from `tech-stack-detect` and split it into two groups:

- skill-worthy techs
  - frameworks
  - languages
  - test runners
  - major databases
  - build tools
  - runtime platforms
  - core infrastructure
- utility / infra techs
  - middleware
  - auth tokens
  - documentation generators
  - analytics
  - minor libraries
  - third-party APIs
  - implementation details

Show the proposed split to the user and wait for confirmation before any blueprint search starts.

Accepted replies:

- `confirm` — search only the skill-worthy techs
- `add [tech]` — move a skipped tech into the search list
- `remove [tech]` — remove a tech from the search list
- `set [techs...]` — replace the search list with exactly these techs

### Step 3 — ask monorepo / folder-structure questions

Use `schema-scan` as the source of truth for the repo shape.

If the project is a monorepo, ask:

> This is a monorepo project that contains multiple packages. Do you want one plugin for all of them, or one separate plugin for each?

If the user chooses one plugin per package, ask:

> Do you want one shared/core plugin to avoid duplication across packages, or are you okay with duplicated setup per plugin at the start?

After the user answers, output the expected folder structure at levels 1 to 3 only. Wait for confirmation before moving to mode selection.

### Step 4 — choose the build mode

Use the mode descriptions from:

- `../modes/light.md`
- `../modes/medium.md`
- `../modes/deep.md`

Ask the user which mode they want.

After they choose, output the full expected folder structure for that mode, including:

- telemetry
- validation
- pre-commit hook
- Bitbucket pipeline or GitHub Action

Wait for confirmation.

### Step 5 — search blueprints one tech at a time

Use `blueprint-select`.

- Run one `blueprint-select` pass per confirmed skill-worthy tech.
- Do it sequentially, one tech at a time.
- Each pass receives only the tech name and the current search context.
- Record the detected skill, source, and link.
- If a tech has no match, keep it visible as a manual item; do not hide it.

The output should still behave like the command flow table, but the search itself is sequential instead of parallel.

### Step 6 — choose the target platform

Ask the user which AI platform this plugin should target.

Use the full caveman-supported platform list, including:

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

Rules:

- Claude Code and OpenCode are agent-capable targets.
- other single platforms stay skill-first
- `multi-platform` means build the combined marketplace layout and keep the platform-specific surfaces separate

### Step 7 — build from the GitHub repo skeleton only

This is a hard rule.

- Use the GitHub repo as the source of truth for the skeleton.
- Do not use the cached or installed plugin folder as the source of truth.
- If GitHub cannot be reached, stop and block — no fallback.
- For a single platform, copy only the files and folders needed for that surface.
- For `multi-platform`, compose the marketplace layout from the platform skeletons present in the GitHub repo.
- Do not bring back the old skeleton-detector path.

### Step 8 — generate the plugin artifacts with named helper skills

Do not rely on vague model routing here. Use the helper skills below explicitly.

#### 8a. Generate skills

Use `skill-create` for every skill file that needs to be produced.

For each skill:

- provide the exact output path
- include the blueprint for that skill
- keep the prompt tied to the user’s actual codebase
- write the skill as a concrete, repo-specific artifact

#### 8b. Generate agents only when the target platform supports them

Use `agent-create` only when the target platform is `Claude Code` or `OpenCode`.

For each agent:

- provide the exact output path
- include the role blueprint
- keep the prompt tied to the user’s actual codebase and stack
- write the agent as a concrete, repo-specific artifact

For other single platforms, skip agent generation.
For `multi-platform`, keep the platform surfaces separate and only generate agent-backed surfaces where the target family supports them.

#### 8c. Copy the shared scripts

Copy these scripts from `plugins/core/scripts/` into the generated marketplace:

- `session-init.mjs`
- `version-bump.mjs`
- `validate-plugins.mjs`

#### 8d. Generate the pre-commit hook fresh

Create a fresh `marketplace/.githooks/pre-commit` using the marketplace folder name so the paths are correct.

Required behaviors:

- run the validator
- run markdownlint the same way as the source plugin
- run the version bump script
- make the hook executable

#### 8e. Copy telemetry and monitors

Copy the telemetry / monitor artifacts to the generated marketplace in the correct locations.

### Step 9 — create the pilot command

Create `marketplace/commands/pilot.md` from the pilot template in:

- `plugins/core/resources/pilot.template.md`

Then adapt it to the mode the user selected.

Also make sure to:

- check whether a toolchain preflight is needed
- check whether the main agent must pass context to subagents
- include telemetry as a first-run prompt or post-run option so the user can see the logs and any concerns after the first pilot run

### Step 10 — validate the generated marketplace

Use `plugin-validate`.

Run validation on the generated marketplace and fix any reported errors before continuing.

### Step 11 — install, test, iterate, and publish

Guide the user to:

- install the generated marketplace locally
- install the plugin or plugins
- run the pilot command on a real task
- report any telemetry or monitor concerns

If concerns are found:

- identify whether the issue belongs to a skill, an agent, or a command
- if it is a skill issue, fix it with `skill-create`
- if it is an agent issue and the platform supports agents, fix it with `agent-create`
- if it is a command or orchestration issue, fix it in the main flow
- ask the user to reinstall and retry after the fix

If the run is clean:

- offer the choice to keep the telemetry opt-in for future runs
- summarize the generated marketplace
- close with the next recommended action

## Minimal execution rule

Never let this skill drift into a generic checklist. Every major step must name the helper skill that owns it.

If a step needs a helper skill and that helper skill exists, name it explicitly.
If a helper skill does not exist, say that clearly and handle the step directly instead of pretending a route exists.
