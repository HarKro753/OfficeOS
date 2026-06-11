---
title: Use a Form Library with Zod for Form State
impact: MEDIUM
impactDescription: eliminates manual validation bugs and reduces form boilerplate by 60-80%
tags: state, forms, react-hook-form, zod, validation
---

## Use a Form Library with Zod for Form State

Form state is uniquely complex: validation, dirty tracking, touched fields, error messages, submission handling, and field-level vs form-level errors. A form library (React Hook Form or similar) combined with Zod schemas handles all of this reliably. Do not manage form state with scattered `useState` calls — it leads to inconsistent validation, missing error states, and fragile submission logic.

**The pattern: Zod schema defines the shape, form library manages the lifecycle, submit handler receives validated data.**

**Incorrect (manual useState for forms):**

```typescript
function CreateProjectForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [descError, setDescError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError("");
    setDescError("");

    // Manual validation — easy to miss cases, hard to maintain
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    if (name.length < 3) {
      setNameError("Name must be at least 3 characters");
      return;
    }
    if (description.length > 500) {
      setDescError("Description must be under 500 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject({ name, description });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      {nameError && <span className="text-red-500">{nameError}</span>}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {descError && <span className="text-red-500">{descError}</span>}
      <button disabled={isSubmitting}>Create</button>
    </form>
  );
}
```

**Correct (Zod schema + React Hook Form):**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// 1. Zod schema — single source of truth for validation
const createProjectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(500, "Description must be under 500 characters").default(""),
});

type CreateProjectInput = z.infer<typeof createProjectSchema>;

// 2. Form component — clean, declarative, fully typed
function CreateProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  const createProject = useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onSuccess();
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => createProject.mutateAsync(data))}>
      <div>
        <label htmlFor="name">Project Name</label>
        <input id="name" {...register("name")} />
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea id="description" {...register("description")} />
        {errors.description && (
          <span className="text-red-500">{errors.description.message}</span>
        )}
      </div>

      {createProject.isError && (
        <div className="text-red-500">
          {createProject.error.message}
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}
```

**Reusing schemas for API validation:**

```typescript
// shared/schemas/project.ts — same schema validates forms AND API payloads
export const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).default(""),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// Used in the form (client)
const form = useForm<CreateProjectInput>({
  resolver: zodResolver(createProjectSchema),
});

// Used in the API handler (server) — same validation, zero duplication
function handleCreateProject(body: unknown) {
  const data = createProjectSchema.parse(body);
  return db.projects.create({ data });
}
```

Form state is inherently different from application state. Let the form library own it. Your component should only care about the validated output on submission.
