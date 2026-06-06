"use client";

import { Toaster } from "@/components/ui/sonner";
import { ChatIntakePanel } from "@/features/chat";
import { SourcePackageOverlay } from "@/features/markdown-editor";
import {
  projectStageIndex,
  DashboardSidebar,
  type ProjectStage,
  type ProjectWorkflowState,
  type UpdateRequest,
  UpdateReportOverlay,
  useProjectWorkflow,
} from "@/features/project-workflow";
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  ExternalLink,
  Hammer,
  LoaderCircle,
  Plus,
  Send,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

const STAGE_DELAY_MS = 4000;

type ProjectWorkflow = ReturnType<typeof useProjectWorkflow>;
type ProjectVersion = ProjectWorkflow["state"]["versions"][number];

const stages: Array<{
  activeDetail: string;
  detail: string;
  icon: LucideIcon;
  id: ProjectStage;
  label: string;
}> = [
  {
    activeDetail: "OfficeOS is validating the submitted request package.",
    detail: "The submitted request is contradiction-free and ready to build.",
    icon: Send,
    id: "request-sent",
    label: "Request sent",
  },
  {
    activeDetail: "OfficeOS is implementing the submitted update.",
    detail: "OfficeOS finished applying the submitted update.",
    icon: Hammer,
    id: "in-implementation",
    label: "In implementation",
  },
  {
    activeDetail: "OfficeOS is testing the implemented app.",
    detail: "The implementation passed the request acceptance checks.",
    icon: ClipboardCheck,
    id: "test-passed",
    label: "Test passed",
  },
  {
    activeDetail: "OfficeOS is promoting the tested version to the live baseline.",
    detail: "The delivered version is the live baseline.",
    icon: CheckCircle2,
    id: "live",
    label: "Live",
  },
];

function completedThrough(request: UpdateRequest | null) {
  if (!request) return projectStageIndex("live");
  if (request.status === "draft") return -1;
  if (request.status === "sent") return projectStageIndex("request-sent");
  if (request.status === "implementing") return projectStageIndex("request-sent");
  if (request.status === "testing") return projectStageIndex("in-implementation");
  return projectStageIndex("test-passed");
}

function activeIndex(request: UpdateRequest | null) {
  if (!request) return projectStageIndex("live");
  if (request.status === "draft") return -1;
  if (request.status === "sent") return projectStageIndex("in-implementation");
  if (request.status === "implementing") return projectStageIndex("in-implementation");
  if (request.status === "testing") return projectStageIndex("test-passed");
  return projectStageIndex("live");
}

function showRequestSentToast(versionTarget: string) {
  toast.success(`Request sent for v${versionTarget}.`, {
    description: "The submitted change request is contradiction-free.",
    duration: 6000,
    id: "officeos-request-sent",
  });
}

function showImplementationToast(versionTarget: string) {
  toast.success(`Implementation complete for v${versionTarget}.`, {
    description: "OfficeOS finished applying the update and is testing the app.",
    duration: 6000,
    id: "officeos-implementation-complete",
  });
}

function showTestPassedToast(versionTarget: string) {
  toast.success(`Tests passed for v${versionTarget}.`, {
    description: "The implementation passed the request acceptance checks.",
    duration: 6000,
    id: "officeos-tests-passed",
  });
}

function showLiveToast(versionTarget: string) {
  toast.success(`v${versionTarget} is live.`, {
    description: "The previous live baseline has been retired.",
    duration: 6000,
    id: "officeos-update-live",
  });
}

function DashboardPageLayout({
  app,
  children,
}: {
  app: ProjectWorkflowState["app"];
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <Toaster />
      <section className="mx-auto grid w-full max-w-[1440px] gap-3 lg:grid-cols-[244px_minmax(0,1fr)]">
        <DashboardSidebar app={app} />
        {children}
      </section>
    </main>
  );
}

function ExternalReference({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-[#C8D0D8] bg-white px-2 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function StatusIndicator({
  active,
  complete,
  loading,
}: {
  active: boolean;
  complete: boolean;
  loading: boolean;
}) {
  const label = complete ? "done" : active ? "in progress" : "queued";

  return (
    <span
      className={`mono inline-flex h-6 items-center gap-1.5 rounded border bg-white px-1.5 text-[8px] font-black uppercase ${
        complete
          ? "border-[#B6DCC8] text-[#107A48]"
          : active
            ? "border-[#C8D6FF] text-[#183FBF]"
            : "border-[#D8DEE4] text-[#687482]"
      }`}
    >
      {complete ? (
        <CheckCircle2 className="h-3 w-3 text-[#20B26B]" />
      ) : loading ? (
        <LoaderCircle className="h-3 w-3 animate-spin text-[#2457FF]" />
      ) : active ? (
        <Circle className="h-3 w-3 fill-[#2457FF] text-[#2457FF]" />
      ) : (
        <Circle className="h-3 w-3 text-[#8A94A0]" />
      )}
      {label}
    </span>
  );
}

function VersionStatusIndicator({
  status,
}: {
  status: ProjectVersion["status"];
}) {
  const live = status === "live";

  return (
    <span
      className={`mono inline-flex h-6 w-fit items-center gap-1.5 rounded border bg-white px-2 text-[8px] font-black uppercase ${
        live
          ? "border-[#B6DCC8] text-[#107A48]"
          : "border-[#D8DEE4] text-[#687482]"
      }`}
    >
      {live ? (
        <CheckCircle2 className="h-3 w-3 text-[#20B26B]" />
      ) : (
        <Circle className="h-3 w-3 text-[#8A94A0]" />
      )}
      {status}
    </span>
  );
}

function LifecycleStage({
  currentVersion,
  request,
}: {
  currentVersion: ProjectWorkflowState["app"]["currentVersion"];
  request: UpdateRequest | null;
}) {
  const doneIndex = completedThrough(request);
  const currentIndex = activeIndex(request);
  const displayedVersion = request?.versionTarget ?? currentVersion;
  const hasLoadingRequest = Boolean(request);

  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Project state
          </div>
          <h2 className="mt-1 text-2xl font-black leading-tight">
            Request sent to live
          </h2>
        </div>
        <span className="mono rounded-md border border-[#D8DEE4] bg-[#F8FAFC] px-2.5 py-1.5 text-[10px] font-black uppercase text-[#46515D]">
          v{displayedVersion}
        </span>
      </div>

      <ol className="mt-4 grid gap-2 lg:grid-cols-4">
        {stages.map((stage, index) => {
          const complete = index <= doneIndex;
          const active = !complete && index === currentIndex;
          const StageIcon = stage.icon;

          return (
            <li
              className="min-h-[148px] rounded-md border border-[#D8DEE4] bg-white p-3"
              key={stage.id}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border bg-white ${
                    complete
                      ? "border-[#20B26B] text-[#107A48]"
                      : active
                        ? "border-[#2457FF] text-[#2457FF]"
                        : "border-[#D8DEE4] text-[#8A94A0]"
                  }`}
                >
                  <StageIcon className="h-4 w-4" />
                </span>
                <StatusIndicator
                  active={active}
                  complete={complete}
                  loading={active && hasLoadingRequest}
                />
              </div>
              <div className="mono mt-4 text-[9px] font-black uppercase text-[#687482]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-1 text-sm font-black">{stage.label}</h3>
              <p className="mt-2 text-xs font-bold leading-5 text-[#46515D]">
                {complete
                  ? stage.detail
                  : active
                    ? stage.activeDetail
                    : "This stage is not active yet."}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function VersionHistoryWorkspace({
  onOpenReport,
  versions,
}: {
  onOpenReport: (reportId: string) => void;
  versions: ProjectWorkflow["state"]["versions"];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <VersionHistory onOpenReport={onOpenReport} versions={versions} />
    </section>
  );
}

function VersionHistory({
  onOpenReport,
  versions,
}: {
  onOpenReport: (reportId: string) => void;
  versions: ProjectWorkflow["state"]["versions"];
}) {
  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Version history
          </div>
          <h2 className="mt-1 text-lg font-black">Versioned app baselines</h2>
        </div>
        <ShieldCheck className="h-5 w-5 text-[#20B26B]" />
      </div>
      <ol className="mt-3 divide-y divide-[#E5EAF0] border-t border-[#E5EAF0]">
        {versions.map((version) => (
          <VersionRow
            key={version.id}
            onOpenReport={onOpenReport}
            version={version}
          />
        ))}
      </ol>
    </section>
  );
}

function VersionRow({
  onOpenReport,
  version,
}: {
  onOpenReport: (reportId: string) => void;
  version: ProjectVersion;
}) {
  const content = (
    <>
      <div className="mono text-sm font-black text-[#183FBF]">
        v{version.version}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black">{version.title}</div>
        <p className="mt-1 text-xs font-bold leading-5 text-[#46515D]">
          {version.summary}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <VersionStatusIndicator status={version.status} />
        {version.reportId ? (
          <span className="inline-flex h-8 translate-y-1 items-center justify-center gap-1.5 rounded-md bg-[#101418] px-2.5 text-[10px] font-black text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            Review report
            <ClipboardCheck className="h-3 w-3" />
          </span>
        ) : null}
      </div>
    </>
  );

  if (version.reportId) {
    return (
      <li className="border-b border-[#E5EAF0] last:border-b-0">
        <button
          className="group relative grid w-full gap-3 px-3 py-3 text-left transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-inset sm:grid-cols-[72px_1fr_auto] sm:items-center"
          onClick={() => onOpenReport(version.reportId ?? "")}
          type="button"
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li className="grid gap-3 px-3 py-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
      {content}
    </li>
  );
}

function DashboardOverviewWorkspace({
  app,
  onCreateUpdate,
  onOpenReport,
  request,
  versions,
}: {
  app: ProjectWorkflow["state"]["app"];
  onCreateUpdate: () => void;
  onOpenReport: (reportId: string) => void;
  request: ProjectWorkflow["state"]["activeRequest"];
  versions: ProjectWorkflow["state"]["versions"];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <header className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="mono text-[10px] font-black uppercase text-[#46515D]">
              Dashboard / {app.platform}
            </div>
            <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
              <h1 className="text-3xl font-black leading-none">{app.name}</h1>
            </div>
            <div className="mono mt-2 truncate text-[10px] font-black uppercase text-[#8A94A0]">
              {app.bundleId}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExternalReference href={app.appStoreUrl} label="App Store" />
            <ExternalReference href={app.posthogUrl} label="PostHog" />
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-xs font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              onClick={onCreateUpdate}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Create update
            </button>
          </div>
        </div>
      </header>

      <LifecycleStage currentVersion={app.currentVersion} request={request} />
      <VersionHistoryWorkspace
        onOpenReport={onOpenReport}
        versions={versions}
      />
    </section>
  );
}

function DashboardDrawer({
  children,
  onClose,
  open,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#101418]/32 text-[#101418]">
      <button
        aria-label="Close drawer"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        className="relative flex h-full w-full max-w-[560px] flex-col border-l border-[#C8D0D8] bg-white shadow-[-24px_0_80px_rgba(16,20,24,0.22)]"
      >
        {children}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflow = useProjectWorkflow();
  const { activeRequest, app, versions } = workflow.state;
  const [chatOpen, setChatOpen] = useState(false);
  const requestSentHandledRef = useRef(false);
  const requestTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const requestSent =
    searchParams.get("sent") === "1" || searchParams.get("approved") === "1";
  const reportId = searchParams.get("reportId");
  const sourceOpen = searchParams.get("source") === "1";
  const selectedReport = reportId ? workflow.reportById(reportId) : null;

  useEffect(() => {
    return () => {
      requestTimersRef.current.forEach((timer) => clearTimeout(timer));
      requestTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!requestSent) {
      requestSentHandledRef.current = false;
      return;
    }

    if (requestSentHandledRef.current) return;

    if (!activeRequest) {
      router.replace("/dashboard");
      return;
    }

    requestSentHandledRef.current = true;
    requestTimersRef.current.forEach((timer) => clearTimeout(timer));
    requestTimersRef.current = [];

    const versionTarget = activeRequest.versionTarget;
    const schedule = (callback: () => void, delay = STAGE_DELAY_MS) => {
      const timer = setTimeout(callback, delay);
      requestTimersRef.current.push(timer);
    };
    const releaseUpdate = () => {
      const completedState = workflow.releaseTestedUpdate();
      showLiveToast(completedState.app.currentVersion);
      router.replace("/dashboard");
    };
    const scheduleTesting = () => {
      workflow.beginImplementationTesting();
      showImplementationToast(versionTarget);

      schedule(() => {
        const testedState = workflow.passImplementationTests();
        const testedVersionTarget =
          testedState.activeRequest?.versionTarget ?? versionTarget;
        showTestPassedToast(testedVersionTarget);
        schedule(releaseUpdate);
      });
    };

    if (activeRequest.status === "test-passed") {
      showTestPassedToast(versionTarget);
      schedule(releaseUpdate);
      return;
    }

    if (activeRequest.status === "testing") {
      schedule(() => {
        const testedState = workflow.passImplementationTests();
        const testedVersionTarget =
          testedState.activeRequest?.versionTarget ?? versionTarget;
        showTestPassedToast(testedVersionTarget);
        schedule(releaseUpdate);
      });
      return;
    }

    if (activeRequest.status === "implementing") {
      schedule(scheduleTesting);
      return;
    }

    const sentState = workflow.markRequestSent();
    const sentVersionTarget =
      sentState.activeRequest?.versionTarget ?? versionTarget;
    showRequestSentToast(sentVersionTarget);

    schedule(() => {
      workflow.beginRequestImplementation();
      schedule(scheduleTesting);
    });
  }, [activeRequest, requestSent, router, workflow]);

  const openSourceReview = (requestId = activeRequest?.id) => {
    if (!requestId) return;

    router.push("/dashboard?source=1");
  };

  const handleRequestSent = () => {
    setChatOpen(false);
    router.push("/dashboard?sent=1");
  };

  const openReport = (nextReportId: string) => {
    if (!nextReportId) return;

    setChatOpen(false);
    router.push(`/dashboard?reportId=${encodeURIComponent(nextReportId)}`);
  };

  const closeReport = () => {
    router.replace("/dashboard");
  };

  const closeSourceReview = () => {
    router.replace("/dashboard");
  };

  return (
    <DashboardPageLayout app={app}>
      <DashboardOverviewWorkspace
        app={app}
        onCreateUpdate={() => setChatOpen(true)}
        onOpenReport={openReport}
        request={activeRequest}
        versions={versions}
      />

      {selectedReport ? (
        <UpdateReportOverlay onClose={closeReport} report={selectedReport} />
      ) : null}

      {sourceOpen ? (
        <SourcePackageOverlay
          onClose={closeSourceReview}
          onRequestSent={handleRequestSent}
          request={activeRequest}
        />
      ) : null}

      <DashboardDrawer
        onClose={() => setChatOpen(false)}
        open={chatOpen}
        title="Create update"
      >
        <ChatIntakePanel
          onClose={() => setChatOpen(false)}
          onRequestSent={handleRequestSent}
          onReviewSource={(requestId) => openSourceReview(requestId)}
          workflow={workflow}
        />
      </DashboardDrawer>
    </DashboardPageLayout>
  );
}
