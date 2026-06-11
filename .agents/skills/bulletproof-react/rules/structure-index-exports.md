---
title: Package-Level Index Exports
impact: HIGH
impactDescription: clean public API per feature, controlled exposure
tags: structure, exports, index, barrel, public-api
---

## Package-Level Index Exports

Each feature exports through a single `index.ts` that defines the feature's public API. External consumers import from the feature root. Internal files import directly from sibling files.

**Incorrect (deep imports from outside the feature):**

```typescript
// src/app/routes/dashboard.tsx
import { UserProfile } from '@/features/user/components/user-profile'
import { useUser } from '@/features/user/hooks/use-user'
import type { User } from '@/features/user/types/user'
```

**Correct (import from feature index):**

```typescript
// src/features/user/index.ts — the public API
export { UserProfile } from './components/user-profile'
export { UserAvatar } from './components/user-avatar'
export { useUser } from './hooks/use-user'
export type { User, UserRole } from './types'

// src/app/routes/dashboard.tsx — clean import
import { UserProfile, useUser } from '@/features/user'
import type { User } from '@/features/user'
```

**Internal imports stay direct:**

```typescript
// src/features/user/components/user-profile.tsx
// WITHIN the feature, import directly — don't go through index.ts
import { useUser } from '../hooks/use-user'
import type { User } from '../types'
```

**Rules:**
1. Every feature has exactly one `index.ts`
2. External consumers only import from the index
3. Internal files import directly from siblings/children (never through index)
4. The index is the explicit public API — only export what external consumers need
5. Don't re-export everything; curate the public surface
