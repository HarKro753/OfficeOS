---
title: User-Facing Error Toast Patterns
impact: HIGH
impactDescription: prevents raw errors from reaching users, provides actionable feedback
tags: toast, notifications, user-experience, error-messages, sonner
---

## User-Facing Error Toast Patterns

Users should never see raw error messages, HTTP status codes, or stack traces. Every error that reaches the user must be translated into an actionable, human-readable message. A toast/notification system provides consistent, non-blocking feedback that doesn't disrupt the user's workflow.

**Incorrect (raw errors shown to users):**

```typescript
// Exposing raw API errors directly
function SaveButton({ data }: { data: FormData }) {
  const mutation = useMutation({
    mutationFn: () => apiClient("/api/save", { method: "POST", body: JSON.stringify(data) }),
    onError: (error) => {
      // Raw error message from the server — could be anything
      alert(error.message);
      // User sees: "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email"
    },
  });

  return <button onClick={() => mutation.mutate()}>Save</button>;
}

// Or worse — showing stack traces
function DataView() {
  const { error } = useQuery({ queryKey: ["data"], queryFn: fetchData });

  if (error) {
    return (
      <div className="text-red-500">
        {/* Leaks internals to the user */}
        Error: {error.stack}
      </div>
    );
  }
}
```

**Correct (human-readable toasts with action context):**

```typescript
// lib/error-messages.ts — map errors to user-friendly messages
import { ApiError } from "./api-client";

type ErrorContext = "save" | "delete" | "load" | "upload" | "update";

const contextMessages: Record<ErrorContext, Record<string, string>> = {
  save: {
    default: "Unable to save your changes. Please try again.",
    409: "This item was modified by someone else. Please refresh and try again.",
    413: "The data is too large to save. Try reducing the content.",
  },
  delete: {
    default: "Unable to delete this item. Please try again.",
    409: "This item is being used elsewhere and cannot be deleted.",
  },
  load: {
    default: "Unable to load the data. Please refresh the page.",
    404: "The requested item could not be found.",
  },
  upload: {
    default: "Upload failed. Please try again.",
    413: "The file is too large. Maximum size is 10MB.",
    415: "This file type is not supported.",
  },
  update: {
    default: "Unable to update. Please try again.",
    409: "This item was modified by someone else. Please refresh and try again.",
  },
};

export function getUserErrorMessage(
  error: unknown,
  context: ErrorContext = "load",
): string {
  if (error instanceof ApiError) {
    const statusMessages = contextMessages[context];
    return statusMessages?.[error.status.toString()] ?? statusMessages?.default ?? "Something went wrong. Please try again.";
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Unable to connect to the server. Check your internet connection.";
  }

  return "An unexpected error occurred. Please try again.";
}
```

```typescript
// Usage in mutations with contextual toasts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getUserErrorMessage } from "@/lib/error-messages";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdate) =>
      apiClient("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error(getUserErrorMessage(error, "update"));
    },
  });
}
```

```typescript
// Toast with retry action for transient failures
import { toast } from "sonner";

export function useDeleteItem() {
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/items/${id}`, { method: "DELETE" }),
    onError: (error, id, _context) => {
      toast.error(getUserErrorMessage(error, "delete"), {
        action: {
          label: "Retry",
          onClick: () => {
            // Re-trigger the mutation
            deleteItem(id);
          },
        },
        duration: 8000, // Give more time for user to read and act
      });
    },
  });
}
```

**Toast guidelines:**

- `toast.error()` for failures that blocked the user's action
- `toast.warning()` for degraded states (offline mode, partial failure)
- `toast.success()` for completed actions (keep these brief)
- Never toast on query errors that are already shown inline via the component
- Set `duration` longer for errors (8s) than for success (4s) so users can read them
- Add an `action` button for retryable errors
- Include the context of what failed ("Unable to save your profile") not just "Error occurred"
