---
mode: light
short-description: "Generalist coverage — 1 skill + 1 agent per broad role. The implementer handles all implementation, the reviewer handles all review. Fast to set up, easy to reason about."
---

# Light Mode

## Philosophy

One agent owns one role. No sub-domain splitting. Claude figures out the specifics within the agent based on context.

## What Gets Generated

For each detected role in the codebase (e.g., implementation, testing, review, git):

- **1 skill** covering the full breadth of that role
- **1 paired agent** that is the sole owner of that role

**Example output for a Node.js project:**

| Skill | Agent |
| --- | --- |
| `skills/implementation/SKILL.md` | `agents/implementer.md` |
| `skills/testing/SKILL.md` | `agents/tester.md` |
| `skills/code-review/SKILL.md` | `agents/code-reviewer.md` |
| `skills/git-handle/SKILL.md` | `agents/git-handler.md` |

## Rules

- Maximum 1 skill per role
- Maximum 1 agent per role
- Agent names are role-based, never domain-based (e.g., `implementer` not `api-implementer`)
- Skills stay broad — no sub-domain splitting inside the skill
