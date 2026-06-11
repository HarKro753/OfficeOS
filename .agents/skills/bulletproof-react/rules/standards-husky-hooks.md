---
title: Pre-Commit Hooks with Husky
impact: MEDIUM
impactDescription: catches issues before they reach the repository
tags: standards, husky, git-hooks, pre-commit, biome
---

## Pre-Commit Hooks with Husky

Use Husky to run Biome and type checking before every commit. This catches issues at the developer's machine, not in CI 10 minutes later.

**Incorrect (no pre-commit checks):**

```
# Developer commits broken code
# CI fails 10 minutes later
# Developer fixes, commits again
# Another 10-minute CI cycle
```

**Correct (pre-commit hooks catch issues locally):**

```json
// package.json
{
  "scripts": {
    "prepare": "husky",
    "check": "biome check --write"
  }
}
```

```bash
# .husky/pre-commit
npx biome check --staged --no-errors-on-unmatched
```

**What `biome check` does in one command:**
1. Lints staged files (catches code quality issues)
2. Formats staged files (consistent style)
3. Sorts imports (organized imports)

**Optionally add type checking:**

```bash
# .husky/pre-commit
npx biome check --staged --no-errors-on-unmatched
npx tsc --noEmit
```

**What NOT to check in pre-commit:**
- Full test suite — too slow, save for CI
- Build — too slow, save for CI
- E2E tests — definitely too slow

**Key principle:** Pre-commit hooks should run in under 10 seconds. Biome is fast enough to lint+format the entire project in milliseconds, so even `--staged` is optional for speed — but it keeps diffs minimal.
