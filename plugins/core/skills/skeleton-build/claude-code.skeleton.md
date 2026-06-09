# Claude Code — Plugin Skeleton Reference

Source: Context7 — `/websites/code_claude` (official docs)
Surfaces: CLI, Desktop, VS Code Extension

## Folder Structure

plugin-architect generates a marketplace folder that contains the Claude Code marketplace manifest at the top level and the actual plugin nested under `plugins/core/`.

The nested `plugins/core/` folder uses the official Claude Code plugin layout from the docs:

```text
marketplace/
├── .claude-plugin/
│   └── plugin.json              # Marketplace manifest
├── plugins/
│   └── core/
│       ├── .claude-plugin/
│       │   └── plugin.json      # Plugin manifest (required)
│       ├── skills/              # Skill definitions (optional dir)
│       │   └── <name>/
│       │       ├── SKILL.md
│       │       └── scripts/     # Skill-specific scripts
│       ├── commands/            # Slash commands (optional)
│       │   └── <name>.md
│       ├── hooks/               # Hook configs (optional)
│       │   └── hooks.json
│       ├── scripts/             # Hook/utility scripts (optional)
│       │   └── <name>.sh/.mjs/.py
│       ├── output-styles/       # Output style defs (optional)
│       │   └── <name>.md
│       ├── themes/              # Color themes (optional)
│       │   └── <name>.json
│       ├── monitors/            # Background monitors (optional)
│       │   └── monitors.json
│       ├── bin/                 # Executables in PATH (optional)
│       │   └── <tool>
│       ├── .mcp.json            # MCP server config (optional)
│       ├── .lsp.json            # LSP server config (optional)
│       └── settings.json        # Default settings (optional)
├── LICENSE
└── CHANGELOG.md
```

## plugin.json Schema

```json
{
  "name": "plugin-name",
  "displayName": "Plugin Name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "skills": "./custom/skills/",
  "commands": ["./custom/commands/special.md"],
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "outputStyles": "./styles/",
  "lspServers": "./.lsp.json",
  "experimental": {
    "themes": "./themes/",
    "monitors": "./monitors.json"
  },
  "dependencies": [
    "helper-lib",
    { "name": "secrets-vault", "version": "~2.1.0" }
  ]
}
```

## Key Rules

- Top-level `marketplace/.claude-plugin/plugin.json` is the marketplace manifest
- Nested `marketplace/plugins/core/.claude-plugin/plugin.json` is the plugin manifest
- `.claude-plugin/` is for `plugin.json` ONLY — all other dirs live at the plugin root
- In plugin-architect output, the plugin root is `marketplace/plugins/core/`
- `skills/`, `commands/`, `hooks/` all live at the nested plugin root, NOT inside `.claude-plugin/`
- `plugin.json` supports `string`, `array`, or `object` values for paths
- Hooks config: `hooks/hooks.json` (or path specified in manifest)
- Scripts called by hooks must have proper shebang and execute permissions
- `bin/` executables are added to the Bash tool's PATH automatically
- Marketplace manifest and plugin manifest are separate files
