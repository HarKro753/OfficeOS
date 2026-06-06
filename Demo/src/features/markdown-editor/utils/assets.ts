import type { MockAsset } from "../types";

export function assetMarkdown(asset: MockAsset) {
  const label = asset.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");

  return asset.kind === "image"
    ? `![${label}](${asset.path})`
    : `[${asset.name}](${asset.path})`;
}
