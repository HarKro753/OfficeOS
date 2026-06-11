# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Token & Auth Security (security)

**Impact:** CRITICAL
**Description:** Improper token storage and unsanitized input are the most exploitable vulnerabilities in SPAs. Tokens in localStorage are accessible to any script on the page. Unsanitized HTML enables XSS attacks that can steal sessions and exfiltrate data.

## 2. Access Control (security)

**Impact:** HIGH
**Description:** Client-side access control prevents unauthorized UI exposure and improves UX. RBAC/PBAC components gate protected content, and a well-structured auth flow ensures protected routes redirect unauthenticated users. Always enforce authorization on the server as well.

## 3. Transport & Headers (security)

**Impact:** MEDIUM
**Description:** Content Security Policy headers restrict which scripts, styles, and connections the browser allows, providing a strong defense-in-depth layer against XSS, clickjacking, and data injection even if application code has vulnerabilities.
