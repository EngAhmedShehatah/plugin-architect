# Warp — Plugin Skeleton Reference

Source: Warp installer integration — skills registry
Surfaces: Desktop (Warp terminal)

## Folder Structure

Warp plugins integrate via the skills registry. No project-level config file is required. Skills are installed with `npx skills add` and discovered automatically by Warp.

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
npx skills add github:<org>/<repo> -a warp --yes --all
```

## Key Rules

- No project-level config file is required — Warp discovers skills via the registry
- Skills live under `skills/<name>/SKILL.md`
- `README.md` documents install instructions and available skills
