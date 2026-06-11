# Qoder — Plugin Skeleton Reference

Source: Qoder installer detection — `.qoder/` directory presence
Surfaces: CLI (soft probe — opt-in via installer)

## Folder Structure

Qoder plugins place configuration and skill definitions inside a `.qoder/` directory at the project root. Qoder detects this directory on startup and loads its contents.

```text
<output-root>/
├── .qoder/
│   └── instructions.md             # Plugin awareness and skill instructions
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## instructions.md Format

`.qoder/instructions.md` is loaded by Qoder as project context:

```markdown
# Plugin Name

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

## Trigger

When the user asks to <action>, read and follow `skills/<skill-name>/SKILL.md`.
```

## Key Rules

- The `.qoder/` directory at the project root is required — Qoder detects it by presence
- This platform is a soft probe — only installed via `node bin/install.js --only qoder`
- Skills live under `skills/<name>/SKILL.md` — referenced from `.qoder/instructions.md`
- Do not include Claude Code `.claude-plugin/` folders for Qoder
- `README.md` documents install instructions and available skills
