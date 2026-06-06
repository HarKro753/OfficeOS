"use client";

import {
  ClipboardCheck,
  ExternalLink,
  Image as ImageIcon,
  Play,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, type ReactNode } from "react";
import {
  getUpdateReportAcceptanceEvidence,
  getUpdateReportNarrative,
  type UpdateReportAcceptanceEvidence,
} from "../data/update-report-narratives";
import type { PreviewScreenshot, UpdateReport } from "../types";

export function UpdateReportOverlay({
  onClose,
  report,
}: {
  onClose: () => void;
  report: UpdateReport;
}) {
  const narrative = getUpdateReportNarrative(report);
  const releaseLinks = [
    {
      href: report.releaseLinks.appStoreUrl,
      label: "App Store",
    },
  ];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#101418]/40 p-2 text-[#101418] sm:p-4">
      <button
        aria-label="Close report"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={`Update Report v${report.versionTarget}`}
        aria-modal="true"
        className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-[1120px] flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-white shadow-[0_28px_120px_rgba(16,20,24,0.34)] sm:max-h-[calc(100dvh-2rem)]"
        role="dialog"
      >
        <header className="sticky top-0 z-10 border-b border-[#D8DEE4] bg-white px-3 py-2 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                {report.documentVersion} / {report.documentType}
              </div>
              <h2 className="mt-0.5 text-lg font-black leading-tight sm:text-xl">
                {report.title}
              </h2>
              <div className="mt-0.5 text-xs font-black text-[#46515D]">
                Update Report - v{report.versionTarget}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {releaseLinks.map((link) => (
                <a
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#101418] px-2.5 text-[10px] font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open {link.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
              <button
                aria-label="Close report"
                className="grid h-8 w-8 place-items-center rounded-md border border-[#C8D0D8] bg-white text-[#46515D] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-0 overflow-auto bg-[#F8FAFC] p-4 sm:p-5">
          <div className="grid gap-4">
            <section className="border border-[#C8D0D8] bg-white p-5">
              <div className="max-w-[820px]">
                <div className="mono text-[10px] font-black uppercase text-[#2457FF]">
                  Operator delivery note
                </div>
                <h3 className="mt-2 text-3xl font-black leading-tight">
                  {narrative.deliveryTitle}
                </h3>
                <div className="mt-4 space-y-4 text-[15px] font-bold leading-8 text-[#26313B]">
                  {narrative.deliveryParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>

            <section className="border border-[#C8D0D8] bg-white p-5">
              <ReportSectionHeader
                eyebrow="Screenshot"
                icon={<ImageIcon className="h-4 w-4" />}
                title="Changed Screens And Behavior"
              />
              <div className="mt-4 grid gap-4">
                {report.screenshots.map((screenshot) => (
                  <ReportScreenshot
                    key={screenshot.src}
                    narrative={narrative.screenEvidence}
                    screenshot={screenshot}
                  />
                ))}
              </div>
            </section>

            <section className="border border-[#C8D0D8] bg-white p-5">
              <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div>
                  <div className="mono text-[10px] font-black uppercase text-[#2457FF]">
                    Acceptance review
                  </div>
                  <h3 className="mt-2 text-2xl font-black leading-tight">
                    Reviewed Against The Change Request
                  </h3>
                </div>
                <div className="space-y-4 text-[15px] font-bold leading-8 text-[#26313B]">
                  {narrative.acceptanceParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>

            <section className="border border-[#C8D0D8] bg-white p-5">
              <ReportSectionHeader
                eyebrow="Verification videos"
                icon={<Video className="h-4 w-4" />}
                title="Acceptance Evidence"
              />
              <div className="mt-4 grid gap-4">
                {getUpdateReportAcceptanceEvidence(report).map(
                  (evidence, index) => (
                    <ReportAcceptanceEvidence
                      evidence={evidence}
                      index={index}
                      key={evidence.criteria}
                    />
                  ),
                )}
              </div>
            </section>

            <section className="border border-[#C8D0D8] bg-white p-5">
              <ReportSectionHeader
                eyebrow="Testing record"
                icon={<ClipboardCheck className="h-4 w-4" />}
                title="What Was Checked"
              />
              <div className="mt-4 space-y-4 text-sm font-bold leading-7 text-[#46515D]">
                {narrative.testingParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p>{report.knownLimitations}</p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReportAcceptanceEvidence({
  evidence,
  index,
}: {
  evidence: UpdateReportAcceptanceEvidence;
  index: number;
}) {
  return (
    <article className="grid overflow-hidden rounded-md border border-[#D8DEE4] bg-[#F8FAFC] md:grid-cols-[260px_minmax(0,1fr)]">
      <div className="grid aspect-video min-h-[170px] place-items-center bg-[#101418] p-4 text-white md:aspect-auto">
        <div className="grid justify-items-center gap-3 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10">
            <Play className="ml-0.5 h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="mono text-[10px] font-black uppercase text-white/65">
              Mock video placeholder
            </div>
            <div className="mt-1 text-sm font-black leading-tight">
              {evidence.videoLabel}
            </div>
          </div>
        </div>
      </div>
      <div className="min-w-0 p-4 sm:p-5">
        <div className="mono text-[10px] font-black uppercase text-[#2457FF]">
          Acceptance {index + 1}
        </div>
        <h3 className="mt-2 text-lg font-black leading-snug">
          {evidence.criteria}
        </h3>
        <p className="mt-3 text-sm font-bold leading-7 text-[#46515D]">
          {evidence.description}
        </p>
      </div>
    </article>
  );
}

function ReportScreenshot({
  narrative,
  screenshot,
}: {
  narrative: string[];
  screenshot: PreviewScreenshot;
}) {
  return (
    <figure className="grid overflow-hidden rounded-md border border-[#D8DEE4] bg-[#F8FAFC] md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="bg-[#101418] p-3">
        <div className="relative mx-auto aspect-[1206/2622] w-full max-w-[210px] overflow-hidden rounded-md border border-[#26313B] lg:max-w-[240px]">
          <Image
            alt={screenshot.alt}
            className="object-cover object-top"
            fill
            sizes="(min-width: 1024px) 240px, (min-width: 768px) 210px, 84vw"
            src={screenshot.src}
          />
        </div>
      </div>
      <figcaption className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
        <div className="mono text-[10px] font-black uppercase text-[#46515D]">
          Screen: {screenshot.label}
        </div>
        <h3 className="mt-2 text-2xl font-black leading-tight">
          {screenshot.label}
        </h3>
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

function ReportSectionHeader({
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
        <h3 className="mt-1 text-xl font-black leading-tight">{title}</h3>
      </div>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#D8DEE4] bg-[#F8FAFC] text-[#46515D]">
        {icon}
      </div>
    </div>
  );
}
