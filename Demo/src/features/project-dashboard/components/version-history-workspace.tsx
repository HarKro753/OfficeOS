import type { useProjectWorkflow } from "@/features/project-workflow";
import { ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { WorkspaceHeader } from "./workspace-header";

type ProjectWorkflow = ReturnType<typeof useProjectWorkflow>;
type ProjectVersion = ProjectWorkflow["state"]["versions"][number];

type VersionHistoryWorkspaceProps = {
  versions: ProjectWorkflow["state"]["versions"];
};

export function VersionHistoryWorkspace({
  versions,
}: VersionHistoryWorkspaceProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <WorkspaceHeader eyebrow="Updates" title="Update history" />
      <VersionHistory versions={versions} />
    </section>
  );
}

function VersionHistory({ versions }: VersionHistoryWorkspaceProps) {
  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Version history
          </div>
          <h2 className="mt-1 text-lg font-black">Versioned app baselines</h2>
        </div>
        <ShieldCheck className="h-5 w-5 text-[#20B26B]" />
      </div>
      <ol className="mt-3 divide-y divide-[#E5EAF0] border-t border-[#E5EAF0]">
        {versions.map((version) => (
          <VersionRow key={version.id} version={version} />
        ))}
      </ol>
    </section>
  );
}

function VersionRow({ version }: { version: ProjectVersion }) {
  const content = (
    <>
      <div className="mono text-sm font-black text-[#183FBF]">
        v{version.version}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black">{version.title}</div>
        <p className="mt-1 text-xs font-bold leading-5 text-[#46515D]">
          {version.summary}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <span
          className={`mono w-fit rounded px-2 py-1 text-[8px] font-black uppercase ${
            version.status === "live"
              ? "bg-[#EAF8F1] text-[#107A48]"
              : "bg-[#EDF3FF] text-[#183FBF]"
          }`}
        >
          {version.status}
        </span>
        {version.reportId ? (
          <span className="inline-flex h-8 translate-y-1 items-center justify-center gap-1.5 rounded-md bg-[#101418] px-2.5 text-[10px] font-black text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            View report
            <ExternalLink className="h-3 w-3" />
          </span>
        ) : null}
      </div>
    </>
  );

  if (version.reportId) {
    return (
      <li className="border-b border-[#E5EAF0] last:border-b-0">
        <Link
          className="group relative grid gap-3 px-3 py-3 transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-inset sm:grid-cols-[72px_1fr_auto] sm:items-center"
          href={`/reports/${version.reportId}`}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className="grid gap-3 px-3 py-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
      {content}
    </li>
  );
}
