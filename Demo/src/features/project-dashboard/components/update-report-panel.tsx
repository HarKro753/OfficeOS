import type { UpdateReport } from "@/features/project-workflow";
import Image from "next/image";

export function UpdateReportPanel({ report }: { report: UpdateReport | null }) {
  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Update report
          </div>
          <h2 className="mt-1 text-lg font-black">
            {report ? report.title : "No active update report"}
          </h2>
        </div>
        <span className="mono rounded-md border border-[#D8DEE4] bg-[#F8FAFC] px-2.5 py-1.5 text-[9px] font-black uppercase text-[#46515D]">
          {report ? `v${report.versionTarget}` : "baseline"}
        </span>
      </div>

      {report ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {report.sections.map((section) => (
              <article
                className="rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3"
                key={section.title}
              >
                <h3 className="text-xs font-black">{section.title}</h3>
                <p className="mt-1 text-xs font-bold leading-5 text-[#46515D]">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {report.screenshots.map((screenshot) => (
              <div
                className="overflow-hidden rounded-md border border-[#D8DEE4] bg-[#101418]"
                key={screenshot.src}
              >
                <div className="relative aspect-[1206/2622]">
                  <Image
                    alt={screenshot.alt}
                    className="object-cover object-top"
                    fill
                    sizes="180px"
                    src={screenshot.src}
                  />
                </div>
                <div className="mono bg-white px-2 py-1.5 text-[8px] font-black uppercase text-[#46515D]">
                  {screenshot.label}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm font-bold leading-6 text-[#46515D]">
          A structured report appears after chat generates an update package.
        </p>
      )}
    </section>
  );
}
