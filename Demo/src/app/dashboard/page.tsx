"use client";

import { ChatIntakePanel } from "@/features/chat";
import {
  DashboardDrawer,
  DashboardOverviewWorkspace,
  DashboardPageLayout,
} from "@/features/project-dashboard";
import { useProjectWorkflow } from "@/features/project-workflow";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function showApprovedToast(versionTarget: string) {
  toast.success(`Approved. v${versionTarget} is live.`, {
    description:
      "OfficeOS used the generated source package and update report to complete the mocked update.",
    duration: 6000,
    id: "officeos-update-approved",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflow = useProjectWorkflow();
  const { activeRequest, app, versions } = workflow.state;
  const [chatOpen, setChatOpen] = useState(false);
  const approvedHandledRef = useRef(false);
  const approved = searchParams.get("approved") === "1";

  useEffect(() => {
    if (!approved) {
      approvedHandledRef.current = false;
      return;
    }

    if (approvedHandledRef.current) return;

    approvedHandledRef.current = true;
    const completedState = workflow.completeApprovedUpdate();
    showApprovedToast(completedState.app.currentVersion);
  }, [approved, workflow]);

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
        versions={versions}
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
