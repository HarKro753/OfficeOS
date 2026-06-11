---
title: Replace cloneElement with Context
impact: LOW-MEDIUM
impactDescription: ensures compatibility with Server Components and lazy content
tags: advanced, cloneElement, context, composition, server-components
---

## Replace cloneElement with Context

Use Context instead of `React.cloneElement()` to pass implicit props to children. `cloneElement` breaks with Server Components, lazy-loaded content, and opaque children references.

**Incorrect (cloneElement breaks with Server Components):**

```tsx
function Tabs({ children, activeTab }: Props) {
  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement, {
          isActive: child.props.value === activeTab,
        })
      )}
    </div>
  )
}
```

**Correct (Context works universally):**

```tsx
const TabsContext = createContext<{ activeTab: string }>({ activeTab: '' })

function Tabs({ children, activeTab }: Props) {
  return (
    <TabsContext value={{ activeTab }}>
      <div>{children}</div>
    </TabsContext>
  )
}

function Tab({ value, children }: TabProps) {
  const { activeTab } = use(TabsContext)
  const isActive = value === activeTab
  return <div data-active={isActive}>{children}</div>
}
```

Context works with Server Components, `React.lazy()`, fragments, and any valid children. `cloneElement` only works with direct React element children and silently fails otherwise.

Reference: [Primitives – React](https://react.dev/reference/react/cloneElement#alternatives)
