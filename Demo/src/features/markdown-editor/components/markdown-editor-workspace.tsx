"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { CsvPreview } from "./csv-preview";
import { EditorHeader } from "./editor-header";
import { MarkdownPreview } from "./markdown-preview";
import { TemplateSidebar } from "./template-sidebar";
import { useMarkdownWorkspace } from "../hooks/use-markdown-workspace";
import type { MockAsset, SourceDoc } from "../types";

type MarkdownEditorWorkspaceProps = {
  actions?: ReactNode;
  assets: MockAsset[];
  backHref?: string;
  backLabel?: string;
  frame?: "embedded" | "page";
  initialDocs: SourceDoc[];
  onBack?: () => void;
  storageKey?: string;
};

export function MarkdownEditorWorkspace({
  actions,
  assets,
  backHref = "/chat",
  backLabel = "Back to chat",
  frame = "page",
  initialDocs,
  onBack,
  storageKey,
}: MarkdownEditorWorkspaceProps) {
  const {
    activeDoc,
    activeItem,
    activeItemId,
    closeWorkspaceItem,
    currentContent,
    mockAssets,
    openItems,
    selectWorkspaceItem,
    workspaceItems,
  } = useMarkdownWorkspace(initialDocs, assets, storageKey);
  const selectedMockAsset =
    activeItem.type === "asset"
      ? mockAssets.find((asset) => asset.path === activeItem.path)
      : undefined;

  const workspace = (
    <section
      className={`flex flex-1 gap-3 overflow-hidden ${
        frame === "page"
          ? "min-h-dvh lg:min-h-[calc(100dvh-2rem)]"
          : "h-full min-h-0"
      }`}
    >
      <TemplateSidebar
        activeItemId={activeItemId}
        backHref={backHref}
        backLabel={backLabel}
        mode={frame === "embedded" ? "artifacts" : "full"}
        onBack={onBack}
        selectWorkspaceItem={selectWorkspaceItem}
        workspaceItems={workspaceItems}
      />

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-white shadow-[0_18px_70px_rgba(16,20,24,0.08)]">
        <EditorHeader
          activeItemId={activeItemId}
          actions={actions}
          closeWorkspaceItem={closeWorkspaceItem}
          openItems={openItems}
          selectWorkspaceItem={selectWorkspaceItem}
        />

        <section className="relative min-h-0 flex-1 overflow-auto bg-white">
          {activeItem.type === "document" ? (
            <div
              aria-label={`${activeDoc} markdown preview`}
              className="min-h-full bg-white"
            >
              <MarkdownPreview assets={mockAssets} markdown={currentContent} />
            </div>
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
  );

  if (frame === "embedded") {
    return (
      <section className="flex h-full min-h-0 overflow-hidden bg-[#E9EDF2] text-[#101418]">
        {workspace}
      </section>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#E9EDF2] text-[#101418] lg:p-4">
      {workspace}
    </main>
  );
}
