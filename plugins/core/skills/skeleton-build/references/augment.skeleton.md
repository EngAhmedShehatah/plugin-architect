# Augment Code — Plugin Skeleton Reference

Source: Augment Code official docs — skills registry integration
Surfaces: VS Code Extension, JetBrains Plugin

## Folder Structure

Augment Code plugins integrate via the skills registry. Skills are installed with `npx skills add` and discovered automatically by Augment in both VS Code and JetBrains environments.

```text
<output-root>/
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## Installation

Skills are published to the skills registry and installed into Augment via:

```sh
npx skills add github:<org>/<repo> -a augment --yes --all
```

## Key Rules

- No project-level config file is required for Augment integration
- Skills are discovered by Augment through the installed skills registry entry
- The same skill set works across both VS Code and JetBrains surfaces
- Do not include Claude Code `.claude-plugin/` folders for Augment
- Do not include Copilot `plugin.json` or `.github/` for Augment
- `README.md` documents install instructions and available skills
