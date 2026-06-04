---
name: skill-creator
description: Provides the template, rules, and procedural steps for creating a new skill markdown file that is codebase-specific and follows plugin-architect conventions.
input:
  blueprint: string — what the skill must do, its scope, and constraints
  focus_prompt: string — instruction that the skill must be codebase-specific, not generic
  output_path: string — where to write the SKILL.md file
output:
  skill_name: string — the kebab-case name for this skill
  template: string — complete SKILL.md template ready to fill in
  validation_checklist: array — rules to verify before finalizing
---

## What this skill does

Guides creation of a new skill markdown file. Provides the complete template structure, frontmatter schema, required sections, content rules, and validation checklist to ensure the skill is codebase-specific and follows plugin-architect standards.

## How to execute this skill

This skill is fully self-contained and works standalone on any tool.

1. Extract skill `name` from `output_path` (e.g. `/skills/git-detect/SKILL.md` → `git-detect`)
2. Provide the frontmatter schema and body structure (see sections below)
3. Apply `focus_prompt` to ensure codebase-specificity, not generic patterns
4. Generate the validation checklist
5. Return the template and checklist

You can run this skill entirely on your own — no agent orchestration is required.

## Frontmatter schema (required)

```yaml
---
name: <kebab-case-name>
description: <one-line description>
input:
  param1: type — description
output:
  result1: type — description
---
```

**Rules:**

- `name` must match folder name exactly (folder `git-detect` → `name: git-detect`)
- `description` must be single-line (no multi-line quoted strings)
- `input` and `output` are optional but recommended

## Body structure (required sections in order)

### 1. "What this skill does"

- 1-2 paragraphs explaining purpose, inputs, outputs
- Answer: what problem does this solve?

### 2. "How to execute this skill"

- Numbered steps with concrete, actionable instructions
- Reference inputs by name
- End with: "You can run this skill entirely on your own — no agent orchestration is required."

### 3. Additional sections (as needed)

- Normalization rules, Detection steps, Validation rules, Error handling, Constraints, Examples

### 4. "Output format"

- Code block showing exact structure with example values

## Content rules (critical)

**Codebase-specific, not generic:**

- Must operate on the user's actual project, not hypothetical
- Reference actual file paths, configs, technology patterns
- Use concrete examples from real codebases
- Write "read X from the project" not "this skill handles X"

**Style:**

- Describe WHAT to do (imperative): "Run `git -C <path> remote get-url origin`"
- No persona: avoid "I", "you", "this skill"
- Be precise, not vague: avoid "handles", "manages", "used to"

**Constraints:**

- Total line count ≤ 150 lines (including frontmatter)
- All code blocks must have language tags (`json`, `bash`, etc.)
- Ensure "output:" schema in frontmatter matches examples in "Output format"

## Validation checklist

Before finalizing:

- [ ] Frontmatter present and valid YAML (both `---` delimiters)
- [ ] `name` matches folder name exactly
- [ ] `description` is single-line string
- [ ] "What this skill does" explains purpose clearly
- [ ] "How to execute this skill" has numbered, actionable steps
- [ ] "Output format" shows example with all fields
- [ ] Content is codebase-specific (actual files/configs/patterns mentioned)
- [ ] No persona language ("I", "you", "this skill does")
- [ ] No generic language ("handles", "manages", "used to")
- [ ] Total line count ≤ 150
- [ ] All code blocks tagged with language
- [ ] "output:" schema matches examples

**NOTE:** Validator script path — The validator (`validate-plugins.mjs`) may not exist in early plugin scaffolding. The agent orchestrating this skill is responsible for:

- Fetching the latest validator from the live plugin-architect repository (HTTPS path)
- Placing it in a standard location accessible during the session
- Providing the correct path to the validator in the workflow

Consult the build-plugin command for validator availability and path resolution.
