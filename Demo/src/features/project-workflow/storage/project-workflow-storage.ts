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

function normalizeReportStatus(
  value: unknown,
): UpdateReport["status"] | undefined {
  if (value === "approved") return "request-sent";
  if (
    value === "draft" ||
    value === "request-sent" ||
    value === "in-implementation" ||
    value === "test-passed" ||
    value === "live"
  ) {
    return value;
  }

  return undefined;
}

function normalizeReport(value: unknown): UpdateReport | null {
  if (!isRecord(value)) return null;

  const fallback = fallbackReport(value);
  const status = normalizeReportStatus(value.status) ?? fallback.status;
  const sentAt =
    typeof value.sentAt === "string"
      ? value.sentAt
      : typeof value.approvedAt === "string"
        ? value.approvedAt
        : fallback.sentAt;

  return {
    ...fallback,
    ...value,
    acceptance: Array.isArray(value.acceptance)
      ? (value.acceptance as UpdateReport["acceptance"])
      : fallback.acceptance,
    releaseLinks: isRecord(value.releaseLinks)
      ? {
          ...fallback.releaseLinks,
          ...value.releaseLinks,
        }
      : fallback.releaseLinks,
    screenshots: normalizeScreenshots(value.screenshots, fallback.screenshots),
    sections: Array.isArray(value.sections)
      ? (value.sections as UpdateReport["sections"])
      : fallback.sections,
    sentAt,
    status,
  } as UpdateReport;
}

function normalizeRequestStage(value: unknown): UpdateRequest["stage"] {
  if (value === "request-created") {
    return "draft";
  }
  if (value === "human-approved") {
    return "request-sent";
  }
  if (
    value === "request-sent" ||
    value === "in-implementation" ||
    value === "test-passed"
  ) {
    return value;
  }

  return "draft";
}

function normalizeRequestStatus(value: unknown): UpdateRequest["status"] {
  if (value === "generated") return "draft";
  if (value === "approved") return "sent";
  if (
    value === "draft" ||
    value === "sent" ||
    value === "implementing" ||
    value === "testing" ||
    value === "test-passed"
  ) {
    return value;
  }

  return "draft";
}

function normalizeActiveRequest(value: unknown): UpdateRequest | null {
  if (!isRecord(value)) return null;

  const fallback = generatedRequest();
  const sentAt =
    typeof value.sentAt === "string"
      ? value.sentAt
      : typeof value.approvedAt === "string"
        ? value.approvedAt
        : undefined;
  const status = normalizeRequestStatus(value.status);
  const stage = normalizeRequestStage(value.stage);
  const generatedButUnsent =
    !sentAt && status === "sent" && stage === "request-sent";
  const inferredStage =
    stage !== "draft" || status === "draft"
      ? stage
      : status === "implementing"
        ? "in-implementation"
        : status === "testing" || status === "test-passed"
          ? "test-passed"
          : "request-sent";

  return {
    ...fallback,
    ...value,
    sentAt,
    stage: generatedButUnsent ? "draft" : inferredStage,
    status: generatedButUnsent ? "draft" : status,
  } as UpdateRequest;
}

function normalizeVersions(
  versions: ProjectVersion[],
  currentVersion: string,
): Pick<ProjectWorkflowState, "versions"> &
  Pick<ProjectWorkflowState["app"], "currentVersion"> {
  const liveVersion =
    versions.find((version) => version.version === currentVersion)?.version ??
    versions.find((version) => version.status === "live")?.version ??
    versions[0]?.version ??
    currentVersion;

  return {
    currentVersion: liveVersion,
    versions: versions.map((version) => ({
      ...version,
      status:
        version.version === liveVersion
          ? ("live" as const)
          : ("pending" as const),
    })),
  };
}

export function normalizeState(value: unknown): ProjectWorkflowState {
  const fallback = baselineState();
  if (!isRecord(value)) return fallback;

  const app = {
    ...fallback.app,
    ...(isRecord(value.app) ? value.app : {}),
  };
  const reports = Array.isArray(value.reports)
    ? value.reports.flatMap((report) => {
        const normalizedReport = normalizeReport(report);
        return normalizedReport ? [normalizedReport] : [];
      })
    : fallback.reports;
  const activeRequest = normalizeActiveRequest(value.activeRequest);
  const rawVersions = Array.isArray(value.versions)
    ? (value.versions as ProjectVersion[])
    : fallback.versions;
  const visibleVersions =
    activeRequest?.status === "draft"
      ? rawVersions.filter(
          (version) => version.version !== activeRequest.versionTarget,
        )
      : rawVersions;
  const { currentVersion, versions } = normalizeVersions(
    visibleVersions,
    app.currentVersion,
  );

  return {
    activeRequest,
    app: {
      ...app,
      currentVersion,
    },
    reports,
    versions,
  };
}

export function readState(): ProjectWorkflowState {
  if (typeof window === "undefined") return baselineState();

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return baselineState();

  try {
    const normalizedState = normalizeState(JSON.parse(stored));
    window.localStorage.setItem(storageKey, JSON.stringify(normalizedState));
    return normalizedState;
  } catch {
    return baselineState();
  }
}

export function writeState(state: ProjectWorkflowState) {
  const normalizedState = normalizeState(state);

  if (typeof window === "undefined") return normalizedState;

  window.localStorage.setItem(storageKey, JSON.stringify(normalizedState));
  return normalizedState;
}
