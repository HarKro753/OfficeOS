"use client";

import type { PreviewScreenshot, UpdateRequest } from "@/features/project-workflow";
import Image from "next/image";

export function AppPreviewPanel({
  request,
  screenshots,
  version,
}: {
  request: UpdateRequest | null;
  screenshots: PreviewScreenshot[];
  version: string;
}) {
  const title = request
    ? request.status === "implementing"
      ? `Implementation preview: v${request.versionTarget}`
      : `Update preview: v${request.versionTarget} pending`
    : `Live preview: v${version}`;

  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="min-w-0">
        <div className="mono text-[10px] font-black uppercase text-[#46515D]">
          App preview
        </div>
        <h2 className="mt-1 text-2xl font-black leading-tight">{title}</h2>
        <p className="mt-2 max-w-[760px] text-sm font-bold leading-6 text-[#46515D]">
          Version 1.0 uses the baseline app screenshots. The submitted update
          switches this preview to the v1.1 Explore and detail-screen evidence.
        </p>

        {request?.status === "implementing" ? (
          <div className="mono mt-3 w-fit rounded-md border border-[#C8D6FF] bg-[#EDF3FF] px-2.5 py-1.5 text-[10px] font-black uppercase text-[#183FBF]">
            {request.title}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {screenshots.map((screenshot) => (
            <figure
              className="group relative aspect-[1206/2622] overflow-hidden rounded-md border border-[#D8DEE4] bg-[#101418] shadow-[0_12px_34px_rgba(16,20,24,0.08)] transition hover:border-[#8FA6FF] hover:shadow-[0_16px_44px_rgba(36,87,255,0.18)]"
              key={screenshot.src}
            >
              <Image
                alt={screenshot.alt}
                className="object-cover object-top transition duration-300 group-hover:scale-[1.04] group-hover:opacity-75"
                fill
                sizes="260px"
                src={screenshot.src}
              />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-[#101418]/88 px-2 py-2 text-left text-xs font-black text-white transition duration-200 group-hover:translate-y-0">
                {screenshot.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
