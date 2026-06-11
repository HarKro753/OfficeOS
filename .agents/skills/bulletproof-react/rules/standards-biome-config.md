---
title: Biome for Linting and Formatting
impact: HIGH
impactDescription: single tool replaces ESLint + Prettier with faster execution
tags: standards, biome, linting, formatting, imports
---

## Biome for Linting and Formatting

Use Biome as the single tool for linting, formatting, and import sorting. Biome replaces ESLint + Prettier with a single binary that is orders of magnitude faster. Configure once, enforce architecture and style in one pass.

**Incorrect (multiple tools with overlapping concerns):**

```json
// package.json — three tools, three configs, three processes
{
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "eslint-plugin-import": "^2.0.0",
    "eslint-plugin-check-file": "^2.0.0",
    "eslint-config-prettier": "^9.0.0"
  }
}
```

**Correct (Biome handles everything):**

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 120
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": {
          "level": "error",
          "fix": "safe"
        },
        "noUnusedVariables": {
          "level": "warn",
          "fix": "safe"
        },
        "useExhaustiveDependencies": "warn"
      }
    }
  },
  "assist": {
    "enabled": true
  },
  "css": {
    "parser": {
      "tailwindDirectives": true
    }
  }
}
```

**Editor integration:**

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

**Key advantages over ESLint + Prettier:**
- Single binary — no plugin ecosystem to manage
- 10-100x faster — written in Rust, no Node.js overhead
- No config conflicts — formatting and linting are unified
- Import sorting built in — no `eslint-plugin-import` needed
- `biome check` runs lint + format + import sort in one command
