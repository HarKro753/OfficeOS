"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  MockAsset,
  SourceDoc,
  SourceDocKey,
  WorkspaceItem,
  WorkspaceItemId,
} from "../types";

const sourceDocumentsStorageKey = "officeos-demo-markdown-documents-v1";

function isSourceDocKey(
  itemId: WorkspaceItemId,
  docs: SourceDoc[],
): itemId is SourceDocKey {
  return docs.some((doc) => doc.key === itemId);
}

function uniqueItems(items: WorkspaceItemId[]) {
  return Array.from(new Set(items));
}

function defaultDocuments(docs: SourceDoc[]): Record<SourceDocKey, string> {
  return docs.reduce(
    (documents, doc) => ({
      ...documents,
      [doc.key]: doc.content,
    }),
    {} as Record<SourceDocKey, string>,
  );
}

function readStoredDocuments(docs: SourceDoc[]): Record<SourceDocKey, string> {
  const defaults = defaultDocuments(docs);

  if (typeof window === "undefined") return defaults;

  const storedDocuments = window.localStorage.getItem(
    sourceDocumentsStorageKey,
  );
  if (!storedDocuments) return defaults;

  try {
    const parsedDocuments: unknown = JSON.parse(storedDocuments);
    if (typeof parsedDocuments !== "object" || parsedDocuments === null) {
      return defaults;
    }

    docs.forEach((doc) => {
      const storedDoc = (parsedDocuments as Record<SourceDocKey, unknown>)[
        doc.key
      ];

      if (typeof storedDoc === "string") {
        defaults[doc.key] = storedDoc;
      }
    });

    return defaults;
  } catch {
    return defaults;
  }
}

function writeStoredDocuments(documents: Record<SourceDocKey, string>) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    sourceDocumentsStorageKey,
    JSON.stringify(documents),
  );
}

export function useMarkdownWorkspace(
  initialDocs: SourceDoc[],
  initialAssets: MockAsset[],
) {
  const defaultActiveDoc = initialDocs[0]?.key ?? "SPEC.md";
  const [activeDoc, setActiveDoc] = useState<SourceDocKey>(defaultActiveDoc);
  const [activeItemId, setActiveItemId] =
    useState<WorkspaceItemId>(defaultActiveDoc);
  const [openItemIds, setOpenItemIds] = useState<WorkspaceItemId[]>(
    initialDocs.map((doc) => doc.key),
  );
  const [documents, setDocuments] = useState<Record<SourceDocKey, string>>(() =>
    readStoredDocuments(initialDocs),
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bindTextarea = useCallback((element: HTMLTextAreaElement | null) => {
    textareaRef.current = element;
  }, []);

  useEffect(() => {
    writeStoredDocuments(documents);
  }, [documents]);

  const workspaceItems = useMemo<WorkspaceItem[]>(() => {
    const documentItems = initialDocs.map((doc) => ({
      id: doc.key,
      type: "document" as const,
      label: doc.label,
      role: doc.role,
    }));

    const assetItems = initialAssets.map((asset) => ({
      id: `asset:${asset.path}` as const,
      type: "asset" as const,
      label: asset.name,
      path: asset.path,
      kind: asset.kind,
    }));

    return [...documentItems, ...assetItems];
  }, [initialAssets, initialDocs]);

  const openItems = useMemo(
    () => {
      const openIds = new Set(openItemIds);
      return workspaceItems.filter((item) => openIds.has(item.id));
    },
    [openItemIds, workspaceItems],
  );

  const activeItem =
    workspaceItems.find((item) => item.id === activeItemId) ??
    workspaceItems[0];
  const currentContent = documents[activeDoc] ?? "";

  const selectWorkspaceItem = (itemId: WorkspaceItemId) => {
    setOpenItemIds((previous) => uniqueItems([...previous, itemId]));
    setActiveItemId(itemId);

    if (isSourceDocKey(itemId, initialDocs)) {
      setActiveDoc(itemId);
    }
  };

  const closeWorkspaceItem = (itemId: WorkspaceItemId) => {
    setOpenItemIds((previous) => {
      if (previous.length === 1) return previous;

      const itemIndex = previous.indexOf(itemId);
      const next = previous.filter((id) => id !== itemId);

      if (activeItemId === itemId) {
        const fallbackId = next[Math.max(0, itemIndex - 1)] ?? next[0];
        setActiveItemId(fallbackId);

        if (isSourceDocKey(fallbackId, initialDocs)) {
          setActiveDoc(fallbackId);
        }
      }

      return next;
    });
  };

  const updateActiveDocument = (content: string) => {
    setDocuments((previous) => ({
      ...previous,
      [activeDoc]: content,
    }));
  };

  return {
    activeDoc,
    activeItem,
    activeItemId,
    bindTextarea,
    closeWorkspaceItem,
    currentContent,
    mockAssets: initialAssets,
    openItems,
    selectWorkspaceItem,
    updateActiveDocument,
    workspaceItems,
  };
}
