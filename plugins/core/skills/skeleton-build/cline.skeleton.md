# Cline — Plugin Skeleton Reference

Source: Cline official docs — rules and `.clinerules` file
Surfaces: VS Code Extension

## Folder Structure

Cline plugins use a `.clinerules` file at the project root to inject skill instructions into Cline's context for every task.

```text
<output-root>/
├── .clinerules                     # Always-on plugin awareness rule
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## Rule File Format

`.clinerules` is a plain markdown file loaded by Cline for every task in the project:

```markdown
# Plugin Name

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

## Trigger

When the user asks to <action>, read and follow `skills/<skill-name>/SKILL.md`.
```

## Key Rules

- `.clinerules` lives at the project root — one file per project
- The file is always-on; Cline loads it automatically for every task
- Keep the rules file concise — it is injected every session
- Skills live under `skills/<name>/SKILL.md` — referenced from `.clinerules`
- Do not include Claude Code `.claude-plugin/` folders for Cline
- Do not include Copilot `plugin.json` or `.github/` for Cline
- `README.md` documents install instructions and available skills
