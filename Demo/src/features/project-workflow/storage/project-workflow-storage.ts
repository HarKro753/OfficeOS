import {
  baselineReport,
  baselineState,
  generatedRequest,
  storageKey,
  updateReport,
} from "../data/mock-workflow";
import type {
  PreviewScreenshot,
  ProjectVersion,
  ProjectWorkflowState,
  UpdateReport,
  UpdateRequest,
} from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeScreenshots(
  value: unknown,
  fallback: PreviewScreenshot[],
) {
  if (!Array.isArray(value)) return fallback;

  return value.map((screenshot, index) => ({
    ...fallback[index],
    ...(isRecord(screenshot) ? screenshot : {}),
    label:
      isRecord(screenshot) && typeof screenshot.label === "string"
        ? screenshot.label
        : (fallback[index]?.label ?? "Screenshot"),
  }));
}

function fallbackReport(value: Record<string, unknown>) {
  const versionTarget =
    typeof value.versionTarget === "string" ? value.versionTarget : undefined;

  if (versionTarget === "1.0" || value.id === "report-yuka-v1-baseline") {
    return baselineReport();
  }

  const requestId =
    typeof value.requestId === "string" ? value.requestId : generatedRequest().id;
  const reportId =
    typeof value.id === "string" ? value.id : generatedRequest().reportId;

  return updateReport(requestId, reportId);
}

function normalizeReport(value: unknown): UpdateReport | null {
  if (!isRecord(value)) return null;

  const fallback = fallbackReport(value);

  return {
    ...fallback,
    ...value,
    screenshots: normalizeScreenshots(value.screenshots, fallback.screenshots),
    sections: Array.isArray(value.sections)
      ? (value.sections as UpdateReport["sections"])
      : fallback.sections,
  } as UpdateReport;
}

export function normalizeState(value: unknown): ProjectWorkflowState {
  const fallback = baselineState();
  if (!isRecord(value)) return fallback;

  return {
    activeRequest: isRecord(value.activeRequest)
      ? ({
          ...generatedRequest(),
          ...value.activeRequest,
        } as UpdateRequest)
      : null,
    app: {
      ...fallback.app,
      ...(isRecord(value.app) ? value.app : {}),
    },
    reports: Array.isArray(value.reports)
      ? value.reports.flatMap((report) => {
          const normalizedReport = normalizeReport(report);
          return normalizedReport ? [normalizedReport] : [];
        })
      : fallback.reports,
    versions: Array.isArray(value.versions)
      ? (value.versions as ProjectVersion[])
      : fallback.versions,
  };
}

export function readState(): ProjectWorkflowState {
  if (typeof window === "undefined") return baselineState();

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return baselineState();

  try {
    return normalizeState(JSON.parse(stored));
  } catch {
    return baselineState();
  }
}

export function writeState(state: ProjectWorkflowState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(storageKey, JSON.stringify(state));
}
