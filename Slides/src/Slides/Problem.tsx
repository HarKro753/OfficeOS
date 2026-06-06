import { SlideCard } from "@/components/SlideCard";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

export function Problem() {
  return (
    <SlideShell label="01 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Problem + customer"
          items={[
            {
              text: "Small teams run ops across chat, docs, spreadsheets, and SaaS tabs.",
              tone: "blue",
            },
            {
              text: "Every handoff becomes a manual status chase or copy-paste ritual.",
              tone: "rose",
            },
            {
              text: "The buyer is an ops-heavy founder or team lead at a 10-80 person company.",
              tone: "ink",
            },
          ]}
          subtitle="The pain is not missing software. It is missing operating memory."
          title={
            <>
              Work is tracked everywhere.
              <br />
              Owned nowhere.
            </>
          }
          tone="rose"
        />

        <SlideVisual>
          <div className="absolute left-4 top-4 h-[458px] w-[560px] rounded-lg border border-slate-950 bg-white p-5 shadow-[14px_16px_0_rgba(16,20,24,0.12)]">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="font-mono text-xs font-black uppercase text-slate-400">
                Current workflow
              </div>
              <div className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">
                Leaky
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SlideCard label="Input" metric="14" tone="blue">
                <p className="text-[17px] font-bold leading-snug text-slate-700">
                  Tools used before a customer request is actually resolved.
                </p>
              </SlideCard>
              <SlideCard label="Loss" metric="3h+" tone="rose">
                <p className="text-[17px] font-bold leading-snug text-slate-700">
                  Weekly manager time spent reconstructing what happened.
                </p>
              </SlideCard>
              <div className="col-span-2 rounded-lg bg-slate-950 p-5 text-white">
                <div className="mb-4 font-mono text-xs font-black uppercase text-slate-400">
                  Status quo competitor
                </div>
                <div className="grid grid-cols-4 gap-3 text-center text-sm font-black">
                  {["Slack", "Notion", "Sheets", "Jira"].map((tool) => (
                    <div
                      className="rounded-md border border-white/15 bg-white/8 px-3 py-5"
                      key={tool}
                    >
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
