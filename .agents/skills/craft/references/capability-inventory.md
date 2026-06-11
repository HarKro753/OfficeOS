# Capability Map

Direct lookup tables for all skills and agents used by the craft orchestrator.

## Workflow Skills

Invoke via the **Skill tool** at the phase indicated.

| Phase | Skill | Fallback |
|---|---|---|
| 0: Worktree | `superpowers:using-git-worktrees` | `git worktree add` directly |
| 1: Discovery (features) | `superpowers:brainstorming` | Manual reframing + solution directions |
| 1: Discovery (bugs) | `superpowers:systematic-debugging` | Manual root-cause analysis |
| 4: Plan writing | `superpowers:writing-plans` | Write plan using plan-template.md |
| 5: TDD | `superpowers:test-driven-development` | Write tests alongside implementation |
| 5: Parallel execution | `superpowers:subagent-driven-development` | Use Task tool to dispatch agents |
| 5: Sequential execution | `superpowers:executing-plans` | Implement steps one by one |
| 6: Verification | `superpowers:verification-before-completion` | Run test suite, check git diff |
| 7: Branch completion | `superpowers:finishing-a-development-branch` | `git merge` / `gh pr create` |

## Agents

Use as `subagent_type` in the **Task tool**.

| Capability | subagent_type |
|---|---|
| Codebase exploration | `feature-dev:code-explorer` |
| Architecture design | `feature-dev:code-architect` |
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
