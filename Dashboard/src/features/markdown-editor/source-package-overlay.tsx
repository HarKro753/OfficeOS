"use client";

import { CheckCircle2, FileText, X } from "lucide-react";
import { useEffect } from "react";
import { MarkdownEditorWorkspace } from "./components/markdown-editor-workspace";
import { getClientMockChangeRequestData } from "./data/client-mock-assets";

type SourcePackageOverlayProps = {
  onClose: () => void;
  onRequestSent: (versionTarget: string) => void;
  request:
    | {
        id: string;
        sourceReady: boolean;
        versionTarget: string;
      }
    | null;
};

export function SourcePackageOverlay({
  onClose,
  onRequestSent,
  request,
}: SourcePackageOverlayProps) {
  const { assets, sourceDocs } = getClientMockChangeRequestData();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const sendRequest = () => {
    if (!request?.sourceReady) return;

    onRequestSent(request.versionTarget);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#101418]/40 p-2 text-[#101418] sm:p-4">
      <button
        aria-label="Close source review"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label="Review source package"
        aria-modal="true"
        className="relative flex h-[calc(100dvh-1rem)] w-full max-w-[1180px] flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-white shadow-[0_28px_120px_rgba(16,20,24,0.34)] sm:h-[calc(100dvh-2rem)]"
        role="dialog"
      >
        <header className="flex min-h-[52px] items-center justify-between gap-3 border-b border-[#D8DEE4] bg-white px-4">
          <div className="min-w-0">
            <div className="mono text-[10px] font-black uppercase text-[#46515D]">
              Source package
            </div>
            <h2 className="truncate text-lg font-black leading-tight">
              Review ChangeRequest.md
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {request?.sourceReady ? (
              <button
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-[#20B26B] px-3 text-xs font-black text-white transition hover:bg-[#188C54] focus:outline-none focus:ring-2 focus:ring-[#20B26B] focus:ring-offset-1"
                onClick={sendRequest}
                type="button"
              >
                <CheckCircle2 className="h-4 w-4" />
                Send request
              </button>
            ) : null}
            <button
              aria-label="Close source review"
              className="grid h-9 w-9 place-items-center rounded-md border border-[#C8D0D8] bg-white text-[#46515D] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {request?.sourceReady ? (
          <section className="min-h-0 flex-1 overflow-hidden">
            <MarkdownEditorWorkspace
              assets={assets}
              frame="embedded"
              initialDocs={sourceDocs}
              showChrome={false}
              storageKey={`officeos-demo-markdown-documents-v1-${request.id}`}
            />
          </section>
        ) : (
          <section className="grid min-h-0 flex-1 place-items-center p-5 text-center">
            <div className="max-w-[420px]">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-[#F8FAFC] text-[#8A94A0]">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-black">
                Change request unavailable
              </h3>
              <p className="mt-2 text-sm font-bold leading-6 text-[#46515D]">
                Create an update first so OfficeOS can prepare ChangeRequest.md
                for review.
              </p>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
