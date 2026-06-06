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
