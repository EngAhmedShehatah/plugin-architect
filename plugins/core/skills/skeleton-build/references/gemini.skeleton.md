# Gemini CLI — Plugin Skeleton Reference

Source: Gemini CLI official docs — extensions and `gemini-extension.json`
Surfaces: CLI, Desktop

## Folder Structure

Gemini CLI plugins use a `gemini-extension.json` manifest at the project root and a context file (named by `contextFileName`) that is injected into every Gemini session.

```text
<output-root>/
├── gemini-extension.json           # Extension manifest (required)
├── GEMINI.md                       # Context file — @-includes skill files
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── README.md
└── LICENSE
```

## gemini-extension.json Schema

```json
{
  "name": "plugin-name",
  "description": "Brief plugin description",
  "version": "1.0.0",
  "contextFileName": "GEMINI.md"
}
```

## Context File Format

The context file uses `@`-include syntax to pull in skill definitions. Gemini CLI resolves each `@<path>` and concatenates the content into the system prompt:

```markdown
@./skills/<skill-name>/SKILL.md
@./skills/<other-skill>/SKILL.md
```

## Key Rules

- `gemini-extension.json` lives at the project root — required for extension discovery
- `contextFileName` must match the name of the context file in the project root
- The context file uses `@./path/to/file.md` syntax — one include per line, no other content
- Include every skill SKILL.md so Gemini has full knowledge of available skills
- Skills live under `skills/<name>/SKILL.md` — @-included from the context file
- `version` in `gemini-extension.json` must be a valid semver string
- Do not include Claude Code `.claude-plugin/` folders for Gemini
- Do not include Copilot `plugin.json` or `.github/` for Gemini
- `README.md` documents install instructions and available skills
