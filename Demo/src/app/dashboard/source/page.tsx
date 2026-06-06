"use client";

import {
  DashboardPageLayout,
  SourcePackageWorkspace,
} from "@/features/project-dashboard";
import { useProjectWorkflow } from "@/features/project-workflow";
import { useRouter } from "next/navigation";

export default function DashboardSourcePage() {
  const router = useRouter();
  const workflow = useProjectWorkflow();
  const { activeRequest, app } = workflow.state;

  return (
    <DashboardPageLayout
      activeRequest={activeRequest}
      app={app}
    >
      <SourcePackageWorkspace
        onApproved={() => router.push("/dashboard?approved=1")}
        workflow={workflow}
      />
    </DashboardPageLayout>
  );
}
