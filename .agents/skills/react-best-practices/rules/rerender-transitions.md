---
title: Use Transitions for Non-Urgent Updates
impact: MEDIUM
impactDescription: maintains UI responsiveness
tags: rerender, transitions, startTransition, performance
---

## Use Transitions for Non-Urgent Updates

Mark frequent, non-urgent state updates as transitions to maintain UI responsiveness.

**Incorrect (blocks UI on every scroll):**

```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

**Correct (non-blocking updates):**

```tsx
import { startTransition } from 'react'

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

---

### ViewTransition requires startTransition

When using React 19's `<ViewTransition>`, state updates must be wrapped in `startTransition()` for animations to trigger. Direct state changes won't produce view transition animations.

**Incorrect (no animation):**

```tsx
function Tabs({ tabs }: Props) {
  const [active, setActive] = useState(0)
  return (
    <ViewTransition>
      <button onClick={() => setActive(1)}>Tab 2</button>
      {tabs[active]}
    </ViewTransition>
  )
}
```

**Correct (animation triggers):**

```tsx
function Tabs({ tabs }: Props) {
  const [active, setActive] = useState(0)
  return (
    <ViewTransition>
      <button onClick={() => startTransition(() => setActive(1))}>
        Tab 2
      </button>
      {tabs[active]}
    </ViewTransition>
  )
}
```
