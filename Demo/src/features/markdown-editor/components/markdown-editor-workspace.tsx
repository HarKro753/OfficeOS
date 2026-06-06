"use client";

import { EditorHeader } from "./editor-header";
import { TemplateSidebar } from "./template-sidebar";
import { useMarkdownWorkspace } from "../hooks/use-markdown-workspace";
import type { SourceDoc } from "../types";

type MarkdownEditorWorkspaceProps = {
  initialDocs: SourceDoc[];
};

export function MarkdownEditorWorkspace({
  initialDocs,
}: MarkdownEditorWorkspaceProps) {
  const {
    activeDoc,
    activeItem,
    activeItemId,
    bindTextarea,
    closeWorkspaceItem,
    currentContent,
    insertAssetReference,
    mockAssets,
    openItems,
    selectWorkspaceItem,
    updateActiveDocument,
    workspaceItems,
  } = useMarkdownWorkspace(initialDocs);
  const selectedMockAsset =
    activeItem.type === "asset"
      ? mockAssets.find((asset) => asset.path === activeItem.path)
      : undefined;

  return (
    <main className="flex min-h-dvh flex-col bg-[#E9EDF2] text-[#101418] lg:p-4">
      <section className="flex min-h-dvh flex-1 gap-3 overflow-hidden lg:min-h-[calc(100dvh-2rem)]">
        <TemplateSidebar
          activeItemId={activeItemId}
          selectWorkspaceItem={selectWorkspaceItem}
          workspaceItems={workspaceItems}
        />

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-white shadow-[0_18px_70px_rgba(16,20,24,0.08)]">
          <EditorHeader
            activeItemId={activeItemId}
            closeWorkspaceItem={closeWorkspaceItem}
            openItems={openItems}
            selectWorkspaceItem={selectWorkspaceItem}
          />

          <section className="relative min-h-0 flex-1 overflow-auto bg-white">
            {activeItem.type === "document" ? (
              <textarea
                ref={bindTextarea}
                aria-label={`${activeDoc} editor`}
                className="mono block min-h-full w-full resize-none border-0 bg-white px-5 py-5 text-[11px] leading-[1.55] text-[#101418] outline-none selection:bg-[#DDE7FF]"
                onChange={(event) =>
                  updateActiveDocument(event.target.value)
                }
                spellCheck={false}
                value={currentContent}
              />
            ) : (
              <div className="flex min-h-full items-center justify-center p-5">
                <div className="w-full max-w-[560px] border border-[#D8DEE4] bg-[#F8FAFC] p-5">
                  <div className="flex items-center gap-3">
                    <span className="mono grid h-10 w-12 shrink-0 place-items-center rounded bg-white text-[10px] font-black text-[#2457FF]">
                      {activeItem.kind === "image" ? "IMG" : "FILE"}
                    </span>
                    <div className="min-w-0">
                      <div className="mono truncate text-sm font-black">
                        {activeItem.label}
                      </div>
                      <div className="mono mt-1 truncate text-[11px] font-bold text-[#46515D]">
                        {activeItem.path}
                      </div>
                    </div>
                  </div>
                  {selectedMockAsset ? (
                    <>
                      <p className="mt-4 text-xs font-bold leading-5 text-[#46515D]">
                        {selectedMockAsset.description}
                      </p>
                      <button
                        className="mt-4 inline-flex h-8 items-center justify-center rounded-md bg-[#101418] px-3 text-[11px] font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                        onClick={() => insertAssetReference(selectedMockAsset)}
                        type="button"
                      >
                        Insert reference
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
