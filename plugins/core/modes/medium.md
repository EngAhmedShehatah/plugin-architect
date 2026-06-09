---
mode: medium
short-description: "Role-specific coverage — separate skills per concern within a role. More precise than light, less granular than deep."
---

# Medium Mode

## Philosophy

Skills are split by concern within a role, not by sub-domain.

## What Gets Generated

For each detected role, split by concern:

- **1 skill per concern** within that role

**Example output for a Node.js project:**

- `skills/implementation/SKILL.md`
- `skills/unit-testing/SKILL.md`
- `skills/e2e-testing/SKILL.md`
- `skills/code-review/SKILL.md`
- `skills/git-handle/SKILL.md`

## Rules

- Split by concern (test type, code layer, review scope) — not by domain
- 1 skill per concern
- Skills are concern-scoped but still cover all domains within that concern
