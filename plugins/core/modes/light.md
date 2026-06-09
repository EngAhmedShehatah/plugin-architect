---
mode: light
short-description: "Generalist coverage — 1 skill per broad role. Fast to set up, easy to reason about."
---

# Light Mode

## Philosophy

One skill owns one role. No sub-domain splitting.

## What Gets Generated

For each detected role in the codebase (e.g., implementation, testing, review, git):

- **1 skill** covering the full breadth of that role

**Example output for a Node.js project:**

- `skills/implementation/SKILL.md`
- `skills/testing/SKILL.md`
- `skills/code-review/SKILL.md`
- `skills/git-handle/SKILL.md`

## Rules

- Maximum 1 skill per role
- Skills stay broad — no sub-domain splitting inside the skill
