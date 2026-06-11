# Cursor — Plugin Skeleton Reference

Source: Cursor official docs — rule files and `.cursor/rules/` directory
Surfaces: Desktop (Cursor IDE)

## Folder Structure

Cursor plugins use rule files to inject skill instructions into the agent context. The modern format is `.cursor/rules/*.mdc` files (Project Rules). The legacy format `.cursorrules` is also supported.

```text
<output-root>/
├── .cursor/
│   └── rules/
│       └── plugin-architect.mdc    # Always-on plugin awareness rule
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## Rule File Format

`.mdc` rule files use frontmatter to control activation:

```markdown
---
description: Brief rule description (shown in Cursor UI)
globs: **/*
alwaysApply: true
---

Rule content here. Plain markdown. Injected into the agent context
on every session when alwaysApply is true, or when matching globs.
```

## Key Rules

- Rule files live under `.cursor/rules/` with the `.mdc` extension
- `alwaysApply: true` injects the rule every session without user trigger
- `globs` scopes the rule to specific file patterns (omit when always-on)
- Skills live under `skills/<name>/SKILL.md` — skill content is referenced from rule files
- One rule file per concern; keep rule files short and focused
- Do not include Claude Code `.claude-plugin/` folders for Cursor
- Do not include Copilot `plugin.json` or `.github/` for Cursor
- `README.md` documents install instructions and available skills
