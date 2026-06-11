---
title: Organize MSW Handlers to Mirror API Structure
impact: HIGH
impactDescription: Reduces test setup duplication, improves maintainability
tags: testing, msw, mocking, api, handlers, vitest
---

## Organize MSW Handlers to Mirror API Structure

MSW handlers should be organized by feature/resource, matching the real API structure. Provide default success handlers for the happy path and override with error or edge-case handlers per test. This eliminates duplicated mock setup across test files and makes it obvious which API endpoints each feature depends on.

**Incorrect (inline handlers duplicated across test files):**

```typescript
// tests/projects-page.test.tsx
const server = setupServer(
  http.get("/api/projects", () => {
    return HttpResponse.json([{ id: "1", name: "Alpha" }]);
  }),
  http.get("/api/users/me", () => {
    return HttpResponse.json({ id: "u1", name: "Jane" });
  })
);

// tests/project-detail.test.tsx — same handlers copy-pasted
const server = setupServer(
  http.get("/api/projects/:id", () => {
    return HttpResponse.json({ id: "1", name: "Alpha" });
  }),
  http.get("/api/users/me", () => {
    return HttpResponse.json({ id: "u1", name: "Jane" });
  })
);
```

**Correct (centralized handlers with per-test overrides):**

```typescript
// src/testing/mocks/handlers/auth.ts
import { http, HttpResponse } from "msw";

export const authHandlers = [
  http.get("/api/users/me", () => {
    return HttpResponse.json({
      id: "u1",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "admin",
    });
  }),

  http.post("/api/auth/logout", () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

// src/testing/mocks/handlers/projects.ts
import { http, HttpResponse } from "msw";
import { projectsFixture } from "../fixtures/projects";

export const projectHandlers = [
  http.get("/api/projects", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const filtered = status
      ? projectsFixture.filter((p) => p.status === status)
      : projectsFixture;
    return HttpResponse.json(filtered);
  }),

  http.get("/api/projects/:id", ({ params }) => {
    const project = projectsFixture.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json(
        { message: "Not found" },
        { status: 404 }
      );
    }
    return HttpResponse.json(project);
  }),

  http.post("/api/projects", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: "new-1", ...body, createdAt: new Date().toISOString() },
      { status: 201 }
    );
  }),
];

// src/testing/mocks/handlers/index.ts
import { authHandlers } from "./auth";
import { projectHandlers } from "./projects";

export const handlers = [...authHandlers, ...projectHandlers];

// src/testing/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

// src/testing/setup.ts (referenced in vitest.config.ts setupFiles)
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Per-Test Overrides

Override specific handlers in individual tests without affecting others:

```typescript
import { http, HttpResponse } from "msw";
import { server } from "@/testing/mocks/server";

test("shows error when projects fail to load", async () => {
  // Override only the projects endpoint for this test
  server.use(
    http.get("/api/projects", () => {
      return HttpResponse.json(
        { message: "Service unavailable" },
        { status: 503 }
      );
    })
  );

  renderWithProviders("/projects");

  await waitFor(() => {
    expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
  });
});

test("handles empty project list", async () => {
  server.use(
    http.get("/api/projects", () => {
      return HttpResponse.json([]);
    })
  );

  renderWithProviders("/projects");

  await waitFor(() => {
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
  });
});
```

Use `onUnhandledRequest: "error"` in `server.listen()` to catch tests that hit API endpoints without a handler -- this surfaces missing mocks immediately instead of producing confusing failures.
