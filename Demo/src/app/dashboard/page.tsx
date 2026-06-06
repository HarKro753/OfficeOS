"use client";

import { ChatIntakePanel } from "@/features/chat";
import {
  DashboardDrawer,
  DashboardOverviewWorkspace,
  DashboardPageLayout,
} from "@/features/project-dashboard";
import { useProjectWorkflow } from "@/features/project-workflow";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function showApprovedToast(versionTarget: string) {
  toast.success("Approved. Implementation is starting.", {
    description: `OfficeOS is using the generated source package and update report to prepare v${versionTarget}.`,
    duration: 6000,
    id: "officeos-update-approved",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflow = useProjectWorkflow();
  const { activeRequest, app } = workflow.state;
  const [chatOpen, setChatOpen] = useState(false);
  const approved = searchParams.get("approved") === "1";
  const approvedVersion = activeRequest?.versionTarget ?? "1.1";

  useEffect(() => {
    if (!approved) return;

    showApprovedToast(approvedVersion);
  }, [approved, approvedVersion]);

  const openSourceReview = (requestId = activeRequest?.id) => {
    if (!requestId) return;

    setChatOpen(false);
    router.push("/dashboard/source");
  };

  const handleApproved = () => {
    setChatOpen(false);
    router.push("/dashboard?approved=1");
  };

  return (
    <DashboardPageLayout
      activeRequest={activeRequest}
      app={app}
    >
      <DashboardOverviewWorkspace
        app={app}
        onCreateUpdate={() => setChatOpen(true)}
        request={activeRequest}
        workflow={workflow}
      />

      <DashboardDrawer
        onClose={() => setChatOpen(false)}
        open={chatOpen}
        title="Create update"
      >
        <ChatIntakePanel
          onApproved={handleApproved}
          onClose={() => setChatOpen(false)}
          onReviewSource={(requestId) => openSourceReview(requestId)}
          workflow={workflow}
        />
      </DashboardDrawer>
    </DashboardPageLayout>
  );
}
