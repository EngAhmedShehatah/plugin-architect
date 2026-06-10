---
name: build-plugin
description: Sequential build flow for platforms without agent-style parallel execution. Use this skill on skill-only surfaces, and use the command variant on Claude Code / OpenCode.
---

# build-plugin — sequential skill flow

Use this skill when the host platform cannot run the command-based parallel flow.

## What this skill does

- Runs the build in sequence instead of in parallel
- Keeps the same target-platform choice list as the command flow
- Supports the `multi-platform` option
- Keeps agents available only for surfaces that support them (`Claude Code` and `OpenCode`)

## Workflow

1. Scan the project sequentially
2. Classify techs before blueprint search
3. Ask monorepo questions if needed
4. Ask for build mode
5. Search blueprints one tech at a time
6. Choose the target platform from the full caveman-supported list
7. Build the skeleton
8. Generate skills, and generate agents only when the target platform supports them
9. Create the pilot command
10. Validate the result
11. Install and test
12. Publish if the user is happy
13. Summarize

## Platform rules

- Claude Code and OpenCode can install the agent-backed surface.
- Other single platforms should stay skill-first.
- `multi-platform` means copy the full infrastructure pattern and keep every supported file/folder surface.

## References

- `../../commands/references/sequential-flow.md`
