# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Integration Testing (testing)

**Impact:** CRITICAL
**Description:** Integration tests give the highest confidence-to-effort ratio. Render full features with mocked APIs, interact as a user would, and assert on visible outcomes. This is where the majority of testing effort should go.

## 2. Mock & API Layer (testing)

**Impact:** HIGH
**Description:** Well-organized MSW handlers and correct test boundaries reduce test maintenance and make tests reliable. Mirror the real API structure and test features as cohesive units.

## 3. E2E Coverage (testing)

**Impact:** MEDIUM
**Description:** Playwright E2E tests cover critical user flows that cross multiple pages and involve real browser behavior. Keep E2E coverage narrow to avoid slow, brittle test suites.

## 4. Unit Testing (testing)

**Impact:** MEDIUM
**Description:** Unit tests are reserved for pure utility functions and hooks with complex logic. If integration tests already cover the behavior, a unit test adds cost without confidence.
