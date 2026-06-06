"use client";

import { useProjectWorkflow } from "@/features/project-workflow";
import {
  Bell,
  Clock3,
  ExternalLink,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppPreviewPanel } from "./app-preview-panel";
import { LifecycleStage } from "./lifecycle-stage";
import { UpdateReportPanel } from "./update-report-panel";

export function ProjectDashboard({ approved = false }: { approved?: boolean }) {
  const router = useRouter();
  const workflow = useProjectWorkflow();
  const { activeRequest, app, logs, versions } = workflow.state;

  return (
    <main className="min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-3">
        <header className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.06)] sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5"
                  height={20}
                  src="/officeos-logo.svg"
                  width={20}
                />
                <span className="mono text-[10px] font-black uppercase text-[#46515D]">
                  OfficeOS dashboard
                </span>
                <span className="h-3 w-px bg-[#D8DEE4]" />
                <span className="mono text-[10px] font-black uppercase text-[#8A94A0]">
                  {app.bundleId}
                </span>
              </div>
              <h1 className="mt-3 text-4xl font-black leading-none sm:text-5xl">
                {app.name}
              </h1>
              <p className="mt-3 max-w-[820px] text-sm font-bold leading-6 text-[#46515D]">
                Orchestrate governed app updates from one place: create an
                update request, approve generated source, watch implementation,
                and inspect the versioned app state.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-sm font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                onClick={() => router.push("/chat")}
                type="button"
              >
                <Plus className="h-4 w-4" />
                Create update
              </button>
              <div className="grid grid-cols-2 gap-2">
                <ExternalReference href={app.appStoreUrl} label="App Store" />
                <ExternalReference href={app.posthogUrl} label="PostHog" />
              </div>
            </div>
          </div>
        </header>

        {approved ? (
          <section className="flex items-start gap-3 border border-[#B6DCC8] bg-[#F1FBF6] p-3 text-[#107A48]">
            <Bell className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="text-sm font-black">
                Approved. Implementation is starting.
              </div>
              <p className="mt-1 text-xs font-bold leading-5 text-[#1B6B47]">
                OfficeOS is using the generated source package and update
                report to prepare v{activeRequest?.versionTarget ?? "1.1"}.
              </p>
            </div>
          </section>
        ) : null}

        <LifecycleStage request={activeRequest} />

        <AppPreviewPanel
          request={activeRequest}
          screenshots={workflow.previewScreenshots}
          version={workflow.previewVersion}
        />

        <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-3">
            <VersionHistory versions={versions} />
            <UpdateReportPanel report={workflow.activeReport} />
          </div>
          <LiveLogs logs={logs} />
        </section>
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
          <li
            className="grid gap-3 py-3 sm:grid-cols-[72px_1fr_auto] sm:items-center"
            key={version.id}
          >
            <div className="mono text-sm font-black text-[#183FBF]">
              v{version.version}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black">{version.title}</div>
              <p className="mt-1 text-xs font-bold leading-5 text-[#46515D]">
                {version.summary}
              </p>
            </div>
            <span
              className={`mono w-fit rounded px-2 py-1 text-[8px] font-black uppercase ${
                version.status === "live"
                  ? "bg-[#EAF8F1] text-[#107A48]"
                  : "bg-[#EDF3FF] text-[#183FBF]"
              }`}
            >
              {version.status}
            </span>
          </li>
        ))}
      </ol>
    </section>
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
