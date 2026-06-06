"use client";

import {
  DashboardPageLayout,
  DeliveryLogWorkspace,
} from "@/features/project-dashboard";
import { useProjectWorkflow } from "@/features/project-workflow";

export default function DashboardLogsPage() {
  const workflow = useProjectWorkflow();
  const { activeRequest, app, logs } = workflow.state;

  return (
    <DashboardPageLayout
      activeRequest={activeRequest}
      app={app}
    >
      <DeliveryLogWorkspace logs={logs} />
    </DashboardPageLayout>
  );
}
