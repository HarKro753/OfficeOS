"use client";

import {
  DashboardPageLayout,
  VersionHistoryWorkspace,
} from "@/features/project-dashboard";
import { useProjectWorkflow } from "@/features/project-workflow";

export default function DashboardHistoryPage() {
  const workflow = useProjectWorkflow();
  const { activeRequest, app, versions } = workflow.state;

  return (
    <DashboardPageLayout
      activeRequest={activeRequest}
      app={app}
    >
      <VersionHistoryWorkspace versions={versions} />
    </DashboardPageLayout>
  );
}
