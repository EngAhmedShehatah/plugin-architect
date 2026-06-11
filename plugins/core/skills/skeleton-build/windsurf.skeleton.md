# Windsurf — Plugin Skeleton Reference

Source: Windsurf official docs — rules and `.windsurfrules` file
Surfaces: Desktop (Windsurf IDE)

## Folder Structure

Windsurf plugins use a `.windsurfrules` file at the project root to inject skill instructions into the Cascade agent context.

```text
<output-root>/
├── .windsurfrules                  # Always-on plugin awareness rule
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## Rule File Format

`.windsurfrules` is a plain markdown file loaded by Windsurf for every Cascade session in the project:

```markdown
# Plugin Name

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

## Trigger

When the user asks to <action>, read and follow `skills/<skill-name>/SKILL.md`.
```

## Key Rules

- `.windsurfrules` lives at the project root — one file per project
- The file is always-on; there is no per-rule activation toggle
- Keep the rules file concise — it is injected every session
- Skills live under `skills/<name>/SKILL.md` — referenced from `.windsurfrules`
- Do not include Claude Code `.claude-plugin/` folders for Windsurf
- Do not include Copilot `plugin.json` or `.github/` for Windsurf
- `README.md` documents install instructions and available skills
