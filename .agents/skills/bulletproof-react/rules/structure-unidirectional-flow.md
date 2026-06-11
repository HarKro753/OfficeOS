---
title: Enforce Unidirectional Import Flow
impact: CRITICAL
impactDescription: prevents circular dependencies and tangled architecture
tags: structure, imports, dependencies, architecture
---

## Enforce Unidirectional Import Flow

Code flows in one direction: **shared -> features -> app**. Shared modules are the foundation. Features build on shared modules. The app layer composes features. Never import upward.

**Incorrect (bidirectional imports):**

```typescript
// src/features/auth/hooks/use-auth.ts
import { api } from '@/app/api'           // Feature importing from app layer
import { useCart } from '@/features/cart'  // Feature importing from another feature

// src/shared/components/header.tsx
import { useAuth } from '@/features/auth' // Shared importing from feature
```

**Correct (unidirectional flow):**

```typescript
// src/features/auth/hooks/use-auth.ts
import { apiClient } from '@/lib/api-client'  // Feature imports from shared
import { useNotification } from '@/hooks'       // Feature imports from shared

// src/app/routes/dashboard.tsx
import { UserProfile } from '@/features/user'  // App imports from feature
import { CartSummary } from '@/features/cart'   // App imports from feature
import { Header } from '@/components'            // App imports from shared
```

**The hierarchy:**

```
src/
  shared layer (components/, hooks/, lib/, types/, utils/)
    ^
    |  features import from shared
    |
  features/ (each feature is self-contained)
    ^
    |  app imports from features and shared
    |
  app/ (routes, providers, entry point)
```

Enforce through clear directory structure and code review. Biome's import analysis catches circular dependencies. For strict boundary enforcement, the directory structure itself is the primary guardrail.
