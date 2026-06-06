"use client";

import type { ProjectWorkflowState } from "@/features/project-workflow";
import {
  Activity,
  ClipboardCheck,
  Clock3,
  FileText,
  Hammer,
  History,
  LayoutDashboard,
  Rocket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardWorkspaceId = "dashboard" | "history" | "logs" | "source";

type DashboardSidebarProps = {
  activeRequest: ProjectWorkflowState["activeRequest"];
  app: ProjectWorkflowState["app"];
};

const dashboardWorkspaceHrefs: Record<DashboardWorkspaceId, string> = {
  dashboard: "/dashboard",
  history: "/dashboard/history",
  logs: "/dashboard/logs",
  source: "/dashboard/source",
};

const workflowItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    workspace: "dashboard",
  },
  {
    icon: FileText,
    label: "Source package",
    requiresSource: true,
    workspace: "source",
  },
  {
    icon: History,
    label: "Update history",
    workspace: "history",
  },
  {
    icon: Clock3,
    label: "Delivery log",
    workspace: "logs",
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

export function DashboardSidebar({
  activeRequest,
  app,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const sourceReady = Boolean(activeRequest?.sourceReady);

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
              <div className="text-base font-black leading-tight">
                {app.name}
              </div>
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
            const isSource = workspace === "source";
            const disabled =
              !workspace || ("requiresSource" in item && !sourceReady);
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
                {isSource && sourceReady ? (
                  <span className="h-2 w-2 rounded-full bg-[#2457FF]" />
                ) : null}
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
