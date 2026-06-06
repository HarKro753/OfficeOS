import type { ProjectStage } from "../types";

export function projectStageIndex(stage: ProjectStage) {
  return [
    "request-created",
    "human-approved",
    "in-implementation",
    "live",
  ].indexOf(stage);
}
