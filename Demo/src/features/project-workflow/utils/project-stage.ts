import type { ProjectStage } from "../types";

export function projectStageIndex(stage: ProjectStage) {
  return [
    "request-sent",
    "in-implementation",
    "test-passed",
    "live",
  ].indexOf(stage);
}
