---
title: Naming Conventions
impact: HIGH
impactDescription: consistent naming makes the codebase navigable and searchable
tags: structure, naming, conventions, files, components
---

## Naming Conventions

Use kebab-case for files and directories. Use PascalCase for React components. Use camelCase for functions, hooks, and variables. Consistency enables instant pattern recognition.

**Incorrect (mixed naming):**

```
src/
  features/
    UserProfile/
      UserProfile.tsx
      userProfile.test.tsx
      user_utils.ts
    product-card/
      ProductCard.tsx
```

**Correct (consistent kebab-case files, PascalCase components):**

```
src/
  features/
    user-profile/
      components/
        user-profile.tsx        # exports function UserProfile()
        user-avatar.tsx         # exports function UserAvatar()
      hooks/
        use-user-profile.ts     # exports function useUserProfile()
      utils/
        format-user-name.ts     # exports function formatUserName()
      types/
        index.ts                # exports type UserProfile, interface UserData
      index.ts
```

**Rules:**
- Files and directories: `kebab-case` (enforced via Biome's `useFilenamingConvention`)
- React components: `PascalCase` (function name, not file name)
- Hooks: `camelCase` with `use` prefix
- Utils/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE` for true constants, `camelCase` for config objects
- Test files: `<name>.test.tsx` or `<name>.test.ts`

**Exception:** `__tests__/` directory uses double underscores per convention.
