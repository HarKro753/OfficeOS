"use client";

import { useCallback, useMemo, useState } from "react";

export type ProjectStage =
  | "request-created"
  | "human-approved"
  | "in-implementation"
  | "live";

export type PreviewScreenshot = {
  alt: string;
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
  createdAt: string;
  id: string;
  requestId: string;
  screenshots: PreviewScreenshot[];
  sections: Array<{
    body: string;
    title: string;
  }>;
  status: "draft" | "approved" | "in-implementation" | "live";
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

const storageKey = "officeos-demo-project-workflow-v1";

const baselineScreenshots: PreviewScreenshot[] = [
  {
    alt: "YUKA onboarding screen",
    label: "Onboarding",
    src: "/assets/screens/app-preview/onbaording.png",
  },
  {
    alt: "YUKA search screen",
    label: "Search",
    src: "/assets/screens/app-preview/search.png",
  },
  {
    alt: "YUKA product detail screen",
    label: "Details",
    src: "/assets/screens/app-preview/details.png",
  },
];

const updateScreenshots: PreviewScreenshot[] = [
  {
    alt: "YUKA explore screen after update",
    label: "Explore",
    src: "/assets/screens/app-preview/explore.png",
  },
  {
    alt: "YUKA explore filter opened after update",
    label: "Filters",
    src: "/assets/screens/app-preview/explore-filter-open.png",
  },
  {
    alt: "YUKA expanded detail sections after update",
    label: "Detail sections",
    src: "/assets/screens/app-preview/detail-expanded-sections.png",
  },
  {
    alt: "YUKA alternative cards after update",
    label: "Alternatives",
    src: "/assets/screens/app-preview/detail-footer-alternative-cards.png",
  },
];

const generatedAt = "2026-06-06T09:20:00.000Z";
const baselineAt = "2026-06-01T09:00:00.000Z";

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
    reports: [],
    versions: [
      {
        createdAt: baselineAt,
        id: "version-yuka-1",
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
    createdAt: generatedAt,
    id: reportId,
    requestId,
    screenshots: updateScreenshots,
    sections: [
      {
        body:
          "Adds a richer Explore workflow with visible filtering and expanded product detail evidence.",
        title: "Changed behavior",
      },
      {
        body:
          "Onboarding, baseline search, and existing product detail access remain available.",
        title: "Preserved behavior",
      },
      {
        body:
          "OfficeOS should validate Explore filtering, expanded nutrient sections, and alternative recommendation cards.",
        title: "QA focus",
      },
    ],
    status: "draft",
    title: "Add guided Explore improvements",
    versionTarget: "1.1",
  };
}

function generatedRequest(): UpdateRequest {
  const requestId = "request-yuka-explore-update";

  return {
    createdAt: generatedAt,
    generatedAt,
    id: requestId,
    reportId: "report-yuka-explore-update",
    sourceReady: true,
    stage: "request-created",
    status: "generated",
    summary:
      "Add guided Explore filtering, expanded product details, and alternative cards while preserving v1.0 flows.",
    title: "Add guided Explore improvements",
    versionTarget: "1.1",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
      ? (value.reports as UpdateReport[])
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
      state,
    }),
    [
      activeReport,
      approveGeneratedRequest,
      ensureGeneratedRequest,
      previewScreenshots,
      previewVersion,
      state,
    ],
  );
}
