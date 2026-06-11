# Testing surfaces

This file tracks the install and live-test surfaces for each supported AI tool.
Add one row per tool and keep the columns in the same order.

| Tool | CLI | Desktop app | VS Code extension | Notes |
| --- | --- | --- | --- | --- |
| Claude Code | ✅ Verified | ✅ Verified | ✅ Verified | Install plugin-architect from the repo, install the core plugin, then invoke the build-plugin skill and verify the full flow works on each surface. |
| GitHub Copilot | ⏳ Pending | N/A | ⏳ Pending | Clone the repo, open in VS Code with Copilot enabled. Invoke the build-plugin skill by describing what you want. Verify the sequential skill flow completes end-to-end. |
| Gemini CLI | ⏳ Pending | N/A | N/A | Install via `gemini extensions install` or `npx skills add -a gemini`. Context auto-loaded from `GEMINI.md` @-includes on session start. Invoke with "build plugin". |
| opencode | ⏳ Pending | N/A | N/A | Native plugin at `src/plugins/opencode/plugin.js`. Copy to `~/.config/opencode/plugins/` via installer. Context injected on `session.created` + `AGENTS.md` @-includes. |
| Codex CLI | ⏳ Pending | N/A | N/A | `.codex-plugin/plugin.json` manifest. Skills invoked as `@<skill-name>`. `.codex/hooks.json` injects awareness on session start. Slash commands via `commands/*.toml`. |
| Cursor | N/A | ⏳ Pending | N/A | Rules delivered via `.cursor/rules/*.mdc` with `alwaysApply: true`. Skills via `npx skills add -a cursor`. |
| Windsurf | N/A | ⏳ Pending | N/A | Rules via `.windsurfrules` at project root. Skills via `npx skills add -a windsurf`. |
| Cline | N/A | N/A | ⏳ Pending | Rules via `.clinerules` at project root. Skills via `npx skills add -a cline`. Open in VS Code with Cline extension installed. |
| OpenClaw | N/A | ⏳ Pending | N/A | SOUL.md bootstrap snippet (marker-fenced) + skill install via `node bin/install.js --only openclaw`. Activation rule from `src/rules/plugin-architect-openclaw-bootstrap.md`. |

## Usage pattern for future tools

- Add a new row for each additional tool.
- Keep the same column order so the matrix stays comparable across tools.
- Mark a surface as verified only after a real install/test on that surface.
- If a tool is not supported on a surface, write `N/A` instead of leaving it blank.
