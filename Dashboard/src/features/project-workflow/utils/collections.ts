import type { ProjectWorkflowState } from "../types";

export function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function hasVersion(state: ProjectWorkflowState, version: string) {
  return state.versions.some((item) => item.version === version);
}
