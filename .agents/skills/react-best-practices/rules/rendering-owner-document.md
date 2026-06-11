---
title: Use ownerDocument Instead of Global Window
impact: MEDIUM
impactDescription: prevents breakage in portals, iframes, and pop-out windows
tags: rendering, portals, iframes, window, ownerDocument
---

## Use ownerDocument Instead of Global Window

Use `ref.current?.ownerDocument.defaultView` instead of the global `window` object. Components rendered in portals, iframes, or pop-out windows have a different `window` — the global one refers to the parent frame.

**Incorrect (breaks in iframes and portals):**

```tsx
function Tooltip({ anchorRef }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // This `window` is the parent frame's window
    // If component is in an iframe, event listeners miss events
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return <div style={{ left: pos.x, top: pos.y }}>Tooltip</div>
}
```

**Correct (works across all rendering contexts):**

```tsx
function Tooltip({ anchorRef }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const win = ref.current?.ownerDocument.defaultView
    if (!win) return

    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    win.addEventListener('mousemove', handler)
    return () => win.removeEventListener('mousemove', handler)
  }, [])

  return <div ref={ref} style={{ left: pos.x, top: pos.y }}>Tooltip</div>
}
```

`ownerDocument.defaultView` returns the `window` that actually owns the DOM node. This is critical for component libraries that may render inside iframes, pop-out windows, or React portals.
