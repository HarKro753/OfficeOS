import { SlideCard } from "@/components/SlideCard";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

export function Solution() {
  return (
    <SlideShell label="02 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Solution + product"
          items={[
            {
              text: "OfficeOS captures requests, decisions, owners, and follow-ups from team tools.",
              tone: "green",
            },
            {
              text: "An AI ops layer turns messy work into a live operating board.",
              tone: "blue",
            },
            {
              text: "The demo shows intake, assignment, status synthesis, and escalation.",
              tone: "orange",
            },
          ]}
          subtitle="A command center for the work that usually disappears between tools."
          title={
            <>
              One workspace
              <br />
              for operational truth.
            </>
          }
          tone="green"
        />

        <SlideVisual>
          <div className="absolute inset-4 rounded-lg border border-slate-950 bg-[#101418] p-5 shadow-[14px_16px_0_rgba(16,20,24,0.16)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-mono text-xs font-black uppercase text-slate-400">
                OfficeOS live board
              </div>
              <div className="rounded-md bg-emerald-400 px-2.5 py-1 text-xs font-black text-slate-950">
                Demo ready
              </div>
            </div>
            <div className="grid h-[390px] grid-cols-[1fr_1.15fr] gap-4">
              <div className="grid gap-3">
                {[
                  ["New request", "Invoice mismatch from ACME"],
                  ["AI summary", "Needs finance owner by 16:00"],
                  ["Next action", "Ping Clara + draft reply"],
                ].map(([label, body]) => (
                  <div
                    className="rounded-md border border-white/12 bg-white/8 p-4"
                    key={label}
                  >
                    <div className="mb-2 font-mono text-[11px] font-black uppercase text-blue-200">
                      {label}
                    </div>
                    <div className="text-[20px] font-black leading-tight text-white">
                      {body}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-md bg-white p-4 text-slate-950">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xl font-black">Ops pulse</div>
                  <div className="font-mono text-xs font-black text-emerald-600">
                    92% clear
                  </div>
                </div>
                <div className="grid gap-3">
                  <SlideCard label="Captured" metric="37" tone="green">
                    <p className="text-base font-bold text-slate-600">
                      Requests found across Slack and docs.
                    </p>
                  </SlideCard>
                  <SlideCard label="Routed" metric="12" tone="blue">
                    <p className="text-base font-bold text-slate-600">
                      Owner-ready tasks created automatically.
                    </p>
                  </SlideCard>
                </div>
              </div>
            </div>
          </div>
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
