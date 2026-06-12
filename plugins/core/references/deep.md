---
mode: deep
short-description: "Domain-specific coverage — multiple specialized agents per role, each scoped to a specific sub-domain. Maximum precision, maximum separation of concerns."
---

# Deep Mode

## Philosophy

Agents are split by sub-domain within a role. Each agent owns exactly one concern in exactly one domain. Nothing bleeds across boundaries.

## What Gets Generated

For each detected role, split by both concern and domain:

- **1 skill per domain-concern pair**
- **1 paired agent per domain-concern pair**

**Example output for a Node.js + MCP project:**

| Skill | Agent |
| --- | --- |
| `skills/core-implementation/SKILL.md` | `agents/core-implementer.md` |
| `skills/api-implementation/SKILL.md` | `agents/api-implementer.md` |
| `skills/mcp-implementation/SKILL.md` | `agents/mcp-implementer.md` |
| `skills/unit-testing/SKILL.md` | `agents/unit-tester.md` |
| `skills/mcp-testing/SKILL.md` | `agents/mcp-tester.md` |
| `skills/code-review/SKILL.md` | `agents/code-reviewer.md` |
| `skills/security-review/SKILL.md` | `agents/security-scanner.md` |
| `skills/git-handle/SKILL.md` | `agents/git-handler.md` |

## Rules

- Split by domain AND concern
- 1 skill per domain-concern pair, 1 agent per domain-concern pair
- Agent names are domain-specific (e.g., `mcp-implementer`, `apex-implementer`)
- Skills are tightly scoped — one domain, one concern, nothing more
- Number of agents scales with the number of distinct domains detected in the codebase
