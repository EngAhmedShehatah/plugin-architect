# Aider Desk — Plugin Skeleton Reference

Source: Aider official docs — conventions file and project context
Surfaces: CLI

## Folder Structure

Aider plugins use a `CONVENTIONS.md` file at the project root to inject coding conventions and skill awareness into Aider's context automatically.

```text
<output-root>/
├── CONVENTIONS.md                  # Always-on plugin awareness and conventions
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## CONVENTIONS.md Format

`CONVENTIONS.md` is a plain markdown file that Aider reads at startup:

```markdown
# Plugin Name — Conventions

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

## Trigger

When the user asks to <action>, read and follow `skills/<skill-name>/SKILL.md`.
```

## Key Rules

- `CONVENTIONS.md` lives at the project root — Aider loads it automatically
- The file is read once at session start; keep it concise
- Skills live under `skills/<name>/SKILL.md` — referenced from `CONVENTIONS.md`
- Do not include Claude Code `.claude-plugin/` folders for Aider
- Do not include Copilot `plugin.json` or `.github/` for Aider
- `README.md` documents install instructions and available skills
