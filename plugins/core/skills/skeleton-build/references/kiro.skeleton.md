# Kiro CLI — Plugin Skeleton Reference

Source: Kiro CLI installer integration — skills registry
Surfaces: CLI

## Folder Structure

Kiro CLI plugins integrate via the skills registry. No project-level config file is required. Skills are installed with `npx skills add` and discovered automatically by Kiro.

```text
<output-root>/
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## Installation

```sh
npx skills add github:<org>/<repo> -a kiro-cli --yes --all
```

## Key Rules

- No project-level config file is required — Kiro discovers skills via the registry
- Skills live under `skills/<name>/SKILL.md`
- `README.md` documents install instructions and available skills
