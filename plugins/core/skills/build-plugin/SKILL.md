---
name: build-plugin
description: Sequential build workflow for skill-only surfaces. Mirrors the command flow step-by-step, but every phase names the exact skill to use so routing is explicit.
---

# build-plugin — definitive sequential skill flow

Use this skill when the host platform cannot run the command-based parallel router. This skill mirrors the command flow, but it never relies on the model to guess which helper to use: every step names the exact skill to invoke.

## Parity with the command flow

This skill follows the same overall journey as `commands/build-plugin.md`:

1. greet and frame the work
2. run the repo / schema / tech scans
3. classify detected tech
4. confirm monorepo shape and folder structure
5. choose the build mode
6. search blueprints for the confirmed tech list
7. choose the target platform
8. build the skeleton using the local skeleton-build skill
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

- `../../references/light.md`
- `../../references/medium.md`
- `../../references/deep.md`

Ask the user which mode they want.

After they choose, output the full expected folder structure for that mode, including:

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

Which AI tool are you planning to use this plugin against?

Full IDE / Desktop:

- Claude Code        → `claude-code`
- Cursor             → `cursor`
- Windsurf           → `windsurf`
- Warp               → `warp`
- OpenClaw           → `openclaw`

VS Code Extensions:

- GitHub Copilot     → `github-copilot`
- Cline              → `cline`
- Continue           → `continue`
- Kilo Code          → `kilo`
- Roo Code           → `roo`
- Augment Code       → `augment`

CLI Agents:

- Gemini CLI         → `gemini`
- OpenCode           → `opencode`
- Codex              → `codex`
- Aider Desk         → `aider-desk`
- Amp                → `amp`
- Bob                → `bob`
- Crush              → `crush`
- Devin              → `devin`
- Droid              → `droid`
- ForgeCode          → `forgecode`
- Goose              → `goose`
- iFlow CLI          → `iflow`
- Kiro               → `kiro`
- Mistral            → `mistral`
- OpenHands          → `openhands`
- Qwen Code          → `qwen`
- Rovo Dev           → `rovodev`
- Tabnine            → `tabnine`
- Trae               → `trae`
- Replit Agent       → `replit`
- Qoder              → `qoder`
- Google Antigravity → `antigravity`

JetBrains:

- Junie              → `junie`

Type the platform ID (e.g. `cursor`) to continue.

Rules:

- Claude Code and OpenCode are agent-capable targets — the generated plugin will include agents
- all other platforms are skill-first — only skills are generated, no agents
- `multi-platform` means build the combined marketplace layout with platform-specific surfaces kept separate

### Step 7 — build the skeleton using the local skeleton-build skill

Use `skeleton-build`.

- Do not build the skeleton inline.
- Do not fetch from GitHub.

Invoke `skeleton-build` with:

- `platform`: the normalized target platform ID from Step 6
- `user_name`: `user_name` from the `git-detect` skill output in Step 2
- `user_email`: `user_email` from the `git-detect` skill output in Step 2
- `surfaces`: optional — omit unless the user explicitly requested a subset of platform surfaces

Use the skill output to write the returned `files` into the project root. The skeleton-build skill selects the correct checked-in skeleton reference and returns the platform-specific folder structure.

Do not use plugin-architect's own metadata when writing generated manifest files.

### Step 8 — generate the plugin artifacts with named helper skills

Do not rely on vague model routing here. Use the helper skills below explicitly.

#### 8a. Generate skills

Use `skill-create` for every skill file that needs to be produced.

For each skill:

- provide the exact output path
- include the blueprint for that skill
- keep the prompt tied to the user's actual codebase
- write the skill as a concrete, repo-specific artifact

#### 8b. Generate agents only when the target platform supports them

Use `agent-create` only when the target platform is `claude-code` or `opencode`.

For each agent:

- provide the exact output path
- include the role blueprint
- keep the prompt tied to the user's actual codebase and stack
- write the agent as a concrete, repo-specific artifact

For all other platforms, skip agent generation entirely.

#### 8c. Copy the shared scripts

Copy these scripts from `plugins/core/scripts/` into the generated marketplace:

- `session-init.mjs`             → `marketplace/plugins/core/scripts/session-init.mjs`
- `version-bump.mjs`             → `marketplace/plugins/core/scripts/version-bump.mjs`
- `validate-plugins.mjs`         → `marketplace/plugins/core/scripts/validate-plugins.mjs`
- `validate-claude-code.mjs`     → `marketplace/plugins/core/scripts/validate-claude-code.mjs`
- `validate-codex.mjs`           → `marketplace/plugins/core/scripts/validate-codex.mjs`
- `validate-cursor.mjs`          → `marketplace/plugins/core/scripts/validate-cursor.mjs`
- `validate-gemini.mjs`          → `marketplace/plugins/core/scripts/validate-gemini.mjs`
- `validate-github-copilot.mjs`  → `marketplace/plugins/core/scripts/validate-github-copilot.mjs`
- `validate-opencode.mjs`        → `marketplace/plugins/core/scripts/validate-opencode.mjs`

#### 8d. Generate the pre-commit hook fresh

Create a fresh `marketplace/.githooks/pre-commit` using the marketplace folder name so the paths are correct.

Required behaviors:

- run the validator: `node "$ROOT/plugins/core/scripts/validate-plugins.mjs" "$ROOT"`
- run markdownlint the same way as the source plugin
- run the version bump script: `node "$ROOT/plugins/core/scripts/version-bump.mjs"`
- make the hook executable with `chmod +x`

#### 8e. Copy telemetry and monitors

Copy the telemetry / monitor artifacts to the generated marketplace in the correct locations.

### Step 9 — create the pilot command

Create `marketplace/commands/pilot.md` from the pilot template at:

- `plugins/core/references/pilot.template.md`

Adapt it to the mode the user selected.

Also make sure to:

- check whether a toolchain preflight is needed
- check whether the main tool must pass context to subagents
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

### Step 12 — push to a live repo

- Ask user to create a new repo and share its clone link
- Inside the marketplace, init git and add a new remote using the clone link
- Commit and push
- Instruct user to uninstall the whole marketplace (if the plugin is not uninstalled by uninstalling the marketplace, uninstall it specifically)
- Instruct user to reinstall the marketplace but this time using the repo link
- Instruct user to reinstall the plugin from the new live marketplace

### Step 13 — celebrate

- Report a summary of the work done to the user
- Ask them to star us on GitHub and share our repo among friends
- Thank them for trusting us

## Minimal execution rule

Never let this skill drift into a generic checklist. Every major step must name the helper skill that owns it.

If a step needs a helper skill and that helper skill exists, name it explicitly.
If a helper skill does not exist, say that clearly and handle the step directly instead of pretending a route exists.
