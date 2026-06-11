---
title: Configure IDE Diagnostics for v4
impact: HIGH
impactDescription: silences false positives that train wrong habits
tags: config, ide, lsp, zed, vscode, dx
---

## Configure IDE Diagnostics for v4

The built-in CSS language server in **both VS Code and Zed** flags Tailwind v4 directives as "Unknown at rule":

- `@import "tailwindcss"` ✅ recognized
- `@plugin "..."` ❌ flagged
- `@theme { ... }` ❌ flagged
- `@utility name-* { ... }` ❌ flagged
- `@apply ...` ❌ flagged
- `@source "..."` ❌ flagged
- `--*: initial` (theme reset) may be flagged
- `--spacing(...)`, `--value(...)` functions ❌ flagged

These are false positives. The Tailwind LSP recognizes them; the built-in CSS LSP doesn't. Configure both LSPs so they cooperate.

**Zed (`.zed/settings.json`):**

```json
{
  "lsp": {
    "tailwindcss-language-server": {
      "settings": {
        "classFunctions": ["clsx", "cva", "cn", "tw"]
      }
    },
    "vscode-css-language-server": {
      "settings": {
        "css": { "lint": { "unknownAtRules": "ignore" } }
      }
    }
  }
}
```

Tailwind LSP is **built into Zed** — no extension needed. The CSS LSP block silences the at-rule false positives.

**VS Code (`.vscode/settings.json`):**

```json
{
  "files.associations": { "*.css": "tailwindcss" },
  "css.lint.unknownAtRules": "ignore",
  "scss.lint.unknownAtRules": "ignore",
  "less.lint.unknownAtRules": "ignore",
  "tailwindCSS.classFunctions": ["clsx", "cva", "cn", "tw"]
}
```

Recommend `bradlc.vscode-tailwindcss` for the team.

**Prefer `classFunctions` over `experimental.classRegex`:** `classFunctions` is the stable, official setting for detecting classes inside `clsx()` / `cva()` / `cn()` calls. Reach for `experimental.classRegex` only if you need to detect classes in non-function contexts (TypeScript types, JSON, custom DSLs).
