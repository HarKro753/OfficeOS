---
description: Feature development orchestrator using only native Claude Code primitives — use when starting any task, fixing a bug, or building a feature. Takes a task, bug, or feature request as argument. Chains discovery, codebase exploration, clarifying questions, multi-architect planning, implementation, quality review, and ship — all without depending on the superpowers plugin.
---

# Forge — Native Feature Development Orchestrator

An orchestrator that discovers the real problem, explores the codebase deeply, compares architectural approaches, and ships with specialist quality gates. Unlike `hai:craft`, forge depends only on Claude Code's built-in agents (`Explore`, `Plan`), the `pr-review-toolkit:*` review agents, and the local `hai:*` domain skills. No `superpowers:*` skills are invoked.

## Execution Rules

- **Do NOT use `EnterPlanMode` or `ExitPlanMode` for this skill's workflow.** This skill IS the plan — follow the phases sequentially.
- If the session is currently in plan mode, **call `ExitPlanMode` immediately — do NOT write a plan first.** The forge skill IS the plan; writing a plan file to exit plan mode is wasted effort. This is the one allowed use of `ExitPlanMode`.
- **Never skip phases. Never reorder phases.** Each phase must complete before the next begins.
- **Track each phase** via `TaskCreate`/`TaskUpdate` so progress is visible in the status line (see Phase Tracking below).

## Capability Map

This orchestrator uses explicit agent and skill mappings defined in [references/capability-inventory.md](references/capability-inventory.md). No runtime scanning needed — use the exact names from that file.

## Current Context

- **Branch:** !`git branch --show-current 2>/dev/null || echo "unknown"`
- **Repo root:** !`git rev-parse --show-toplevel 2>/dev/null || echo "Not a git repo"`
- **Worktrees:** !`git worktree list 2>/dev/null || echo "Not a git repo"`
- **Existing plans:** !`find . -name "*.md" -path "*/plans/*" -o -name "*plan*.md" 2>/dev/null | head -10 || echo "None"`

## Pre-flight: Check for Existing Work

Before starting Phase 0, check the injected context above:

1. If "Existing plans" shows any `.md` files, read each and check for `**Status:** In Progress`
2. If an in-progress plan is found, use `AskUserQuestion`:
   - "Found existing plan: `<filename>`. Resume or start new?"
   - Options: Resume / Start new
3. If resume: Determine state and skip to the appropriate phase:
   - Plan exists but no code changes → Phase 5 (Implementation)
   - Code exists but uncommitted → Phase 6 (Quality Review)
   - Review feedback pending → Phase 6 checkpoint
4. If start new: Proceed to Phase 0
5. If no existing plans: Proceed to Phase 0

## Phase Tracking (MANDATORY)

After Pre-flight resolves, **create a task for each phase** using `TaskCreate` so progress is visible in the status line:

| Subject | activeForm |
|---|---|
| Phase 0: Workspace Setup | Setting up workspace |
| Phase 1: Discovery | Discovering problem space |
| Phase 2: Codebase Exploration | Exploring codebase |
| Phase 3: Clarifying Questions | Clarifying requirements |
| Phase 4: Architecture + Plan | Designing architecture |
| Phase 5: Implementation | Implementing solution |
| Phase 6: Quality Review | Reviewing quality |
| Phase 7: Ship | Shipping |

As you enter each phase: set its task to `in_progress`. As you leave: set it to `completed`.

**Persist progress to plan file:** At every checkpoint and phase transition, update the `## Progress` checklist in the plan file (`[x]` for completed, `[ ]` for pending). This survives `/compact` — task list state does not.

**Recovery after /compact:** If the task list is empty but a plan file exists with progress checkmarks, read the plan file, recreate tasks from the Progress section, and resume from the first unchecked phase.

---

## Phase 0: Workspace Setup

**Goal:** Isolate the work so the main branch stays clean.

### Step 0.1: Derive a branch name

From the request (`$ARGUMENTS`), pick a conventional branch name:

- Feature: `feat/<short-slug>` (e.g., `feat/add-auth`)
- Bug fix: `fix/<short-slug>` (e.g., `fix/slow-query`)
- Refactor: `refactor/<short-slug>`
- Chore: `chore/<short-slug>`

Keep slugs short (3-5 words, hyphen-separated). The branch name is also the worktree directory name.

### Step 0.2: Create the worktree

Run the native git worktree commands directly. Put worktrees under a sibling `.worktrees/` directory so the main repo stays tidy:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
BRANCH="<derived-branch>"
WORKTREE_PATH="$REPO_ROOT/.worktrees/$(basename "$BRANCH")"
mkdir -p "$(dirname "$WORKTREE_PATH")"
git worktree add -b "$BRANCH" "$WORKTREE_PATH"
```

Store `$WORKTREE_PATH` for cleanup in Phase 7. All subsequent file operations happen inside the worktree.

If the branch already exists (e.g., resuming prior work), use `git worktree add "$WORKTREE_PATH" "$BRANCH"` without `-b`.

### Step 0.3: Check CLAUDE.md for post-worktree setup

After creation, check two places for project-specific worktree setup instructions (CLAUDE.md is already in your context — do NOT grep, just recall):

1. **CLAUDE.md** — any section mentioning "worktree" setup, post-worktree steps, generated files, or files in `.gitignore` that need copying into the new worktree
2. **Auto-memory** — your memory directory for project-specific notes about worktree setup

If either source specifies post-worktree steps (e.g., copying `.env`, running codegen, linking `node_modules`), follow them now. Then proceed to Phase 1.

---

## Phase 1: Discovery

**Goal:** Understand the problem space and confirm direction before exploring code in depth.

### Step 1.1: Lightweight codebase survey

Dispatch a single `Explore` agent with thoroughness `quick` to survey code areas that look related to the request. This grounds the problem statement in actual codebase state — not assumptions. Feed the agent enough context that it can form useful search queries (key terms from the request, hypothesized file paths, adjacent features).

### Step 1.2: Classify the request

Read `$ARGUMENTS` and decide:

- **Bug fix** (words like "error", "broken", "regression", "unexpected behavior", stack traces, reproduction steps) → follow the **Debugging flow** below
- **Feature / change** (new capability, refactor, enhancement) → follow the **Brainstorming flow** below

### Step 1.3a: Debugging flow (bugs only)

Do root-cause analysis before proposing any fix. Work through these questions in order, writing your reasoning plainly:

1. **Reproduce** — What exact inputs, state, or steps trigger the bug? Can you run it locally?
2. **Observe** — What's the actual behavior vs. the expected behavior? Capture exact error messages, stack traces, or output diffs.
3. **Hypothesize** — List 2-3 candidate root causes, ranked by likelihood. Explain what evidence would confirm or rule out each.
4. **Verify** — Read the suspect code. Use `Grep`/`Read` to trace the execution path. Check assumptions (is that variable really null? does that callback really run?).
5. **Root cause** — State the actual root cause in one sentence. Resist the urge to fix symptoms. If you can't confidently name the root cause, keep investigating — don't proceed to a fix.
6. **Confirm** — Before moving to Phase 2, restate: "The bug is X. It's caused by Y. Fixing Y means changing Z."

### Step 1.3b: Brainstorming flow (features only)

Before committing to a solution, explore what the user actually wants:

1. **Reframe the request** in your own words. What problem does the user have? (Not "what they asked for" — "why they asked.")
2. **List user goals** — what does success look like from their perspective? What would make them say "yes, that's exactly it"?
3. **Surface assumptions** — what are you assuming about scope, users, data, constraints? Call out anything uncertain.
4. **Propose 2-3 solution directions** — briefly sketch distinct approaches (different in philosophy, not just implementation). For each, name a tradeoff.
5. **Recommend one direction** and explain why.

The output of this step is a short written summary the user can react to in Phase 3.

---

## Phase 2: Codebase Exploration

**Goal:** Deep, parallel exploration of the codebase to inform architecture.

Dispatch **2-3 `Explore` agents in parallel** (single message, multiple `Agent` tool calls) with thoroughness `medium` or `very thorough`. Each explores a different dimension:

1. **Feature context** — existing code closest to the planned changes (files, modules, tests)
2. **Pattern analysis** — conventions, abstractions, and patterns used elsewhere in the codebase for similar problems
3. **Integration surface** — boundaries, APIs, types, and dependencies the change will touch

Feed each agent: the problem statement from Phase 1, the chosen direction (for features) or root cause (for bugs), and specific questions you need answered. Collect all three results before proceeding — do not start Phase 3 with partial exploration data.

---

## Phase 3: Clarifying Questions

**Goal:** Resolve ambiguities discovered during exploration before committing to an architecture.

Synthesize findings from Phase 2 and identify:

- Ambiguous requirements that could go multiple reasonable ways
- Technical constraints (existing patterns, API shapes, perf limits) that force a decision
- Trade-offs the user should weigh in on (e.g., "do we refactor X while we're here, or leave it alone?")

If questions exist, present them via `AskUserQuestion` — batch related questions into a single call (up to 4). If exploration resolved all ambiguities, state that explicitly and proceed to Phase 4.

---

## Phase 4: Architecture + Plan

**Goal:** Compare architectural approaches, pick one, write a detailed plan.

### Step 4.1: Multi-architect comparison

Dispatch **2-3 `Plan` agents in parallel**, each with a different philosophy. The `Plan` agent is Claude Code's built-in architect — each instance receives the same problem context but a different philosophical constraint:

1. **Minimal** — smallest change footprint, least disruption to existing code
2. **Clean** — best long-term architecture, may refactor adjacent code when it's the right call
3. **Pragmatic** — balanced approach, ships fast without cutting corners

Each agent receives:

- The problem statement and chosen direction (from Phase 1)
- All three Phase 2 exploration results
- Phase 3 clarification answers
- Explicit instruction on which philosophy to apply ("propose the minimal-footprint approach" etc.)

### Step 4.2: Present approaches

Display a comparison table the user can scan at a glance:

```
| Approach   | Files touched | Key tradeoff                | Est. complexity |
|------------|---------------|-----------------------------|-----------------|
| Minimal    | 3             | Carries existing tech debt  | Low             |
| Clean      | 11            | Refactors shared module     | Medium-High     |
| Pragmatic  | 5             | New abstraction scoped to X | Medium          |
```

Use `AskUserQuestion` to let the user pick an approach (or modify one).

### Step 4.3: Write the plan

Use [plan-template.md](plan-template.md) as the structure. Write the plan directly to `plans/<slug>.md` in the worktree. Fill in:

- Problem statement (from Phase 1)
- Solution direction (from Phase 4.2)
- Goals and non-goals
- Implementation steps (concrete files, concrete changes — not vague bullets)
- Verification checklist

State the plan file path so the user can open it directly.

### Checkpoint: Plan approval

Use `AskUserQuestion`:

- **Execute** — "Start implementation"
- **Edit** — "I have changes"
- **Abort** — "Stop here, save for later"

If the user picks **Edit**, revise the plan and ask again. If **Abort**, update plan status to `Paused` and stop.

---

## Phase 5: Implementation

**Goal:** Execute the plan.

### Step 5.1: Load domain skills (MANDATORY)

1. Extract technologies from the plan (languages, frameworks, libraries, domains)
2. Match against the **Domain Skills** table in [references/capability-inventory.md](references/capability-inventory.md)
3. **Print the match table** showing which skills will be loaded and why
4. **Invoke EACH matched skill** via the `Skill` tool — one call per match
5. If zero match: state explicitly — "No domain skills matched: [technologies checked]"

### Step 5.2: Pick an execution mode

Choose based on the plan's shape:

- **Test-driven** — if the project has a testing framework configured AND the plan changes behavior (not just refactors). For each step: write the failing test first, run it to confirm it fails for the right reason, implement until it passes, refactor. Commit often.
- **Parallel subagents** — if the plan has **3+ genuinely independent tasks** (no file overlap, no shared types being modified). Dispatch each as a separate `Agent` call in one message. Merge results afterward. Only use this when the independence is real — false parallelism creates merge pain.
- **Sequential** — the default. Walk through plan steps one at a time, updating the plan's `## Progress` checklist as each completes.

Apply domain skill guidance throughout (patterns, anti-patterns, conventions from Phase 5.1 skills).

### Step 5.3: Keep the plan alive

As you implement, update the plan file when reality diverges from the plan:

- New step discovered? Add it.
- Step no longer needed? Strike it through with rationale.
- Approach changed mid-step? Update the step and add a `## Change Log` entry.

Proceed directly to Phase 6 after implementation.

---

## Phase 6: Quality Review

**Goal:** Specialist verification and code quality.

### Step 6.1: Verification

Before dispatching reviewers, verify the work yourself:

1. **Run the test suite.** Use whatever command the project uses (`npm test`, `pytest`, `go test ./...`). All tests must pass.
2. **Run type checks and lints** if the project uses them.
3. **Inspect `git diff`** — read every change. Confirm each chunk is intentional. Look for:
   - Debug code, `console.log`, commented-out blocks
   - Files touched that shouldn't have been
   - Generated files that should be gitignored
   - TODOs you meant to resolve

Fix anything obviously wrong before moving on. Don't waste reviewer time on things you can catch yourself.

### Step 6.2: Dispatch review agents (MANDATORY)

Dispatch in a **single message with parallel `Agent` tool calls** (foreground, NOT background). One call per agent — verify the count before sending.

**CORE agents — dispatch ALL:**

| subagent_type | What it checks |
|---|---|
| `pr-review-toolkit:code-reviewer` | Holistic changeset review against plan and standards |
| `pr-review-toolkit:silent-failure-hunter` | Suppressed errors, bad fallbacks |
| `pr-review-toolkit:pr-test-analyzer` | Tests cover new functionality and edge cases |
| `pr-review-toolkit:code-simplifier` | Simplify code while preserving functionality |

**CONDITIONAL agents — dispatch only when trigger is met:**

| subagent_type | Trigger | What it checks |
|---|---|---|
| `pr-review-toolkit:type-design-analyzer` | New types in `git diff` | Encapsulation and invariant quality |
| `pr-review-toolkit:comment-analyzer` | New/modified doc comments in `git diff` | Comment accuracy and maintainability |

### Step 6.3: Domain skill review

1. **UI check (MANDATORY):** Run `git diff --name-only`. If any file has a UI-related extension (`.tsx`, `.jsx`, `.html`, `.css`, `.scss`, `.vue`, `.svelte`, `.ejs`, `.hbs`), invoke `hai:web-design-guidelines`. This is extension-triggered, not keyword-matched.
2. **Re-check domain skills** — invoke any from the capability map that weren't loaded in Phase 5 but are relevant to review (e.g., `hai:security` for auth changes, `hai:react-doctor` for React diagnostics).
3. Apply review criteria from ALL loaded domain skills against the changeset — accessibility checks, performance patterns, framework-specific anti-patterns, design compliance, etc.

### Step 6.4: Triage findings

Classify each finding:

- **Blocker** — correctness bugs, security vulnerabilities, data loss, broken tests
- **Warning** — style, simplification, nice-to-have

Display a grouped summary:

```
### Review Summary
**Blockers ([B]):** [list]
**Warnings ([W]):** [list]
```

Fix all blockers before the checkpoint. Warnings are logged in the summary and deferred to the user — don't silently fix them, don't silently skip them.

If blockers were found and fixed, re-run verification (Step 6.1) before continuing to Phase 7.

---

## Phase 7: Ship

**Goal:** Capture learnings, close out, deliver.

### Step 7.1: Update the plan file

Set status to `Completed` (or `Partial` if scope was trimmed). Add a `## Deviations` section listing anything that changed from the original plan and why. Add a `## Key Insights` section for non-obvious learnings worth remembering.

### Step 7.2: Commit and finish the branch

Use `AskUserQuestion` to let the user pick:

- **Merge** — checkout base branch, merge the feature branch, remove the worktree
- **PR** — push the branch, run `gh pr create` with a summary and test plan, leave the worktree until merge
- **Keep** — leave the worktree and branch as-is for continued work
- **Discard** — remove the worktree and delete the branch (confirm before destructive action)

For each path:

**Merge:**
```bash
cd "$REPO_ROOT"
git checkout <base-branch>
git merge --no-ff <feature-branch>
git worktree remove "$WORKTREE_PATH"
```

**PR:**
```bash
git -C "$WORKTREE_PATH" push -u origin <feature-branch>
gh pr create --title "..." --body "$(cat <<'EOF'
## Summary
- <bullet 1>

## Test plan
- [ ] <check 1>
EOF
)"
```

**Discard:** confirm with the user first, then `git worktree remove` and `git branch -D`.

Always create new commits — never amend published commits, never `--force-push` without explicit user authorization.

### Step 7.3: Summary

Display to the user:

- What was built (one-line summary)
- Plan file path
- PR link (if created)
- Key learnings captured in the plan

---

## Living Document Principle

**The plan file is a living document.** At any checkpoint:

1. Update the plan to reflect new decisions
2. Add to the `## Change Log` section:

```markdown
## Change Log

### [Checkpoint N] - [Brief description]
**User feedback**: [What the user requested]
**Change**: [What was modified]
```

This keeps the plan an honest record of what actually happened, not just what was intended — useful for learning and for picking up work after `/compact`.
