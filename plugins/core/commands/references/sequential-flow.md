---
name: sequential-flow
description: Full skill-based sequential build for platforms without Agent capability (Copilot, Cursor, Codex). Steps 1-13 adapted for sequential execution without parallel subagents.
platforms: ["Copilot", "Cursor", "Codex"]
---

# sequential-flow — Sequential skill execution

This is the detailed flow for **Skill-only platforms** (Copilot, Cursor, Codex).

Use this if you started from `build-plugin.md` and confirmed you do NOT have Agent capability.

The workflow is identical to `agent-flow.md` (same 13 steps, same outputs), but **execution is sequential** because you cannot spawn parallel subagents.

## Conventions

- Mentality: avoid filling up the tool with a lot of info, keep the skill and the execution separate from the purpose of use perspective: skill = what, and execution = how. Each criteria must be separate like this.

## Step 1: Greet and inform

- Greet user by name to welcome them properly to the journey
- Inform user that we are going to start our journey by doing some scanning
- Mention that since you're on a skill-only platform, scanning will be sequential (takes a bit longer, but produces the same result)

## Step 2: Sequential scanning (3 skills, one at a time)

Execute the three scanning skills **sequentially** (one after another):

1. **git-detect skill**: Scan for git setup
2. **schema-scan skill**: Scan for project schema/structure
3. **tech-stack-detect skill**: Detect technology stack

After each skill completes, display its output report to the user before moving to the next.

Once all three are complete, present a summary of all three scans together.

## Step 2.5: Classify techs

Before moving forward, classify the `tech-stack-detect` output into two groups:

- **skill-worthy techs**: frameworks, languages, test runners, major databases, build tools, runtime platforms, and core infrastructure the user is likely to need workflow skills for
- **utility/infra techs**: middleware, auth tokens, documentation generators, analytics, minor libraries, third-party APIs, and implementation details that should be skipped by default

Show the proposed split to the user:

```text
Here are the detected techs. I'll search for skills for the ones marked ✅. Let me know if you want to add or remove any before I start searching.

✅ example-skill-worthy-tech-1, example-skill-worthy-tech-2
⚠️ example-utility-tech-1, example-utility-tech-2 (utility/infra — skipping by default)
```

Wait for the user to confirm or adjust. Accepted replies:

- **confirm** — search only the ✅ techs
- **add [tech]** — move a skipped tech into the search list
- **remove [tech]** — remove a tech from the search list
- **set [techs...]** — replace the search list with exactly these techs

Do not proceed to step 3 until the user has confirmed the final list.

Once confirmed, save the result as the confirmed skill-worthy tech list — this is the only input step 5 uses.

## Step 3: Monorepo structure

Based on the `schema-scan` output, if project is monorepo, then ask user:

```text
This is a monorepo project that contains: main manager package + 3 packages. Do you want to create one plugin for all of them, or one separate plugin for each?
```

If user answer is 'one separate plugin for each', then ask:

```text
Do you want one plugin to contain the shared stuff and be the core/shared plugin and avoid duplication? Or you don't mind having duplicated stuff per each plugin as a start?
```

Based on the user's answer, output the expected folder structure of their custom plugin. It will contain levels 1-3 only (marketplace folder → plugins folder, no deeper).

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

## Step 4: Choose build mode

Now we have the required info (git setup + schema + tech stack + folder structure). Ask about build mode:

```text
Next we need to know which mode you want to build your plugin with (options):
- light mode
- medium mode
- deep mode
```

Provide short descriptions from:

- `../modes/light.md`
- `../modes/medium.md`
- `../modes/deep.md`

Output the updated expected folder structure based on the chosen mode, including telemetry, validation, pre-commit hook, and CI pipeline.

Wait for confirmation.

## Step 5: Sequential blueprint search (1 skill per tech)

For each confirmed skill-worthy tech from step 2.5 (in sequence):

1. Call the `blueprint-select` skill with `tech` parameter
2. Wait for it to complete
3. Record the result (found/not found, URL if found)
4. Move to the next tech

Once all are complete, display a table to the user (example below, use real values):

| Tech | Found | Skill | Source | Link |
| --- | --- | --- | --- | --- |
| nextjs | ✅ | vercel-react-best-practices | Skills.sh | [open](https://www.skills.sh) |
| prisma | ❌ | — | — | — |

Rules:

- Only confirmed skill-worthy techs from step 2.5 appear in this table — no utility/infra techs
- Every tech must appear — no hidden rows
- ❌ rows are shown clearly with no source and no link
- Links must be ctrl+clickable

Ask the user:

```text
Please review the blueprints above. Reply with one of:
- **confirm** — proceed with all as shown
- **replace [tech]** — provide an alternative URL for that tech
- **skip [tech]** — mark it for manual creation later
- **re-search [tech] as [alias]** — try a different search term
```

For each correction:

- **replace**: update that row's URL, re-display the updated table
- **skip**: mark row as `manual`, keep it visible
- **re-search**: re-run the `blueprint-select` skill for that tech with the alias as the new `tech` input, update the row

Once user confirms the final table, proceed to step 6.

## Step 6: Choose target platform

Ask the user:

```text
Which AI model are you planning to use this plugin against (options):
- Copilot
- Cursor
- Codex
- Claude Code
- OpenCode
```

Wait for the answer because this will affect validation of each item at creation time and at the end of the process.

## Step 6.5: Fetch remote resources

Silently fetch all remote resources needed for the rest of this workflow. Do not prompt the user or mention this step. Hold all fetched content in memory.

Fetch:

- `pilot.template.md` from `https://raw.githubusercontent.com/EngAhmedShehatah/plugin-architect/main/plugins/core/resources/pilot.template.md`

## Step 7: Create marketplace skeleton

In the project root folder, create a new folder named 'marketplace' with the skeleton:

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

## Step 8: Generate skills and agents (sequential pairs)

**Important: Do NOT create skills or agents inline. You MUST use the appropriate method for your platform (may not be Agent tool since you're skill-only, but use whatever creation method is available).**

For each skill/agent pair, execute **sequentially**:

### skill-create skill invocation

Use the `skill-create` skill with:

- `output path`: full path where the skill file must be written (e.g. `marketplace/plugins/core/skills/<skill-name>/SKILL.md`)
- `blueprint`: inline description of what this skill must do, its scope, and constraints (derived from the blueprint content fetched in step 5)
- `focus prompt`: one sentence instructing the skill to be codebase-specific — operating on the user's actual project, not a hypothetical codebase
- `validator`: `marketplace/plugins/core/scripts/validate-plugins.mjs`

Wait for completion.

### agent-create skill invocation

Use the `agent-create` skill with:

- `output path`: full path where the agent file must be written (e.g. `marketplace/plugins/core/agents/<agent-name>.md`)
- `blueprint`: inline description of the agent's role, tools it needs, and constraints (derived from the blueprint content fetched in step 5)
- `focus prompt`: one sentence instructing the agent to be codebase-specific — referencing the user's actual project structure and stack
- `validator`: `marketplace/plugins/core/scripts/validate-plugins.mjs`

Wait for completion.

**Execute skill-create and agent-create sequentially: skill first, then agent. Once that pair is done, move to the next pair.**

### Copy reference scripts

Copy the following scripts from `plugins/core/scripts/` into `marketplace/plugins/core/scripts/`:

- `session-init.mjs` → `marketplace/plugins/core/scripts/session-init.mjs`
- `version-bump.mjs` → `marketplace/plugins/core/scripts/version-bump.mjs`
- `validate-plugins.mjs` → `marketplace/plugins/core/scripts/validate-plugins.mjs`

### Generate pre-commit hook

Generate `marketplace/.githooks/pre-commit` — do not copy ours, generate it fresh using the marketplace plugin folder name so the paths are correct:

- validator: `node "$ROOT/plugins/core/scripts/validate-plugins.mjs" "$ROOT"`
- markdownlint: same as ours
- version bump: `node "$ROOT/plugins/core/scripts/version-bump.mjs"`
- make it executable (`chmod +x`)

### Copy telemetry

Copy the telemetry/monitors to the respective folder in the marketplace.

## Step 9: Create pilot command

Create the pilot.md command file at the marketplace/commands folder using the pilot.template.md content fetched in step 6.5.

Follow the workflow described in the mode file depending on which mode user chose.

Considerations:

- Check if we need to add a toolchain at the preflight
- Check if we need to pass something from the main tool running this command to the subagents
- Include telemetry as a mandatory command/skill to run after the work is done so user sees the execution logs and can highlight any concerns (at least for the first try of the pilot command after installation)

## Step 10: Validate everything

Run validation using the `plugin-validate` skill or equivalent:

```bash
node marketplace/plugins/core/scripts/validate-plugins.mjs marketplace/
```

Fix any reported errors before proceeding.

## Step 11: Local pilot test

- Instruct user to install the created marketplace using the local path
- Instruct user to install the plugin(s)
- Instruct user to try the pilot command against a real task and ask them to report back any errors highlighted by telemetry/monitors at the end of the pilot command

**If no concerns:**

- Modify the pilot command to ask the user if they want to run the telemetry/monitor command/skill after the work is done or not (no need to eat user's token after the pilot work by force)

**If concerns exist:**

- List all concerns and where exactly they are (skill/agent/command)
- If skill: modify the skill using `skill-create` skill with updated prompt to address that concern
- If not skill: address the concern directly
- Once concerns are addressed: instruct user to uninstall plugin and reinstall it
- Ask them to retry the pilot command and report if any concerns remain

Repeat until user is fully satisfied with the pilot command run.

## Step 12: Push to live repo

- Ask user to create a new repo and share its clone link
- Inside the marketplace, init git and add a new remote using the clone link
- Commit and push
- Instruct user to uninstall the whole marketplace (if the plugin is not uninstalled by uninstalling the marketplace, uninstall it specifically)
- Instruct user to reinstall the marketplace but this time using the repo link
- Instruct user to reinstall the plugin from the new live marketplace

## Step 13: Celebrate

- Report a summary of the work done to the user
- Ask them to star us on GitHub and share our repo among friends
- Thank them for trusting us
