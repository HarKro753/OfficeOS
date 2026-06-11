---
title: Use Playwright for Critical User Flows Only
impact: MEDIUM
impactDescription: Catches cross-page and real-browser issues
tags: testing, e2e, playwright, critical-path, smoke-tests
---

## Use Playwright for Critical User Flows Only

E2E tests with Playwright should cover the critical paths that generate business value: login, signup, checkout, onboarding, data submission, and core CRUD flows. Do not E2E-test every feature -- it is slow, brittle, and duplicates what integration tests already cover. A focused E2E suite of 10-20 tests that runs in under 2 minutes provides far more value than 200 tests that take 30 minutes and fail randomly.

**Incorrect (E2E-testing everything including trivial UI):**

```typescript
// e2e/tooltip.spec.ts — not worth E2E testing
test("tooltip shows on hover", async ({ page }) => {
  await page.goto("/settings");
  await page.hover('[data-tooltip="Help"]');
  await expect(page.getByRole("tooltip")).toBeVisible();
});

// e2e/sidebar-toggle.spec.ts — integration test covers this
test("sidebar collapses when toggle clicked", async ({ page }) => {
  await page.goto("/dashboard");
  await page.click('[aria-label="Toggle sidebar"]');
  await expect(page.locator(".sidebar")).toHaveClass(/collapsed/);
});
```

**Correct (E2E tests for critical user flows):**

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can log in and reach the dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("jane@example.com");
    await page.getByLabel("Password").fill("securepassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { name: /dashboard/i })
    ).toBeVisible();

    // Verify user info is displayed
    await expect(page.getByText("Jane Doe")).toBeVisible();
  });

  test("user sees validation errors with wrong credentials", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.getByText(/invalid email or password/i)
    ).toBeVisible();
    await expect(page).toHaveURL("/login");
  });
});

// e2e/create-project.spec.ts
test.describe("Project Creation", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("user can create a new project end-to-end", async ({ page }) => {
    await page.goto("/projects");

    await page.getByRole("button", { name: /new project/i }).click();

    // Fill form
    await page.getByLabel("Project name").fill("Launch Campaign");
    await page.getByLabel("Description").fill("Q1 marketing launch");
    await page
      .getByRole("combobox", { name: /team/i })
      .selectOption("marketing");

    await page.getByRole("button", { name: /create/i }).click();

    // Verify redirect to new project page
    await expect(page).toHaveURL(/\/projects\/[\w-]+/);
    await expect(
      page.getByRole("heading", { name: "Launch Campaign" })
    ).toBeVisible();

    // Verify it appears in the project list
    await page.goto("/projects");
    await expect(page.getByText("Launch Campaign")).toBeVisible();
  });
});
```

### Which Flows Deserve E2E Tests

| Test with Playwright | Test with Integration (Vitest + MSW) |
|---|---|
| Login / signup / logout | Component interactions |
| Checkout / payment | Form validation |
| Onboarding wizard (multi-step) | Filtering, sorting, pagination |
| Data submission with file upload | Error states and loading states |
| Critical CRUD (create, edit, delete) | Modal open/close |
| Role-based access (admin vs user) | Tooltip, dropdown, accordion |

### Playwright Config Tips

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

Keep the E2E suite under 2 minutes by running tests in parallel and using `storageState` to skip login for authenticated tests.
