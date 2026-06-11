---
title: Test User Behavior, Not Implementation Details
impact: CRITICAL
impactDescription: Prevents brittle tests that break on refactors
tags: testing, testing-library, user-behavior, accessibility, anti-patterns
---

## Test User Behavior, Not Implementation Details

Tests should interact with the application the same way a user does: find elements by their accessible role or visible text, click buttons, type into inputs, and assert on what appears on screen. Never test component state, hook return values, or internal method calls directly. Implementation-detail tests break on every refactor even when the feature still works correctly.

**Incorrect (testing implementation details):**

```typescript
import { render, screen } from "@testing-library/react";
import { Counter } from "../counter";

test("increments count", () => {
  const { container } = render(<Counter />);

  // Anti-pattern: querying by CSS class or test ID when a role exists
  const button = container.querySelector(".increment-btn");
  // Anti-pattern: querying by data-testid when visible text exists
  const display = screen.getByTestId("count-display");

  fireEvent.click(button!);

  // Anti-pattern: testing internal state value
  expect(display.textContent).toBe("1");
});

// Anti-pattern: testing hook internals directly
test("useCounter returns incremented value", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

**Correct (testing what the user sees and does):**

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "../counter";

test("increments the displayed count when the user clicks increment", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  // Query by role — the same way assistive tech finds the button
  const button = screen.getByRole("button", { name: /increment/i });

  // Assert on what the user sees before interaction
  expect(screen.getByText("Count: 0")).toBeInTheDocument();

  // Interact the way a real user does
  await user.click(button);

  // Assert on the visible outcome
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

### Query Priority

Follow Testing Library's recommended query priority:

1. **`getByRole`** -- accessible to everyone, reflects real user experience
2. **`getByLabelText`** -- good for form fields
3. **`getByPlaceholderText`** -- when no label exists
4. **`getByText`** -- for non-interactive elements
5. **`getByDisplayValue`** -- for filled-in form elements
6. **`getByAltText`** -- for images
7. **`getByTitle`** -- rarely needed
8. **`getByTestId`** -- last resort only, when no semantic query applies

### Common Anti-Patterns to Avoid

- `container.querySelector()` -- bypasses accessibility, breaks on markup changes
- `fireEvent` when `userEvent` is available -- `userEvent` simulates real browser events (focus, hover, keydown)
- Testing `useState` or `useReducer` values directly -- test the UI those values produce
- Asserting on CSS classes or inline styles -- assert on visible text or ARIA attributes instead
- Snapshot tests for behavior verification -- snapshots catch unintended markup changes, not behavior
