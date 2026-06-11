# opencode — Plugin Skeleton Reference

Source: opencode official docs — native plugin system
Surfaces: CLI

## Folder Structure

opencode plugins use a native ESM plugin module loaded from `~/.config/opencode/plugins/<name>/`. The skeleton provides the plugin source files plus skill definitions that are copied into opencode's skills directory on install.

```text
<output-root>/
├── src/
│   └── plugins/
│       └── opencode/
│           ├── plugin.js           # ESM plugin module (required)
│           └── package.json        # "type": "module" marker (required)
├── skills/
│   └── <skill-name>/
│       └── SKILL.md               # Skill definitions
├── AGENTS.md                       # @-includes all skill files
├── README.md
└── LICENSE
```

## plugin.js Structure

The plugin module exports a default object with lifecycle hooks:

```javascript
export default {
  name: 'plugin-name',

  hooks: {
    'session.created': async () => {
      // Inject skill awareness into the session context.
      // Return { context: '<markdown string>' } to append to system prompt.
      return { context: '...' };
    },

    'tui.prompt.append': async ({ prompt }) => {
      // Optionally append text to the user prompt before it is sent.
      // Return null for no-op.
      return null;
    },
  },
};
```

## package.json

```json
{
  "type": "module"
}
```

## AGENTS.md Format

`AGENTS.md` uses `@`-include syntax to pull in all skill definitions. opencode resolves each `@<path>` and loads the content as agent instructions:

```markdown
@./skills/<skill-name>/SKILL.md
@./skills/<other-skill>/SKILL.md
```

## Key Rules

- `src/plugins/opencode/plugin.js` is the entry point — must be ESM (`export default`)
- `src/plugins/opencode/package.json` must contain `"type": "module"`
- The installer copies `src/plugins/opencode/` to `~/.config/opencode/plugins/<name>/`
- The installer copies `skills/` to `~/.config/opencode/skills/<name>/`
- `session.created` hook injects skill awareness via `{ context: string }` return value
- `AGENTS.md` @-includes all skills so opencode auto-discovers them
- Do not include Claude Code `.claude-plugin/` folders for opencode
- Do not include Copilot `plugin.json` or `.github/` for opencode
- `README.md` documents install instructions and available skills
