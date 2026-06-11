# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Error Boundaries (error)

**Impact:** CRITICAL
**Description:** Granular error boundaries prevent a single component crash from taking down the entire application. Each feature or route gets its own boundary.

## 2. API Error Handling (error)

**Impact:** CRITICAL
**Description:** Centralized API error interception eliminates duplicated error handling across components and ensures consistent behavior for auth failures, server errors, and network issues.

## 3. User Notifications (error)

**Impact:** HIGH
**Description:** User-facing error messages must be actionable and never expose raw errors or stack traces. A toast system provides consistent, non-blocking feedback.

## 4. Error Tracking (error)

**Impact:** HIGH
**Description:** Production error tracking with Sentry provides visibility into real-world failures, with source maps for readable stack traces and error boundary integration for automatic reporting.

## 5. Graceful Degradation (error)

**Impact:** MEDIUM
**Description:** Non-critical feature failures should not block the user. Fallback UIs, retry mechanisms, and offline-capable patterns keep the app usable when parts of it fail.
