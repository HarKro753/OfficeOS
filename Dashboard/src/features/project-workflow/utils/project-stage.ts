import type { ProjectStage } from "../types";

export function projectStageIndex(stage: ProjectStage) {
  return [
    "request-sent",
    "in-implementation",
    "resolved",
  ].indexOf(stage);
}
