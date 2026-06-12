---
name: build-plugin
description: Orchestrates the full plugin build journey — scans the codebase, selects blueprints, generates skills and agents, and delivers a ready-to-install plugin. Agent-capable platforms only (Claude Code, OpenCode).
tools:
  - Agent
  - Read
  - Write
  - Bash
  - WebFetch
---

# orchestrator command

## name: build-plugin

### Conventions

- Mentality: avoid filling up the agent with a lot of info, keep the skill and the agent separate from the purpose of use perspective: skill = what, and agent = who and how. Each criteria must be separate like this.

### Step 1

- Greet user by name to welcome them properly to the journey
- Inform user that we are going to start our journey by doing some scanning

### Step 2

- Spin up 3 subagents in parallel to do the scanning process:
    1. git-detector agent at `../plugins/core/agents/git-detector.md`
    2. schema-scanner agent at `../plugins/core/agents/schema-scanner.md`
    3. tech-stack-detector at `../plugins/core/agents/tech-stack-detector.md`
- Once they finish, check each agent's output report and print it out to the user

### Step 2.5

- Before moving forward, classify the `tech-stack-detector` output into two groups:
  - **skill-worthy techs**: frameworks, languages, test runners, major databases, build tools, runtime platforms, and core infrastructure the user is likely to need workflow skills for
  - **utility/infra techs**: middleware, auth tokens, documentation generators, analytics, minor libraries, third-party APIs, and implementation details that should be skipped by default

- Show the proposed split to the user before any `blueprint-selector` subagents are spawned:

  > Here are the detected techs. I'll search for skills for the ones marked ✅. Let me know if you want to add or remove any before I start searching.
  >
  > ✅ example-skill-worthy-tech-1, example-skill-worthy-tech-2
  > ⚠️ example-utility-tech-1, example-utility-tech-2 (utility/infra — skipping by default)

  The tech names above are examples only. Replace them with the real values from `tech-stack-detector` output — never copy these example values into the actual response.

- Wait for the user to confirm or adjust the list. Accepted replies:

  - **confirm** — search only the ✅ techs
  - **add [tech]** — move a skipped tech into the search list
  - **remove [tech]** — remove a tech from the search list
  - **set [techs...]** — replace the search list with exactly these techs

- Do not proceed to step 3 or spawn any `blueprint-selector` subagents until the user has confirmed the final list
- Once confirmed, save the result as the confirmed skill-worthy tech list — this is the only input step 5 uses

### Step 3

- Based on the output from `schema-scanner` agent, if project is monorepo, then ask user:

  > This is a monorepo project that contains: main manager package + 3 packages. Do you want to create one plugin for all of them ? or one separate plugin for each ?

- If user answer is 'one separate plugin for each', then ask:

  > Do you want one plugin to contain the shared stuff and be the core/shared plugin and avoid duplication ? or you don't mind having duplicated stuff per each plugin as a start ?

- Based on the user's answer, output the expected folder structure of their custom plugin. It will contain levels 1–3 only (marketplace folder → plugins folder, no deeper).

**Example for single plugin:**

```text
.
└── marketplace/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── plugins/
    │   └── single-plugin/
    └── README.md
```

**Example for separate plugins:**

```text
.
└── marketplace/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── plugins/
    │   ├── plugin1/
    │   ├── plugin2/
    │   └── plugin3/
    └── README.md
```

### Step 4

- Ask about build mode:

  > Next we need to know which mode you want to build your plugin with (options):
  > - light mode
  > - medium mode
  > - deep mode

- Provide short descriptions from:
  - `../plugins/core/references/light.md`
  - `../plugins/core/references/medium.md`
  - `../plugins/core/references/deep.md`

- Output the updated expected folder structure based on the chosen mode, including validation and CI pipeline.

- Wait for confirmation.

### Step 5

- Spin one `blueprint-selector` subagent per confirmed skill-worthy tech from step 2.5, all in parallel. Each subagent receives:
  - `tech` — the tech name

- Wait for all subagents to finish

- Display a table to the user (example below, use real values):

  | Tech | Found | Skill | Source | Link |
  | --- | --- | --- | --- | --- |
  | nextjs | ✅ | vercel-react-best-practices | Skills.sh | [open](https://www.skills.sh) |
  | prisma | ❌ | — | — | — |

  Rules:
  - Only confirmed skill-worthy techs from step 2.5 appear in this table — no utility/infra techs
  - Every tech must appear — no hidden rows
  - ❌ rows are shown clearly with no source and no link
  - Links must be ctrl+clickable

- Ask the user:

  > Please review the blueprints above. Reply with one of:
  > - **confirm** — proceed with all as shown
  > - **replace [tech]** — provide an alternative URL for that tech
  > - **skip [tech]** — mark it for manual creation later
  > - **re-search [tech] as [alias]** — try a different search term

- For each correction:
  - **replace**: update that row's URL, re-display the updated table
  - **skip**: mark row as `manual`, keep it visible
  - **re-search**: re-spin the same `blueprint-selector` subagent for that tech with the alias as the new `tech` input, update the row

- Once user confirms the final table, proceed to step 6

### Step 6

Display the following block to the user exactly as written below — do not reformat, reorder, summarize, or alter it in any way:

---

Which AI tool are you planning to build this plugin for?

Claude Code, GitHub Copilot, Gemini, OpenCode, Codex

Type the tool name and I'll take it from there.

---

Wait for the answer. Normalize the user's input to the matching platform ID:

| User types | Platform ID |
| --- | --- |
| Claude Code | `claude-code` |
| GitHub Copilot, Copilot | `github-copilot` |
| Gemini | `gemini` |
| OpenCode | `opencode` |
| Codex | `codex` |

This platform ID is used for validation and skeleton generation in all subsequent steps.

Rules:

- Claude Code and OpenCode are agent-capable targets — the generated plugin will include agents
- GitHub Copilot, Gemini, and Codex are skill-first — only skills are generated, no agents

### Step 6.5

Silently fetch all remote resources needed for the rest of this workflow. Do not prompt the user or mention this step. Hold all fetched content in memory.

Fetch:

- `pilot.template.md` from `https://raw.githubusercontent.com/EngAhmedShehatah/plugin-architect/main/plugins/core/references/pilot.template.md`

### Step 7

Invoke the `skeleton-builder` agent to create the platform-specific skeleton. Do not build the skeleton inline.

Invoke at `../plugins/core/agents/skeleton-builder.md` with:

- `platform`: normalized target platform ID from Step 6
- `user_name`: `user_name` from the `git-detector` output in Step 2
- `user_email`: `user_email` from the `git-detector` output in Step 2
- `surfaces`: optional — omit unless the user explicitly requested a subset of platform surfaces

Use the agent output to write the returned `files` into the project root. The skeleton-builder agent is responsible for selecting the correct checked-in skeleton reference and returning the platform-specific folder structure.

Do not use plugin-architect's own metadata when writing generated manifest files.

### Step 8

**Do NOT create skills or agents inline in the main agent. You MUST use the `Agent` tool for every skill and every agent — no exceptions.**

For each skill/agent pair, invoke both subagents in parallel in the same message using the `Agent` tool:

**skill-creator agent** at `../plugins/core/agents/skill-creator.md`. The prompt must include:

- `output path`: full path where the skill file must be written (e.g. `marketplace/plugins/core/skills/<skill-name>/SKILL.md`)
- `blueprint`: inline description of what this skill must do, its scope, and constraints (derived from the blueprint content fetched in step 5)
- `focus prompt`: one sentence instructing the skill to be codebase-specific — operating on the user's actual project, not a hypothetical codebase
- `validator`: `marketplace/plugins/core/scripts/validate-plugins.mjs`

**agent-creator agent** at `../plugins/core/agents/agent-creator.md`. The prompt must include:

- `output path`: full path where the agent file must be written (e.g. `marketplace/plugins/core/agents/<agent-name>.md`)
- `blueprint`: inline description of the agent's role, tools it needs, and constraints (derived from the blueprint content fetched in step 5)
- `focus prompt`: one sentence instructing the agent to be codebase-specific — referencing the user's actual project structure and stack
- `validator`: `marketplace/plugins/core/scripts/validate-plugins.mjs`

Spawn both `Agent` calls for the same pair together in one message (parallel). Wait for both to finish, then move to the next pair. Pair by pair until all skills and agents are finished.

Copy the following scripts from `plugins/core/scripts/` into `marketplace/plugins/core/scripts/`:

- `session-init.mjs`             → `marketplace/plugins/core/scripts/session-init.mjs`
- `version-bump.mjs`             → `marketplace/plugins/core/scripts/version-bump.mjs`
- `validate-plugins.mjs`         → `marketplace/plugins/core/scripts/validate-plugins.mjs`
- `validate-claude-code.mjs`     → `marketplace/plugins/core/scripts/validate-claude-code.mjs`
- `validate-codex.mjs`           → `marketplace/plugins/core/scripts/validate-codex.mjs`
- `validate-gemini.mjs`          → `marketplace/plugins/core/scripts/validate-gemini.mjs`
- `validate-github-copilot.mjs`  → `marketplace/plugins/core/scripts/validate-github-copilot.mjs`
- `validate-opencode.mjs`        → `marketplace/plugins/core/scripts/validate-opencode.mjs`

### Step 9

Create the pilot.md command file at `marketplace/commands/` using the `pilot.template.md` content fetched in step 6.5.

Follow the workflow described in the mode file depending on which mode user chose.

Considerations:

- Check if we need to add a toolchain at the preflight
- Check if we need to pass something from the main agent running this command to the subagents

### Step 10

Validate everything by running:

```bash
node marketplace/plugins/core/scripts/validate-plugins.mjs marketplace/
```

Fix any reported errors before proceeding.

### Step 11

- Instruct user to install the created marketplace using the local path
- Instruct user to install the plugin(s)
- Instruct user to try the pilot command against a real task and ask them to report back any errors or unexpected behavior

If concerns exist:

- List all concerns and where exactly they are (skill/agent/command)
- If skill or agent: spin the respective creator agent with a different prompt to address that concern
- If not skill/agent: address the concern in the main agent
- Once concerns are addressed: instruct user to uninstall plugin and reinstall it
- Ask them to retry the pilot command and report if any concerns remain

Repeat until user is fully satisfied with the pilot command run.

### Step 12

- Ask user to create a new repo and share its clone link
- Inside the marketplace, init git and add a new remote using the clone link
- Commit and push
- Instruct user to uninstall the whole marketplace (if the plugin is not uninstalled by uninstalling the marketplace, uninstall it specifically)
- Instruct user to reinstall the marketplace but this time using the repo link
- Instruct user to reinstall the plugin from the new live marketplace

### Step 13

- Report a summary of the work done to the user
- Ask them to star us on GitHub and share our repo among friends
- Thank them for trusting us
