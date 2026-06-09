export type SourceDocKey =
  | "SPEC.md"
  | "DESIGN.md"
  | "ChangeRequest.md"
  | "UpdateReport.md";

export type SourceDoc = {
  key: SourceDocKey;
  label: string;
  role: string;
  description: string;
  content: string;
};

export type WorkspaceItemId = SourceDocKey | `asset:${string}`;

export type WorkspaceDocumentItem = {
  id: SourceDocKey;
  type: "document";
  label: string;
  role: string;
};

export type WorkspaceAssetItem = {
  id: `asset:${string}`;
  type: "asset";
  label: string;
  path: string;
  kind: "image" | "file";
};

export type WorkspaceItem = WorkspaceDocumentItem | WorkspaceAssetItem;

export type MockAsset = {
  name: string;
  path: string;
  kind: "image" | "file";
  description: string;
};
