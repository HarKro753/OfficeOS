import { MarkdownEditorWorkspace } from "@/features/markdown-editor";
import { getMockMarkdownEditorData } from "@/features/markdown-editor/data/mock-assets";

type SourcePageProps = {
  searchParams?: Promise<{
    state?: string | string[];
  }>;
};

export default async function SourcePage({ searchParams }: SourcePageProps) {
  const resolvedSearchParams = await searchParams;
  const state = resolvedSearchParams?.state;
  const sourceState = Array.isArray(state) ? state[0] : state;
  const templateState = sourceState === "final" ? "final" : "empty";
  const { assets, sourceDocs } = getMockMarkdownEditorData(templateState);

  return (
    <MarkdownEditorWorkspace
      assets={assets}
      initialDocs={sourceDocs}
      storageKey={`officeos-demo-markdown-documents-v1-${templateState}`}
    />
  );
}
