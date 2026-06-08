# plugin-architect

> **Don't install generic plugins. Install yours.**

A smart meta-plugin that turns generic AI coding assistants into something built specifically for your project — your stack, your conventions, your workflow. Supports Claude Code (agents) and GitHub Copilot (skills).

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

## File tree

```text
plugin-architect/
├── AGENTS.md                       ← Copilot agent instructions
├── plugin.json                     ← Copilot marketplace manifest
├── .claude-plugin/
│   ├── marketplace.json
│   ├── plugin.config.json          ← $schema reference
│   └── plugin.json                 ← Claude Code marketplace manifest
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       └── validate.yml            ← CI validation on every PR
├── .githooks/
│   └── pre-commit                  ← version bump + markdown lint + validator orchestrator
├── testing/
│   └── surfaces.md                 ← install/test matrix for supported AI tools
├── plugins/
│   └── core/
│       ├── .claude-plugin/
│       │   ├── plugin.config.json
│       │   └── plugin.json         ← core plugin manifest
│       ├── .mcp.json               ← MCP server config
│       ├── agents/
│       │   ├── agent.config.json   ← frontmatter schema reference
│       │   ├── agent-creator.md
│       │   ├── blueprint-selector.md
│       │   ├── git-detector.md
│       │   ├── plugin-validator.md
│       │   ├── schema-scanner.md
│       │   ├── skeleton-builder.md
│       │   ├── skill-creator.md
│       │   └── tech-stack-detector.md
│       ├── hooks/
│       │   └── config.json
│       ├── modes/
│       │   ├── deep.md
│       │   ├── light.md
│       │   └── medium.md
│       ├── resources/
│       │   └── pilot.template.md   ← template for generated pilot command
│       ├── scripts/
│       │   ├── session-init.mjs    ← runs on SessionStart hook
│       │   ├── validate-plugins.mjs
│       │   ├── validate-claude-code.mjs
│       │   ├── validate-github-copilot.mjs
│       │   └── version-bump.mjs    ← auto-bumps patch version on every commit
│       ├── skills/
│       │   ├── skill.config.json
│       │   ├── agent-create/
│       │   │   └── SKILL.md
│       │   ├── blueprint-select/
│       │   │   ├── SKILL.md
│       │   │   └── resources/
│       │   │       └── urls.json
│       │   ├── build-plugin/
│       │   │   ├── SKILL.md        ← main orchestrator (skill format)
│       │   │   ├── build-plugin.config.json
│       │   │   └── references/
│       │   │       ├── agent-flow.md
│       │   │       └── sequential-flow.md
│       │   ├── git-detect/
│       │   │   └── SKILL.md
│       │   ├── plugin-validate/
│       │   │   └── SKILL.md
│       │   ├── schema-scan/
│       │   │   └── SKILL.md
│       │   ├── skeleton-build/
│       │   │   ├── SKILL.md
│       │   │   ├── claude-code.skeleton.md
│       │   │   └── github-copilot.skeleton.md
│       │   ├── skill-create/
│       │   │   └── SKILL.md
│       │   └── tech-stack-detect/
│       │       └── SKILL.md
├── .gitignore
├── .markdownlint.json
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
├── package.json
└── package-lock.json
```

---

## Requirements

- **Claude Code** v2.1.105 or later (for agents, agents are not required on skill-only platforms)
- **GitHub Copilot** in VS Code or CLI (for skill-only usage)
- Node.js **v18** or later

---

## Installation

Installation varies by platform.

### Claude Code — plugin install

#### Step 1 — Install the marketplace

```bash
claude plugin install plugin-architect@https://github.com/EngAhmedShehatah/plugin-architect
```

Or install from a local clone:

```bash
git clone https://github.com/EngAhmedShehatah/plugin-architect.git
claude plugin install ./plugin-architect --scope project
```

#### Step 2 — Install the core plugin

```bash
claude plugin install core@plugin-architect
```

#### Step 3 — Verify

```bash
claude plugin list
```

You should see `plugin-architect` marketplace and `core` plugin listed.

### GitHub Copilot — instructions + skills

Clone the repo:

```bash
git clone https://github.com/EngAhmedShehatah/plugin-architect.git
```

Open the folder in VS Code with GitHub Copilot enabled, or use the Copilot CLI inside the project directory. Copilot will read `AGENTS.md` and `plugin.json` to load the workspace-level instructions and available skills.

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

| Tool        | Status             | Build flow          |
| ----------- | ------------------ | ------------------- |
| Claude Code | ✅ Supported       | Agent (parallel)    |
| GitHub Copilot | ✅ Supported    | Skill (sequential)  |
| Opencode    | 🔜 Coming soon     | —                   |
| Codex       | 🔜 Coming soon     | —                   |
| Cursor      | 🔜 Coming soon     | —                   |

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
