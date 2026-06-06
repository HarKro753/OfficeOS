import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  MarkdownEditorWorkspace,
  type SourceDoc,
  type SourceDocKey,
} from "@/features/markdown-editor";

const templateDirectory = join(process.cwd(), "templates");

const templateMetadata: Array<Omit<SourceDoc, "content">> = [
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

function readTemplate(key: SourceDocKey) {
  return readFileSync(join(templateDirectory, key), "utf8");
}

export default function Home() {
  const sourceDocs: SourceDoc[] = templateMetadata.map((doc) => ({
    ...doc,
    content: readTemplate(doc.key),
  }));

  return <MarkdownEditorWorkspace initialDocs={sourceDocs} />;
}
