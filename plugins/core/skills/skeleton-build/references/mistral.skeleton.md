# Mistral Vibe — Plugin Skeleton Reference

Source: Mistral Vibe installer integration — skills registry
Surfaces: CLI

## Folder Structure

Mistral Vibe plugins integrate via the skills registry. No project-level config file is required. Skills are installed with `npx skills add` and discovered automatically by Mistral Vibe.

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
npx skills add github:<org>/<repo> -a mistral-vibe --yes --all
```

## Key Rules

- No project-level config file is required — Mistral Vibe discovers skills via the registry
- Skills live under `skills/<name>/SKILL.md`
- `README.md` documents install instructions and available skills
