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
  reports: UpdateReport[];
  versions: ProjectVersion[];
};
