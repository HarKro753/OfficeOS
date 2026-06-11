---
title: Use useId() for Component Instance IDs
impact: MEDIUM
impactDescription: prevents ID collisions in multi-instance scenarios
tags: rendering, useId, accessibility, ssr, instances
---

## Use useId() for Component Instance IDs

Use `useId()` to generate unique, stable identifiers for each component instance. Hardcoded IDs cause collisions when the same component renders multiple times, breaking accessibility and label associations.

**Incorrect (ID collision with multiple instances):**

```tsx
function EmailField() {
  return (
    <div>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
    </div>
  )
}

// Two instances on the same page — both inputs have id="email"
<EmailField />
<EmailField />
```

**Correct (unique ID per instance):**

```tsx
import { useId } from 'react'

function EmailField() {
  const id = useId()
  return (
    <div>
      <label htmlFor={id}>Email</label>
      <input id={id} type="email" />
    </div>
  )
}

// Each instance gets a unique, stable ID — no collisions
<EmailField />
<EmailField />
```

`useId()` generates IDs that are stable across server and client rendering, preventing hydration mismatches. Use it for `htmlFor`/`id` pairs, `aria-describedby`, and any DOM ID that must be unique.

Reference: [useId – React](https://react.dev/reference/react/useId)
