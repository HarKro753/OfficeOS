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

const STAGE_DELAY_MS = 4000;

function showHumanApprovedToast(versionTarget: string) {
  toast.success(`Human approval complete for v${versionTarget}.`, {
    description: "The generated source package is approved for implementation.",
    duration: 6000,
    id: "officeos-human-approved",
  });
}

function showImplementationToast(versionTarget: string) {
  toast.success(`Implementation complete for v${versionTarget}.`, {
    description: "OfficeOS finished applying the approved update package.",
    duration: 6000,
    id: "officeos-implementation-complete",
  });
}

function showLiveToast(versionTarget: string) {
  toast.success(`v${versionTarget} is live.`, {
    description: "The previous live baseline has been retired.",
    duration: 6000,
    id: "officeos-update-live",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflow = useProjectWorkflow();
  const { activeRequest, app, versions } = workflow.state;
  const [chatOpen, setChatOpen] = useState(false);
  const approvedHandledRef = useRef(false);
  const approvalTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const approved = searchParams.get("approved") === "1";

  useEffect(() => {
    return () => {
      approvalTimersRef.current.forEach((timer) => clearTimeout(timer));
      approvalTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!approved) {
      approvedHandledRef.current = false;
      return;
    }

    if (approvedHandledRef.current) return;

    if (!activeRequest) {
      router.replace("/dashboard");
      return;
    }

    approvedHandledRef.current = true;
    approvalTimersRef.current.forEach((timer) => clearTimeout(timer));
    approvalTimersRef.current = [];

    const versionTarget = activeRequest.versionTarget;
    const schedule = (callback: () => void, delay = STAGE_DELAY_MS) => {
      const timer = setTimeout(callback, delay);
      approvalTimersRef.current.push(timer);
    };
    const scheduleImplementation = () => {
      workflow.beginApprovedImplementation();

      schedule(() => {
        const completedState = workflow.completeApprovedUpdate();
        showImplementationToast(versionTarget);
        showLiveToast(completedState.app.currentVersion);
        router.replace("/dashboard");
      });
    };

    if (activeRequest.status === "generated") {
      schedule(() => {
        workflow.approveGeneratedRequest();
        showHumanApprovedToast(versionTarget);
        scheduleImplementation();
      });
      return;
    }

    if (activeRequest.status === "approved") {
      showHumanApprovedToast(versionTarget);
    }

    scheduleImplementation();
  }, [
    activeRequest,
    approved,
    router,
    workflow,
  ]);

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
