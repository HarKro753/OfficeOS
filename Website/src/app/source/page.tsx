import { MarkdownEditorWorkspace } from "@/features/markdown-editor";
import { getMockChangeRequestData } from "@/features/markdown-editor/data/mock-assets";
import { redirect } from "next/navigation";

type SourcePageProps = {
  searchParams?: Promise<{
    origin?: string | string[];
    requestId?: string | string[];
    version?: string | string[];
  }>;
};

export default async function SourcePage({ searchParams }: SourcePageProps) {
  const resolvedSearchParams = await searchParams;
  const requestIdParam = resolvedSearchParams?.requestId;
  const versionParam = resolvedSearchParams?.version;
  const requestId = Array.isArray(requestIdParam)
    ? requestIdParam[0]
    : requestIdParam;
  const version = Array.isArray(versionParam) ? versionParam[0] : versionParam;

  if (!requestId && !version) {
    redirect("/chat");
  }

  const templateState = "final";
  const { assets, sourceDocs } = getMockChangeRequestData(templateState);

  return (
    <MarkdownEditorWorkspace
      assets={assets}
      backHref="/chat"
      backLabel="Back to chat"
      initialDocs={sourceDocs}
      showChrome={false}
      storageKey={`officeos-demo-markdown-documents-v1-${
        requestId ?? `version-${version}`
      }`}
    />
  );
}
