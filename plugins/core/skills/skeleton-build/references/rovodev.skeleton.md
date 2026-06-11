# Atlassian Rovo Dev — Plugin Skeleton Reference

Source: Atlassian Rovo Dev installer integration — skills registry
Surfaces: CLI

## Folder Structure

Rovo Dev plugins integrate via the skills registry. No project-level config file is required. Skills are installed with `npx skills add` and discovered automatically by Rovo Dev.

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
npx skills add github:<org>/<repo> -a rovodev --yes --all
```

## Key Rules

- No project-level config file is required — Rovo Dev discovers skills via the registry
- Skills live under `skills/<name>/SKILL.md`
- `README.md` documents install instructions and available skills
