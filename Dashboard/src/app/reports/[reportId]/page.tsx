"use client";

import { AuthGate, SignOutButton } from "@/features/auth";
import {
  getUpdateReportAcceptanceEvidence,
  getUpdateReportNarrative,
  useProjectWorkflow,
  type PreviewScreenshot,
  type UpdateReportAcceptanceEvidence,
} from "@/features/project-workflow";
import {
  ArrowLeft,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

const MOCK_ACCEPTANCE_VIDEO_SRC =
  "/Recording%202026-06-06%20at%2015-13-20.mp4";

export default function ReportPage() {
  return (
    <AuthGate>
      <ReportPageContent />
    </AuthGate>
  );
}

function ReportPageContent() {
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

  const releaseLinks = [
    {
      href: report.releaseLinks.appStoreUrl,
      label: "App Store",
    },
    {
      href: report.releaseLinks.posthogUrl,
      label: "PostHog",
    },
  ];
  const narrative = getUpdateReportNarrative(report);

  return (
    <main className="min-h-dvh bg-[#E9EDF2] text-[#101418]">
      <header className="border-b border-[#C8D0D8] bg-white">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
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
            <div className="flex flex-wrap items-center gap-2">
              {releaseLinks.map((link) => (
                <a
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-xs font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open {link.label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
              <SignOutButton variant="header" />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                {report.documentVersion} / {report.documentType}
              </div>
              <h1 className="mt-2 text-4xl font-black leading-none tracking-normal sm:text-5xl">
                {report.title}
              </h1>
              <p className="mt-3 text-base font-black leading-6 text-[#26313B]">
                Update Report - v{report.versionTarget}
              </p>
              <p className="mt-3 max-w-[780px] text-sm font-bold leading-6 text-[#46515D]">
                {report.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[520px]">
              <CompactMeta label="App" value={report.appName} />
              <CompactMeta label="Request" value={report.requestId} />
              <CompactMeta label="Created" value={formatDate(report.createdAt)} />
              <CompactMeta
                label="Sent"
                value={report.sentAt ? formatDate(report.sentAt) : "Pending"}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
          <div className="max-w-[820px]">
            <div className="mono text-[10px] font-black uppercase text-[#2457FF]">
              Operator delivery note
            </div>
            <h2 className="mt-2 text-3xl font-black leading-tight text-[#101418]">
              {narrative.deliveryTitle}
            </h2>
            <div className="mt-4 space-y-4 text-[15px] font-bold leading-8 text-[#26313B]">
              {narrative.deliveryParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
          <SectionHeader
            eyebrow="Screenshot"
            icon={<ImageIcon className="h-4 w-4" />}
            title="Changed Screens And Behavior"
          />
          <div className="mt-4 grid gap-4">
            {report.screenshots.map((screenshot) => (
              <ScreenshotEvidence
                key={screenshot.src}
                narrative={narrative.screenEvidence}
                screenshot={screenshot}
              />
            ))}
          </div>
        </section>

        <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div>
              <div className="mono text-[10px] font-black uppercase text-[#2457FF]">
                Acceptance review
              </div>
              <h2 className="mt-2 text-2xl font-black leading-tight text-[#101418]">
                Reviewed Against The Change Request
              </h2>
            </div>
            <div className="space-y-4 text-[15px] font-bold leading-8 text-[#26313B]">
              {narrative.acceptanceParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
          <SectionHeader
            eyebrow="Verification videos"
            icon={<Video className="h-4 w-4" />}
            title="Acceptance Evidence"
          />
          <div className="mt-4 grid gap-4">
            {getUpdateReportAcceptanceEvidence(report).map(
              (evidence, index) => (
                <AcceptanceEvidenceCard
                  evidence={evidence}
                  index={index}
                  key={evidence.criteria}
                />
              ),
            )}
          </div>
        </section>

        <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
          <SectionHeader
            eyebrow="Resolution record"
            icon={<ClipboardCheck className="h-4 w-4" />}
            title="What Was Sent Back"
          />
          <div className="mt-4 space-y-4 text-sm font-bold leading-7 text-[#46515D]">
            {narrative.resolutionParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>{report.knownLimitations}</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function AcceptanceEvidenceCard({
  evidence,
  index,
}: {
  evidence: UpdateReportAcceptanceEvidence;
  index: number;
}) {
  return (
    <article className="grid overflow-hidden rounded-md border border-[#D8DEE4] bg-[#F8FAFC] md:grid-cols-[280px_minmax(0,1fr)]">
      <div className="bg-[#101418] md:min-h-[180px]">
        <video
          aria-label={evidence.videoLabel}
          className="h-full min-h-[180px] w-full object-cover"
          controls
          preload="metadata"
        >
          <source src={MOCK_ACCEPTANCE_VIDEO_SRC} type="video/mp4" />
          {evidence.videoLabel}
        </video>
      </div>
      <div className="min-w-0 p-4 sm:p-5">
        <div className="mono text-[10px] font-black uppercase text-[#2457FF]">
          Acceptance {index + 1}
        </div>
        <h3 className="mt-2 text-lg font-black leading-snug text-[#101418]">
          {evidence.criteria}
        </h3>
        <p className="mt-3 text-sm font-bold leading-7 text-[#46515D]">
          {evidence.description}
        </p>
      </div>
    </article>
  );
}

function ScreenshotEvidence({
  narrative,
  screenshot,
}: {
  narrative: string[];
  screenshot: PreviewScreenshot;
}) {
  return (
    <figure className="grid overflow-hidden rounded-md border border-[#D8DEE4] bg-[#F8FAFC] md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="bg-[#101418] p-3">
        <div className="relative mx-auto aspect-[1206/2622] w-full max-w-[220px] overflow-hidden rounded-md border border-[#26313B] lg:max-w-[260px]">
          <Image
            alt={screenshot.alt}
            className="object-cover object-top"
            fill
            sizes="(min-width: 1024px) 260px, (min-width: 768px) 220px, 84vw"
            src={screenshot.src}
          />
        </div>
      </div>
      <figcaption className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
        <div className="mono text-[10px] font-black uppercase text-[#46515D]">
          Screen: {screenshot.label}
        </div>
        <h2 className="mt-2 text-2xl font-black leading-tight text-[#101418]">
          {screenshot.label}
        </h2>
        {screenshot.description ? (
          <p className="mt-3 max-w-[680px] text-sm font-bold leading-7 text-[#46515D]">
            {screenshot.description}
          </p>
        ) : null}
        <div className="mt-4 space-y-3 text-sm font-bold leading-7 text-[#26313B]">
          {narrative.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </figcaption>
    </figure>
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

function CompactMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3">
      <div className="mono text-[9px] font-black uppercase text-[#8A94A0]">
        {label}
      </div>
      <div className="mt-1 truncate text-xs font-black leading-5 text-[#101418]">
        {value}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
