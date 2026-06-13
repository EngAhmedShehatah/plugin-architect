# plugin-architect

> **Don't install generic plugins. Install yours.**

A smart meta-plugin that turns generic AI coding assistants into something built specifically for your project — your stack, your conventions, your workflow. Supports Claude Code, GitHub Copilot, Gemini, OpenCode, and Codex.

---

## What it does

Most AI coding plugins are generic. They work for any project, which means they're optimised for none. `plugin-architect` takes a different approach:

1. **Scans your project** — detects schema (mono vs solo), git setup, and full tech stack
2. **You choose the depth** — Light, Medium, or Deep (more on this below)
3. **Searches for blueprints** — finds the best community skills per detected tech
4. **Rewrites everything** — generates skills and agents focused on _your_ actual codebase, not a hypothetical one
5. **Validates and ships** — runs validation and guides you through install → test → publish

---

## Modes

| Mode       | What gets generated                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| **Light**  | 1 skill + 1 agent per broad role (implementer, tester, reviewer, git-handler). Fast to set up.              |
| **Medium** | Split by concern within a role — `unit-tester` and `e2e-tester` instead of just `tester`. More precise.     |
| **Deep**   | Split by domain AND concern — `apex-implementer`, `mcp-implementer`, `lwc-implementer`. Maximum separation. |

---

## Requirements

- **Claude Code** v2.1.105 or later — agents + skills
- **GitHub Copilot** in VS Code or CLI — skills only
- **Gemini CLI** — skills only
- **OpenCode** — agents + skills
- **Codex CLI** — skills only
- Node.js **v18** or later (required for all platforms)

---

## Installation

<details>
<summary>Claude Code</summary>

```bash
claude plugin install plugin-architect@https://github.com/EngAhmedShehatah/plugin-architect
claude plugin install core@plugin-architect
```

Or via npx:

```bash
npx github:EngAhmedShehatah/plugin-architect --only claude
```

</details>

<details>
<summary>GitHub Copilot</summary>

Open VS Code → Chat panel → click the gear icon → paste:

```text
https://github.com/EngAhmedShehatah/plugin-architect
```

Or via npx:

```bash
npx github:EngAhmedShehatah/plugin-architect --only copilot
```

</details>

<details>
<summary>Gemini</summary>

```bash
gemini extensions install https://github.com/EngAhmedShehatah/plugin-architect
```

Or via npx:

```bash
npx github:EngAhmedShehatah/plugin-architect --only gemini
```

</details>

<details>
<summary>Codex</summary>

```bash
codex plugin marketplace add https://github.com/EngAhmedShehatah/plugin-architect
```

Or via npx:

```bash
npx github:EngAhmedShehatah/plugin-architect --only codex
```

</details>

<details>
<summary>opencode</summary>

```bash
npx github:EngAhmedShehatah/plugin-architect --only opencode
```

</details>

<details>
<summary>All detected tools at once</summary>

```bash
npx github:EngAhmedShehatah/plugin-architect
```

Detects which of the 5 tools are installed and asks you to confirm each before installing.

</details>

---

## Usage

Usage depends on your platform. The `build-plugin` skill guides you through the full journey.

### Claude Code — skill invocation

Navigate to your project root and describe what you want:

```text
Build a plugin for this project
```

Claude Code will identify the `build-plugin` skill from the manifest and execute the agent-based flow.

| Step | What happens                                                                  |
| ---- | ----------------------------------------------------------------------------- |
| 1    | Greets you by name                                                            |
| 2    | Spins 3 parallel agents: git-detector, schema-scanner, tech-stack-detector    |
| 2.5  | Classifies detected techs into skill-worthy vs utility — you confirm the list |
| 3    | Asks monorepo questions if needed, shows expected folder structure            |
| 4    | You choose Light / Medium / Deep mode                                         |
| 5    | Searches for blueprints per tech, shows a table with ctrl+clickable links     |
| 6    | You choose your target AI tool                                                |
| 7    | Scaffolds the marketplace folder structure in your project                    |
| 8    | Generates skills and agents pair by pair using your selected blueprints       |
| 9    | Creates a `pilot.md` command tailored to your mode and stack                  |
| 10   | Validates the entire generated plugin                                         |
| 11   | Guides you through install → pilot run → fix loop                             |
| 12   | Helps you publish to your own GitHub repo                                     |
| 13   | Summary                                                                       |

### GitHub Copilot — skill invocation

Navigate to your project root and ask Copilot to build a plugin:

```text
Build a plugin for this project
```

Copilot will identify the `build-plugin` skill from the manifest and execute the sequential skill flow.

| Step | What happens                                                                  |
| ---- | ----------------------------------------------------------------------------- |
| 1    | Greets you by name                                                            |
| 2    | Runs 3 skills sequentially: git-detect, schema-scan, tech-stack-detect        |
| 2.5  | Classifies detected techs — you confirm the list                              |
| 3    | Asks monorepo questions if needed, shows expected folder structure            |
| 4    | You choose Light / Medium / Deep mode                                         |
| 5    | Searches for blueprints per tech in sequence                                  |
| 6    | You choose your target AI tool                                                |
| 7    | Scaffolds the marketplace folder structure in your project                    |
| 8    | Generates skills and agents sequentially using your selected blueprints       |
| 9    | Creates a `pilot.md` tailored to your mode and stack                          |
| 10   | Validates the entire generated plugin                                         |
| 11   | Guides you through install → pilot run → fix loop                             |
| 12   | Helps you publish to your own GitHub repo                                     |
| 13   | Summary                                                                       |

---

## What gets generated in your project

After the build-plugin skill completes, your project will contain a generated `marketplace/` folder. The exact structure depends on the target platform.

### Claude Code — generated marketplace

```text
your-project/
└── marketplace/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── plugins/
    │   └── your-plugin/
    │       ├── .claude-plugin/
    │       │   └── plugin.json
    │       ├── skills/             ← rewritten for your actual codebase
    │       ├── agents/             ← rewritten for your actual codebase
    │       ├── commands/
    │       │   └── pilot.md        ← your main workflow command
    │       ├── hooks/
    │       ├── scripts/
    │       │   ├── session-init.mjs
    │       │   ├── version-bump.mjs
    │       │   ├── validate-plugins.mjs
    │       │   └── validate-claude-code.mjs
    │       └── .mcp.json
    └── README.md
```

### GitHub Copilot — generated marketplace

```text
your-project/
└── marketplace/
    ├── plugin.json
    ├── AGENTS.md
    ├── .github/
    │   ├── copilot-instructions.md
    │   ├── skills/                 ← rewritten for your actual codebase
    │   └── agents/
    │       └── *.agent.md
    ├── .mcp.json
    └── README.md
```

---

## Supported AI tools

| Tool           | Status       | Build flow         |
| -------------- | ------------ | ------------------ |
| Claude Code    | ✅ Supported | Agent (parallel)   |
| GitHub Copilot | ✅ Supported | Skill (sequential) |
| Gemini         | ✅ Supported | Skill (sequential) |
| OpenCode       | ✅ Supported | Agent (parallel)   |
| Codex          | ✅ Supported | Skill (sequential) |

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

The most valuable contributions right now:

- New tech stack blueprints under `plugins/core/blueprints/`
- Additional validator rules in `plugins/core/scripts/`
- Platform-specific skeleton references under `plugins/core/skills/skeleton-build/`
- New mode definitions under `plugins/core/modes/`

---

## License

MIT — see [LICENSE](./LICENSE)

---

## Author

Built by [Ahmed Shehatah](https://github.com/EngAhmedShehatah)

If this saved you time, star the repo and share it with your team. 🙏
