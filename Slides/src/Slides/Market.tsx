import { SlideCard } from "@/components/SlideCard";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

const competitors = [
  ["Status quo", "Slack + Sheets + manual standups"],
  ["Horizontal PM", "Asana, Monday, Jira"],
  ["Knowledge base", "Notion, Confluence"],
  ["AI assistant", "Generic chat over docs"],
];

export function Market() {
  return (
    <SlideShell
      footnote="Sizing is bottom-up and intentionally editable: replace with validated customer counts and pricing before submission."
      label="04 / 07"
    >
      <SlideGrid>
        <SlideIntro
          eyebrow="Market + competition"
          items={[
            {
              text: "Start with ops-heavy teams that already feel coordination pain weekly.",
              tone: "blue",
            },
            {
              text: "Beachhead: founder-led B2B services and SaaS companies with 10-80 employees.",
              tone: "green",
            },
            {
              text: "We win by becoming the live operating layer, not another task list.",
              tone: "orange",
            },
          ]}
          subtitle="The first market is narrow enough to sell manually and painful enough to pay."
          title={
            <>
              A focused wedge
              <br />
              into team operations.
            </>
          }
          tone="orange"
        />

        <SlideVisual>
          <div className="absolute inset-4 grid grid-rows-[auto_1fr] gap-4">
            <div className="grid grid-cols-3 gap-4">
              <SlideCard label="Customers" metric="2,000" tone="blue">
                <p className="text-base font-bold leading-snug text-slate-600">
                  Hamburg + Berlin ops-heavy startups in the first wedge.
                </p>
              </SlideCard>
              <SlideCard label="ACV" metric="€2.4k" tone="green">
                <p className="text-base font-bold leading-snug text-slate-600">
                  €199/month team plan for the first 20 seats.
                </p>
              </SlideCard>
              <SlideCard label="Beachhead" metric="€4.8M" tone="orange">
                <p className="text-base font-bold leading-snug text-slate-600">
                  Bottom-up reachable annual revenue.
                </p>
              </SlideCard>
            </div>

            <div className="rounded-lg border border-slate-950 bg-white p-5 shadow-[14px_16px_0_rgba(16,20,24,0.12)]">
              <div className="mb-4 font-mono text-xs font-black uppercase text-slate-400">
                Competitive map
              </div>
              <div className="grid grid-cols-2 gap-3">
                {competitors.map(([label, text]) => (
                  <div
                    className="rounded-md border border-slate-200 bg-slate-50 p-4"
                    key={label}
                  >
                    <div className="text-lg font-black text-slate-950">
                      {label}
                    </div>
                    <p className="mt-2 text-base font-semibold leading-snug text-slate-600">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md bg-slate-950 p-4 text-[19px] font-black leading-tight text-white">
                Differentiator: OfficeOS follows work across tools and produces
                owned next actions automatically.
              </div>
            </div>
          </div>
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
