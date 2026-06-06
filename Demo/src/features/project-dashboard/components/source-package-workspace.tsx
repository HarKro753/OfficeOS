"use client";

import {
  getClientMockMarkdownEditorData,
  MarkdownEditorWorkspace,
} from "@/features/markdown-editor";
import type { useProjectWorkflow } from "@/features/project-workflow";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";

type ProjectWorkflow = ReturnType<typeof useProjectWorkflow>;

type SourcePackageWorkspaceProps = {
  dashboardHref?: string;
  onApproved: (versionTarget: string) => void;
  workflow: ProjectWorkflow;
};

export function SourcePackageWorkspace({
  dashboardHref = "/dashboard",
  onApproved,
  workflow,
}: SourcePackageWorkspaceProps) {
  const request = workflow.state.activeRequest?.sourceReady
    ? workflow.state.activeRequest
    : null;
  const { assets, sourceDocs } = getClientMockMarkdownEditorData();

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
          <h1 className="mt-4 text-xl font-black">Source package unavailable</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-[#46515D]">
            Create an update first so OfficeOS can prepare SPEC.md, DESIGN.md,
            ChangeRequest.md, and the update report.
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
          storageKey={`officeos-demo-markdown-documents-v1-${request.id}`}
        />
      </section>
    </section>
  );
}
