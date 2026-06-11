---
title: Prevent Server Value Leaks with Taint APIs
impact: LOW-MEDIUM
impactDescription: prevents accidental serialization of secrets to client
tags: advanced, security, taint, server-components, secrets
---

## Prevent Server Value Leaks with Taint APIs

Use `experimental_taintUniqueValue()` and `experimental_taintObjectReference()` to mark sensitive server-only values. These APIs prevent accidental serialization of tokens, secrets, and private data to Client Components.

**Incorrect (secret leaks to client):**

```tsx
// Server Component
async function Dashboard() {
  const config = await getConfig()
  // config.apiSecret is passed to client — visible in browser
  return <AnalyticsPanel config={config} />
}
```

**Correct (tainted values throw if passed to client):**

```tsx
import {
  experimental_taintObjectReference as taintObjectReference,
  experimental_taintUniqueValue as taintUniqueValue,
} from 'react'

async function getConfig() {
  const config = await db.getConfig()

  // Taint the entire object — cannot be passed to Client Components
  taintObjectReference('Do not pass config to client', config)

  // Taint specific sensitive values
  taintUniqueValue(
    'Do not pass API secret to client',
    config,
    config.apiSecret
  )

  return config
}
```

When a tainted value is accidentally passed to a Client Component, React throws an error with the message you provided. This catches leaks during development before they reach production.

Reference: [taintUniqueValue – React](https://react.dev/reference/react/experimental_taintUniqueValue)
