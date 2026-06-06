import { MarkdownEditorWorkspace } from "@/features/markdown-editor";
import { getMockMarkdownEditorData } from "@/features/markdown-editor/data/mock-assets";

export default function Home() {
  const { assets, sourceDocs } = getMockMarkdownEditorData();

  return <MarkdownEditorWorkspace assets={assets} initialDocs={sourceDocs} />;
}
