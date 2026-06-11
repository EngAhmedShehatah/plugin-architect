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
| Continue | N/A | N/A | ⏳ Pending | VS Code extension (`continue.continue`). Skills via `npx skills add -a continue`. Auto-detected by installer. |
| Kilo Code | N/A | N/A | ⏳ Pending | VS Code extension (`kilocode`). Skills via `npx skills add -a kilo`. Auto-detected by installer. |
| Roo Code | N/A | N/A | ⏳ Pending | VS Code and Cursor extension (`roo-cline`). Skills via `npx skills add -a roo`. Auto-detected by installer. |
| Augment Code | N/A | N/A | ⏳ Pending | VS Code extension and JetBrains plugin (`augment`). Skills via `npx skills add -a augment`. Auto-detected by installer. Test both IDE targets. |
| Aider Desk | ⏳ Pending | N/A | N/A | Detected via `aider` command on PATH. Skills via `npx skills add -a aider-desk`. |
| Sourcegraph Amp | ⏳ Pending | N/A | N/A | Detected via `amp` command on PATH. Skills via `npx skills add -a amp`. |
| Block Goose | ⏳ Pending | N/A | N/A | Detected via `goose` command on PATH. Skills via `npx skills add -a goose`. |
| Trae | ⏳ Pending | N/A | N/A | Detected via `trae` command on PATH. Skills via `npx skills add -a trae`. |
| Warp | N/A | ⏳ Pending | N/A | Desktop terminal app. Skills via `npx skills add -a warp`. Detected via `warp` command on PATH. |
| Devin | ⏳ Pending | N/A | N/A | Detected via `devin` command on PATH. Skills via `npx skills add -a devin`. |
| Replit Agent | ⏳ Pending | N/A | N/A | Detected via `replit` command on PATH. Skills via `npx skills add -a replit`. |
| OpenHands | ⏳ Pending | N/A | N/A | Detected via `openhands` command on PATH. Skills via `npx skills add -a openhands`. |
| Rovo Dev | ⏳ Pending | N/A | N/A | Detected via `rovodev` command on PATH. Skills via `npx skills add -a rovodev`. |
| ForgeCode | ⏳ Pending | N/A | N/A | Detected via `forge` command on PATH. Skills via `npx skills add -a forgecode`. |
| Mistral Vibe | ⏳ Pending | N/A | N/A | Detected via `mistral` command on PATH. Skills via `npx skills add -a mistral-vibe`. |
| Qwen Code | ⏳ Pending | N/A | N/A | Detected via `qwen` command on PATH. Skills via `npx skills add -a qwen-code`. |
| Tabnine CLI | ⏳ Pending | N/A | N/A | Detected via `tabnine` command on PATH. Skills via `npx skills add -a tabnine-cli`. |
| Kiro CLI | ⏳ Pending | N/A | N/A | Detected via `kiro` command on PATH. Skills via `npx skills add -a kiro-cli`. |
| iFlow CLI | ⏳ Pending | N/A | N/A | Detected via `iflow` command on PATH. Skills via `npx skills add -a iflow-cli`. |
| IBM Bob | ⏳ Pending | N/A | N/A | Detected via `bob` command on PATH. Skills via `npx skills add -a bob`. |
| Crush | ⏳ Pending | N/A | N/A | Detected via `crush` command on PATH. Skills via `npx skills add -a crush`. |
| Droid | ⏳ Pending | N/A | N/A | Detected via `droid` command on PATH. Skills via `npx skills add -a droid`. |
| JetBrains Junie | N/A | N/A | N/A | JetBrains plugin (soft probe). Opt-in via `node bin/install.js --only junie`. Skills via `npx skills add -a junie`. |
| Qoder | N/A | N/A | N/A | Soft probe — detected via `.qoder` directory. Opt-in via `node bin/install.js --only qoder`. Skills via `npx skills add -a qoder`. |
| Google Antigravity | N/A | N/A | N/A | Soft probe — detected via `.gemini/antigravity` directory. Opt-in via `node bin/install.js --only antigravity`. Skills via `npx skills add -a antigravity`. |

## Usage pattern for future tools

- Add a new row for each additional tool.
- Keep the same column order so the matrix stays comparable across tools.
- Mark a surface as verified only after a real install/test on that surface.
- If a tool is not supported on a surface, write `N/A` instead of leaving it blank.
