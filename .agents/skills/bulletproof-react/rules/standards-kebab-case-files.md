---
title: Enforce Kebab-Case Filenames
impact: MEDIUM
impactDescription: prevents case-sensitivity bugs across operating systems
tags: standards, naming, files, kebab-case, biome
---

## Enforce Kebab-Case Filenames

Use kebab-case for all TypeScript/TSX files and directories. Enforce via Biome's `useFilenamingConvention` rule. Kebab-case prevents case-sensitivity issues between macOS (case-insensitive) and Linux CI (case-sensitive).

**Incorrect (mixed casing):**

```
src/
  features/
    UserProfile/
      UserProfile.tsx
      UserAvatar.tsx
      useUserData.ts
```

**Correct (kebab-case everywhere):**

```
src/
  features/
    user-profile/
      user-profile.tsx
      user-avatar.tsx
      use-user-data.ts
```

**Biome enforcement:**

```json
// biome.json
{
  "linter": {
    "rules": {
      "style": {
        "useFilenamingConvention": {
          "level": "error",
          "options": {
            "filenameCases": ["kebab-case"],
            "requireAscii": true
          }
        }
      }
    }
  }
}
```

**Why kebab-case over PascalCase files:**
- Avoids case-sensitivity bugs (`UserProfile.tsx` works on macOS, fails on Linux)
- Consistent with npm package naming, URL slugs, and HTML conventions
- `git mv` handles renames cleanly — no phantom case-change diffs
