# Kilo Code — Plugin Skeleton Reference

Source: Kilo Code official docs — rule files and `.kilocode/rules/` directory
Surfaces: VS Code Extension

## Folder Structure

Kilo Code plugins use `.mdc` rule files placed in `.kilocode/rules/` to inject skill instructions into the agent context. The format mirrors Cursor's Project Rules system.

```text
<output-root>/
├── .kilocode/
│   └── rules/
│       └── plugin-name.mdc         # Always-on plugin awareness rule
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
description: Brief rule description
globs: **/*
alwaysApply: true
---

Rule content here. Plain markdown. Injected into the agent context
on every session when alwaysApply is true.
```

## Key Rules

- Rule files live under `.kilocode/rules/` with the `.mdc` extension
- `alwaysApply: true` injects the rule every session without user trigger
- Skills live under `skills/<name>/SKILL.md` — referenced from rule files
- One rule file per concern; keep rule files short and focused
- Do not include Claude Code `.claude-plugin/` folders for Kilo Code
- Do not include Copilot `plugin.json` or `.github/` for Kilo Code
- `README.md` documents install instructions and available skills
