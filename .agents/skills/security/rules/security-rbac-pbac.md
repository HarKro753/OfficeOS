---
title: Role-Based and Permission-Based Access Control
impact: HIGH
impactDescription: Prevents unauthorized UI exposure — gates protected features behind role and permission checks
tags: security, rbac, pbac, authorization, roles, permissions
---

## Role-Based and Permission-Based Access Control

Client-side authorization prevents users from seeing UI they cannot use and reduces accidental exposure of admin features. Build reusable authorization primitives — an `<Authorized>` component and a `useAuthorization` hook — that check roles and permissions declaratively.

**Incorrect (ad-hoc role checks scattered throughout components):**

```typescript
// pages/Dashboard.tsx
import { useUser } from '~/hooks/useUser'

function Dashboard() {
  const { user } = useUser()

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Role checks duplicated everywhere — easy to forget or get wrong */}
      {user?.role === 'admin' && <AdminPanel />}
      {(user?.role === 'admin' || user?.role === 'editor') && <ContentEditor />}
      {user?.permissions?.includes('analytics:read') && <AnalyticsWidget />}
    </div>
  )
}
```

**Correct (centralized authorization components and hooks):**

```typescript
// lib/authorization.tsx
import { createContext, useContext, useCallback, type ReactNode } from 'react'

type Role = 'admin' | 'editor' | 'viewer'
type Permission = string // e.g., 'analytics:read', 'users:write'

interface User {
  id: string
  role: Role
  permissions: Permission[]
}

interface AuthorizationContextValue {
  user: User | null
  checkAccess: (opts: AccessCheckOptions) => boolean
}

interface AccessCheckOptions {
  roles?: Role[]
  permissions?: Permission[]
}

const AuthorizationContext = createContext<AuthorizationContextValue | null>(null)

export function AuthorizationProvider({
  user,
  children,
}: {
  user: User | null
  children: ReactNode
}) {
  const checkAccess = useCallback(
    ({ roles, permissions }: AccessCheckOptions): boolean => {
      if (!user) return false
      if (roles && !roles.includes(user.role)) return false
      if (permissions && !permissions.every((p) => user.permissions.includes(p))) return false
      return true
    },
    [user],
  )

  return (
    <AuthorizationContext.Provider value={{ user, checkAccess }}>
      {children}
    </AuthorizationContext.Provider>
  )
}

export function useAuthorization() {
  const context = useContext(AuthorizationContext)
  if (!context) throw new Error('useAuthorization must be used within AuthorizationProvider')
  return context
}
```

```typescript
// components/Authorized.tsx
import { type ReactNode } from 'react'
import { useAuthorization } from '~/lib/authorization'

interface AuthorizedProps {
  roles?: ('admin' | 'editor' | 'viewer')[]
  permissions?: string[]
  fallback?: ReactNode
  children: ReactNode
}

export function Authorized({ roles, permissions, fallback = null, children }: AuthorizedProps) {
  const { checkAccess } = useAuthorization()

  if (!checkAccess({ roles, permissions })) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

```typescript
// pages/Dashboard.tsx
import { Authorized } from '~/components/Authorized'
import { useAuthorization } from '~/lib/authorization'

function Dashboard() {
  const { checkAccess } = useAuthorization()

  // Declarative — single source of truth for access rules
  return (
    <div>
      <h1>Dashboard</h1>

      <Authorized roles={['admin']}>
        <AdminPanel />
      </Authorized>

      <Authorized roles={['admin', 'editor']}>
        <ContentEditor />
      </Authorized>

      <Authorized permissions={['analytics:read']}>
        <AnalyticsWidget />
      </Authorized>

      {/* Hook form for conditional logic outside JSX */}
      {checkAccess({ permissions: ['users:export'] }) && (
        <button onClick={handleExport}>Export Users</button>
      )}
    </div>
  )
}
```

Client-side authorization is a UX measure only. The server must enforce the same role and permission checks on every API request. An attacker can bypass any client-side gate by calling the API directly.
