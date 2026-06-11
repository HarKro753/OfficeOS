---
title: Deduplicate Server Fetches with React.cache()
impact: HIGH
impactDescription: eliminates redundant database/API calls per request
tags: async, cache, rsc, server-components, deduplication
---

## Deduplicate Server Fetches with React.cache()

Wrap server-side data fetches with `React.cache()` to deduplicate identical queries within a single request. Without it, multiple Server Components requesting the same data trigger separate database calls.

**Incorrect (duplicate fetches per request):**

```tsx
// db.ts
export async function getUser(id: string) {
  return await db.query('SELECT * FROM users WHERE id = ?', [id])
}

// Header.tsx (Server Component)
export default async function Header() {
  const user = await getUser(params.id) // 1st query
  return <nav>{user.name}</nav>
}

// Profile.tsx (Server Component)
export default async function Profile() {
  const user = await getUser(params.id) // 2nd query — same data
  return <h1>{user.name}</h1>
}
```

**Correct (single fetch, shared across components):**

```tsx
import { cache } from 'react'

// db.ts
export const getUser = cache(async (id: string) => {
  return await db.query('SELECT * FROM users WHERE id = ?', [id])
})

// Header.tsx and Profile.tsx both call getUser(params.id)
// Only one database query executes per request
```

`React.cache()` memoizes by arguments within a single server request. The cache is automatically discarded after the request completes — no stale data across requests.

Reference: [cache – React](https://react.dev/reference/react/cache)
