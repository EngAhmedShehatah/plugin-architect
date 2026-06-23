# plugin-architect

> **Don't install generic plugins. Create yours.**

A smart plugin that turns generic AI coding tooling into something built specifically for your project — your stack, your conventions, your workflow.

---

## What it does

Most AI coding plugins are generic. They work for any project, which means they're optimised for none. `plugin-architect` takes a different approach:

1. **Scans your project** — detects schema (mono vs solo), git setup, and full tech stack
2. **You choose the depth** — Light, Medium, or Deep (more on this below)
3. **Searches for blueprints** — finds the best community skills per detected tech
4. **Rewrites everything** — generates skills and agents focused on _your_ actual codebase, not a hypothetical one
5. **Validates and ships** — runs validation, wires up pre-commit hooks, and guides you through install → test → publish

---

## Modes

| Mode       | What gets generated                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| **Light**  | 1 skill + 1 agent per broad role (implementer, tester, reviewer, git-handler). Fast to set up.              |
| **Medium** | Split by concern within a role — `unit-tester` and `e2e-tester` instead of just `tester`. More precise.     |
| **Deep**   | Split by domain AND concern — `apex-implementer`, `mcp-implementer`, `lwc-implementer`. Maximum separation. |

---

## Installation

### Step 1 — Install the marketplace

```bash
claude plugin install plugin-architect@https://github.com/EngAhmedShehatah/plugin-architect
```

Or install from a local clone:

```bash
git clone https://github.com/EngAhmedShehatah/plugin-architect.git
claude plugin install ./plugin-architect --scope project
```

### Step 2 — Install the core plugin

```bash
claude plugin install core@plugin-architect
```

### Step 3 — Verify installation

```bash
claude plugin list
```

You should see `plugin-architect` marketplace and `core` plugin listed.

---

## Usage

Navigate to the root of your project and run:

```text
/build-plugin
```

The command will guide you through the full journey interactively:

| Step | What happens                                                                  |
| ---- | ----------------------------------------------------------------------------- |
| 1    | Greets you by name                                                            |
| 2    | Spins 3 parallel agents: git-detector, schema-scanner, tech-stack-detector    |
| 2.5  | Classifies detected techs into skill-worthy vs utility — you confirm the list |
| 3    | Asks monorepo questions if needed, shows expected folder structure            |
| 4    | You choose Light / Medium / Deep mode                                         |
| 5    | Searches for blueprints per tech, shows a table with ctrl+clickable links     |
| 6    | You choose your AI tool (Claude Code / Opencode / Codex / Copilot)            |
| 7    | Scaffolds the marketplace folder structure in your project                    |
| 8    | Generates skills and agents pair by pair using your selected blueprints       |
| 9    | Creates a `pilot.md` command tailored to your mode and stack                  |
| 10   | Validates the entire generated plugin                                         |
| 11   | Guides you through install → pilot run → fix loop                             |
| 12   | Helps you publish to your own GitHub repo                                     |
| 13   | Summary                                                                       |

---

## What gets generated in your project

After `/build-plugin` completes, your project will have:

```text
your-project/
└── marketplace/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── .githooks/
    │   └── pre-commit              ← generated fresh for your project paths
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
    │       │   └── validate-plugins.mjs
    │       └── .mcp.json
    └── README.md
```

---

## Supported AI tools

| Tool        | Status         |
| ----------- | -------------- |
| Claude Code | ✅ Supported   |
| Opencode    | 🔜 Coming soon |
| Copilot     | 🔜 Coming soon |
| Codex       | 🔜 Coming soon |

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

The most valuable contributions right now:

- New tech stack blueprints under `plugins/core/blueprints/`
- Additional validator rules in `plugins/core/scripts/validate-plugins.mjs`
- New mode definitions under `plugins/core/modes/`

---

## License

MIT — see [LICENSE](./LICENSE)

---

## Author

Built by [Ahmed Shehatah](https://github.com/EngAhmedShehatah)

If this saved you time, star the repo and share it with your team. 🙏
