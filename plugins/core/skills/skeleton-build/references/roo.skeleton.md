# Roo Code — Plugin Skeleton Reference

Source: Roo Code official docs — rules and `.roorules` file
Surfaces: VS Code Extension

## Folder Structure

Roo Code plugins use a `.roorules` file at the project root to inject skill instructions into Roo's context for every task in the project.

```text
<output-root>/
├── .roorules                       # Always-on plugin awareness rule
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## Rule File Format

`.roorules` is a plain markdown file loaded by Roo Code for every task in the project:

```markdown
# Plugin Name

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

## Trigger

When the user asks to <action>, read and follow `skills/<skill-name>/SKILL.md`.
```

## Key Rules

- `.roorules` lives at the project root — one file per project
- The file is always-on; Roo loads it automatically for every task
- Keep the rules file concise — it is injected every session
- Skills live under `skills/<name>/SKILL.md` — referenced from `.roorules`
- Do not include Claude Code `.claude-plugin/` folders for Roo Code
- Do not include Copilot `plugin.json` or `.github/` for Roo Code
- `README.md` documents install instructions and available skills
