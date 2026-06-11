# Google Antigravity — Plugin Skeleton Reference

Source: Google Antigravity installer detection — `.gemini/antigravity/` directory presence
Surfaces: CLI (soft probe — opt-in via installer)

## Folder Structure

Google Antigravity plugins place configuration and skill definitions inside `.gemini/antigravity/` at the project root. Antigravity detects this directory on startup.

```text
<output-root>/
├── .gemini/
│   └── antigravity/
│       └── instructions.md         # Plugin awareness and skill instructions
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## instructions.md Format

`.gemini/antigravity/instructions.md` is loaded as project context:

```markdown
# Plugin Name

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

## Trigger

When the user asks to <action>, read and follow `skills/<skill-name>/SKILL.md`.
```

## Key Rules

- The `.gemini/antigravity/` directory at the project root is required — detected by presence
- This platform is a soft probe — only installed via `node bin/install.js --only antigravity`
- Skills live under `skills/<name>/SKILL.md` — referenced from the instructions file
- Do not include Claude Code `.claude-plugin/` folders for Antigravity
- `README.md` documents install instructions and available skills
