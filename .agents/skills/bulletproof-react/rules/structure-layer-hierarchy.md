---
title: Feature Layer Hierarchy
impact: HIGH
impactDescription: consistent internal structure makes features predictable
tags: structure, layers, features, data, ui
---

## Feature Layer Hierarchy

Each feature has three internal layers with a strict import hierarchy: **data -> shared -> UI**. The data layer fetches and transforms external data. The shared layer provides hooks, types, and utils. The UI layer renders components.

**Incorrect (flat, mixed concerns):**

```
src/features/product/
  ProductCard.tsx          # Component that also fetches data
  ProductList.tsx          # Component with inline API call
  useProducts.ts           # Hook mixed with types
  types.ts
  utils.ts
```

**Correct (layered with clear hierarchy):**

```
src/features/product/
  api/                     # Data layer — external communication
    get-products.ts        #   Query function + TanStack Query hook
    create-product.ts      #   Mutation function + hook
  hooks/                   # Shared layer — feature-internal logic
    use-product-filters.ts
  types/                   # Shared layer — type definitions
    index.ts
  utils/                   # Shared layer — pure functions
    format-price.ts
  components/              # UI layer — rendering only
    product-card.tsx       #   Imports from api/, hooks/, types/
    product-list.tsx       #   Never fetches data directly
  index.ts                 # Public API
```

**Import rules within a feature:**
- `components/` imports from `api/`, `hooks/`, `types/`, `utils/`
- `hooks/` imports from `types/`, `utils/`
- `api/` imports from `types/`
- `types/` and `utils/` import from nothing within the feature

**Key constraint:** Components never call API functions directly. They consume data through hooks that wrap the API layer.
