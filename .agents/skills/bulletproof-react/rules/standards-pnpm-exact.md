---
title: pnpm with Exact Versions
impact: MEDIUM
impactDescription: deterministic installs and no surprise breaking changes
tags: standards, pnpm, dependencies, versioning
---

## pnpm with Exact Versions

Use pnpm as the package manager and pin all dependencies to exact versions. Semver ranges (`^`, `~`) introduce non-deterministic installs — a patch release can silently break your build.

**Incorrect (npm/yarn with semver ranges):**

```json
// package.json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-router": "~7.2.0",
    "@tanstack/react-query": "^5.60.0"
  }
}
```

Different developers get different versions on `npm install`. A transitive dependency bumps, CI breaks, nobody knows why.

**Correct (pnpm with exact versions):**

```
# .npmrc
save-exact=true
```

```json
// package.json
{
  "packageManager": "pnpm@10.4.1",
  "dependencies": {
    "react": "19.0.0",
    "react-router": "7.2.0",
    "@tanstack/react-query": "5.60.5"
  }
}
```

**Setup:**

```bash
# Enable corepack for consistent pnpm version across the team
corepack enable
corepack use pnpm@latest

# Configure exact versions globally (or per-project in .npmrc)
pnpm config set save-exact true
```

**Why pnpm over npm/yarn:**
- Strict dependency isolation — no phantom dependencies from hoisting
- Faster installs via content-addressable storage (hard links, no duplication)
- `pnpm-lock.yaml` is more deterministic than `package-lock.json`
- Built-in workspace support for monorepos

**Why exact versions:**
- Every developer and CI gets the exact same dependency tree
- Upgrades are intentional — `pnpm update react` bumps explicitly
- No surprise breakage from a transitive patch release
- Easier to bisect regressions — you know exactly what changed
