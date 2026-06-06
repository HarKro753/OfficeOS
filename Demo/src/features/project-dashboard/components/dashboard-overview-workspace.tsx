"use client";

import type { useProjectWorkflow } from "@/features/project-workflow";
import { Plus } from "lucide-react";
import { AppPreviewPanel } from "./app-preview-panel";
import { ExternalReference } from "./external-reference";
import { LifecycleStage } from "./lifecycle-stage";

type ProjectWorkflow = ReturnType<typeof useProjectWorkflow>;

type DashboardOverviewWorkspaceProps = {
  app: ProjectWorkflow["state"]["app"];
  onCreateUpdate: () => void;
  request: ProjectWorkflow["state"]["activeRequest"];
  workflow: ProjectWorkflow;
};

export function DashboardOverviewWorkspace({
  app,
  onCreateUpdate,
  request,
  workflow,
}: DashboardOverviewWorkspaceProps) {
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
