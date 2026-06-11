# Block Goose — Plugin Skeleton Reference

Source: Block Goose official docs — extensions and config
Surfaces: CLI

## Folder Structure

Block Goose plugins register skills via a `.goose/config.yaml` extension entry at the project root. Skill files are placed under `skills/`.

```text
<output-root>/
├── .goose/
│   └── config.yaml                 # Extension registration
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## config.yaml Format

```yaml
extensions:
  - name: plugin-name
    description: Brief description of what this plugin provides.
    skills_path: ../skills/
```

## Key Rules

- `.goose/config.yaml` lives inside a `.goose/` folder at the project root
- The `skills_path` field is relative to the `.goose/` directory
- Skills live under `skills/<name>/SKILL.md` — registered via `skills_path`
- Do not include Claude Code `.claude-plugin/` folders for Goose
- Do not include Copilot `plugin.json` or `.github/` for Goose
- `README.md` documents install instructions and available skills
