# plugin-architect

> **Don’t install generic plugins. Install yours.**

`plugin-architect` helps you generate a custom plugin for *your* codebase — with the right skills, the right agents, and the right platform surface.

## What it does

- Scans your project structure, git setup, and tech stack
- Lets you choose the build depth: light, medium, or deep
- Finds blueprint skills for the tech you actually use
- Builds a plugin skeleton tailored to the target platform
- Keeps agents available only where they make sense: **Claude Code** and **OpenCode**
- Supports a **multi-platform** option when you want the full cross-platform layout

## Supported surfaces

- **Command-capable**: Claude Code, OpenCode
- **Skill-only**: Codex, Copilot, Cursor, Windsurf, Cline, Continue, Kilo Code, Roo Code, Augment Code, Aider Desk, Amp, Bob, Crush, Devin, Droid, ForgeCode, Goose, iFlow CLI, Kiro CLI, Mistral Vibe, OpenHands, Qwen Code, Atlassian Rovo Dev, Tabnine CLI, Trae, Warp, Replit Agent, JetBrains Junie, Qoder, Google Antigravity
- **Multi-platform**: generate the full infrastructure/skeleton for every supported surface

## How to use it

- On **Claude Code** or **OpenCode**, use the command flow: `/build-plugin`
- On skill-only surfaces, use the sequential build skill
- Choose `multi-platform` when you want the full cross-platform layout and install surface set

<!-- markdownlint-disable MD033 -->

<details>
<summary>Install plugin-architect</summary>

Clone the repo and install dependencies:

```bash
git clone https://github.com/EngAhmedShehatah/plugin-architect.git
cd plugin-architect
npm install
```

Then install the marketplace/plugin package for the platform you are using.

- If the platform supports commands, use `/build-plugin`
- If the platform is skill-only, use the sequential `build-plugin` skill

</details>

<!-- markdownlint-enable MD033 -->

## Validation

Run the repo checks before publishing changes:

```bash
npm run check
```

## Contributing

Contributions are welcome. The most useful improvements are:

- new blueprints
- better validation rules
- more platform skeleton support
- clearer platform-specific install flows

## License

MIT

## Author

Built by [Ahmed Shehatah](https://github.com/EngAhmedShehatah)
