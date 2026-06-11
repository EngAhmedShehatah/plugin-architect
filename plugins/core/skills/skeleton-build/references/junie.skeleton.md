# JetBrains Junie — Plugin Skeleton Reference

Source: JetBrains Junie official docs — guidelines and `.junie/` directory
Surfaces: JetBrains Plugin (soft probe — opt-in via installer)

## Folder Structure

Junie plugins use a `guidelines.md` file inside `.junie/` at the project root to inject project-specific instructions into Junie's context.

```text
<output-root>/
├── .junie/
│   └── guidelines.md               # Always-on plugin awareness and project guidelines
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## guidelines.md Format

`.junie/guidelines.md` is a plain markdown file that Junie reads as project context:

```markdown
# Plugin Name — Guidelines

Brief description of what this plugin provides.

## Skills

- `<skill-name>` — What it does. Read `skills/<skill-name>/SKILL.md` before executing.

## Trigger

When the user asks to <action>, read and follow `skills/<skill-name>/SKILL.md`.
```

## Key Rules

- `.junie/guidelines.md` is the only supported entry point — Junie reads it automatically
- Keep guidelines concise — injected every session
- Skills live under `skills/<name>/SKILL.md` — referenced from `guidelines.md`
- This platform is a soft probe — only installed via `node bin/install.js --only junie`
- Do not include Claude Code `.claude-plugin/` folders for Junie
- Do not include Copilot `plugin.json` or `.github/` for Junie
- `README.md` documents install instructions and available skills
