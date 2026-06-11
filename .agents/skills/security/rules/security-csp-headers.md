---
title: Content Security Policy Headers
impact: MEDIUM
impactDescription: Defense-in-depth against XSS, clickjacking, and data injection — limits what the browser is allowed to load
tags: security, csp, headers, xss, vite, nonce, clickjacking
---

## Content Security Policy Headers

Content Security Policy (CSP) tells the browser which sources of scripts, styles, images, and connections are allowed. Even if an XSS vulnerability exists in application code, a strict CSP prevents the injected script from executing. Configure CSP in both development and production.

**Incorrect (no CSP — browser loads anything):**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // No security headers configured
  // Any injected <script> tag will execute
  // Data can be exfiltrated to any domain
})
```

**Correct (CSP configured for Vite dev server and production):**

```typescript
// vite.config.ts — Development CSP
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Development CSP — permissive enough for HMR and dev tools
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // Vite HMR requires inline scripts in dev
        "style-src 'self' 'unsafe-inline'",  // Vite injects styles inline in dev
        "connect-src 'self' ws://localhost:*", // WebSocket for HMR
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "frame-ancestors 'none'", // Prevent clickjacking
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})
```

```typescript
// Production CSP — set by your deployment platform or reverse proxy.
// This is NOT set in vite.config.ts — Vite does not serve production traffic.

// Example: Express server serving the built SPA
import express from 'express'
import crypto from 'node:crypto'

const app = express()

app.use((req, res, next) => {
  // Generate a unique nonce per request for inline scripts
  const nonce = crypto.randomBytes(16).toString('base64')
  res.locals.nonce = nonce

  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,   // Only scripts with this nonce execute
    "style-src 'self' 'unsafe-inline'",      // Or use nonce for styles too
    "connect-src 'self' https://api.example.com", // Restrict API connections
    "img-src 'self' data: https://cdn.example.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; '))

  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  next()
})

// Inject nonce into the HTML template
app.get('*', (req, res) => {
  const nonce = res.locals.nonce
  const html = getBuiltHtml() // Read dist/index.html
    .replace('<script', `<script nonce="${nonce}"`) // Add nonce to entry script

  res.send(html)
})
```

```typescript
// Deployment platform examples:

// Vercel — vercel.json
// {
//   "headers": [
//     {
//       "source": "/(.*)",
//       "headers": [
//         {
//           "key": "Content-Security-Policy",
//           "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.example.com; frame-ancestors 'none'"
//         }
//       ]
//     }
//   ]
// }

// Nginx
// add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.example.com; frame-ancestors 'none'" always;

// Cloudflare Pages — _headers file
// /*
//   Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.example.com; frame-ancestors 'none'
```

Key CSP directives:

- `default-src 'self'` — Fallback for all resource types. Only allow same-origin by default.
- `script-src` — Controls which scripts execute. Use nonces over `'unsafe-inline'` in production.
- `style-src` — Controls stylesheets. `'unsafe-inline'` is often needed for CSS-in-JS.
- `connect-src` — Controls fetch, XHR, and WebSocket destinations. Whitelist your API domains.
- `frame-ancestors 'none'` — Prevents your site from being embedded in iframes (clickjacking protection).
- `base-uri 'self'` — Prevents `<base>` tag injection that redirects relative URLs.
- `form-action 'self'` — Prevents forms from submitting to external domains.

Start with a strict policy and use the browser console to identify violations. Use `Content-Security-Policy-Report-Only` header during rollout to log violations without blocking resources.
