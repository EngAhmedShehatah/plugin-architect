---
mode: medium
short-description: "Role-specific coverage — separate skills and agents per concern within a role. Testers split by test type, implementers split by layer. More precise than light, less granular than deep."
---

# Medium Mode

## Philosophy

Agents are split by concern within a role, not by sub-domain. A single codebase area (e.g., testing) gets multiple agents — one per test type — but each agent still covers all domains within its concern.

## What Gets Generated

For each detected role, split by concern:

- **1 skill per concern** within that role
- **1 paired agent per concern**

**Example output for a Node.js project:**

| Skill | Agent |
| --- | --- |
| `skills/implementation/SKILL.md` | `agents/implementer.md` |
| `skills/unit-testing/SKILL.md` | `agents/unit-tester.md` |
| `skills/e2e-testing/SKILL.md` | `agents/e2e-tester.md` |
| `skills/code-review/SKILL.md` | `agents/code-reviewer.md` |
| `skills/git-handle/SKILL.md` | `agents/git-handler.md` |

## Rules

- Split by concern (test type, code layer, review scope) — not by domain
- 1 skill per concern, 1 agent per concern
- Agent names are concern-based (e.g., `unit-tester`, `e2e-tester`) — not domain-based
- Skills are concern-scoped but still cover all domains within that concern
