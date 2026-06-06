"use client";

import { Toaster } from "@/components/ui/sonner";
import type { ProjectWorkflowState } from "@/features/project-workflow";
import type { ReactNode } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardPageLayoutProps = {
  activeRequest: ProjectWorkflowState["activeRequest"];
  app: ProjectWorkflowState["app"];
  children: ReactNode;
};

export function DashboardPageLayout({
  activeRequest,
  app,
  children,
}: DashboardPageLayoutProps) {
  return (
    <main className="min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <Toaster />
      <section className="mx-auto grid w-full max-w-[1440px] gap-3 lg:grid-cols-[244px_minmax(0,1fr)]">
        <DashboardSidebar
          activeRequest={activeRequest}
          app={app}
        />
        {children}
      </section>
    </main>
  );
}
