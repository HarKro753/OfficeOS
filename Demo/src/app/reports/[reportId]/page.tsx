"use client";

import { useProjectWorkflow } from "@/features/project-workflow";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ReportPage() {
  const params = useParams<{ reportId: string }>();
  const workflow = useProjectWorkflow();
  const report = workflow.reportById(params.reportId);

  if (!report) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#E9EDF2] p-4 text-[#101418]">
        <section className="w-full max-w-[520px] rounded-md border border-[#C8D0D8] bg-white p-5 text-center shadow-[0_18px_70px_rgba(16,20,24,0.08)]">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-[#F8FAFC] text-[#8A94A0]">
            <FileText className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-xl font-black">Report unavailable</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-[#46515D]">
            This report has not been generated in the mocked project state yet.
          </p>
          <Link
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-xs font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-3">
        <header className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.06)] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                href="/"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="mono mt-4 text-[10px] font-black uppercase text-[#46515D]">
                Update report / v{report.versionTarget}
              </div>
              <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                {report.title}
              </h1>
              <p className="mt-3 max-w-[760px] text-sm font-bold leading-6 text-[#46515D]">
                Structured implementation report with screenshots, changed
                surfaces, preserved behavior, and QA focus.
              </p>
            </div>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-xs font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              href={`/source?requestId=${report.requestId}`}
            >
              <ExternalLink className="h-4 w-4" />
              View source
            </Link>
          </div>
        </header>

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-3">
            <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                Screenshot evidence
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {report.screenshots.map((screenshot) => (
                  <figure
                    className="overflow-hidden rounded-md border border-[#D8DEE4] bg-[#101418]"
                    key={screenshot.src}
                  >
                    <div className="relative aspect-[1206/2622]">
                      <Image
                        alt={screenshot.alt}
                        className="object-cover object-top"
                        fill
                        sizes="220px"
                        src={screenshot.src}
                      />
                    </div>
                    <figcaption className="mono bg-white px-2 py-2 text-[9px] font-black uppercase text-[#46515D]">
                      {screenshot.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                Structured description
              </div>
              <div className="mt-3 grid gap-2">
                {report.sections.map((section) => (
                  <article
                    className="rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3"
                    key={section.title}
                  >
                    <h2 className="text-sm font-black">{section.title}</h2>
                    <p className="mt-1 text-sm font-bold leading-6 text-[#46515D]">
                      {section.body}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
            <div className="mono text-[10px] font-black uppercase text-[#46515D]">
              Report metadata
            </div>
            <dl className="mt-3 space-y-3">
              <MetadataRow label="Request" value={report.requestId} />
              <MetadataRow label="Version target" value={`v${report.versionTarget}`} />
              <MetadataRow label="Status" value={report.status} />
              <MetadataRow
                label="Created"
                value={new Date(report.createdAt).toLocaleString()}
              />
            </dl>
          </aside>
        </section>
      </section>
    </main>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mono text-[9px] font-black uppercase text-[#8A94A0]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-black text-[#101418]">
        {value}
      </dd>
    </div>
  );
}
