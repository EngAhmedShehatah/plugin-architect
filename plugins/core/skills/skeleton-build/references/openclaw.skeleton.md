# OpenClaw — Plugin Skeleton Reference

Source: OpenClaw official docs — workspace skills and SOUL.md
Surfaces: Desktop (OpenClaw workspace)

## Folder Structure

OpenClaw plugins install a skill file into `~/.openclaw/workspace/skills/` and append a marker-fenced awareness snippet to `~/.openclaw/workspace/SOUL.md`. The skeleton provides the skill source file; the installer handles workspace placement.

```text
<output-root>/
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definition (installed to workspace)
├── README.md
└── LICENSE
```

## SOUL.md Snippet

The installer appends this marker-fenced block to `~/.openclaw/workspace/SOUL.md`:

```markdown
<!-- plugin-name-begin -->
## Plugin Name (available)

Plugin Name is installed in this workspace.

To start: say "<trigger phrase>". The full workflow lives at:

  skills/<skill-name>/SKILL.md

Read the skill file before acting.
<!-- plugin-name-end -->
```

## Installation

The unified installer handles OpenClaw deployment:

```sh
node bin/install.js --only openclaw
```

This copies `skills/<skill-name>/SKILL.md` to `~/.openclaw/workspace/skills/<skill-name>/SKILL.md` and appends the SOUL.md snippet.

## Key Rules

- No project-level config file is created in the output root
- The skill file is the only artifact in the skeleton — deployment is workspace-level
- SOUL.md snippet uses HTML comment markers (`<!-- name-begin -->` / `<!-- name-end -->`) for idempotent install/uninstall
- Do not include Claude Code `.claude-plugin/` folders for OpenClaw
- Do not include Copilot `plugin.json` or `.github/` for OpenClaw
- `README.md` documents install instructions and available skills
