---
mode: deep
short-description: "Domain-specific coverage — multiple specialized skills per role, each scoped to a specific sub-domain. Maximum precision and separation of concerns."
---

# Deep Mode

## Philosophy

Skills are split by sub-domain within a role. Each skill owns exactly one concern in exactly one domain. Nothing bleeds across boundaries.

## What Gets Generated

For each detected role, split by both concern and domain:

- **1 skill per domain-concern pair**

**Example output for a Node.js + MCP project:**

- `skills/core-implementation/SKILL.md`
- `skills/api-implementation/SKILL.md`
- `skills/mcp-implementation/SKILL.md`
- `skills/unit-testing/SKILL.md`
- `skills/mcp-testing/SKILL.md`
- `skills/code-review/SKILL.md`
- `skills/security-review/SKILL.md`
- `skills/git-handle/SKILL.md`

## Rules

- Split by domain AND concern
- 1 skill per domain-concern pair
- Skills are tightly scoped — one domain, one concern, nothing more
- Number of skills scales with the number of distinct domains detected in the codebase
