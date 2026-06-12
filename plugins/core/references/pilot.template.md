---
# DO NOT EDIT DIRECTLY: this file is a source template/blueprint for generated pilot commands. Copy it into the generated plugin and customize the copy, not this reference.
description: Full ticket-to-PR orchestrator for altify-maxai — fetches Jira, plans with user approval, implements, reviews (≤2 iterations), tests in parallel, commits, and returns a Bitbucket PR URL.
argument-hint: ALT-XXXXX or Jira URL
allowed-tools: Read, Write, Glob, Grep, Agent, Bash(git:*), Bash(cat:*), Bash(ls:*), Bash(test:*), Bash(jq:*), Bash(sf:*), TodoWrite, EnterPlanMode, ExitPlanMode, mcp__atlassian__getAccessibleAtlassianResources, mcp__atlassian__getJiraIssue
---

# Pilot — altify-maxai Ticket-to-PR Orchestrator

Run the full development workflow for a Jira ticket against the altify-maxai codebase: plan, implement, review, test (in parallel across three stacks), commit, and surface a Bitbucket PR URL. The orchestrator never touches source files — every code change goes through a delegated agent.

## Arguments

$ARGUMENTS

Parse the arguments for a Jira ticket reference. Accept any of these formats:

- **Ticket ID**: `ALT-12345` (matches pattern `ALT-\d+`)
- **Jira URL**: `https://altify.atlassian.net/browse/ALT-12345` (extract the `ALT-\d+` segment)
- **Raw number**: `12345` (matches pattern `\d+`; prepend `ALT-` automatically → `ALT-12345`)

Extract / normalise the `ALT-XXXXX` ticket ID from whichever format was provided. Store it as `TICKET_ID`.

If no arguments are provided, or the input matches none of the three formats, respond with:
"Usage: `/max:pilot ALT-XXXXX`, `/max:pilot 12345`, or `/max:pilot <jira-url>`"

## Pre-Flight

Run these checks before doing any work. Any failure stops the workflow.

### Step 0 — Session folder must exist

SessionStart creates a per-session folder that hosts the cached Jira ticket, the pre-commit log, and the plan file. Pilot writes those artefacts; downstream phases read them by absolute path passed in dispatch prompts.

The SessionStart hook (`altify-core/scripts/telemetry/session-init.mjs`) writes the id to two channels: the env var `MAX_SESSION_ID` (via `$CLAUDE_ENV_FILE`, "courtesy" only — may not propagate to the LLM's tool-call shell) and the sentinel file `${CLAUDE_PLUGIN_DATA}/.current-session-id` (the "primary cross-hook channel" per `lib.mjs:56-57`). Pilot must try both.

```bash
SID="$MAX_SESSION_ID"

# Fallback 1: read sentinel via CLAUDE_PLUGIN_DATA when present
if [ -z "$SID" ] && [ -n "$CLAUDE_PLUGIN_DATA" ] && [ -f "$CLAUDE_PLUGIN_DATA/.current-session-id" ]; then
  SID=$(cat "$CLAUDE_PLUGIN_DATA/.current-session-id")
fi

# Fallback 2: tool-call shell may have neither env var; glob both install variants under $HOME
if [ -z "$SID" ]; then
  for d in "$HOME"/.claude/plugins/data/max-*; do
    [ -f "$d/.current-session-id" ] || continue
    SID=$(cat "$d/.current-session-id")
    CLAUDE_PLUGIN_DATA="$d"
    break
  done
fi

test -n "$SID" && test -d "${CLAUDE_PLUGIN_DATA}/tmp/${SID}" || { echo "BLOCKED: session folder not initialised"; exit 1; }
```

If the block exits with `BLOCKED:` (no env var, no sentinel, no folder), stop and report:

> "The altify-maxai session folder is not initialised — `$MAX_SESSION_ID` is unset, the sentinel file is missing, and no `max-*` data dir under `$HOME/.claude/plugins/data/` contains a session id. The SessionStart hook may not have fired. Please restart your Claude Code session and re-run `/max:pilot {TICKET_ID}`."

Do NOT attempt to create the folder yourself — if all three lookups failed, the hook's failure is signal that the plugin's hook wiring is broken.

Capture `MAX_SESSION_ID="$SID"` and `SESSION_DIR="${CLAUDE_PLUGIN_DATA}/tmp/${SID}"` for use in later steps (cached ticket path, plan file path, pre-commit log path).

### Step 1 — Validate ticket ID

Confirm `TICKET_ID` matches `ALT-\d+`. If not, stop with the usage message above.

### Step 2 — Atlassian MCP availability

Try `mcp__atlassian__getAccessibleAtlassianResources`. Two outcomes:

- **Available** → store the `cloudId` from the response for use in Phase 1.
- **Unavailable / unauthenticated / errors out** → fall back to user-supplied ticket details. Tell the user:
  > "Atlassian MCP is not currently available. Paste the ticket details below (summary, issue type, description, acceptance criteria, fix version), or run `/mcp` to authenticate and re-run pilot."
  Wait for the user's response. Use whatever they provide as the ticket data.

> **Known v0 gap.** The Atlassian MCP for altify-maxai is configured in `plugins/altify-maxai/.mcp.json` but session connectivity has been intermittent. The fallback above is the supported path until the MCP is reliably wired.

### Step 3 — Git status sanity

```bash
git status --short
```

If the working tree has uncommitted changes that are NOT going to be part of this ticket's work, warn the user:

> "Your altify-maxai working tree has uncommitted changes. Recommended: **stash first** so reviewers, testers, and git-handler see only this ticket's diff. They use `git status --porcelain` directly to enumerate changed files, so any pre-existing modifications will surface in their output. Or proceed and accept that pre-existing changes will be picked up."

Wait for a response. **Stash is the recommended default.** If the user chooses to stash, run `git stash push -m "pilot-preflight-{TICKET_ID}"` before continuing. If they proceed without stashing, note the preexisting-changes risk for later phases.

### Step 3.5 — Toolchain pre-resolution

Resolve absolute paths to `node`, `npm`, `npx`, and `sf` once, with NVM bootstrap if available, and assert Node ≥ 20. This block runs in pilot's trusted parent shell — subagents receive the resolved paths via their dispatch prompts and never re-bootstrap NVM themselves. Cross-platform: works on macOS/Linux with NVM, on Windows where nvm-windows already has Node on PATH, and on systems with system-installed Node.

```bash
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  . "$NVM_DIR/nvm.sh" 2>/dev/null
  nvm use 20 2>/dev/null || true
fi

NODE=$(command -v node) || { echo "BLOCKED: node binary not found on PATH. Install Node 20+ or fix Node-version-manager setup."; exit 1; }
NPM=$(command -v npm) || { echo "BLOCKED: npm not found on PATH."; exit 1; }
NPX=$(command -v npx) || NPX="$NPM"
SF=$(command -v sf) || { echo "BLOCKED: sf CLI not found on PATH. Run 'npm install -g @salesforce/cli' (with Node 20 active)."; exit 1; }

NODE_VERSION=$($NODE -v)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "BLOCKED: Node version $NODE_VERSION is too old (need >= 20). Likely cause: shell fell back to a stale system Node before NVM activation."
  exit 1
fi

echo "TOOLCHAIN_OK"
echo "NODE=$NODE"
echo "NPM=$NPM"
echo "NPX=$NPX"
echo "SF=$SF"
echo "NODE_VERSION=$NODE_VERSION"
```

Capture the four resolved values (`NODE`, `NPM`, `NPX`, `SF`) plus `NODE_VERSION`. Pilot embeds them verbatim into every subagent dispatch prompt under a `## Toolchain (pre-resolved by pilot)` block (see "Toolchain dispatch contract" below). If any `BLOCKED:` line appears, stop pilot here with that message; downstream phases cannot proceed without a valid toolchain.

### Step 4 — Default scratch org must be set

The Tests phase deploys to and runs against the `sf` CLI's default scratch org. If no default is set, `apex-tester` and `agentforce-tester` hard-BLOCK at Phase 3 — wasting the Plan and Implement work. With per-task tester dispatch (Phase 3), testers only run when the plan has matching `apex-test` / `agentforce-test` tasks; for plans with no such tasks the gate is irrelevant. Gate it here anyway, before any phase work runs, so we fail fast.

Use the `$SF` resolved in Step 3.5:

```bash
$SF config get target-org --json
```

Parse the JSON. If `.result[0].value` is a non-empty string, capture it as `TARGET_ORG_ALIAS` and proceed.

If `.result[0].value` is empty, null, or missing, list connected scratch orgs:

```bash
$SF org list --json | jq '[.result.scratchOrgs[] | select(.connectedStatus == "Connected")]'
```

Three cases:

- **Zero connected** → stop with:
  > "No connected scratch orgs. Run `sf org login web --alias <name> --set-default`, then re-run `/max:pilot {TICKET_ID}`."

- **Exactly one connected** → ask the user:
  > "No default scratch org is set, but one is connected: `<alias>` (`<username>`). Set it as default and proceed?" — **[Yes, set as default]** / **[No, I'll set it manually]**.

  If yes, run `$SF config set target-org <alias> --global` and capture `<alias>` as `TARGET_ORG_ALIAS`. If no, stop with the same login/set message.

- **More than one connected** → list each as `<alias> — <username>` and ask:
  > "No default scratch org is set. Reply with the alias to set as default, or set it yourself and re-run pilot."

  If the user picks an alias from the list, run `$SF config set target-org <alias> --global` and capture it. Otherwise stop.

`--global` is required on every `sf config set` here because pilot runs from the repo root, outside the `salesforce/` DX project — without it sf throws `InvalidProjectWorkspaceError`. Writing global is fine because the testers merge global + project config at runtime; if the project later sets its own default, project-local wins.

`TARGET_ORG_ALIAS` is captured for the gate only — pilot does not pass it to downstream agents. The testers each re-resolve the default at execution time.

## Toolchain dispatch contract

Every subagent dispatch in Phases 2 (implementers), 3 (testers), 4 (reviewers), and 5 (git-handler) MUST include a `## Toolchain (pre-resolved by pilot)` block in the dispatch prompt, populated with the values captured in Step 3.5. Format:

```markdown
## Toolchain (pre-resolved by pilot)
NODE=<resolved-path>
NPM=<resolved-path>
NPX=<resolved-path>
SF=<resolved-path>
NODE_VERSION=<v20.x.x>

Use these directly — do NOT prepend NVM init. Pilot already activated Node 20 and resolved binaries cross-platform.
```

Subagents call `${NPM}` / `${SF}` / `${NPX}` / `${NODE}` directly. This eliminates the NVM bootstrap dance from every subagent's shell calls, drops permission prompts to short shapes that allowlist trivially, and is cross-platform safe. The block applies to all six worker types: `mcp-implementer` / `apex-implementer` / `agentforce-implementer` / `core-implementer` / `mcp-tester` / `apex-tester` / `agentforce-tester`. Read-only reviewers (`spec-reviewer`, `code-quality-reviewer`, `code-reviewer`) receive the block for uniformity and ignore it.

## Output Contract Enforcement

Every delegated agent has a structured output contract. Pilot parses agent output by heading name. If a required heading is missing, treat the agent as having returned **BLOCKED** ("Agent output did not contain a required section"). Required sections per agent:

- `mcp-implementer` / `apex-implementer` / `agentforce-implementer` / `core-implementer` → `### Files changed`, `### Verification commands run`, `### Outstanding` (identical contract for all four; the per-task `**Stack:**` field — `mcp` / `apex` / `agentforce` / `core` — selects which one is dispatched — see Phase 2)
- `mcp-tester` / `apex-tester` / `agentforce-tester` → `## Tests written`, `## Test execution` (with a `Result:` line), `## Coverage`, `## Outstanding` (identical contract for all three; the per-task `**Stack:**` field — `mcp-test` / `apex-test` / `agentforce-test` / `core-test` — selects which one is dispatched — see Phase 3)
- `spec-reviewer` → `## Verdict`, `## Files reviewed`, `## Findings`, `## Outstanding`
- `code-quality-reviewer` → `## Verdict`, `## Files reviewed`, `## Findings`, `## Outstanding`
- `code-reviewer` → `## Verdict`, `## Files reviewed`, `## Findings`, `## Outstanding`
- `git-handler` → `## Branch`, `## Commit`, `## PR URL`, `## Pre-commit hooks` (or a `## BLOCKED:` block)

## Setup Progress Tracking

Create up to seven TodoWrite tasks upfront so the user can see the full workflow:

1. **Plan** — "Plan implementation for {TICKET_ID}"
2. **Implement** — "Implement {TICKET_ID}" (depends on 1)
3. **Tests** — "Run testers for {TICKET_ID} per test tasks in plan" (depends on 2)
4. **Code review** — "Code review {TICKET_ID}" (depends on 3)
4.5. **Security scan (conditional)** — "Run security-scanner for {TICKET_ID} if plan touches Apex/AgentForce" (depends on 4) — fires only when the gate in Phase 4.5 Step 1 returns true
5. **Git handler** — "Branch, commit, push {TICKET_ID}" (depends on 4)
6. **Summary** — "Final summary for {TICKET_ID}" (depends on 5)

---

## Phase 1: Plan

**Gate: User must approve the plan before anything else happens.**

Mark task 1 as `in_progress`.

### Step 1.1 — Fetch the Jira ticket

If the Atlassian MCP was unavailable in Pre-Flight, use the user-supplied ticket details from the fallback and skip ahead to Step 1.2.

Otherwise, issue **two `mcp__atlassian__getJiraIssue` calls in parallel** — one assistant turn, two tool uses, do NOT await one before issuing the other:

1. **All fields** — `cloudId` (from Pre-Flight Step 2), `issueIdOrKey: TICKET_ID`, `fields: ["*all"]`, `responseContentFormat: "markdown"`. Captures every custom field (Sprint, Story Points, Scrum Team, Fix Version, Components, Labels, etc.) — defaults drop most of these.
2. **Comments** — same `cloudId` and `issueIdOrKey`, `fields: ["comment"]`, `responseContentFormat: "markdown"`. Comment bodies routinely hold acceptance criteria, security findings, and Figma links that are not in the description.

Combine the two responses for use in Steps 1.2 (cache) and 1.3 (present).

### Step 1.2 — Cache the ticket to the session folder

Write the ticket data to:

```text
${CLAUDE_PLUGIN_DATA}/tmp/${MAX_SESSION_ID}/{TICKET_ID}-jira-ticket.md
```

Use this format:

```markdown
---
ticketId: ALT-XXXXX
summary: "the ticket summary"
issueType: Story
fixVersion: ALT 9.18
parent: null
fetchedAt: 2026-04-28T12:00:00.000Z
---

## Description

(full markdown description from the all-fields response, verbatim)

## Custom Fields

(every non-empty custom field that is not already covered in the frontmatter — Sprint, Story Points, Scrum Team, Components, Labels, Affects Version(s), Linked issues, etc. Skip system / internal fields with no user value.)

## Attachments

(one bullet per attachment: `filename — size — author`. If none, write "None".)

## Comments

(every comment from the comments response, in chronological order: author, date, full body text — never truncated. If none, write "None".)
```

For the MCP-unavailable fallback, paste whatever the user supplied verbatim under `## Description` and leave the other sections as `None` / empty.

The frontmatter is read by `git-handler` for branch naming. The body — description, custom fields, attachments, and comments — is preserved as-is so downstream agents (notably `spec-reviewer`) can read the full ticket without an MCP round-trip. The richer payload is what makes acceptance-criteria-in-comments and security-findings-in-comments visible to spec review.

### Step 1.3 — Present ticket summary to the user

Show:

- Summary, issue type, fix version
- Acceptance criteria (verbatim from the description)
- **Figma links** — scan the description and every comment body for URLs containing `figma.com`. List any found (one per line); if none, state "No Figma links found."
- **Attachments** — list each as `filename — size — author`; if none, state "No attachments."
- Any other links (design docs, related tickets)

### Step 1.4 — Enter plan mode

Call `EnterPlanMode`. The harness will respond with a system-reminder that includes a pre-allocated absolute plan-file path under `~/.claude/plans/<harness-slug>.md`. **Capture that path verbatim as `HARNESS_PLAN_PATH`** — pilot needs it in Step 1.5. From this point on, no source files may be modified until the user approves.

### Step 1.5 — Write plan to the harness path and wait for approval

Produce the plan in the format defined by `max:writing-plans` — read that skill before drafting. Summary of the contract:

- **Required header** (three labelled lines, in this order):
  - `**Goal:** <one sentence>`
  - `**Architecture:** <2–3 sentences on approach, workspaces touched, patterns reused>`
  - `**Tech Stack:** <comma-separated stacks: mcp/typescript, apex, agentforce, genai, lwc, host-app>`
- **Required body** — one section per task, in dependency order. Each section uses this exact shape:
  - `### Task N: <Component Name>` — `N` is the 1-based position; `<Component Name>` is a short human label.
  - `**parallel_safe:** true | false` — `true` only when this task's `Files:` set is disjoint from every other task's `Files:` set.
  - `**depends_on:** [task-X, task-Y]` — optional; omit the line entirely when there are no dependencies.
  - `**Stack:** mcp | apex | agentforce | core` — mandatory. Determines which stack-specific implementer the orchestrator dispatches in Phase 2. See `max:writing-plans` "Stack classification rules" for the routing table; in short:
    - `mcp` when all `Files:` are under `mcp/mcp-*-server-ts/**` or `mcp/shared/typescript/**`.
    - `apex` when all `Files:` are plain Apex (`salesforce/force-app/**/classes/*.cls` + meta + permission set) and the class is **not** an AgentForce InvocableMethod / GenAi-wrapped.
    - `agentforce` when `Files:` includes any `bots/`, `genAiFunctions/`, `genAiPromptTemplates/`, or an InvocableMethod `.cls` that backs a GenAi function.
    - `core` for `mcp/host-app/**`, LWC, mixed-stack tasks, or anything outside the three above.
  - `**Files:**` block — at least one entry. Each entry uses `Create:`, `Modify:`, or `Test:` followed by a concrete path (no globs). `Modify:` may include `:Lstart-Lend`.
  - Checkbox steps — `- [ ] **Step N:** <action>`. The final step is an acceptance check (compile, target verification command, or "tests pass").
- **Authoring lint** (rerun the `max:writing-plans` checks before showing the plan):
  - For every pair of `parallel_safe: true` tasks, their `Files:` sets are disjoint.
  - Every `depends_on:` ID refers to an earlier task in plan order; no forward references; no cycles.
  - Every task has a `**Stack:**` line valued one of `mcp`, `apex`, `agentforce`, `core`.
  - Every task has at least one `Files:` entry — the orchestrator uses this in Phase 4 to map reviewer findings back to tasks.

Risks specific to maxai (FLS gaps, namespace prefixes, GenAi provider count, permission set updates) belong in either the `Architecture:` line or in the relevant task's checkbox steps as explicit verification actions — not as a separate "Risks" section. Ticket-level stack classification is captured in the `Tech Stack:` header line; per-task stack classification (which drives Phase 2 implementer dispatch and Phase 3 tester dispatch) is captured in each task's `**Stack:**` line.

**Plan-shape rules** (enforced by `max:writing-plans` lint and re-checked by `max:per-task-orchestration` §(a)):

- Every code task (`Stack: mcp | apex | agentforce | core`) has only `Create:` and `Modify:` entries in its `Files:` block.
- Every test task (`Stack: mcp-test | apex-test | agentforce-test | core-test`) has only `Test:` entries and a `depends_on:` line pointing at its paired code task.
- A task may not mix code and test entries — split into a paired code + test pair.
- Two file groups in the same stack with no shared symbols belong in two `parallel_safe: true` tasks, not one combined task — that's what unlocks parallel implementer/tester fan-out in Phases 2 and 3.

Write the plan to **`HARNESS_PLAN_PATH`** captured in Step 1.4 (the harness owns the filename). Do not attempt to write to `${SESSION_DIR}` while plan-mode is active — the harness binds the plan-file location and pilot.md must accept it.

Then tell the user:

> "Plan written to `{HARNESS_PLAN_PATH}`. Review it and let me know — approve to proceed with implementation, or share changes and I'll update it."

Wait for the user's response:

- **Approved** → proceed with the post-approval handoff below.
- **Changes requested** → update the plan file at `HARNESS_PLAN_PATH` to reflect the feedback, repeat the message. Stay in plan mode until the user explicitly approves.

#### Step 1.5a — Post-approval: ExitPlanMode and copy to session folder

On explicit user approval:

1. Call `ExitPlanMode`.
2. Copy the harness file's contents into the canonical session-folder path so every downstream phase sees a predictable absolute path:

   ```bash
   PLAN_PATH="${SESSION_DIR}/${TICKET_ID}-plan.md"
   cat "$HARNESS_PLAN_PATH" > "$PLAN_PATH"
   test -s "$PLAN_PATH" || { echo "BLOCKED: plan copy from $HARNESS_PLAN_PATH to $PLAN_PATH failed or produced an empty file"; exit 1; }
   ```

   `Bash(cat:*)` and `Bash(test:*)` are already in pilot's allowed-tools — no new permission grants needed.
3. From this point on, **`PLAN_PATH` is `${SESSION_DIR}/${TICKET_ID}-plan.md`** — that's the absolute path embedded in every Phase 2/3/4 dispatch prompt. The harness file at `HARNESS_PLAN_PATH` is left in place (the harness manages its own `~/.claude/plans/` directory) and is not referenced past this point.
4. Mark task 1 as `completed` and proceed to Phase 2.

Note: the canonical workflow plan lives in `${SESSION_DIR}` (out of the project tree, scoped to the session, never in `git status`). The harness file is just the intermediate write target during plan-mode. Downstream agents only ever see the session-folder path.

---

## Phase 2: Implement (per-task dispatch)

**Auto-gate: Proceed only when every task returns a complete `### Files changed` section.**

Mark task 2 as `in_progress`.

Phase 2 follows `max:per-task-orchestration` — read the skill before starting. The orchestrator (this command) drives the dispatch; implementers receive only their own task slice.

### Step 2.1 — Parse plan and expand the TodoWrite list

Per `max:per-task-orchestration` §(a), parse the plan file at `PLAN_PATH` into a list of task objects. Validate the structure (every task has `Files:`; every task has a recognised `**Stack:**` value; no forward `depends_on:` references; no cycles). If validation fails, stop with a lint error — the plan should have been caught by the `max:writing-plans` lint at Phase 1, but this is the defence-in-depth check.

Expand the existing TodoWrite list (created in "Setup Progress Tracking") to add a per-task entry inside Phase 2:

- `task-1: <task name>` — pending
- `task-2: <task name>` — pending
- …

Each entry transitions `pending → in_progress → completed` as that task dispatches and returns.

### Step 2.2 — Dispatch waves

Per `max:per-task-orchestration` §(b), build dispatch waves by topological sort of `depends_on:`. For each wave:

1. **Parallel sub-wave** — every task in the wave with `parallel_safe: true` and all `depends_on:` satisfied. Issue **one `Agent` tool call per task in a single assistant turn** (multiple tool uses in one message) — Superpowers' `dispatching-parallel-agents` pattern, also used by Phase 4's three-reviewer parallel dispatch. A parallel sub-wave can mix `subagent_type` values across calls (e.g. one `mcp-implementer` call alongside one `apex-implementer` call in the same turn). If the parallel sub-wave has more than 5 tasks, split into batches of up to 5 dispatched sequentially within the wave.
2. **Sequential remainder** — tasks with `parallel_safe: false`, dispatched one per assistant turn in plan order, after the parallel sub-wave returns successfully.

**Routing — pick subagent_type per task from `task.stack`:**

| `task.stack` | `subagent_type` |
| --- | --- |
| `mcp` | `mcp-implementer` |
| `apex` | `apex-implementer` |
| `agentforce` | `agentforce-implementer` |
| `core` | `core-implementer` |

Each dispatch uses the prompt template in `max:per-task-orchestration` §(c) — task body verbatim, plus `TICKET_ID`, the cached Jira ticket path, and the session manifest path. **Never** include the plan header, sibling task bodies, `parallel_safe:`, `depends_on:`, or `**Stack:**` metadata in the implementer prompt — the `**Stack:**` field already determined which agent received the dispatch and is not needed inside the worker's prompt.

### Step 2.3 — Route each implementer's output

Classify each returned implementer from its structured headings alone — the agent's output is the only signal pilot uses; do not run git, read files, or open the working tree.

- **Successful** — has `### Files changed` (≥1 file), `### Verification commands run`, and `### Outstanding` without a `BLOCKED:` line → mark its TodoWrite entry `completed`.
- **Blocked** — has `BLOCKED: <reason>` in `### Outstanding`, or is missing a required heading → halt the wave (do not start the sequential remainder, do not start later waves), present the failing task's full output and the wave's other outputs, and suggest: "Fix the blocker in {task-N} and re-run `/max:pilot {TICKET_ID}`."

### Step 2.4 — Phase complete

When every task is Successful, mark task 2 `completed`. Hand the user the implementers' `### Files changed` and `### Outstanding` sections concatenated verbatim — no paraphrase, no diffs, no commentary. Proceed to Phase 3 (Tests).

Reviewers and git-handler discover the changed files by running `git status --porcelain` themselves at point of need; testers receive an explicit `Files:` list from each test task in the plan (Phase 3 dispatches per test task, not via git filtering). The working tree is the single source of truth for reviewers and git-handler from this point on — no manifest file, no env-var dependency.

---

## Phase 3: Tests (per-task tester dispatch)

**Auto-gate: Proceed only when every test task in the plan returns a Pass value (or no test tasks exist).**

Mark task 3 as `in_progress`.

Phase 3 dispatches testers task-by-task using the same wave logic as Phase 2 — `max:per-task-orchestration` §(b). The plan's test tasks (those whose `**Stack:**` is `mcp-test` / `apex-test` / `agentforce-test` / `core-test`) are the units of work; pilot does NOT fan out a fixed three-tester squad anymore.

### Step 3.1 — Identify test tasks in the plan

Re-read the plan from `PLAN_PATH`. Filter to tasks whose `**Stack:**` ends in `-test`. Three outcomes:

- **Zero test tasks** → skip Phase 3 entirely with note: "No test tasks in plan — skipping tester phase." Mark task 3 `completed` and proceed to Phase 4.
- **One or more test tasks** → continue to Step 3.2.

### Step 3.2 — Dispatch waves

Per `max:per-task-orchestration` §(b), build dispatch waves from the test-task subset. A test task's `depends_on:` typically points at its paired code task — those code tasks are already complete from Phase 2, so most test tasks become ready immediately and form a single wave. For each wave:

1. **Parallel sub-wave** — every test task in the wave with `parallel_safe: true` and all `depends_on:` satisfied. Issue **one `Agent` tool call per test task in a single assistant turn** (multiple tool uses in one message). A parallel sub-wave can mix tester subagent_types — e.g., one `mcp-tester` call alongside one `apex-tester` call alongside one `agentforce-tester` call in the same turn. Multiple tasks of the same stack with disjoint `Files:` also fan out as parallel calls (e.g., two `mcp-tester` calls in one turn). If the parallel sub-wave has more than 5 tasks, split into batches of up to 5 dispatched sequentially within the wave.
2. **Sequential remainder** — tasks with `parallel_safe: false`, dispatched one per assistant turn in plan order, after the parallel sub-wave returns successfully.

**Routing — pick subagent_type per test task from `task.stack`:**

| `task.stack` | `subagent_type` |
| --- | --- |
| `mcp-test` | `mcp-tester` |
| `apex-test` | `apex-tester` |
| `agentforce-test` | `agentforce-tester` |
| `core-test` | `mcp-tester` *(temporary; revisit when a dedicated `core-tester` exists)* |

Each dispatch uses the prompt template in `max:per-task-orchestration` §(c) — task body verbatim, plus `TICKET_ID`, the cached Jira ticket path, and the toolchain block. **Never** include the plan header, sibling task bodies, `parallel_safe:`, `depends_on:`, or `**Stack:**` metadata in the tester prompt — the `**Stack:**` field already determined which agent received the dispatch and is not needed inside the worker's prompt.

### Step 3.3 — Route each tester's output

Each tester writes a `## Test execution` section with a `Result:` line. Acceptable values per agent:

| Agent | Pass values | Stop values |
| --- | --- | --- |
| mcp-tester | `PASSED`, `PASSED_WITH_COVERAGE_GAP` | `FAILED`, `BLOCKED` |
| apex-tester | `PASSED`, `PASSED_WITH_COVERAGE_GAP` | `FAILED`, `BLOCKED` |
| agentforce-tester | `PASSED`, `PASSED_WITH_FLAKES` | `FAILED`, `BLOCKED` |

- **Pass** — has the structured contract (`## Tests written`, `## Test execution` with a Pass value, `## Coverage`, `## Outstanding`) → mark its TodoWrite entry `completed`.
- **Stop** — `Result:` is FAILED or BLOCKED, or required headings are missing → halt the wave (do not start the sequential remainder, do not start later waves), present the failing task's full output and the wave's other outputs, and suggest: "Fix the failure in {test-task-N} and re-run `/max:pilot {TICKET_ID}`."

### Step 3.4 — Confirm with the user

When every test task is Pass, confirm explicitly:
> "All test tasks returned acceptable results. Proceed to code review?" — **[Yes, proceed]** / **[No, stop here]**.

If yes → mark task 3 as `completed`. Proceed to Phase 4 (Code Review).
If no → stop the workflow.

---

## Phase 4: Code Review (3 reviewers, parallel)

**Gate: User confirms after all three reviewers return APPROVED. Loop back to the affected code/test tasks up to 2 iterations on any unresolved findings.**

Phase 4 runs three reviewers in parallel on every iteration, each with a single, narrow mandate:

1. **`spec-reviewer`** — does the diff match the approved plan? (Missing requirements + extra/out-of-scope work.) Iteration-agnostic.
2. **`code-quality-reviewer`** — is the code clean, testable, maintainable per the `max:code-review` skill? Iteration-agnostic.
3. **`code-reviewer`** — full sweep including FLS / write-tool audit, multi-stack convention overlays, namespace discipline, permission-set entries. Iteration-aware.

By the time Phase 4 runs, both source code (Phase 2 implementers) and tests (Phase 3 testers) are in the working tree, so each reviewer's `git diff --name-only origin/master` includes both kinds of files in a single review pass. None of the three gates the next *within* a single iteration, so pilot dispatches all three together, waits for every one to return, then decides whether to proceed, loop, or stop.

Mark task 4 as `in_progress`.

Set `review_iteration = 1` and `max_review_iterations = 2`. Pilot owns the counter — only `code-reviewer` is told the iteration number.

### Review loop

On each iteration, dispatch all three reviewers in parallel.

In a single assistant turn, issue **three `Agent` tool calls in parallel** — multiple tool uses in one message, do NOT await one before issuing the next or they will serialize and the phase will take ~2× longer:

1. **`spec-reviewer`** with:
   - `TICKET_ID`
   - `base_ref = origin/master`
   - Path to the plan file (`PLAN_PATH` from Step 1.5a; absolute path)
   - Path to the cached Jira ticket

   Do NOT pass a file list. Do NOT pass an iteration number — spec-reviewer is iteration-agnostic. The reviewer enumerates the diff scope itself via `git diff --name-only origin/master` plus `git ls-files --others --exclude-standard`.

2. **`code-quality-reviewer`** with the same inputs as the spec-reviewer (no iteration number).

3. **`code-reviewer`** with:
   - `TICKET_ID`
   - `iteration = {review_iteration}` (this agent IS iteration-aware — its own logic returns BLOCKED if iteration 2 still has unresolved Blocking findings)
   - `base_ref = origin/master`
   - Path to the plan file (`PLAN_PATH` from Step 1.5a; absolute path)
   - Path to the cached Jira ticket

4. **Wait for all three to return, then collect outputs.** For each, parse `## Verdict`. Treat any output missing the required headings (`## Verdict`, `## Files reviewed`, `## Findings`, `## Outstanding`) as BLOCKED per the Output Contract Enforcement rules.

5. **Decide based on the combined verdicts:**

### All three APPROVED

- Present the reviewers' outputs to the user, in order: spec-reviewer, code-quality-reviewer, code-reviewer.
- For each agent, show:
  1. `## Files reviewed` — verbatim
  2. `## Findings` — verbatim
  3. `## Verdict: APPROVED`
  4. `## Outstanding` — verbatim
- Ask: "All three reviewers approved. Proceed to security scan and git-handler?" with options **[Yes, proceed]** / **[No, stop here]**.
- If yes → mark task 4 as `completed`. Proceed to Phase 4.5 (which may auto-skip and forward to Phase 5).
- If no → stop the workflow.

### Any reviewer returned CHANGES REQUESTED (regardless of the others' verdicts)

- Increment `review_iteration`.
- If `review_iteration > max_review_iterations` (i.e., already at iteration 2 and at least one reviewer is still CHANGES REQUESTED) → stop. Present all three reviewers' outputs to the user with: "Code review still requesting changes after 2 iterations. Address the remaining findings manually, then re-run pilot."
- Otherwise → route findings to tasks per `max:per-task-orchestration` §(d). Concatenate each non-APPROVED reviewer's `## Findings` section, prefixed with the agent name (`### spec-reviewer findings`, `### code-quality-reviewer findings`, `### code-reviewer findings`), into a single combined block. Then, per §(d), for each finding extract referenced file paths and map them to the owning task's `Files:` (Step 2 of §(d)); classify each as code-side or test-side (Step 2b); group findings by owning task (Step 3); identify paired test tasks needing re-validate (also Step 3's `propagate_revalidate` set). Re-dispatch **only** the tasks with non-empty findings buckets and the propagated re-validate test tasks — tasks with no findings and no propagation are skipped. Re-dispatched tasks follow the same wave logic as Phase 2/3 (parallel sub-wave first, sequential remainder after). After every relaunched code task completes, its paired re-validate test tasks fire in the next wave. Once all relaunched workers finish, loop back to step 1 (re-review) with the incremented iteration number — all three reviewers run again on the updated diff (which now includes both the re-implemented source and the re-validated tests).

### Any reviewer returned BLOCKED

- Stop. Present all three reviewers' full outputs and the specific blocking reason from the BLOCKED reviewer. Do not loop.

---

## Phase 4.5: Security Scan (Apex / AgentForce only)

**Gate: this phase runs only when the plan contains at least one `apex` / `agentforce` / `apex-test` / `agentforce-test` task. For all-MCP or all-host-app tickets it auto-skips with a one-line note and proceeds directly to Phase 5.**

Phase 4.5 catches Apex/FLS/SOQL findings **before** push, so the post-push CI scanner and claude-auto-review bot rarely see them. It is bounded at 2 iterations, mirroring Phase 4's pattern.

### Step 4.5.1 — Gate check

```bash
PLAN_PATH="${SESSION_DIR}/${TICKET_ID}-plan.md"
HAS_APEX_OR_AGENTFORCE=$(grep -cE '^\*\*Stack:\*\*[[:space:]]+(apex|agentforce|apex-test|agentforce-test)[[:space:]]*$' "$PLAN_PATH")
```

If `$HAS_APEX_OR_AGENTFORCE` equals `0`:

- Mark task 4.5 as `completed` with note "Skipped — no Apex or AgentForce tasks in plan."
- Proceed directly to Phase 5.

Otherwise → mark task 4.5 as `in_progress` and continue.

### Step 4.5.2 — Iteration counter

Set `scan_iteration = 1` and `max_scan_iterations = 2`. Mirror Phase 4's `review_iteration` / `max_review_iterations` pattern. Pilot owns the counter — only `security-scanner` is told the iteration number.

### Step 4.5.3 — Dispatch `security-scanner`

Issue **one** `Agent` tool call with:

- `subagent_type: security-scanner`
- `TICKET_ID`
- `iteration = {scan_iteration}`
- `base_ref = origin/master`
- Path to the plan file (`PLAN_PATH` — absolute)
- Path to the cached Jira ticket
- Toolchain block (NODE / NPM / NPX / SF as resolved in Pre-Flight Step 3.5)

Wait for the agent to return.

### Step 4.5.4 — Route the verdict

Parse `## Verdict` from the agent's output. Treat output missing any required heading (`## Verdict`, `## Files scanned`, `## Findings Summary`, `## Mapped Findings`, `## Recommended Fixes`, `## Outstanding`) as `BLOCKED` per Output Contract Enforcement.

### APPROVED

- Present `## Findings Summary`, `## Mapped Findings`, `## Recommended Fixes`, and `## Outstanding` to the user, verbatim.
- Ask: "Security scan returned APPROVED. Proceed to git-handler?" — **[Yes, proceed]** / **[No, stop here]**.
- If yes → mark task 4.5 as `completed`. Proceed to Phase 5.
- If no → stop the workflow.

### CHANGES REQUESTED

- Increment `scan_iteration`.
- If `scan_iteration > max_scan_iterations` (already at iteration 2 and findings still requested) → stop. Present the agent's full output with: "Security scan still requesting changes after 2 iterations. Address remaining findings manually, then re-run pilot."
- Otherwise → route findings to tasks per `max:per-task-orchestration §(d)`. The agent's `## Mapped Findings (by owning task)` already groups findings by task — extract each task's findings bucket directly. Re-dispatch **only** the code tasks with non-empty findings buckets and their paired test tasks (test re-validation propagation per §(d) Step 3). Wave logic follows Phase 2 (parallel sub-wave first, sequential remainder after). Once re-dispatched workers finish, loop back to Step 4.5.3 with the incremented iteration number — the scanner runs again on the updated diff.

### BLOCKED

- Stop. Present the agent's full output and the specific blocker from `## Outstanding`. Do not loop.

---

## Phase 5: Git Handler

**Auto-gate: Proceed only if pre-commit hooks pass and the push succeeds.**

Mark task 5 as `in_progress`.

Launch the **git-handler** agent with:

- `TICKET_ID`
- `REVIEWER_VERDICT = APPROVED` (must literally be the string `APPROVED` — git-handler refuses anything else)
- `ISSUE_TYPE` from the Jira ticket frontmatter (so the agent picks `bugfix/` vs `feature/` correctly)
- `JIRA_SUMMARY` from the Jira ticket frontmatter (so the agent builds a sensible branch slug)

Do NOT pass a file list. git-handler runs `git status --porcelain` itself to determine staging targets, branches off `master`, stages explicit paths only (no `git add -A`), runs Husky pre-commit hooks, pushes, and returns a Bitbucket PR URL it computes from `git remote get-url origin`.

Wait for the agent. Inspect:

- **Success** (`## Branch`, `## Commit`, `## PR URL`, `## Pre-commit hooks: PASSED` all present) → mark task 5 as `completed`. Capture branch name, commit SHA, commit message first line, PR URL, pre-commit summary. Proceed to Phase 6.
- **`## BLOCKED: Step N — ...`** → stop. Present the full BLOCKED block including git state and any hook failure details. The commit may or may not exist locally — git-handler will say.

---

## Phase 6: Summary

Mark task 6 as `completed`.

Present the final report in **exactly** this structure:

```markdown
### Pilot Summary — {TICKET_ID}

**Ticket:** {TICKET_ID} — {summary}
**Type:** {issue type}

#### Implementation
{each dispatched implementer's `### Files changed` list, concatenated verbatim — one line per file, grouped by task or stack as the consolidated Phase 2 summary}

#### Tests
{one bullet per dispatched test task, in plan order: `**{task-id} ({task.stack})**: {Result} + one-line coverage summary`. If the plan had no test tasks, write a single line: "No test tasks in plan — Phase 3 skipped."}

#### Code Review — {APPROVED}
{Findings count by severity, verbatim from code-reviewer's `## Findings` section: e.g., "Blocking: 0, Suggested: 2, Nit: 1"}

#### Git
**Branch:** {branch name}
**Commit:** {SHA + first line of commit message}

### Create Pull Request
{Bitbucket PR URL — surfaced verbatim from git-handler}

### Next Steps
1. Open the PR URL above and review the diff
2. Verify deploy on a connected scratch org if Apex/GenAi changed
3. Manually test host-app changes on localhost dev server (no automated tests)
```

The PR URL must be the exact string git-handler returned — never reconstruct or "fix" it.

---

## Error Handling

If the workflow stops at any phase, always report:

1. **Which phase failed** and at which step
2. **The agent's full output** (status, error details, findings)
3. **What completed successfully** (reference the TodoWrite list)
4. **How to resume**: "Fix the issue and re-run `/max:pilot {TICKET_ID}`"

Never silently skip a phase. Never proceed past a failed gate. Never attempt to fix implementation, review, test, or hook failures from the orchestrator — that is the agents' job. Pilot is a router, not a doer.

---

<!-- Architecture decisions captured here:
  Phase 1.5 (Schema Consult) — NOT a fixed phase. `altify-schema-expert` is invoked on-demand
    by `apex-implementer` and `agentforce-implementer` via the Agent tool, only when they
    need to confirm a field name or relationship at write-time. See the
    "Schema Expert Consultation" section in each implementer's body. This is Gate E from
    `~/projects/max-plugin/plugin-component-scan.md`.
  Phase 4.5 (Security Scan) — IMPLEMENTED. See Phase 4.5 block above. Fires only when the
    plan contains an apex/agentforce/-test task; otherwise auto-skips.
-->
