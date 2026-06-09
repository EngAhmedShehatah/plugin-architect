---
name: build-plugin
description: Builds a project-specific plugin using a sequential, skill-only workflow. Scans the target project, selects the right skills, generates the marketplace output, validates it, and prepares it for install and publish.
input:
  project_path: absolute path to the target project root
output:
  marketplace: path to the generated marketplace folder
---

## What this skill does

Builds a custom plugin for the user's project using a single sequential flow. It scans the target project, classifies the detected technologies, picks the right blueprint skills, generates the plugin skeleton, validates the output, and prepares the plugin for install and publish.

This skill is intentionally *skill-only* — no agents, no platform routing, no parallel subagents.

## How to execute this skill

### Step 1: Greet and orient

- Greet the user by name
- Say you are starting with project scans
- Keep the explanation short and direct

### Step 2: Sequential scans

Run the following skills one at a time and show each output before moving on:

1. `git-detect`
2. `schema-scan`
3. `tech-stack-detect`

After the three scans complete, summarize the findings together.

### Step 3: Classify the detected techs

Split the detected tech list into two groups:

- **skill-worthy techs**: frameworks, languages, test runners, databases, build tools, runtime platforms, and core infrastructure
- **utility/infra techs**: auth tokens, docs tooling, analytics, minor libraries, and implementation details

Show the proposed split to the user and wait for confirmation before searching for blueprints.

### Step 4: Search blueprints sequentially

For each confirmed skill-worthy tech, run `blueprint-select` and review the result before moving to the next tech.

- Keep the search list narrow
- Skip utilities unless the user explicitly adds them
- Prefer practical, battle-tested skills over speculative ones

### Step 5: Select the build mode

Ask which mode the user wants:

- **Light** — minimal plugin surface, fastest to generate
- **Medium** — split by concern
- **Deep** — split by domain and concern

Explain the trade-off briefly and wait for confirmation.

### Step 6: Generate the skeleton

Use `skeleton-build` to generate the plugin skeleton for the target platform.

Rules:

- Keep the output inside the generated `marketplace/` folder
- Keep the generated plugin consistent across supported surfaces
- Use the detected project structure to shape the generated files

### Step 7: Create the skills

Use `skill-create` to generate the skills selected for the project.

Rules:

- Reuse the user's naming conventions
- Keep skill descriptions concise and action-oriented
- Favor reusable, portable skill text

### Step 8: Validate the plugin

Use `plugin-validate` to validate the generated output.

Validation must cover:

- folder structure
- manifest completeness
- required files
- relative paths
- Markdown validity

### Step 9: Report the output

Return a JSON object with:

```json
{
  "marketplace": "path/to/marketplace",
  "platform": "sequential",
  "execution": "sequential",
  "summary": "Short summary of what was built"
}
```

## Constraints

- Do not mention platform routing; there is no routing in this build
- Do not use agents
- Do not spawn parallel workers
- Only create files inside the generated marketplace
- Never modify files outside the project root
