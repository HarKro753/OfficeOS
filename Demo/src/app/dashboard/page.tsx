"use client";

import { Toaster } from "@/components/ui/sonner";
import { ChatIntakePanel } from "@/features/chat";
import { SourcePackageOverlay } from "@/features/markdown-editor";
import {
  projectStageIndex,
  type ProjectStage,
  type ProjectWorkflowState,
  type UpdateRequest,
  UpdateReportOverlay,
  useProjectWorkflow,
} from "@/features/project-workflow";
import {
  Activity,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  ExternalLink,
  Hammer,
  LayoutDashboard,
  Plus,
  Rocket,
  Send,
  ShieldCheck,
  Clock3,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

const STAGE_DELAY_MS = 4000;

type ProjectWorkflow = ReturnType<typeof useProjectWorkflow>;
type ProjectVersion = ProjectWorkflow["state"]["versions"][number];
type DashboardWorkspaceId = "dashboard";

const dashboardWorkspaceHrefs: Record<DashboardWorkspaceId, string> = {
  dashboard: "/dashboard",
};

const workflowItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    workspace: "dashboard",
  },
  {
    icon: ClipboardCheck,
    label: "Readiness",
    status: "queued",
  },
  {
    icon: Hammer,
    label: "Implementation",
    status: "queued",
  },
  {
    icon: Rocket,
    label: "Release",
    status: "queued",
  },
  {
    icon: Activity,
    label: "Monitoring",
    status: "queued",
  },
] as const;

const stages: Array<{
  detail: string;
  icon: LucideIcon;
  id: ProjectStage;
  label: string;
}> = [
  {
    detail: "The update request has a change request and report attached.",
    icon: Send,
    id: "request-created",
    label: "Request created",
  },
  {
    detail: "A human approved the generated update package.",
    icon: CheckCircle2,
    id: "human-approved",
    label: "Human approved",
  },
  {
    detail: "OfficeOS is implementing the approved update.",
    icon: Hammer,
    id: "in-implementation",
    label: "In implementation",
  },
  {
    detail: "The delivered version is the live baseline.",
    icon: CheckCircle2,
    id: "live",
    label: "Live",
  },
];

function completedThrough(request: UpdateRequest | null) {
  if (!request) return projectStageIndex("live");
  if (request.status === "generated") return projectStageIndex("request-created");
  if (request.status === "approved") return projectStageIndex("human-approved");
  return projectStageIndex("human-approved");
}

function activeIndex(request: UpdateRequest | null) {
  if (!request) return projectStageIndex("live");
  if (request.status === "generated") return projectStageIndex("human-approved");
  if (request.status === "approved") return projectStageIndex("in-implementation");
  return projectStageIndex("in-implementation");
}

function showHumanApprovedToast(versionTarget: string) {
  toast.success(`Human approval complete for v${versionTarget}.`, {
    description: "The generated change request is approved for implementation.",
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

function DashboardSidebar({
  app,
}: {
  app: ProjectWorkflowState["app"];
}) {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-0 flex-col rounded-md border border-[#C8D0D8] bg-[#F8FAFC] shadow-[0_18px_70px_rgba(16,20,24,0.08)] lg:sticky lg:top-3 lg:h-[calc(100dvh-1.5rem)]">
      <header className="border-b border-[#D8DEE4] p-3">
        <div className="flex items-center gap-2">
          <Image
            alt="OfficeOS"
            className="h-9 w-9 shrink-0"
            height={36}
            src="/officeos-logo.svg"
            width={36}
          />
          <div className="min-w-0">
            <div className="text-lg font-black leading-none">OfficeOS</div>
            <div className="mono mt-1 text-[9px] font-black uppercase text-[#46515D]">
              Delivery OS
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-[#D8DEE4] bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base font-black leading-tight">{app.name}</div>
              <div className="mono mt-1 truncate text-[9px] font-black uppercase text-[#687482]">
                {app.bundleId}
              </div>
            </div>
            <span className="mono rounded bg-[#EAF8F1] px-1.5 py-1 text-[8px] font-black uppercase text-[#107A48]">
              live
            </span>
          </div>
        </div>
      </header>

      <nav className="min-h-0 flex-1 overflow-auto p-3" aria-label="Workflow">
        <div className="mono px-1 pb-2 text-[10px] font-black uppercase text-[#46515D]">
          Workflow
        </div>
        <div className="space-y-1">
          {workflowItems.map((item) => {
            const Icon = item.icon;
            const workspace =
              "workspace" in item
                ? (item.workspace as DashboardWorkspaceId)
                : undefined;
            const disabled = !workspace;
            const href = workspace
              ? dashboardWorkspaceHrefs[workspace]
              : undefined;
            const active = Boolean(href && pathname === href);
            const itemClassName = `group flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1 ${
              active
                ? "bg-[#E5EAF0] text-[#101418]"
                : disabled
                  ? "cursor-not-allowed text-[#9AA5B1]"
                  : "text-[#46515D] hover:bg-white"
            }`;
            const itemContent = (
              <>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-xs font-black">
                  {item.label}
                </span>
              </>
            );

            if (!workspace || disabled || !href) {
              return (
                <button
                  aria-current={active ? "page" : undefined}
                  className={itemClassName}
                  disabled={disabled}
                  key={item.label}
                  type="button"
                >
                  {itemContent}
                </button>
              );
            }

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={itemClassName}
                href={href}
                key={item.label}
              >
                {itemContent}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
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

  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Project state
          </div>
          <h2 className="mt-1 text-2xl font-black leading-tight">
            Request created to live
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
          const Icon = complete ? CheckCircle2 : active ? Clock3 : Circle;

          return (
            <li
              className={`min-h-[148px] rounded-md border p-3 ${
                complete
                  ? "border-[#B6DCC8] bg-[#F1FBF6]"
                  : active
                    ? "border-[#C8D6FF] bg-[#F4F7FF]"
                    : "border-[#D8DEE4] bg-[#F8FAFC]"
              }`}
              key={stage.id}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${
                    complete
                      ? "border-[#107A48] bg-[#20B26B] text-white"
                      : active
                        ? "border-[#C8D6FF] bg-[#EDF3FF] text-[#2457FF]"
                        : "border-[#D8DEE4] bg-white text-[#8A94A0]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={`mono rounded px-1.5 py-1 text-[8px] font-black uppercase ${
                    complete
                      ? "bg-[#EAF8F1] text-[#107A48]"
                      : active
                        ? "bg-[#EDF3FF] text-[#183FBF]"
                        : "bg-white text-[#8A94A0]"
                  }`}
                >
                  {complete ? "done" : active ? "waiting" : "queued"}
                </span>
              </div>
              <div className="mono mt-4 text-[9px] font-black uppercase text-[#687482]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-1 text-sm font-black">{stage.label}</h3>
              <p className="mt-2 text-xs font-bold leading-5 text-[#46515D]">
                {complete
                  ? stage.detail
                  : active
                    ? `Waiting for ${stage.label.toLowerCase()}.`
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
        <span
          className={`mono w-fit rounded px-2 py-1 text-[8px] font-black uppercase ${
            version.status === "live"
              ? "bg-[#EAF8F1] text-[#107A48]"
              : "bg-[#EDF3FF] text-[#183FBF]"
          }`}
        >
          {version.status}
        </span>
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
  const approvedHandledRef = useRef(false);
  const approvalTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const approved = searchParams.get("approved") === "1";
  const reportId = searchParams.get("reportId");
  const sourceOpen = searchParams.get("source") === "1";
  const selectedReport = reportId ? workflow.reportById(reportId) : null;

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
  }, [activeRequest, approved, router, workflow]);

  const openSourceReview = (requestId = activeRequest?.id) => {
    if (!requestId) return;

    router.push("/dashboard?source=1");
  };

  const handleApproved = () => {
    setChatOpen(false);
    router.push("/dashboard?approved=1");
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
          onApproved={handleApproved}
          onClose={closeSourceReview}
          request={activeRequest}
        />
      ) : null}

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
