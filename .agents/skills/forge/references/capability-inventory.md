# Capability Map

Direct lookup tables for all agents and skills used by the forge orchestrator. No external plugin dependencies beyond this repo's own `hai:*` domain skills and the `pr-review-toolkit:*` review agents.

## Built-in Agents

Use as `subagent_type` in the **Agent tool**. These ship with Claude Code — no plugin required.

| Capability | subagent_type | Typical use |
|---|---|---|
| Codebase exploration | `Explore` | Phase 1/2: survey relevant code, find patterns, map integration points |
| Implementation planning | `Plan` | Phase 4: compare architectural approaches, produce step-by-step plans |
| Broad multi-step research | `general-purpose` | Open-ended investigations that span tools beyond search/read |

## Review Agents

Use as `subagent_type` in the **Agent tool**. From the `pr-review-toolkit` plugin.

| Capability | subagent_type |
|---|---|
| Code review | `pr-review-toolkit:code-reviewer` |
| Silent failure hunting | `pr-review-toolkit:silent-failure-hunter` |
| Test coverage analysis | `pr-review-toolkit:pr-test-analyzer` |
| Code simplification | `pr-review-toolkit:code-simplifier` |
| Type design analysis | `pr-review-toolkit:type-design-analyzer` |
| Comment analysis | `pr-review-toolkit:comment-analyzer` |

## Domain Skills

Invoke via the **Skill tool** when the plan involves matching technologies.

| Skill | Technology Match |
|---|---|
| `hai:react-best-practices` | React |
| `hai:composition-patterns` | Component architecture, compound components |
| `hai:tailwind-best-practices` | Tailwind CSS |
| `hai:api-layer` | API layer, TanStack Query, data fetching |
| `hai:state-management` | State management, Zustand, URL state |
| `hai:testing-strategy` | Test strategy, test planning |
| `hai:security` | Auth, security, XSS, RBAC |
| `hai:error-handling` | Error boundaries, Sentry, toast notifications, fault tolerance |
| `hai:web-design-guidelines` | UI review, accessibility, design compliance |
| `hai:bulletproof-react` | Project architecture, folder structure |
| `hai:react-doctor` | React diagnostics, post-implementation checks |

## Native Workflow Primitives

Instead of external workflow skills, forge uses these built-in primitives directly:

| Phase concern | Primitive |
|---|---|
| Worktree setup | `git worktree add -b <branch> <path>` |
| Task tracking | `TaskCreate` / `TaskUpdate` |
| Parallel exploration | `Agent` tool with multiple subagent calls in one message |
| Plan authoring | Write directly to `plans/<slug>.md` using `plan-template.md` |
| Verification | Run project's test/lint/typecheck commands; inspect `git diff` |
| Branch completion | `git commit`, `git push`, `gh pr create`, or `git merge` |
