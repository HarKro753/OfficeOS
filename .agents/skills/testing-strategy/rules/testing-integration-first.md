---
title: Integration Tests Are the Primary Investment
impact: CRITICAL
impactDescription: Highest confidence-to-effort ratio
tags: testing, integration, vitest, testing-library, msw, react
---

## Integration Tests Are the Primary Investment

Integration tests render a full feature with mocked API responses, interact through the UI as a user would, and assert on visible outcomes. They catch real bugs that unit tests miss: broken data flows, missing loading states, incorrect routing, and failed error handling. One integration test replaces dozens of shallow unit tests while providing higher confidence.

**Incorrect (shallow unit tests that don't catch real bugs):**

```typescript
// tests/use-projects.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useProjects } from "../hooks/use-projects";

// Testing the hook in isolation tells you nothing about
// whether the feature actually works for users
test("useProjects returns data", async () => {
  const { result } = renderHook(() => useProjects());

  await waitFor(() => {
    expect(result.current.data).toHaveLength(3);
  });
});

// tests/project-card.test.ts
test("ProjectCard renders title", () => {
  render(<ProjectCard project={mockProject} />);
  expect(screen.getByText("My Project")).toBeInTheDocument();
});
```

**Correct (integration test that exercises the real user flow):**

```typescript
// tests/projects-page.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../routes";

const server = setupServer(
  http.get("/api/projects", () => {
    return HttpResponse.json([
      { id: "1", name: "Alpha", status: "active" },
      { id: "2", name: "Beta", status: "archived" },
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(initialRoute: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const router = createMemoryRouter(routeConfig, {
    initialEntries: [initialRoute],
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

test("displays projects and filters by status", async () => {
  const user = userEvent.setup();
  renderWithProviders("/projects");

  // Loading state is visible
  expect(screen.getByRole("status")).toBeInTheDocument();

  // Projects appear after fetch
  await waitFor(() => {
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });
  expect(screen.getByText("Beta")).toBeInTheDocument();

  // Filter to active only
  await user.click(screen.getByRole("tab", { name: /active/i }));

  expect(screen.getByText("Alpha")).toBeInTheDocument();
  expect(screen.queryByText("Beta")).not.toBeInTheDocument();
});

test("shows error state when API fails", async () => {
  server.use(
    http.get("/api/projects", () => {
      return HttpResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    })
  );

  renderWithProviders("/projects");

  await waitFor(() => {
    expect(
      screen.getByText(/something went wrong/i)
    ).toBeInTheDocument();
  });
});
```

The integration test covers loading states, data rendering, user interaction (filtering), and error handling in two tests. The shallow unit tests cover none of these real-world scenarios. Aim for roughly 70% integration, 20% E2E, 10% unit in your test distribution.
