---
title: Start with Colocated Local State
impact: CRITICAL
impactDescription: prevents unnecessary complexity and re-renders from premature state elevation
tags: state, colocation, useState, useReducer, architecture
---

## Start with Colocated Local State

Most state is local. Start with `useState` or `useReducer` in the component that owns the data. Only elevate state when another component genuinely needs access to it. Premature elevation into context or global stores creates coupling, increases re-renders, and makes code harder to understand.

**Decision tree:**
1. Only one component needs it → `useState` / `useReducer`
2. A few siblings in the same feature need it → lift state to shared parent, or create a feature-level context provider
3. Truly app-wide state (theme, sidebar, auth status) → Zustand store
4. Shareable / bookmarkable state → URL search params

**Incorrect (premature global store for local concern):**

```typescript
// store/ui-store.ts — global store for a single component's toggle
import { create } from "zustand";

interface AccordionStore {
  openSections: Record<string, boolean>;
  toggle: (id: string) => void;
}

const useAccordionStore = create<AccordionStore>((set) => ({
  openSections: {},
  toggle: (id) =>
    set((state) => ({
      openSections: {
        ...state.openSections,
        [id]: !state.openSections[id],
      },
    })),
}));

// components/faq-item.tsx — reaches into global store for a local toggle
function FAQItem({ id, question, answer }: FAQItemProps) {
  const isOpen = useAccordionStore((s) => s.openSections[id]);
  const toggle = useAccordionStore((s) => s.toggle);

  return (
    <div>
      <button onClick={() => toggle(id)}>{question}</button>
      {isOpen && <p>{answer}</p>}
    </div>
  );
}
```

**Correct (colocated local state):**

```typescript
// components/faq-item.tsx — state lives where it's used
function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        {question}
      </button>
      {isOpen && <p>{answer}</p>}
    </div>
  );
}
```

**When elevation IS justified (sibling components need shared state):**

```typescript
// features/dashboard/context.tsx — feature-level context, not global
interface DashboardFilters {
  dateRange: DateRange;
  metric: string;
}

interface DashboardContextValue {
  filters: DashboardFilters;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function useDashboard() {
  const ctx = use(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: { start: startOfMonth(new Date()), end: new Date() },
    metric: "revenue",
  });

  return (
    <DashboardContext value={{ filters, setFilters }}>
      {children}
    </DashboardContext>
  );
}

// Both the chart and the filter bar need the same state — elevation is justified
function DashboardPage() {
  return (
    <DashboardProvider>
      <FilterBar />
      <MetricsChart />
      <DataTable />
    </DashboardProvider>
  );
}
```

The rule of thumb: if you cannot name another component that currently reads or writes this state, keep it local.
