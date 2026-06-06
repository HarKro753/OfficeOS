export type ProjectStage =
  | "request-sent"
  | "in-implementation"
  | "test-passed"
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
  acceptance: string[];
  changedScreens: string[];
  createdAt: string;
  documentType: string;
  documentVersion: string;
  id: string;
  implementationNotes: string;
  knownLimitations: string;
  preservedBehavior: string[];
  qaChecklist: string[];
  releaseLinks: {
    appStoreUrl: string;
    posthogUrl: string;
  };
  requestId: string;
  screenshots: PreviewScreenshot[];
  sections: Array<{
    body: string;
    title: string;
  }>;
  sentAt?: string;
  status:
    | "draft"
    | "request-sent"
    | "in-implementation"
    | "test-passed"
    | "live";
  summary: string;
  title: string;
  versionTarget: string;
};

export type UpdateRequest = {
  createdAt: string;
  generatedAt: string;
  id: string;
  reportId: string;
  sentAt?: string;
  sourceReady: boolean;
  stage: Exclude<ProjectStage, "live">;
  status: "sent" | "implementing" | "testing" | "test-passed";
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
  reports: UpdateReport[];
  versions: ProjectVersion[];
};
