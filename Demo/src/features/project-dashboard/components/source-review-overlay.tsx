"use client";

import {
  getClientMockMarkdownEditorData,
  MarkdownEditorWorkspace,
} from "@/features/markdown-editor";
import { X } from "lucide-react";

type SourceReviewOverlayProps = {
  onClose: () => void;
  open: boolean;
  requestId: string | null;
};

export function SourceReviewOverlay({
  onClose,
  open,
  requestId,
}: SourceReviewOverlayProps) {
  if (!open || !requestId) return null;

  const { assets, sourceDocs } = getClientMockMarkdownEditorData();

  return (
    <div className="fixed inset-0 z-50 bg-[#101418]/40 p-2 text-[#101418] sm:p-3">
      <section
        aria-label="Source package review"
        className="mx-auto flex h-full w-full max-w-[1380px] flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-[#E9EDF2] shadow-[0_30px_120px_rgba(16,20,24,0.34)]"
      >
        <header className="flex min-h-[54px] items-center justify-between gap-3 border-b border-[#C8D0D8] bg-white px-3 py-2">
          <div className="min-w-0">
            <div className="text-sm font-black">Source package review</div>
            <div className="mono mt-1 truncate text-[9px] font-black uppercase text-[#46515D]">
              {requestId}
            </div>
          </div>
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#D8DEE4] bg-white text-[#46515D] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close source review</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 p-3">
          <MarkdownEditorWorkspace
            assets={assets}
            backLabel="Back to update"
            frame="embedded"
            initialDocs={sourceDocs}
            onBack={onClose}
            storageKey={`officeos-demo-markdown-documents-v1-${requestId}`}
          />
        </div>
      </section>
    </div>
  );
}
