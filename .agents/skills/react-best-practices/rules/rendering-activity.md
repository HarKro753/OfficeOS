---
title: Use Activity Component for Show/Hide
impact: MEDIUM
impactDescription: preserves state/DOM
tags: rendering, activity, visibility, state-preservation
---

## Use Activity Component for Show/Hide

Use React's `<Activity>` to preserve state/DOM for expensive components that frequently toggle visibility.

**Usage:**

```tsx
import { Activity } from 'react'

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

Avoids expensive re-renders and state loss.

---

### Clean Up Global Styles When Hidden

Components that inject global `<style>` tags can leak styles when hidden by `<Activity>`. Set `media="not all"` on style elements during cleanup to disable them without removing the DOM node.

```tsx
function ThemedPanel() {
  const ref = useRef<HTMLStyleElement>(null)

  useLayoutEffect(() => {
    // Activate styles on mount/show
    if (ref.current) ref.current.media = ''
    return () => {
      // Disable styles on hide — prevents style leakage across instances
      if (ref.current) ref.current.media = 'not all'
    }
  }, [])

  return (
    <>
      <style ref={ref}>{`.panel { background: var(--theme-bg); }`}</style>
      <div className="panel">Content</div>
    </>
  )
}
```

This ensures global CSS side effects are properly disabled when a component is hidden by `<Activity>`, preventing styles from bleeding into other visible instances.
