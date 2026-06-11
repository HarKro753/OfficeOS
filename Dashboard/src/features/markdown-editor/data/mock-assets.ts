import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { MockAsset, SourceDoc, SourceDocKey } from "../types";

type TemplateState = "empty" | "final";

function templateDirectoryForState(templateState: TemplateState) {
  return join(
    process.cwd(),
    "templates",
    templateState === "empty" ? "empty" : "",
  );
}

const mockSourceDocuments: Array<Omit<SourceDoc, "content">> = [
  {
    key: "SPEC.md",
    label: "SPEC.md",
    role: "Product contract",
    description:
      "Defines the app, navigation, screens, requirements, and acceptance criteria.",
  },
  {
    key: "DESIGN.md",
    label: "DESIGN.md",
    role: "Design contract",
    description:
      "Defines colors, typography, layout, components, and visual constraints.",
  },
  {
    key: "ChangeRequest.md",
    label: "Update brief",
    role: "Change contract",
    description:
      "Defines the governed app update that modifies the source of truth.",
  },
];

function readTemplate(key: SourceDocKey, templateState: TemplateState) {
  const templateDirectory = templateDirectoryForState(templateState);

  return readFileSync(join(templateDirectory, key), "utf8");
}

export const mockAssets: MockAsset[] = [
  {
    name: "openfoodfacts-yuka-sample.csv",
    path: "assets/data/openfoodfacts-yuka-sample.csv",
    kind: "file",
    description: "Mock product dataset for scan, search, and explore behavior.",
  },
  {
    name: "yuka-app-icon.png",
    path: "assets/brand/yuka-app-icon.png",
    kind: "image",
    description: "Mock brand asset for the YUKA app identity.",
  },
  {
    name: "scanner.png",
    path: "assets/screens/v1.0/scanner.png",
    kind: "image",
    description: "v1.0 baseline Scanner screen.",
  },
  {
    name: "explore.png",
    path: "assets/screens/v1.0/explore.png",
    kind: "image",
    description: "v1.0 baseline Explore screen.",
  },
  {
    name: "explore-filter.png",
    path: "assets/screens/v1.0/explore-filter.png",
    kind: "image",
    description: "v1.0 baseline Explore filter state.",
  },
  {
    name: "product-detail.png",
    path: "assets/screens/v1.0/product-detail.png",
    kind: "image",
    description: "v1.0 baseline Product Details screen.",
  },
  {
    name: "product-detail-expanded-sections.png",
    path: "assets/screens/v1.0/product-detail-expanded-sections.png",
    kind: "image",
    description: "v1.0 baseline expanded Product Details sections.",
  },
  {
    name: "product-detail-alternatives.png",
    path: "assets/screens/v1.0/product-detail-alternatives.png",
    kind: "image",
    description: "v1.0 baseline Product Details alternatives.",
  },
  {
    name: "history.png",
    path: "assets/screens/v1.1/history.png",
    kind: "image",
    description: "v1.1 submitted update screenshot for the Product History page.",
  },
];

export function getMockMarkdownEditorData(templateState: TemplateState = "final") {
  return {
    sourceDocs: mockSourceDocuments.map((doc) => ({
      ...doc,
      content: readTemplate(doc.key, templateState),
    })),
    assets: mockAssets,
  };
}

export function getMockChangeRequestData(
  templateState: TemplateState = "final",
) {
  const { assets, sourceDocs } = getMockMarkdownEditorData(templateState);

  return {
    assets,
    sourceDocs: sourceDocs.filter((doc) => doc.key === "ChangeRequest.md"),
  };
}
