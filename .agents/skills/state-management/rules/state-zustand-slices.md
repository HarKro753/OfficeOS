---
title: Organize Zustand Stores with the Slice Pattern
impact: HIGH
impactDescription: keeps stores small, typed, and maintainable as the app grows
tags: state, zustand, slices, architecture, typescript
---

## Organize Zustand Stores with the Slice Pattern

As Zustand stores grow, a single flat store becomes hard to maintain. Use the slice pattern to split state by domain concern. Each slice is a self-contained `StateCreator` with its own interface, state, and actions. Combine slices into a single store with full type safety. Keep one store per domain (UI store, notification store) rather than one monolithic store for the entire app.

**Incorrect (monolithic store with mixed concerns):**

```typescript
// store.ts — one giant store for everything
import { create } from "zustand";

interface AppStore {
  // UI concerns
  sidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;

  // Notification concerns
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  dismissNotification: (id: string) => void;

  // Feature flag concerns
  features: Record<string, boolean>;
  setFeature: (key: string, enabled: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  theme: "light",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  notifications: [],
  addNotification: (n) =>
    set((s) => ({ notifications: [...s.notifications, n] })),
  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
  features: {},
  setFeature: (key, enabled) =>
    set((s) => ({ features: { ...s.features, [key]: enabled } })),
}));
```

**Correct (slice pattern — separate files, combined with types):**

```typescript
// store/slices/ui-slice.ts
import type { StateCreator } from "zustand";

export interface UISlice {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  sidebarOpen: true,
  theme: "light",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
});
```

```typescript
// store/slices/notification-slice.ts
import type { StateCreator } from "zustand";

export interface NotificationSlice {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  dismissNotification: (id: string) => void;
}

export const createNotificationSlice: StateCreator<
  NotificationSlice,
  [],
  [],
  NotificationSlice
> = (set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((s) => ({ notifications: [...s.notifications, notification] })),
  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
});
```

```typescript
// store/ui-store.ts — combine slices into a single typed store
import { create } from "zustand";
import { createUISlice, type UISlice } from "./slices/ui-slice";
import {
  createNotificationSlice,
  type NotificationSlice,
} from "./slices/notification-slice";

type UIStore = UISlice & NotificationSlice;

export const useUIStore = create<UIStore>()((...a) => ({
  ...createUISlice(...a),
  ...createNotificationSlice(...a),
}));
```

**Using selectors to minimize re-renders:**

```typescript
// Components select only the state they need
function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside className={sidebarOpen ? "w-64" : "w-0"}>
      <button onClick={toggleSidebar}>Toggle</button>
      {/* sidebar content */}
    </aside>
  );
}

// This component only re-renders when notifications change,
// not when sidebar or theme change
function NotificationBell() {
  const notifications = useUIStore((s) => s.notifications);

  return (
    <button>
      Notifications {notifications.length > 0 && `(${notifications.length})`}
    </button>
  );
}
```

**When slices need to read each other's state, type the full store:**

```typescript
// store/slices/ui-slice.ts — cross-slice access
import type { StateCreator } from "zustand";
import type { NotificationSlice } from "./notification-slice";

export interface UISlice {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebarAndClearNotifications: () => void;
}

export const createUISlice: StateCreator<
  UISlice & NotificationSlice,
  [],
  [],
  UISlice
> = (set, get) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebarAndClearNotifications: () => {
    set({ sidebarOpen: false, notifications: [] });
  },
});
```

Keep stores focused on a single domain. If you find yourself scrolling through a store file, it is time to split it into slices or separate stores.
