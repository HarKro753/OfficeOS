"use client";

import { Toaster } from "@/components/ui/sonner";
import {
  getClientMockChangeRequestData,
  MarkdownEditorWorkspace,
} from "@/features/markdown-editor";
import {
  type ProjectWorkflowState,
  useProjectWorkflow,
} from "@/features/project-workflow";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Hammer,
  LayoutDashboard,
  Rocket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

type ProjectWorkflow = ReturnType<typeof useProjectWorkflow>;
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

function SourcePackageWorkspace({
  dashboardHref = "/dashboard",
  onApproved,
  workflow,
}: {
  dashboardHref?: string;
  onApproved: (versionTarget: string) => void;
  workflow: ProjectWorkflow;
}) {
  const request = workflow.state.activeRequest?.sourceReady
    ? workflow.state.activeRequest
    : null;
  const { assets, sourceDocs } = getClientMockChangeRequestData();

  const approveRequest = () => {
    if (!request) return;

    onApproved(request.versionTarget);
  };

  if (!request) {
    return (
      <section className="grid min-h-[calc(100dvh-1rem)] place-items-center border border-[#C8D0D8] bg-white p-5 text-center shadow-[0_18px_70px_rgba(16,20,24,0.06)] sm:min-h-[calc(100dvh-1.5rem)]">
        <div className="max-w-[420px]">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-[#F8FAFC] text-[#8A94A0]">
            <FileText className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-xl font-black">
            Change request unavailable
          </h1>
          <p className="mt-2 text-sm font-bold leading-6 text-[#46515D]">
            Create an update first so OfficeOS can prepare ChangeRequest.md for
            review.
          </p>
          <Link
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
            href={dashboardHref}
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-[calc(100dvh-1rem)] min-h-0 min-w-0 flex-col sm:h-[calc(100dvh-1.5rem)]">
      <section className="min-h-0 flex-1 overflow-hidden">
        <MarkdownEditorWorkspace
          actions={
            <>
              <Link
                className="inline-flex min-h-8 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-2 text-[11px] font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                href={dashboardHref}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <button
                className="inline-flex min-h-8 items-center justify-center gap-2 rounded-md bg-[#20B26B] px-2 text-[11px] font-black text-white transition hover:bg-[#188C54] focus:outline-none focus:ring-2 focus:ring-[#20B26B] focus:ring-offset-1"
                onClick={approveRequest}
                type="button"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve request
              </button>
            </>
          }
          assets={assets}
          backLabel="Dashboard"
          frame="embedded"
          initialDocs={sourceDocs}
          showChrome={false}
          storageKey={`officeos-demo-markdown-documents-v1-${request.id}`}
        />
      </section>
    </section>
  );
}

export default function DashboardSourcePage() {
  const router = useRouter();
  const workflow = useProjectWorkflow();
  const { app } = workflow.state;

  return (
    <DashboardPageLayout app={app}>
      <SourcePackageWorkspace
        onApproved={() => router.push("/dashboard?approved=1")}
        workflow={workflow}
      />
    </DashboardPageLayout>
  );
}
