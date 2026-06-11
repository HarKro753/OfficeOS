---
description: Feature development orchestrator — use when starting any task, fixing a bug, or building a feature. Takes a task, bug, or feature request as argument. Chains discovery, codebase exploration, clarifying questions, multi-architect planning, implementation, quality review, and ship.
---

# Craft — Feature Development Orchestrator

An orchestrator that discovers the real problem, explores the codebase deeply, compares architectural approaches, and ships with specialist quality gates.

## Execution Rules

- **Do NOT use `EnterPlanMode` or `ExitPlanMode` for this skill's workflow.** This skill IS the plan — follow the phases sequentially.
- If the session is currently in plan mode, **call `ExitPlanMode` immediately — do NOT write a plan first.** The craft skill IS the plan; writing a plan file to exit plan mode is wasted effort. This is the one allowed use of `ExitPlanMode`.
- **Never skip phases. Never reorder phases.** Each phase must complete before the next begins.
- **Track each phase** via TaskCreate/TaskUpdate so progress is visible in the status line (see Phase Tracking below).

## Model Assignment

Each phase uses a specific model tier to balance reasoning depth vs. speed/cost:

| Phase | Model | Rationale |
|---|---|---|
| 0: Workspace Setup | inherited | Simple git operations |
| 1: Discovery | `sonnet` | Fast exploration, read-heavy |
| 2: Codebase Exploration | `sonnet` | Parallel read-heavy agents |
| 3: Clarifying Questions | inherited | Main agent synthesizes and talks to user |
| 4: Architecture + Plan | `opus` | Deep reasoning for design trade-offs |
| 5: Implementation | `sonnet` | Executes a well-defined plan |
| 6: Quality Review | `opus` | Deep reasoning catches subtle issues |
| 7: Ship | inherited | Simple git operations |

When dispatching agents via the Agent tool, pass the `model` parameter as specified above. "Inherited" means omit the `model` parameter (uses the session's current model).

**Code style directive — include in ALL implementation agent prompts:**
> Write code, not comments. Default to zero comments. Only add a comment when the WHY is non-obvious: a hidden constraint, a workaround, behavior that would surprise a reader. Never explain WHAT the code does — well-named identifiers do that. Never write multi-line comment blocks or verbose docstrings.

## Capability Map

This orchestrator uses explicit skill and agent mappings defined in [references/capability-inventory.md](references/capability-inventory.md). No runtime scanning needed — use the exact names from that file.

## Current Context

- **Branch:** !`git branch --show-current 2>/dev/null || echo "unknown"`
- **Repo root:** !`git rev-parse --show-toplevel 2>/dev/null || echo "Not a git repo"`
- **Worktrees:** !`git worktree list 2>/dev/null || echo "Not a git repo"`
- **Existing plans:** !`find . -name "*.md" -path "*/plans/*" -o -name "*plan*.md" 2>/dev/null | head -10 || echo "None"`

## Pre-flight: Check for Existing Work

Before starting Phase 0, check the injected context above:

1. If "Existing plans" shows any `.md` files, read each and check for `**Status:** In Progress`
2. If an in-progress plan is found, use AskUserQuestion:
   - "Found existing plan: `<filename>`. Resume or start new?"
   - Options: Resume / Start new
3. If resume: Determine state and skip to appropriate phase:
   - Plan exists but no code changes → Phase 5 (Implementation)
   - Code exists but uncommitted → Phase 6 (Quality Review)
   - Review feedback pending → Phase 6 checkpoint
4. If start new: Proceed to Phase 0
5. If no existing plans: Proceed to Phase 0

## Phase Tracking (MANDATORY)

After Pre-flight resolves, **create a task for each phase** using TaskCreate so progress is visible in the status line:

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

**Recovery after /compact:** If task list is empty but a plan file exists with progress checkmarks, read the plan file, recreate tasks from the Progress section, and resume from the first unchecked phase.

---

## Phase 0: Workspace Setup

Invoke `superpowers:using-git-worktrees` — derive branch name from the request (e.g., `feat/add-auth`, `fix/slow-query`). Store worktree path for cleanup in Phase 7.

### Post-worktree: Check CLAUDE.md for Setup Rules

After creation, check for worktree setup instructions in two places (CLAUDE.md is already in your context — do NOT grep, just recall):

1. **CLAUDE.md** — look for any section mentioning "worktree" setup, post-worktree steps, generated files, or files in `.gitignore` that need copying
2. **Auto-memory** — check your memory directory for project-specific notes about worktree setup

If either source specifies post-worktree steps (e.g., copying generated files, running codegen), follow them. Then proceed to Phase 1.

---

## Phase 1: Discovery

**Goal:** Understand the problem space and confirm direction.

### Step 1.0: Lightweight Exploration

Dispatch a single `feature-dev:code-explorer` agent (`model: "sonnet"`) to survey relevant code areas. This grounds the problem statement in actual codebase state.

### Step 1.1: Classify & Invoke

Classify the request ($ARGUMENTS):

- **Bug fix** (error, broken, regression, unexpected behavior) → Invoke `superpowers:systematic-debugging`. Follow its root-cause analysis before proposing solutions.
- **Feature / change** → Invoke `superpowers:brainstorming`. Follow its exploration of intent, requirements, and design before implementation.

---

## Phase 2: Codebase Exploration

**Goal:** Deep, parallel exploration of the codebase to inform architecture.

Dispatch **2-3 `feature-dev:code-explorer` agents in parallel** (`model: "sonnet"`, single message, multiple Task tool calls). Each explores a different dimension:

1. **Feature context** — existing code closest to the planned changes
2. **Pattern analysis** — conventions, abstractions, and patterns used in the codebase
3. **Integration surface** — boundaries, APIs, and dependencies the change will touch

Collect all results before proceeding.

---

## Phase 3: Clarifying Questions

**Goal:** Resolve ambiguities discovered during exploration before committing to architecture.

Synthesize findings from Phase 2 and identify:
- Ambiguous requirements that could go multiple ways
- Technical constraints that affect the approach
- Trade-offs the user should weigh in on

If questions exist, present them via AskUserQuestion (batch related questions). If exploration resolved all ambiguities, state so and proceed.

---

## Phase 4: Architecture + Plan

**Goal:** Compare architectural approaches, pick one, write a detailed plan.

### Step 4.0: Multi-Architect Comparison

Dispatch **2-3 `feature-dev:code-architect` agents in parallel** (`model: "opus"`), each with a different philosophy:

1. **Minimal** — smallest change footprint, least disruption
2. **Clean** — best long-term architecture, may refactor more
3. **Pragmatic** — balanced approach, ships fast without cutting corners

Each agent receives: problem statement, chosen direction, Phase 2 exploration results, Phase 3 answers.

### Step 4.1: Present Approaches

Display a comparison table (files touched, trade-offs, complexity). Use AskUserQuestion to let the user pick an approach.

### Step 4.2: Write Plan

1. Invoke `superpowers:writing-plans` — use [plan-template.md](plan-template.md) for structure if writing directly
2. State the plan file path so the user can open it directly

### Checkpoint: Plan Approval

Use AskUserQuestion:
- **Execute** — "Start implementation"
- **Edit** — "I have changes"
- **Abort** — "Stop here, save for later"

---

## Phase 5: Implementation

**Goal:** Execute the plan.

### Step 5.0: Load Domain Skills (MANDATORY)

1. Extract technologies from the plan (languages, frameworks, libraries, domains)
2. Match against the **Domain Skills** table in [references/capability-inventory.md](references/capability-inventory.md)
3. **Print the match table** showing which skills will be loaded and why
4. **Invoke EACH matched skill** via the Skill tool — one call per match
5. If zero match: state explicitly — "No domain skills matched: [technologies checked]"

### Step 5.1: Execute

- If the project has a testing framework configured: invoke `superpowers:test-driven-development`
- For 3+ independent tasks: invoke `superpowers:subagent-driven-development` (dispatch implementation agents with `model: "sonnet"`)
- For sequential tasks: invoke `superpowers:executing-plans` (implementation runs on the current model)
- Apply domain skill guidance throughout

Proceed directly to Phase 6 after implementation.

---

## Phase 6: Quality Review

**Goal:** Specialist verification and code quality.

### Step 6.0: Verification

Invoke `superpowers:verification-before-completion` — run test suite, check `git diff` for unintended changes.

### Step 6.1: Dispatch Review Agents (MANDATORY)

Dispatch in a **single message with parallel Task tool calls** (foreground, NOT background). One Task call per agent — verify the count before sending. All review agents use `model: "opus"` for deep reasoning on subtle issues.

**CORE agents — dispatch ALL:**

| subagent_type | model | What it checks |
|---|---|---|
| `pr-review-toolkit:code-reviewer` | `opus` | Holistic changeset review against plan and standards |
| `pr-review-toolkit:silent-failure-hunter` | `opus` | Suppressed errors, bad fallbacks |
| `pr-review-toolkit:pr-test-analyzer` | `opus` | Tests cover new functionality and edge cases |
| `pr-review-toolkit:code-simplifier` | `opus` | Simplify code while preserving functionality |

**CONDITIONAL agents — dispatch only when trigger is met:**

| subagent_type | model | Trigger | What it checks |
|---|---|---|---|
| `pr-review-toolkit:type-design-analyzer` | `opus` | New types in `git diff` | Encapsulation and invariant quality |
| `pr-review-toolkit:comment-analyzer` | `opus` | New/modified doc comments in `git diff` | Comment accuracy and maintainability |

### Step 6.2: Domain Skill Review

1. **UI check (MANDATORY):** Run `git diff --name-only` against the changeset. If ANY file has a UI-related extension (`.tsx`, `.jsx`, `.html`, `.css`, `.scss`, `.vue`, `.svelte`, `.ejs`, `.hbs`), invoke `hai:web-design-guidelines`. This is extension-triggered, not keyword-matched.
2. **Re-check domain skills** — invoke any from the capability map that weren't loaded in Phase 5 but are relevant to review (e.g., `hai:security` for auth changes, `hai:react-doctor` for React diagnostics).
3. Apply review criteria from ALL loaded domain skills against the changeset — accessibility checks, performance patterns, framework-specific anti-patterns, design compliance, etc.

### Step 6.3: Triage Findings

Classify each finding:
- **Blocker** — correctness bugs, security vulnerabilities, data loss, broken tests
- **Warning** — style, simplification, nice-to-have

Display grouped summary:

```
### Review Summary
**Blockers ([B]):** [list]
**Warnings ([W]):** [list]
```

Fix all Blockers before checkpoint. Warnings deferred to user.

If blockers found: fix all before proceeding. Warnings: log in summary and continue to Phase 7.

---

## Phase 7: Ship

**Goal:** Capture learnings, close out, deliver.

### Step 7.1: Update Plan File

Set status to `Completed` (or `Partial`). Add `## Deviations` section.

### Step 7.2: Finish the Branch

Invoke `superpowers:finishing-a-development-branch` or use AskUserQuestion:

- **Merge** — checkout base, merge, remove worktree
- **PR** — push, `gh pr create`, remove worktree
- **Keep** — leave worktree for continued work
- **Discard** — remove worktree and branch

### Step 7.3: Summary

Display: what was built, plan file path, PR link (if created), key learnings captured.

---

## Living Document Principle

**The plan file is a living document.** At any checkpoint:

1. Update plan to reflect new decisions
2. Add to the `## Change Log` section:

```markdown
## Change Log

### [Checkpoint N] - [Brief description]
**User feedback**: [What the user requested]
**Change**: [What was modified]
```
