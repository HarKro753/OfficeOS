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
  {
    key: "UpdateReport.md",
    label: "Update report",
    role: "Delivery report",
    description:
      "Summarizes the submitted update, changed screens, screenshots, and QA checks.",
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
    name: "explore-screen.png",
    path: "assets/screens/explore-screen.png",
    kind: "image",
    description: "Mock visual reference for the Explore product rows.",
  },
  {
    name: "product-details-expanded.png",
    path: "assets/screens/product-details-expanded.png",
    kind: "image",
    description: "Mock visual reference for nutrient detail expansion.",
  },
  {
    name: "explore.png",
    path: "assets/screens/app-preview/explore.png",
    kind: "image",
    description: "Submitted update screenshot for the Explore screen.",
  },
  {
    name: "explore-filter-open.png",
    path: "assets/screens/app-preview/explore-filter-open.png",
    kind: "image",
    description: "Submitted update screenshot for the open Explore filter.",
  },
  {
    name: "detail-expanded-sections.png",
    path: "assets/screens/app-preview/detail-expanded-sections.png",
    kind: "image",
    description: "Submitted update screenshot for expanded detail sections.",
  },
  {
    name: "detail-footer-alternative-cards.png",
    path: "assets/screens/app-preview/detail-footer-alternative-cards.png",
    kind: "image",
    description: "Submitted update screenshot for alternative product cards.",
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
