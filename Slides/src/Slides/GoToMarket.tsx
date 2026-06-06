import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

const steps = [
  ["01", "Founder-led warm outreach", "Use local startup and operator network."],
  ["02", "Workflow teardown", "Offer a 20-minute ops audit using their current tools."],
  ["03", "Concierge pilot", "Manually onboard 5 teams and instrument every handoff."],
  ["04", "Proof loop", "Publish before/after workflow metrics and convert referrals."],
];

export function GoToMarket() {
  return (
    <SlideShell label="06 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Go-to-market"
          items={[
            {
              text: "The first 50 customers come from founder-led selling, not paid ads.",
              tone: "blue",
            },
            {
              text: "The wedge is a workflow teardown that reveals missing ownership.",
              tone: "orange",
            },
            {
              text: "Every pilot creates integration patterns and sharper proof.",
              tone: "green",
            },
          ]}
          subtitle="A narrow channel the team can actually run next week."
          title={
            <>
              Win the first
              <br />
              50 teams manually.
            </>
          }
          tone="blue"
        />

        <SlideVisual>
          <div className="absolute left-5 top-4 h-[458px] w-[558px] rounded-lg border border-slate-950 bg-white p-6 shadow-[14px_16px_0_rgba(16,20,24,0.12)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-black uppercase text-slate-400">
                  First channel
                </div>
                <div className="mt-1 text-3xl font-black leading-none text-slate-950">
                  Ops audit to paid pilot
                </div>
              </div>
              <div className="rounded-md bg-amber-100 px-3 py-2 text-sm font-black text-amber-800">
                50 target accounts
              </div>
            </div>
            <div className="grid gap-3">
              {steps.map(([number, title, body]) => (
                <div
                  className="grid grid-cols-[64px_1fr] gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={number}
                >
                  <div className="font-mono text-2xl font-black text-blue-600">
                    {number}
                  </div>
                  <div>
                    <div className="text-xl font-black leading-none text-slate-950">
                      {title}
                    </div>
                    <p className="mt-2 text-base font-semibold leading-snug text-slate-600">
                      {body}
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
