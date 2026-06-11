---
title: Absolute Imports with Path Aliases
impact: MEDIUM
impactDescription: eliminates fragile relative paths and improves readability
tags: standards, imports, paths, aliases
---

## Absolute Imports with Path Aliases

Configure `@/` as a path alias to `src/`. Deep relative imports (`../../../`) are fragile, hard to read, and break when files move. Absolute imports are stable and self-documenting.

**Incorrect (deep relative imports):**

```typescript
import { Button } from '../../../components/button'
import { useAuth } from '../../../../features/auth/hooks/use-auth'
import type { User } from '../../../types/user'
```

**Correct (absolute imports with @/ alias):**

```typescript
import { Button } from '@/components/button'
import { useAuth } from '@/features/auth'
import type { User } from '@/types/user'
```

**Configuration:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
})
```

`vite-tsconfig-paths` reads the `paths` from `tsconfig.json` automatically — no need to duplicate alias config in Vite. Single source of truth.

**Rules:**
- Use `@/` for all imports outside the current feature
- Use relative imports (`./` or `../`) only within the same feature
- Never use relative imports that go more than one level up from the feature root
