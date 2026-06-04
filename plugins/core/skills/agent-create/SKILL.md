---
name: agent-create
description: Provides the template, rules, and procedural steps for creating a new agent markdown file that is codebase-specific, focused, and follows plugin-architect conventions.
input:
  blueprint: string — what the agent must do, its role, tools needed, and constraints
  focus_prompt: string — instruction that the agent must be codebase-specific, not generic
  output_path: string — where to write the agent file (e.g. plugins/core/agents/git-detector.md)
output:
  agent_name: string — the kebab-case name for this agent
  template: string — complete agent markdown template ready to fill in
  validation_checklist: array — rules to verify before finalizing
---

## What this skill does

Guides creation of a new agent markdown file. Provides the complete template structure, frontmatter schema, system prompt rules, and validation checklist to ensure the agent is codebase-specific, focused, and follows plugin-architect standards.

## How to execute this skill

This skill is fully self-contained and works standalone on any tool.

1. Extract agent `name` from `output_path` (e.g. `/agents/git-detector.md` → `git-detector`)
2. Provide the frontmatter schema and body structure (see sections below)
3. Apply `focus_prompt` to ensure codebase-specificity and single responsibility
4. Generate the validation checklist
5. Return the template and checklist

You can run this skill entirely on your own — no agent orchestration is required.

## Agent file structure

Agent markdown files follow this structure:

```markdown
---
name: <agent-name>
description: <one inline string — when to invoke and what it owns>
model: sonnet
tools: <comma-separated list or omit if not needed>
---

<system prompt — codebase-specific, focused on exactly one role>
```

## Frontmatter schema (required)

**Universal fields:**

- `name` — lowercase letters and hyphens only; must match filename without `.md`
- `description` — single inline string (no block scalars); explain when to invoke and what it exclusively owns
- `model` — use `sonnet` unless blueprint specifies otherwise

**Optional fields:**

- `tools` — comma-separated list of tools this agent needs (minimal, only what's necessary)
- `disallowedTools` — alternative to `tools`: list tools to exclude (easier when excluding few vs listing many)
- `effort` — omit unless blueprint specifies (low / medium / high / xhigh)
- `maxTurns` — omit unless blueprint specifies a hard limit
- Do NOT include `skills:` field (invalid across platforms)

## Body structure

After frontmatter, write a focused system prompt:

- **Single responsibility:** One agent owns exactly one thing — one role (light), one concern (medium), or one domain-concern pair (deep)
- **Codebase-specific:** Refers to user's actual project structure, stack, and conventions — not hypothetical
- **Clear boundaries:** State explicitly what this agent does AND does NOT do
- **No overlap:** Avoid duplicating responsibilities with other agents in the plugin

## Content rules (critical)

**Codebase-specific, not generic:**

- Reference actual files, configs, patterns from the user's codebase
- Use concrete examples from real projects
- Write "scan the user's auth directory" not "handle authentication generically"

**Style:**

- Describe WHAT to do, not WHO does it — no persona language
- Be precise: "Read package.json" not "handles dependency detection"
- Use imperative voice: "Analyze the tech stack" not "This agent analyzes"

**Single responsibility:**

- One agent = one concern
- Never overlap with other agents in the same plugin
- State clearly: "You do X. You do NOT do Y, Z (that's agent-B's job)"

## Validation checklist

Before finalizing:

- [ ] Frontmatter present and valid YAML (both `---` delimiters)
- [ ] `name` matches filename (without `.md`) exactly
- [ ] `description` is single-line inline string (no block scalars)
- [ ] `model` field present (use `sonnet` unless specified)
- [ ] No `skills:` field in frontmatter
- [ ] `tools` list is minimal (only what agent genuinely needs)
- [ ] System prompt explains role, boundaries, and what agent does NOT do
- [ ] Content is codebase-specific (actual files/structures mentioned)
- [ ] No persona language ("I", "you", "this agent")
- [ ] No generic language ("handles", "manages", "used to")
- [ ] Single responsibility enforced (no overlap with other agents)

## Output format

Agent markdown with validated frontmatter and codebase-specific system prompt:

```markdown
---
name: example-detector
description: Detects the example pattern in the user's codebase and returns configuration details.
model: sonnet
tools: Bash, Read
---

## Role

You detect whether a specific pattern exists in the user's codebase. Your role is precisely:

- Scan the user's project for the pattern in config files
- Report the location and configuration if found
- Return structured data for downstream agents

You do NOT:

- Modify or write any files
- Make decisions about what to do with the pattern
- Handle multiple patterns (each gets its own agent)
```
