"use client";

import {
  useProjectWorkflow,
  type PreviewScreenshot,
} from "@/features/project-workflow";
import {
  ArrowLeft,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
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
  const isHistoryUpdate = report.versionTarget === "1.1";
  const narrative = isHistoryUpdate
    ? historyUpdateNarrative
    : fallbackNarrative(report);

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
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-xs font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              href={`/source?requestId=${report.requestId}`}
            >
              <ExternalLink className="h-4 w-4" />
              View source
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                {report.documentVersion} / {report.documentType}
              </div>
              <h1 className="mt-2 text-4xl font-black leading-none tracking-normal sm:text-5xl">
                Update Report - v{report.versionTarget}
              </h1>
              <p className="mt-3 text-base font-black leading-6 text-[#26313B]">
                {report.title}
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
                label="Approved"
                value={report.approvedAt ? formatDate(report.approvedAt) : "Pending"}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="max-w-[760px]">
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

            <aside className="h-fit rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-4">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                Source considered
              </div>
              <div className="mt-3 grid gap-2">
                {narrative.sourceSignals.map((signal) => (
                  <div
                    className="rounded border border-[#D8DEE4] bg-white px-3 py-2 text-xs font-black leading-5 text-[#101418]"
                    key={signal}
                  >
                    {signal}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
          <SectionHeader
            eyebrow="Screenshot"
            icon={<ImageIcon className="h-4 w-4" />}
            title="Evidence From The Build"
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

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
            <SectionHeader
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

          <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
            <SectionHeader
              eyebrow="Release links"
              icon={<Link2 className="h-4 w-4" />}
              title="Open Release"
            />
            <div className="mt-4 grid gap-2">
              {releaseLinks.map((link) => (
                <a
                  className="inline-flex h-11 items-center justify-between gap-3 rounded-md border border-[#C8D0D8] bg-[#F8FAFC] px-3 text-sm font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                  <ExternalLink className="h-4 w-4 shrink-0 text-[#46515D]" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
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

type NarrativeReport = {
  acceptanceParagraphs: string[];
  deliveryParagraphs: string[];
  deliveryTitle: string;
  screenEvidence: string[];
  sourceSignals: string[];
  testingParagraphs: string[];
};

const historyUpdateNarrative: NarrativeReport = {
  acceptanceParagraphs: [
    "The change was reviewed against the full source request, not only the submitted screenshot. The accepted behavior covers every entry point named in the brief: successful barcode scans, search results, Explore product cards, and alternative product cards all need to write the opened product into History.",
    "The review also covers the product-list rules that make History useful in a real shopping session. Recently opened products are ordered with the latest item first, repeat views do not create duplicate rows, and selecting any History row returns the user to the same shared Product Details destination used elsewhere in the app.",
    "Navigation was considered as part of acceptance. Product Details remains a shared destination rather than a fourth workflow, and back navigation must return to History when History was the source. Existing Scanner, Explore, Product Details, and Alternatives behavior is expected to remain intact.",
  ],
  deliveryParagraphs: [
    "Version 1.1 implements Product History as the only new top-level page in YUKA. The update gives shoppers a dedicated place to return to products they already opened, which removes the need to rescan, retype a search, or rediscover the same product from Explore while comparing items in-store.",
    "The bottom navigation has been expanded from the v1.0 Scanner and Explore structure to Scanner, Explore, and History. Product Details stays as the shared destination behind those entry points, so the update adds recall and continuity without changing the mental model of how product information is opened.",
    "The History screen is designed around recognition. Each row carries the product image, product name, brand, score, score label, last viewed time, and a chevron affordance. That set of fields matches the source brief and gives users enough context to confidently reopen the right product.",
  ],
  deliveryTitle: "Product History was added as an accountable v1.1 update.",
  screenEvidence: [
    "The submitted build evidence shows History as the active tab and presents recently viewed products as native-feeling rows. This is the only new screen introduced in v1.1, which keeps the scope intentionally narrow.",
    "The screenshot also confirms the intended hierarchy: History is a top-level app section, while each row remains a path back into Product Details.",
  ],
  sourceSignals: [
    "Change type: feature",
    "Affected areas: Navigation, Scanner, Explore, Product Details, History, Design System",
    "Non-goals: favorites, accounts, cloud sync, notes, purchase history",
    "Release state: mocked App Store and PostHog links attached",
  ],
  testingParagraphs: [
    "The review pass was framed around the user journeys in ChangeRequest.md. The critical check is that opening Product Details from scan, search, Explore, and Alternatives writes the product to History and moves it to the top of the list.",
    "The same pass records the persistence and navigation rules that are easy to miss in a superficial visual review: repeat views produce one row, an empty History screen has a clear empty state, every populated row opens Product Details, and back navigation returns to History when that was the origin.",
  ],
};

function fallbackNarrative(report: {
  changedScreens: string[];
  preservedBehavior: string[];
  summary: string;
  title: string;
}): NarrativeReport {
  return {
    acceptanceParagraphs: [
      report.changedScreens.join(" "),
      report.preservedBehavior.join(" "),
    ],
    deliveryParagraphs: [report.summary],
    deliveryTitle: report.title,
    screenEvidence: [
      "The screenshots attached to this report are the visual evidence for the delivered version.",
    ],
    sourceSignals: ["Baseline report", "Version evidence attached"],
    testingParagraphs: [
      "The baseline report records the screens and behavior expected to remain available.",
    ],
  };
}
