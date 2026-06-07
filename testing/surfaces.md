# Testing surfaces

This file tracks the install and live-test surfaces for each supported AI tool.
Add one row per tool and keep the columns in the same order.

| Tool | CLI | Desktop app | VS Code extension | Notes |
| --- | --- | --- | --- | --- |
| Claude Code | Pending | Pending | Pending | Install plugin-architect from the repo, install the core plugin, then run `/build-plugin` and verify the full flow works on each surface. |

## Usage pattern for future tools

- Add a new row for each additional tool.
- Keep the same column order so the matrix stays comparable across tools.
- Mark a surface as verified only after a real install/test on that surface.
- If a tool is not supported on a surface, write `N/A` instead of leaving it blank.
