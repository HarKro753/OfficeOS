"use client";

import {
  useProjectWorkflow,
  type PreviewScreenshot,
} from "@/features/project-workflow";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Info,
  Layers3,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

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
    <main className="min-h-dvh bg-[#E9EDF2] text-[#101418]">
      <section className="border-b border-[#C8D0D8] bg-white">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                href="/"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
              <StatusPill value={report.status} />
            </div>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-xs font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              href={`/source?requestId=${report.requestId}`}
            >
              <ExternalLink className="h-4 w-4" />
              View source
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="min-w-0">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                {report.documentVersion} / {report.documentType}
              </div>
              <h1 className="mt-2 text-4xl font-black leading-none tracking-normal sm:text-5xl">
                Update Report
              </h1>
              <p className="mt-3 max-w-[780px] text-base font-black leading-7 text-[#26313B]">
                {report.title}
              </p>
              <p className="mt-3 max-w-[920px] text-sm font-bold leading-6 text-[#46515D]">
                {report.summary}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-2 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3">
              <MetadataRow label="App" value={report.appName} />
              <MetadataRow label="Target" value={`v${report.versionTarget}`} />
              <MetadataRow label="Request" value={report.requestId} />
              <MetadataRow label="Created" value={formatDate(report.createdAt)} />
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1320px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="grid min-w-0 gap-5">
          <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-5">
            <SectionHeader
              eyebrow="Screenshots"
              icon={<ImageIcon className="h-4 w-4" />}
              title="Submitted Update Evidence"
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {report.screenshots.map((screenshot) => (
                <ScreenshotFigure key={screenshot.src} screenshot={screenshot} />
              ))}
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ReportList
              icon={<Layers3 className="h-4 w-4" />}
              items={report.changedScreens}
              title="Changed Screens"
            />
            <ReportList
              icon={<ShieldCheck className="h-4 w-4" />}
              items={report.preservedBehavior}
              title="Preserved Behavior"
            />
          </section>

          <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-5">
            <SectionHeader
              eyebrow="Implementation notes"
              icon={<Info className="h-4 w-4" />}
              title="Mock Update Scope"
            />
            <p className="mt-4 text-sm font-bold leading-7 text-[#46515D]">
              {report.implementationNotes}
            </p>
          </section>

          <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-5">
            <SectionHeader
              eyebrow="QA checklist"
              icon={<ListChecks className="h-4 w-4" />}
              title="Review Gates"
            />
            <ol className="mt-4 grid gap-2">
              {report.qaChecklist.map((item, index) => (
                <li
                  className="flex gap-3 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3"
                  key={item}
                >
                  <span className="mono grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#101418] text-[10px] font-black text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm font-bold leading-6 text-[#26313B]">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-5">
            <SectionHeader
              eyebrow="Known limitations"
              icon={<CircleAlert className="h-4 w-4" />}
              title="Disconnected Systems"
            />
            <p className="mt-4 text-sm font-bold leading-7 text-[#46515D]">
              {report.knownLimitations}
            </p>
          </section>
        </div>

        <aside className="h-fit border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.04)] lg:sticky lg:top-5">
          <SectionHeader
            eyebrow="Frontmatter"
            icon={<FileText className="h-4 w-4" />}
            title="Report Metadata"
          />
          <dl className="mt-4 grid gap-3">
            <MetadataRow label="Document" value={report.documentType} />
            <MetadataRow label="Version" value={report.documentVersion} />
            <MetadataRow label="App" value={report.appName} />
            <MetadataRow label="Request ID" value={report.requestId} />
            <MetadataRow label="Request title" value={report.title} />
            <MetadataRow label="Target version" value={report.versionTarget} />
            <MetadataRow label="Status" value={report.status} />
            <MetadataRow label="Created" value={formatDate(report.createdAt)} />
            {report.approvedAt ? (
              <MetadataRow label="Approved" value={formatDate(report.approvedAt)} />
            ) : null}
          </dl>

          <div className="mt-5 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#101418]">
              <CalendarClock className="h-4 w-4 text-[#46515D]" />
              Source template
            </div>
            <p className="mt-2 text-xs font-bold leading-5 text-[#46515D]">
              This view mirrors the content in
              {" "}
              <span className="mono font-black">templates/UpdateReport.md</span>
              {" "}
              and keeps the generated source package one click away.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ScreenshotFigure({ screenshot }: { screenshot: PreviewScreenshot }) {
  return (
    <figure className="overflow-hidden rounded-md border border-[#D8DEE4] bg-[#101418]">
      <div className="relative aspect-[1206/2622]">
        <Image
          alt={screenshot.alt}
          className="object-cover object-top"
          fill
          sizes="(min-width: 1280px) 260px, (min-width: 640px) 45vw, 92vw"
          src={screenshot.src}
        />
      </div>
      <figcaption className="bg-white p-3">
        <div className="mono text-[9px] font-black uppercase text-[#46515D]">
          Screen: {screenshot.label}
        </div>
        {screenshot.description ? (
          <p className="mt-2 text-xs font-bold leading-5 text-[#46515D]">
            {screenshot.description}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}

function ReportList({
  icon,
  items,
  title,
}: {
  icon: ReactNode;
  items: string[];
  title: string;
}) {
  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-5">
      <SectionHeader eyebrow="Report section" icon={icon} title={title} />
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li
            className="flex gap-3 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3 text-sm font-bold leading-6 text-[#26313B]"
            key={item}
          >
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#1C7C54]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  icon,
  title,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="mono text-[10px] font-black uppercase text-[#46515D]">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-xl font-black leading-tight text-[#101418]">
          {title}
        </h2>
      </div>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#D8DEE4] bg-[#F8FAFC] text-[#46515D]">
        {icon}
      </div>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  return (
    <span className="inline-flex h-9 items-center justify-center rounded-md border border-[#BFD8CA] bg-[#ECF8F1] px-3 text-xs font-black uppercase text-[#1C5F42]">
      {value.replaceAll("-", " ")}
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="mono text-[9px] font-black uppercase text-[#8A94A0]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-black leading-5 text-[#101418]">
        {value}
      </dd>
    </div>
  );
}
