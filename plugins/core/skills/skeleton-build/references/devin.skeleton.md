# Devin — Plugin Skeleton Reference

Source: Devin official docs — playbook and project instructions
Surfaces: CLI

## Folder Structure

Devin plugins use a `playbook.md` file at the project root to inject agent instructions and skill awareness into Devin's context.

```text
<output-root>/
├── playbook.md                     # Always-on agent instructions and skill awareness
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## playbook.md Format

`playbook.md` is a plain markdown file that Devin reads as project instructions:

```markdown
# Plugin Name — Playbook

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

## Trigger

When the user asks to <action>, read and follow `skills/<skill-name>/SKILL.md`.
```

## Key Rules

- `playbook.md` lives at the project root — Devin reads it as project context
- Keep the playbook concise and directive
- Skills live under `skills/<name>/SKILL.md` — referenced from `playbook.md`
- Do not include Claude Code `.claude-plugin/` folders for Devin
- Do not include Copilot `plugin.json` or `.github/` for Devin
- `README.md` documents install instructions and available skills
