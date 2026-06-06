import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

const changes = [
  {
    label: "Model capability",
    text: "LLMs can now classify, summarize, and draft across messy internal context.",
  },
  {
    label: "Tool sprawl",
    text: "Teams added more SaaS, not more coordination capacity.",
  },
  {
    label: "API surface",
    text: "Work tools expose enough events to build a real ops memory layer.",
  },
];

export function WhyNow() {
  return (
    <SlideShell label="03 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Why now"
          items={[
            {
              text: "The timing is a capability shift, not a chatbot trend.",
              tone: "blue",
            },
            {
              text: "OfficeOS wins when it is embedded in daily workflows and source-of-truth systems.",
              tone: "green",
            },
            {
              text: "The defensible layer is workflow memory plus team-specific operating data.",
              tone: "ink",
            },
          ]}
          subtitle="AI can finally maintain the context humans lose between meetings, messages, and tools."
          title={
            <>
              The back office
              <br />
              can become live software.
            </>
          }
          tone="blue"
        />

        <SlideVisual>
          <div className="absolute left-7 top-7 h-[440px] w-[540px] rounded-lg border border-slate-950 bg-white p-6 shadow-[14px_16px_0_rgba(16,20,24,0.12)]">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="font-mono text-xs font-black uppercase text-slate-400">
                  Inflection stack
                </div>
                <div className="mt-1 text-3xl font-black leading-none text-slate-950">
                  2026 is different
                </div>
              </div>
              <div className="h-14 w-14 rounded-md bg-blue-600 shadow-[6px_6px_0_#101418]" />
            </div>
            <div className="grid gap-4">
              {changes.map((change, index) => (
                <div
                  className="grid grid-cols-[54px_1fr] gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={change.label}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-md bg-slate-950 font-mono text-lg font-black text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-950">
                      {change.label}
                    </div>
                    <p className="mt-1 text-base font-semibold leading-snug text-slate-600">
                      {change.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
