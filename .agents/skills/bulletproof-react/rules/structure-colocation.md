---
title: Colocate Related Files
impact: HIGH
impactDescription: reduces cognitive overhead and makes features self-documenting
tags: structure, colocation, organization
---

## Colocate Related Files

Place files as close as possible to where they are used. A component's styles, tests, types, and stories should live next to the component, not in distant top-level directories.

**Incorrect (separated by concern):**

```
src/
  components/
    product-card.tsx
  __tests__/
    components/
      product-card.test.tsx
  types/
    product-card.ts
  stories/
    product-card.stories.tsx
```

**Correct (colocated):**

```
src/features/product/
  components/
    product-card.tsx
    product-card.test.tsx
    product-card.stories.tsx
```

**Colocation rules:**
1. Tests live next to the file they test (`foo.test.tsx` beside `foo.tsx`)
2. Types used by a single file live in that file, not a separate types file
3. Types shared across a feature live in the feature's `types/` directory
4. Types shared across features live in `src/types/`
5. Storybook stories live next to the component they document

**Exception:** Global configuration files (Biome, Vite, TypeScript) live at the project root.
