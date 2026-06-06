import { SlideCard } from "@/components/SlideCard";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

export function BusinessModel() {
  return (
    <SlideShell label="05 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Business model + evidence"
          items={[
            {
              text: "Paid by the team lead or founder who owns delivery quality.",
              tone: "green",
            },
            {
              text: "Monthly SaaS pricing maps to seats plus connected workflows.",
              tone: "blue",
            },
            {
              text: "Evidence to gather today: workflow interviews, waitlist, demo usage, and repo history.",
              tone: "orange",
            },
          ]}
          subtitle="The pitch should show who pays, how often, and what proof exists by 19:00."
          title={
            <>
              Sell the saved
              <br />
              operating time.
            </>
          }
          tone="green"
        />

        <SlideVisual>
          <div className="absolute inset-4 rounded-lg border border-slate-950 bg-white p-6 shadow-[14px_16px_0_rgba(16,20,24,0.12)]">
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <SlideCard label="Starter" metric="€199/mo" tone="green">
                <p className="text-base font-bold leading-snug text-slate-600">
                  One team, two integrations, weekly ops summaries.
                </p>
              </SlideCard>
              <SlideCard label="Pro" metric="€499/mo" tone="blue">
                <p className="text-base font-bold leading-snug text-slate-600">
                  Multiple workflows, custom routing, escalation rules.
                </p>
              </SlideCard>
            </div>

            <div className="mt-5 rounded-lg bg-slate-950 p-5 text-white">
              <div className="mb-4 font-mono text-xs font-black uppercase text-slate-400">
                Evidence checklist
              </div>
              <div className="grid gap-3">
                {[
                  "3 customer conversations with named workflow pain",
                  "1 live prototype that completes intake to owner assignment",
                  "1 waitlist or pilot signal from a target team",
                  "Public GitHub repo with visible build history",
                ].map((item) => (
                  <div
                    className="flex items-center gap-3 rounded-md border border-white/12 bg-white/8 p-3 text-[17px] font-bold leading-tight"
                    key={item}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-emerald-400 font-mono text-sm font-black text-slate-950">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
