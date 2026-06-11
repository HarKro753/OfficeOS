---
title: Authentication Flow Patterns for SPAs
impact: HIGH
impactDescription: Ensures secure, consistent auth state across the app — prevents stale sessions and unprotected routes
tags: security, auth, react-router, tanstack-query, protected-routes, session
---

## Authentication Flow Patterns for SPAs

A complete auth flow connects login, session management, route protection, and error recovery into a single coherent system. The flow: login sets an HttpOnly cookie, TanStack Query caches user state, protected routes redirect unauthenticated users, and a 401 interceptor clears stale sessions.

**Incorrect (fragmented auth with manual state and no 401 handling):**

```typescript
// Scattered auth state — no single source of truth
const [user, setUser] = useState(null)
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  fetch('/api/auth/me')
    .then((res) => res.json())
    .then(setUser)
    .finally(() => setIsLoading(false))
}, [])

// No 401 handling — stale token shows broken UI instead of redirecting
// No route protection — users can navigate to /admin by URL
```

**Correct (TanStack Query + React Router + 401 interceptor):**

```typescript
// lib/api-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Never retry auth errors — redirect instead
        if (error instanceof ApiError && error.status === 401) return false
        return failureCount < 3
      },
    },
  },
})

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Attach HttpOnly cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 401) {
    // Clear cached user state — session expired or was revoked
    queryClient.setQueryData(['auth', 'user'], null)
    queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    throw new ApiError(401, 'Unauthorized')
  }

  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }

  return response.json()
}
```

```typescript
// hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '~/lib/api-client'

interface User {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  permissions: string[]
}

export function useUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => apiFetch<User>('/api/auth/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry — 401 means not logged in
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiFetch<User>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'user'], user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiFetch<void>('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null)
      queryClient.clear() // Remove all cached data on logout
    },
  })
}
```

```typescript
// components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router'
import { useUser } from '~/hooks/useAuth'

export function ProtectedRoute() {
  const { data: user, isLoading } = useUser()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    // Preserve intended destination for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function RoleRoute({ roles }: { roles: string[] }) {
  const { data: user, isLoading } = useUser()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
```

```typescript
// routes.tsx
import { createBrowserRouter } from 'react-router'
import { ProtectedRoute, RoleRoute } from '~/components/ProtectedRoute'

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },

  // Authenticated routes
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/profile', element: <ProfilePage /> },

      // Admin-only routes
      {
        element: <RoleRoute roles={['admin']} />,
        children: [
          { path: '/admin', element: <AdminPage /> },
          { path: '/admin/users', element: <UserManagementPage /> },
        ],
      },
    ],
  },
])
```

```typescript
// pages/LoginPage.tsx
import { useNavigate, useLocation } from 'react-router'
import { useLogin } from '~/hooks/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    login.mutate(
      {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      },
      {
        onSuccess: () => navigate(from, { replace: true }),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Signing in...' : 'Sign in'}
      </button>
      {login.isError && <p role="alert">Invalid credentials</p>}
    </form>
  )
}
```

Server-side session validation is required. Route protection and cached user state are UX conveniences. The server must validate the session cookie on every API request and return 401 when the session is expired or revoked.
