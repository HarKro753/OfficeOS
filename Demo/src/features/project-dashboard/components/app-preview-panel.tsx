"use client";

import type { PreviewScreenshot, UpdateRequest } from "@/features/project-workflow";
import Image from "next/image";
import { useState } from "react";

export function AppPreviewPanel({
  request,
  screenshots,
  version,
}: {
  request: UpdateRequest | null;
  screenshots: PreviewScreenshot[];
  version: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeScreenshot = screenshots[activeIndex] ?? screenshots[0];
  const title = request
    ? request.status === "implementing"
      ? `Implementation preview: ${request.title}`
      : `Update preview: v${request.versionTarget} pending`
    : `Live preview: v${version}`;

  return (
    <section className="grid gap-3 border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)] xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <div className="mono text-[10px] font-black uppercase text-[#46515D]">
          App preview
        </div>
        <h2 className="mt-1 text-2xl font-black leading-tight">{title}</h2>
        <p className="mt-2 max-w-[760px] text-sm font-bold leading-6 text-[#46515D]">
          The phone frame is tied to the workflow state. Version 1.0 uses the
          baseline app screenshots; the submitted update switches to the new
          Explore and detail-screen evidence.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {screenshots.map((screenshot, index) => (
            <button
              className={`rounded-md border p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1 ${
                activeIndex === index
                  ? "border-[#2457FF] bg-[#EDF3FF]"
                  : "border-[#D8DEE4] bg-[#F8FAFC] hover:bg-white"
              }`}
              key={screenshot.src}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <span className="mono text-[9px] font-black uppercase text-[#687482]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-1 block truncate text-xs font-black">
                {screenshot.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-[520px] items-center justify-center rounded-md bg-[#101418] p-4">
        {activeScreenshot ? (
          <div className="relative flex aspect-[1206/2622] h-full max-h-[640px] min-h-0 w-auto max-w-full items-center justify-center rounded-[38px] border border-white/18 bg-[#05070A] p-2 shadow-[0_28px_86px_rgba(0,0,0,0.52)]">
            <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-white">
              <Image
                alt={activeScreenshot.alt}
                className="object-contain object-top"
                fill
                sizes="320px"
                src={activeScreenshot.src}
              />
            </div>
            <div className="pointer-events-none absolute inset-2 rounded-[30px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
