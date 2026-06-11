# OpenHands — Plugin Skeleton Reference

Source: OpenHands official docs — microagents and `.openhands/` directory
Surfaces: CLI

## Folder Structure

OpenHands plugins use custom microagent definitions placed in `.openhands/microagents/`. Each markdown file in that directory is loaded as a microagent with its own trigger keyword.

```text
<output-root>/
├── .openhands/
│   └── microagents/
│       └── plugin-name.md          # Microagent definition with trigger keyword
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## Microagent File Format

Each `.md` file in `.openhands/microagents/` defines a microagent:

```markdown
---
name: plugin-name
agent: CodeActAgent
triggers:
  - build plugin
  - generate plugin
---

# Plugin Name

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

When triggered, read and follow `skills/<skill-name>/SKILL.md` exactly.
```

## Key Rules

- Microagent files live under `.openhands/microagents/` with the `.md` extension
- The `triggers` frontmatter field lists phrases that activate this microagent
- The `agent` field specifies the OpenHands agent type (use `CodeActAgent` for code tasks)
- Skills live under `skills/<name>/SKILL.md` — referenced from the microagent definition
- Do not include Claude Code `.claude-plugin/` folders for OpenHands
- Do not include Copilot `plugin.json` or `.github/` for OpenHands
- `README.md` documents install instructions and available skills
