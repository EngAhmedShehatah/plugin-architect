# Continue — Plugin Skeleton Reference

Source: Continue official docs — rules and `.continue/rules/` directory
Surfaces: VS Code Extension

## Folder Structure

Continue plugins use markdown rule files placed in `.continue/rules/` to inject skill instructions into Continue's context for every session in the project.

```text
<output-root>/
├── .continue/
│   └── rules/
│       └── plugin-name.md          # Always-on plugin awareness rule
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## Rule File Format

Files in `.continue/rules/` are plain markdown loaded by Continue as system instructions:

```markdown
# Plugin Name

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

## Trigger

When the user asks to <action>, read and follow `skills/<skill-name>/SKILL.md`.
```

## Key Rules

- Rule files live under `.continue/rules/` with the `.md` extension
- Continue loads all files in `.continue/rules/` as additional system instructions
- Keep rule files concise — they are injected every session
- Skills live under `skills/<name>/SKILL.md` — referenced from rule files
- Do not include Claude Code `.claude-plugin/` folders for Continue
- Do not include Copilot `plugin.json` or `.github/` for Continue
- `README.md` documents install instructions and available skills
