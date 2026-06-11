---
title: Conditional Module Loading
impact: HIGH
impactDescription: loads large data only when needed
tags: bundle, conditional-loading, lazy-loading
---

## Conditional Module Loading

Load large data or modules only when a feature is activated.

**Example (lazy-load animation frames):**

```tsx
function AnimationPlayer({ enabled, setEnabled }: { enabled: boolean; setEnabled: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [frames, setFrames] = useState<Frame[] | null>(null)

  useEffect(() => {
    if (enabled && !frames && typeof window !== 'undefined') {
      import('./animation-frames.js')
        .then(mod => setFrames(mod.frames))
        .catch(() => setEnabled(false))
    }
  }, [enabled, frames, setEnabled])

  if (!frames) return <Skeleton />
  return <Canvas frames={frames} />
}
```

The `typeof window !== 'undefined'` check prevents bundling this module for SSR, optimizing server bundle size and build speed.

---

### Server-Proof: Defer Browser APIs to useEffect

Browser-only APIs (`localStorage`, `window.matchMedia`, `navigator`) do not exist on the server. Never call them during render — defer to `useEffect` which only runs on the client.

**Incorrect (crashes during SSR):**

```tsx
function UserPrefs() {
  // localStorage is undefined on the server
  const prefs = JSON.parse(localStorage.getItem('prefs') || '{}')
  return <Settings defaults={prefs} />
}
```

**Correct (deferred to client):**

```tsx
function UserPrefs() {
  const [prefs, setPrefs] = useState({})

  useEffect(() => {
    const stored = localStorage.getItem('prefs')
    if (stored) setPrefs(JSON.parse(stored))
  }, [])

  return <Settings defaults={prefs} />
}
```
