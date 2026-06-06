"use client";

import { Toaster } from "@/components/ui/sonner";
import { ChatIntakePanel } from "@/features/chat";
import { useProjectWorkflow } from "@/features/project-workflow";
import {
  Clock3,
  ExternalLink,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AppPreviewPanel } from "./app-preview-panel";
import { DashboardDrawer } from "./dashboard-drawer";
import {
  DashboardSidebar,
  type DashboardWorkspaceId,
} from "./dashboard-sidebar";
import { LifecycleStage } from "./lifecycle-stage";
import { SourcePackageWorkspace } from "./source-package-workspace";

function showApprovedToast(versionTarget: string) {
  toast.success("Approved. Implementation is starting.", {
    description: `OfficeOS is using the generated source package and update report to prepare v${versionTarget}.`,
    duration: 6000,
    id: "officeos-update-approved",
  });
}

export function ProjectDashboard({ approved = false }: { approved?: boolean }) {
  const workflow = useProjectWorkflow();
  const { activeRequest, app, logs, versions } = workflow.state;
  const [chatOpen, setChatOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] =
    useState<DashboardWorkspaceId>("dashboard");
  const approvedVersion = activeRequest?.versionTarget ?? "1.1";

  useEffect(() => {
    if (!approved) return;

    showApprovedToast(approvedVersion);
  }, [approved, approvedVersion]);

  const openSourceReview = (requestId = activeRequest?.id) => {
    if (!requestId) return;
    setChatOpen(false);
    setActiveWorkspace("source");
  };

  const handleApproved = (versionTarget: string) => {
    setChatOpen(false);
    setActiveWorkspace("dashboard");
    showApprovedToast(versionTarget);
  };

  return (
    <main className="min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <Toaster />
      <section className="mx-auto grid w-full max-w-[1440px] gap-3 lg:grid-cols-[244px_minmax(0,1fr)]">
        <DashboardSidebar
          activeRequest={activeRequest}
          activeWorkspace={activeWorkspace}
          app={app}
          onSelectWorkspace={setActiveWorkspace}
        />

        {activeWorkspace === "source" ? (
          <SourcePackageWorkspace
            onApproved={handleApproved}
            onBack={() => setActiveWorkspace("dashboard")}
            workflow={workflow}
          />
        ) : activeWorkspace === "history" ? (
          <VersionHistoryWorkspace versions={versions} />
        ) : activeWorkspace === "logs" ? (
          <DeliveryLogWorkspace logs={logs} />
        ) : (
          <DashboardWorkspace
            app={app}
            onCreateUpdate={() => setChatOpen(true)}
            request={activeRequest}
            workflow={workflow}
          />
        )}
      </section>

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
    </main>
  );
}

function DashboardWorkspace({
  app,
  onCreateUpdate,
  request,
  workflow,
}: {
  app: ReturnType<typeof useProjectWorkflow>["state"]["app"];
  onCreateUpdate: () => void;
  request: ReturnType<typeof useProjectWorkflow>["state"]["activeRequest"];
  workflow: ReturnType<typeof useProjectWorkflow>;
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
              <span className="mono rounded border border-[#B6DCC8] bg-[#F1FBF6] px-2 py-1 text-[9px] font-black uppercase text-[#107A48]">
                v{workflow.previewVersion} active
              </span>
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

      <LifecycleStage request={request} />

      <AppPreviewPanel
        request={request}
        screenshots={workflow.previewScreenshots}
        version={workflow.previewVersion}
      />
    </section>
  );
}

function VersionHistoryWorkspace({
  versions,
}: {
  versions: ReturnType<typeof useProjectWorkflow>["state"]["versions"];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <WorkspaceHeader eyebrow="Updates" title="Update history" />
      <VersionHistory versions={versions} />
    </section>
  );
}

function DeliveryLogWorkspace({
  logs,
}: {
  logs: ReturnType<typeof useProjectWorkflow>["state"]["logs"];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <WorkspaceHeader eyebrow="Operations" title="Delivery log" />
      <LiveLogs logs={logs} />
    </section>
  );
}

function WorkspaceHeader({
  action,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            {eyebrow}
          </div>
          <h1 className="mt-1 text-3xl font-black leading-none">{title}</h1>
        </div>
        {action}
      </div>
    </header>
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

function VersionHistory({
  versions,
}: {
  versions: ReturnType<typeof useProjectWorkflow>["state"]["versions"];
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
          <VersionRow key={version.id} version={version} />
        ))}
      </ol>
    </section>
  );
}

function VersionRow({
  version,
}: {
  version: ReturnType<typeof useProjectWorkflow>["state"]["versions"][number];
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
            View report
            <ExternalLink className="h-3 w-3" />
          </span>
        ) : null}
      </div>
    </>
  );

  if (version.reportId) {
    return (
      <li className="border-b border-[#E5EAF0] last:border-b-0">
        <Link
          className="group relative grid gap-3 px-3 py-3 transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-inset sm:grid-cols-[72px_1fr_auto] sm:items-center"
          href={`/reports/${version.reportId}`}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className="grid gap-3 px-3 py-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
      {content}
    </li>
  );
}

function LiveLogs({
  logs,
}: {
  logs: ReturnType<typeof useProjectWorkflow>["state"]["logs"];
}) {
  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Live updates
          </div>
          <h2 className="mt-1 text-lg font-black">Delivery log</h2>
        </div>
        <Clock3 className="h-5 w-5 text-[#2457FF]" />
      </div>

      <ol className="mt-3 space-y-2">
        {logs.map((log) => (
          <li
            className="rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3"
            key={log.id}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xs font-black">{log.title}</h3>
              <span
                className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  log.tone === "green"
                    ? "bg-[#20B26B]"
                    : log.tone === "blue"
                      ? "bg-[#2457FF]"
                      : "bg-[#8A94A0]"
                }`}
              />
            </div>
            <p className="mt-1 text-xs font-bold leading-5 text-[#46515D]">
              {log.detail}
            </p>
            <div className="mono mt-2 text-[9px] font-black uppercase text-[#8A94A0]">
              {new Date(log.at).toLocaleString()}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
