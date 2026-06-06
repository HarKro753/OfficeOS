"use client";

import { useCallback, useMemo, useState } from "react";

export type ProjectStage =
  | "request-created"
  | "human-approved"
  | "in-implementation"
  | "live";

export type PreviewScreenshot = {
  alt: string;
  description?: string;
  label: string;
  src: string;
};

export type ProjectVersion = {
  createdAt: string;
  id: string;
  reportId?: string;
  screenshots: PreviewScreenshot[];
  status: "live" | "pending";
  summary: string;
  title: string;
  version: string;
};

export type UpdateReport = {
  appName: string;
  approvedAt?: string;
  changedScreens: string[];
  createdAt: string;
  documentType: string;
  documentVersion: string;
  id: string;
  implementationNotes: string;
  knownLimitations: string;
  preservedBehavior: string[];
  qaChecklist: string[];
  requestId: string;
  screenshots: PreviewScreenshot[];
  sections: Array<{
    body: string;
    title: string;
  }>;
  status: "draft" | "approved" | "in-implementation" | "live";
  summary: string;
  title: string;
  versionTarget: string;
};

export type ProjectLog = {
  at: string;
  detail: string;
  id: string;
  title: string;
  tone: "blue" | "green" | "slate";
};

export type UpdateRequest = {
  approvedAt?: string;
  createdAt: string;
  generatedAt: string;
  id: string;
  reportId: string;
  sourceReady: boolean;
  stage: Exclude<ProjectStage, "live">;
  status: "generated" | "approved" | "implementing";
  summary: string;
  title: string;
  versionTarget: string;
};

export type ProjectWorkflowState = {
  activeRequest: UpdateRequest | null;
  app: {
    appStoreUrl: string;
    bundleId: string;
    category: string;
    currentVersion: string;
    name: string;
    platform: string;
    posthogUrl: string;
  };
  logs: ProjectLog[];
  reports: UpdateReport[];
  versions: ProjectVersion[];
};

const storageKey = "officeos-demo-project-workflow-v2";

const baselineScreenshots: PreviewScreenshot[] = [
  {
    alt: "YUKA scanner screen",
    label: "Scanner",
    src: "/assets/screens/v1.0/scanner.png",
  },
  {
    alt: "YUKA explore screen",
    label: "Explore",
    src: "/assets/screens/v1.0/explore.png",
  },
  {
    alt: "YUKA product detail screen",
    label: "Product Details",
    src: "/assets/screens/v1.0/product-detail.png",
  },
];

const updateScreenshots: PreviewScreenshot[] = [
  {
    alt: "YUKA product history screen after update",
    description:
      "History is the only new v1.1 page. It shows recently viewed products with image, brand, score, viewed time, and a selected History tab.",
    label: "Product History",
    src: "/assets/screens/v1.1/history.png",
  },
];

const generatedAt = "2026-06-06T09:20:00.000Z";
const baselineAt = "2026-06-01T09:00:00.000Z";

function baselineReport(): UpdateReport {
  return {
    appName: "YUKA",
    changedScreens: [
      "Scanner is available as the baseline product lookup page.",
      "Explore is available as the baseline browsing page.",
      "Product Details is available as the shared product review page.",
    ],
    createdAt: baselineAt,
    documentType: "mobile-app-update-report",
    documentVersion: "alpha",
    id: "report-yuka-v1-baseline",
    implementationNotes:
      "v1.0 is the live baseline before the History update. It includes Scanner, Explore, Product Details, expanded nutrients, and alternatives.",
    knownLimitations:
      "History is not available in v1.0. Recently viewed products cannot be reopened from a dedicated page.",
    preservedBehavior: [
      "Scanner opens Product Details for matched products.",
      "Explore opens Product Details from product cards.",
      "Product Details can show expanded nutrition evidence and alternatives.",
    ],
    qaChecklist: [
      "Scanner baseline screenshot is present.",
      "Explore baseline screenshot is present.",
      "Product Details baseline screenshot is present.",
      "No History page is present in v1.0.",
    ],
    requestId: "request-yuka-v1-baseline",
    screenshots: baselineScreenshots,
    sections: [
      {
        body: "Records the v1.0 baseline before Product History exists.",
        title: "Version note",
      },
    ],
    status: "live",
    summary:
      "Version 1.0 is the live YUKA baseline. It includes Scanner, Explore, and Product Details, but no History page.",
    title: "Initial YUKA baseline",
    versionTarget: "1.0",
  };
}

function baselineState(): ProjectWorkflowState {
  return {
    activeRequest: null,
    app: {
      appStoreUrl: "https://appstoreconnect.apple.com/apps/officeos-yuka",
      bundleId: "com.officeos.yuka",
      category: "Health & Fitness",
      currentVersion: "1.0",
      name: "YUKA",
      platform: "iOS",
      posthogUrl: "https://app.posthog.com/project/officeos-yuka",
    },
    logs: [
      {
        at: baselineAt,
        detail:
          "Initial YUKA baseline is live with onboarding, search, and product details.",
        id: "log-baseline-live",
        title: "v1.0 live",
        tone: "green",
      },
    ],
    reports: [baselineReport()],
    versions: [
      {
        createdAt: baselineAt,
        id: "version-yuka-1",
        reportId: "report-yuka-v1-baseline",
        screenshots: baselineScreenshots,
        status: "live",
        summary:
          "Baseline app with onboarding, product search, and product detail review.",
        title: "Initial YUKA release",
        version: "1.0",
      },
    ],
  };
}

function updateReport(requestId: string, reportId: string): UpdateReport {
  return {
    appName: "YUKA",
    approvedAt: "2026-06-06T09:24:00.000Z",
    changedScreens: [
      "Product History was added as the only new v1.1 page.",
      "The bottom app navigation now includes Scanner, Explore, and History.",
      "History rows show product image, name, brand, score, score label, viewed time, and chevron.",
    ],
    createdAt: generatedAt,
    documentType: "mobile-app-update-report",
    documentVersion: "alpha",
    id: reportId,
    implementationNotes:
      "The update should use the submitted History screenshot as the visual reference. The implementation work should focus on the History page and local recently viewed product behavior only.",
    knownLimitations:
      "This is a mocked update report. No real App Store release, PostHog event stream, or backend history sync is connected.",
    preservedBehavior: [
      "Scanner remains available.",
      "Explore remains available.",
      "Product Details remains the shared destination for products opened from every entry point.",
    ],
    qaChecklist: [
      "History screen matches the submitted screenshot.",
      "Products opened from scan, search, Explore, or Alternatives appear in History.",
      "Reopened products move to the top without duplication.",
      "Selecting a History row opens Product Details.",
      "Existing Scanner, Explore, and detail navigation remain usable.",
    ],
    requestId,
    screenshots: updateScreenshots,
    sections: [
      {
        body:
          "Adds Product History as a top-level page for recently viewed products.",
        title: "Changed behavior",
      },
      {
        body:
          "Scanner, Explore, and Product Details remain available.",
        title: "Preserved behavior",
      },
      {
        body:
          "OfficeOS should validate History rows, deduplication, ordering, and row-to-detail navigation.",
        title: "QA focus",
      },
    ],
    status: "in-implementation",
    summary:
      "Version 1.1 adds one new page to YUKA: Product History. The page gives users a top-level place to revisit products they recently opened from Scanner, Search, Explore, or Alternatives.",
    title: "Add product history tab",
    versionTarget: "1.1",
  };
}

function generatedRequest(): UpdateRequest {
  const requestId = "request-yuka-history-update";

  return {
    createdAt: generatedAt,
    generatedAt,
    id: requestId,
    reportId: "report-yuka-history-update",
    sourceReady: true,
    stage: "request-created",
    status: "generated",
    summary:
      "Add Product History as a top-level tab while preserving Scanner, Explore, and Product Details.",
    title: "Add product history tab",
    versionTarget: "1.1",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeReport(value: unknown): UpdateReport | null {
  if (!isRecord(value)) return null;

  const requestId =
    typeof value.requestId === "string" ? value.requestId : generatedRequest().id;
  const reportId =
    typeof value.id === "string" ? value.id : generatedRequest().reportId;
  const fallback = updateReport(requestId, reportId);

  return {
    ...fallback,
    ...value,
    screenshots: Array.isArray(value.screenshots)
      ? value.screenshots.map((screenshot, index) => ({
          ...fallback.screenshots[index],
          ...(isRecord(screenshot) ? screenshot : {}),
          description: fallback.screenshots[index]?.description,
          label: fallback.screenshots[index]?.label ?? "Screenshot",
        }))
      : fallback.screenshots,
    sections: Array.isArray(value.sections)
      ? (value.sections as UpdateReport["sections"])
      : fallback.sections,
  } as UpdateReport;
}

function normalizeState(value: unknown): ProjectWorkflowState {
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
    logs: Array.isArray(value.logs) ? (value.logs as ProjectLog[]) : fallback.logs,
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

function readState(): ProjectWorkflowState {
  if (typeof window === "undefined") return baselineState();

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return baselineState();

  try {
    return normalizeState(JSON.parse(stored));
  } catch {
    return baselineState();
  }
}

function writeState(state: ProjectWorkflowState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function hasVersion(state: ProjectWorkflowState, version: string) {
  return state.versions.some((item) => item.version === version);
}

export function projectStageIndex(stage: ProjectStage) {
  return [
    "request-created",
    "human-approved",
    "in-implementation",
    "live",
  ].indexOf(stage);
}

export function useProjectWorkflow() {
  const [state, setState] = useState<ProjectWorkflowState>(() =>
    readState(),
  );

  const sync = useCallback((nextState: ProjectWorkflowState) => {
    writeState(nextState);
    setState(nextState);
    return nextState;
  }, []);

  const ensureGeneratedRequest = useCallback(() => {
    const current = readState();
    if (current.activeRequest?.sourceReady) {
      setState(current);
      return current.activeRequest;
    }

    const request = generatedRequest();
    const report = updateReport(request.id, request.reportId);
    const nextState: ProjectWorkflowState = {
      ...current,
      activeRequest: request,
      logs: uniqueById([
        {
          at: request.createdAt,
          detail:
            "Chat generated SPEC.md, DESIGN.md, ChangeRequest.md, and the update report.",
          id: "log-update-generated",
          title: "Update request created",
          tone: "blue",
        },
        ...current.logs,
      ]),
      reports: uniqueById([report, ...current.reports]),
      versions: hasVersion(current, request.versionTarget)
        ? current.versions
        : [
            {
              createdAt: request.createdAt,
              id: "version-yuka-1-1-pending",
              reportId: report.id,
              screenshots: updateScreenshots,
              status: "pending",
              summary: request.summary,
              title: request.title,
              version: request.versionTarget,
            },
            ...current.versions,
          ],
    };

    return sync(nextState).activeRequest ?? request;
  }, [sync]);

  const approveGeneratedRequest = useCallback(() => {
    const current = readState();
    const request = current.activeRequest ?? generatedRequest();
    const approvedAt = new Date().toISOString();
    const approvedRequest: UpdateRequest = {
      ...request,
      approvedAt,
      stage: "in-implementation",
      status: "implementing",
    };
    const nextState: ProjectWorkflowState = {
      ...current,
      activeRequest: approvedRequest,
      logs: uniqueById([
        {
          at: approvedAt,
          detail:
            "Human approval was recorded. OfficeOS started mocked implementation for v1.1.",
          id: "log-update-approved",
          title: "Human approved",
          tone: "green",
        },
        {
          at: approvedAt,
          detail:
            "Implementation is now using the generated update report and source package.",
          id: "log-implementation-started",
          title: "Implementation started",
          tone: "blue",
        },
        {
          at: approvedAt,
          detail:
            "UpdateReport.md includes changed screens, screenshot evidence, QA focus, and preserved behavior.",
          id: "log-report-generated",
          title: "Report generated",
          tone: "slate",
        },
        ...current.logs,
      ]),
      reports: current.reports.map((report) =>
        report.id === request.reportId
          ? { ...report, status: "in-implementation" }
          : report,
      ),
      versions: current.versions.map((version) =>
        version.version === request.versionTarget
          ? { ...version, status: "pending" }
          : version,
      ),
    };

    return sync(nextState);
  }, [sync]);

  const latestVersion = state.versions[0] ?? null;
  const activeReport = state.activeRequest
    ? state.reports.find((report) => report.id === state.activeRequest?.reportId) ??
      null
    : null;
  const reportById = useCallback(
    (reportId: string) =>
      state.reports.find((report) => report.id === reportId) ?? null,
    [state.reports],
  );
  const previewVersion = state.activeRequest?.versionTarget ?? state.app.currentVersion;
  const previewScreenshots =
    state.activeRequest?.sourceReady && activeReport
      ? activeReport.screenshots
      : (latestVersion?.screenshots ?? baselineScreenshots);

  return useMemo(
    () => ({
      activeReport,
      approveGeneratedRequest,
      ensureGeneratedRequest,
      previewScreenshots,
      previewVersion,
      reportById,
      state,
    }),
    [
      activeReport,
      approveGeneratedRequest,
      ensureGeneratedRequest,
      previewScreenshots,
      previewVersion,
      reportById,
      state,
    ],
  );
}
