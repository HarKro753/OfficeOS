---
title: Test Features as Units, Not Individual Components
impact: HIGH
impactDescription: Fewer tests, higher confidence, less coupling
tags: testing, boundaries, integration, feature-tests, components
---

## Test Features as Units, Not Individual Components

Draw test boundaries around features, not components. Render the entire feature page with its real child components and a mocked API layer, then test the user flow end-to-end. Only unit-test components that are truly reusable shared primitives (design system buttons, form inputs, data tables). Testing every leaf component in isolation creates a massive test suite that is tightly coupled to the component tree and breaks on every refactor.

**Incorrect (testing every component in isolation):**

```typescript
// tests/project-header.test.tsx
test("renders project name", () => {
  render(<ProjectHeader project={mockProject} />);
  expect(screen.getByText("Alpha")).toBeInTheDocument();
});

// tests/project-members.test.tsx
test("renders member list", () => {
  render(<ProjectMembers members={mockMembers} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});

// tests/project-actions.test.tsx
test("calls onArchive when archive button clicked", async () => {
  const onArchive = vi.fn();
  render(<ProjectActions onArchive={onArchive} />);
  await userEvent.click(screen.getByRole("button", { name: /archive/i }));
  expect(onArchive).toHaveBeenCalled();
});

// 3 test files, tightly coupled to component structure.
// Renaming or merging components breaks all tests even if
// the feature still works identically.
```

**Correct (testing the feature as a unit):**

```typescript
// tests/project-detail-page.test.tsx
import { http, HttpResponse } from "msw";
import { server } from "@/testing/mocks/server";

test("displays project details and allows archiving", async () => {
  const user = userEvent.setup();
  server.use(
    http.get("/api/projects/:id", () => {
      return HttpResponse.json({
        id: "1",
        name: "Alpha",
        status: "active",
        members: [
          { id: "u1", name: "Jane" },
          { id: "u2", name: "Bob" },
          { id: "u3", name: "Alice" },
        ],
      });
    }),
    http.patch("/api/projects/:id", async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ id: "1", ...body });
    })
  );

  renderWithProviders("/projects/1");

  // Header renders
  await waitFor(() => {
    expect(
      screen.getByRole("heading", { name: "Alpha" })
    ).toBeInTheDocument();
  });

  // Members render
  expect(screen.getAllByRole("listitem")).toHaveLength(3);

  // Archive flow works
  await user.click(screen.getByRole("button", { name: /archive/i }));
  await user.click(
    screen.getByRole("button", { name: /confirm/i })
  );

  await waitFor(() => {
    expect(screen.getByText(/archived/i)).toBeInTheDocument();
  });
});

// 1 test file covers the same ground as 3 isolated tests,
// with higher confidence and zero coupling to component structure.
```

### When to Unit-Test Components

Unit-test a component only when it is a **shared, reusable primitive** with its own contract:

```typescript
// tests/ui/data-table.test.tsx — shared design system component
import { DataTable } from "@/components/ui/data-table";

const columns = [
  { key: "name" as const, header: "Name" },
  { key: "email" as const, header: "Email" },
];

const data = [
  { name: "Jane", email: "jane@example.com" },
  { name: "Bob", email: "bob@example.com" },
];

test("renders rows matching data", () => {
  render(<DataTable columns={columns} data={data} />);

  expect(screen.getAllByRole("row")).toHaveLength(3); // header + 2 data rows
  expect(screen.getByText("Jane")).toBeInTheDocument();
});

test("shows empty state when no data", () => {
  render(<DataTable columns={columns} data={[]} />);

  expect(screen.getByText(/no results/i)).toBeInTheDocument();
});

test("calls onSort when column header clicked", async () => {
  const onSort = vi.fn();
  render(<DataTable columns={columns} data={data} onSort={onSort} />);

  await userEvent.click(
    screen.getByRole("columnheader", { name: "Name" })
  );

  expect(onSort).toHaveBeenCalledWith("name", "asc");
});
```

Rule of thumb: if the component lives in `src/components/ui/` or `src/components/shared/` and is used by three or more features, it deserves its own unit tests. Feature-specific components are covered by feature integration tests.
