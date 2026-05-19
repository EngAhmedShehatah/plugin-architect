---
name: build-plugin
description: Orchestrates the full plugin build journey — scans the codebase, selects blueprints, generates skills and agents, and delivers a ready-to-install Claude Code plugin.
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

- mentality: avoid filling up the agent with a lot of info, keep the skill and the agent separate from the purpose of use perspective: skill = what , and agent = who and how. each criteria must be separate like this.

### step 1

- greet user by his name to welcome him properly to our journey
- inform user that we are going to start our journey by doing some scanning

### step 2

- spin up 3 subagents in parallel to do the scanning process:
    1. git-detector agent at '../agents/git-detector.md'
    2. schema-scanner agent at '../agents/schema-scanner.md'
    3. tech-stack-detector at '../agents/tech-stack-detector.md'
- once they finish, check each agent's output report and print it out to the user

### step 2.5

- before moving forward, classify the `tech-stack-detector` output into two groups:
  - skill-worthy techs: frameworks, languages, test runners, major databases, build tools, runtime platforms, and core infrastructure the user is likely to need workflow skills for
  - utility/infra techs: middleware, auth tokens, documentation generators, analytics, minor libraries, third-party APIs, and implementation details that should be skipped by default

- show the proposed split to the user before any `blueprint-selector` subagents are spawned:

  The tech names below are examples only. Replace them with the real values from `tech-stack-detector` output — never copy these example values into the actual response.

  > Here are the detected techs. I'll search for skills for the ones marked ✅. Let me know if you want to add or remove any before I start searching.
  >
  > ✅ example-skill-worthy-tech-1, example-skill-worthy-tech-2
  > ⚠️ example-utility-tech-1, example-utility-tech-2 (utility/infra — skipping by default)

- wait for the user to confirm or adjust the list. accepted replies:

  > - **confirm** — search only the ✅ techs
  > - **add [tech]** — move a skipped tech into the search list
  > - **remove [tech]** — remove a tech from the search list
  > - **set [techs...]** — replace the search list with exactly these techs

- do not proceed to step 3 or spawn any `blueprint-selector` subagents until the user has confirmed the final list
- once confirmed, save the result as the confirmed skill-worthy tech list — this is the only input step 5 uses

### step 3

- based on the output from `schema-scanner` agent, if project is monorepo, then ask user:

  > This is a monorepo project that contains: main manager package + 3 packages. Do you want to create one plugin for all of them ? or one separate plugin for each ?

- based on the user's answer for the previous question, if user answer is 'one separate plugin for each', then we need to ask user:
  
  > do you want one plugin to contain the shared stuff and be the core/shared plugin and avoid duplication ? or you don't mind having duplicated stuff per each plugin as a start ?

- based on the user's answer for the previous question, we will output the expected folder structure of his custom plugin created by our own plugin. But it will only contain the levels from 1 to 3, so the marketplace folder as the root folder down to the plugins folder only no more.

example for single plugin:

```text
.
└── marketplace/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── plugins/
    │   └── single-plugin/
    └── README.md
```

example for separate plugins:

```text
.
└── marketplace/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── plugins/
    │   └── plugin1/
    │   └── plugin2/
    │   └── plugin3/
    └── README.md
```

### step 4

- once he agrees, we proceed to the next question:

  > now we have the required info for starting building the custom setup: git setup + schema + tech stack + folder structure of the custom plugin. next we need to ask him about which mode he wants to build his plugin with (options):
    - light mode
      we need to get the short description from '../modes/light.md' to use as hint
    - medium mode
      we need to get the short description from '../modes/medium.md' to use as hint
    - deep mode
      we need to get the short description from '../modes/deep.md' to use as hint

- based on his answer, we will output the updated expected folder structure of his custom plugin created by own plugin and this time it will be complete from the highest level to the lowest level based on the mode he chooses. We must also include the telemetry + the validation + the precommit hook + bitbucket pipeline or github action.

- wait for his confirmation

### step 5

- spin one `blueprint-selector` subagent per confirmed skill-worthy tech from step 2.5, all in parallel. Each subagent receives:
  - `tech` — the tech name

- wait for all subagents to finish

- display a table to the user (below is example, use real values):

  | Tech | Found | Skill | Source | Link |
  | --- | --- | --- | --- | --- |
  | nextjs | ✅ | vercel-react-best-practices | Skills.sh | [open](https://www.skills.sh) |
  | prisma | ❌ | — | — | — |

  - only confirmed skill-worthy techs from step 2.5 appear in this table — no utility/infra techs
  - every tech must appear — no hidden rows
  - ❌ rows are shown clearly with no source and no link
  - links must be ctrl+clickable

- ask the user:

  > Please review the blueprints above. Reply with one of:
  > - **confirm** — proceed with all as shown
  > - **replace [tech]** — provide an alternative URL for that tech
  > - **skip [tech]** — mark it for manual creation later
  > - **re-search [tech] as [alias]** — try a different search term

- for each correction:
  - **replace**: update that row's URL, re-display the updated table
  - **skip**: mark row as `manual`, keep it visible
  - **re-search**: re-spin the same `blueprint-selector` subagent for that tech with the alias as the new `tech` input, update the row

- once user confirms the final table, proceed to step 6

### step 6

- ask the user:

  > which AI model are you planning to use this plugin against (options):
    - Claude Code
    - Opencode
    - Codex
    - Copilot
  
- wait for him to answer because this will affect the validation of each item at creating time and at the end of the process.

### step 7

- in the project root folder, create a new folder named 'marketplace' with the skeleton folders and files

```text
.
└── marketplace/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── plugins/
    │   └── core/
    │       ├── .claude-plugin/
    │       │   └── plugin.json
    │       ├── skills
    │       ├── agents
    │       ├── commands
    │       ├── hooks
    │       ├── scripts
    │       └── .mcp.json
    └── README.md
```

### step 8

**Do NOT create skills or agents inline in the main agent. You MUST use the `Agent` tool for every skill and every agent — no exceptions.**

For each skill/agent pair, invoke both subagents in parallel in the same message using the `Agent` tool:

- skill-creator agent at '../agents/skill-creator.md' . The prompt must include:
  - `output path`: full path where the skill file must be written (e.g. `marketplace/plugins/core/skills/<skill-name>/SKILL.md`)
  - `blueprint`: inline description of what this skill must do, its scope, and constraints (derived from the blueprint content fetched in step 5)
  - `focus prompt`: one sentence instructing the skill to be codebase-specific — operating on the user's actual project, not a hypothetical codebase
  - `validator`: `marketplace/plugins/core/scripts/validate-plugins.mjs`

- agent-creator agent at '../agents/agent-creator.md' . The prompt must include:
  - `output path`: full path where the agent file must be written (e.g. `marketplace/plugins/core/agents/<agent-name>.md`)
  - `blueprint`: inline description of the agent's role, tools it needs, and constraints (derived from the blueprint content fetched in step 5)
  - `focus prompt`: one sentence instructing the agent to be codebase-specific — referencing the user's actual project structure and stack
  - `validator`: `marketplace/plugins/core/scripts/validate-plugins.mjs`

Spawn both `Agent` calls for the same pair together in one message (parallel). Wait for both to finish, then move to the next pair. Pair by pair until all skills and agents are finished.

- copy the following scripts from `plugins/core/scripts/` into `marketplace/plugins/core/scripts/`:
  - `session-init.mjs` → `marketplace/plugins/core/scripts/session-init.mjs`
  - `version-bump.mjs` → `marketplace/plugins/core/scripts/version-bump.mjs`
  - `validate-plugins.mjs` → `marketplace/plugins/core/scripts/validate-plugins.mjs`
- generate `marketplace/.githooks/pre-commit` — do not copy ours, generate it fresh using the marketplace plugin folder name so the paths are correct:
  - validator: `node "$ROOT/plugins/core/scripts/validate-plugins.mjs" "$ROOT"`
  - markdownlint: same as ours
  - version bump: `node "$ROOT/plugins/core/scripts/version-bump.mjs"`
  - make it executable (`chmod +x`)
- copy the telemetry/monitors to the respective folder in the marketplace

### step 9

- create the pilot.md command file at the marketplace/commands folder following the template described at [pilot.template.md](https://raw.githubusercontent.com/EngAhmedShehatah/plugin-architect/main/plugins/core/resources/pilot.template.md).
- follow the workflow described in the mode file depending on which mode user has chosen.
- make sure to check if we need to add a toolchain at the preflight.
- make sure to check if we need to pass something from the main agent running this command to the subagents.
- make sure to include the telemetry as a mandatory command/skill/agent to spin after the work is done so that we make sure that user sees the subagents logs and highlight any concerns at least for the first try of the pilot command after installation.

### step 10

- validate everything again by running:

  ```bash
  node marketplace/plugins/core/scripts/validate-plugins.mjs marketplace/
  ```

  fix any reported errors before proceeding.

### step 11

- instruct user to install the created marketplace using the local path
- insrtuct user to install the plugin/s
- instruct user to try the pilot command against a real task and ask him to report back any errors that has been highlighted by the telemetry/monitors at the end of the pilot command.
  - if there is no concerns, just modify the pilot command to just ask the user if he want to run the telemetry/monitor command/skill/agent after the work is done or not, no need to eat user's token after the pilot work is done by force. it is up to him.
  - if there is any concern, just list all of them and where exactly this concern is skill/agent/command. if it is a skill or an agent, we need to spin the respective creator agent with different prompt to just address that concern. if not skill or agent, just address the concern in the main agent.
- if any concern has been addressed, instruct user to uninstall plugin and then reinstall it again. I know this is aggressive but we don't want to waste the time trying the whole pilot command without making sure he has the latest updated version of the plugin.
- after he reinstalls the plugin again, ask him to retry the pilot command and report back if any concerns to highlight.
- and so on, until the user is fully satisfied with the pilot command run and has no more concerns.

### step 12

- ask user to create a new repo and share its clone link.
- inside the marketplace, init the git and add a new remote using the clone link.
- commit and push.
- instruct user to uninstall the whole marketplace (if the plugin is not uninstalled by uninstalling the marketplace then uninstall it specifically).
- instruct user to reinstall the marketplace but this time using the repo link
- instruct user to reinstall the plugin from the new live marketplace

### step 13

- just report a summary of the work done to the user and ask him to star us on GitHub and share our repo among his friends.
- of course thank him for trusting us.
