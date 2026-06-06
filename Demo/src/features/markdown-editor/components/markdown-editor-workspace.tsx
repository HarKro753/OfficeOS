"use client";

import Image from "next/image";
import { CsvPreview } from "./csv-preview";
import { EditorHeader } from "./editor-header";
import { TemplateSidebar } from "./template-sidebar";
import { useMarkdownWorkspace } from "../hooks/use-markdown-workspace";
import type { MockAsset, SourceDoc } from "../types";

type MarkdownEditorWorkspaceProps = {
  assets: MockAsset[];
  initialDocs: SourceDoc[];
};

export function MarkdownEditorWorkspace({
  assets,
  initialDocs,
}: MarkdownEditorWorkspaceProps) {
  const {
    activeDoc,
    activeItem,
    activeItemId,
    bindTextarea,
    closeWorkspaceItem,
    currentContent,
    mockAssets,
    openItems,
    selectWorkspaceItem,
    updateActiveDocument,
    workspaceItems,
  } = useMarkdownWorkspace(initialDocs, assets);
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
                className="mono block min-h-full w-full resize-none border-0 bg-white px-5 py-5 text-[10px] leading-[1.55] text-[#101418] outline-none selection:bg-[#E5EAF0]"
                onChange={(event) =>
                  updateActiveDocument(event.target.value)
                }
                spellCheck={false}
                value={currentContent}
              />
            ) : selectedMockAsset?.kind === "image" ? (
              <div className="relative min-h-full w-full bg-[#F8FAFC]">
                <Image
                  alt={selectedMockAsset.name}
                  className="object-contain p-8"
                  fill
                  sizes="calc(100vw - 260px)"
                  src={`/${selectedMockAsset.path}`}
                />
              </div>
            ) : selectedMockAsset?.name.endsWith(".csv") ? (
              <CsvPreview path={selectedMockAsset.path} />
            ) : (
              <div className="flex min-h-full items-center justify-center p-5">
                <div className="text-xs font-bold text-[#687482]">
                  Preview unavailable.
                </div>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
