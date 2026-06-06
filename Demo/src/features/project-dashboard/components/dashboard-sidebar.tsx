"use client";

import type { ProjectWorkflowState } from "@/features/project-workflow";
import {
  Activity,
  ClipboardCheck,
  FileText,
  Hammer,
  LayoutDashboard,
  MessageSquarePlus,
  Rocket,
} from "lucide-react";
import Image from "next/image";

type DashboardSidebarProps = {
  activeRequest: ProjectWorkflowState["activeRequest"];
  app: ProjectWorkflowState["app"];
  onCreateUpdate: () => void;
  onOpenSource: () => void;
};

const workflowItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    status: "active",
  },
  {
    icon: MessageSquarePlus,
    label: "Intake",
    status: "ready",
  },
  {
    icon: FileText,
    label: "Source package",
    status: "source",
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
  onCreateUpdate,
  onOpenSource,
}: DashboardSidebarProps) {
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
            const isSource = item.status === "source";
            const disabled = item.status === "queued" || (isSource && !sourceReady);
            const active = item.status === "active";
            const handleClick =
              item.status === "ready"
                ? onCreateUpdate
                : isSource && sourceReady
                  ? onOpenSource
                  : undefined;

            return (
              <button
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1 ${
                  active
                    ? "bg-[#E5EAF0] text-[#101418]"
                    : disabled
                      ? "cursor-not-allowed text-[#9AA5B1]"
                      : "text-[#46515D] hover:bg-white"
                }`}
                disabled={disabled}
                key={item.label}
                onClick={handleClick}
                type="button"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-xs font-black">
                  {item.label}
                </span>
                {isSource && sourceReady ? (
                  <span className="h-2 w-2 rounded-full bg-[#2457FF]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
