import { OfficeOSMark } from "@/components/OfficeOSMark";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

const roles = [
  "Build speed: ship integrations and demo flow by the deadline.",
  "Product clarity: narrow the workflow and customer pain.",
  "Pitch ownership: evidence, story, and live delivery.",
];

export function Team() {
  return (
    <SlideShell label="07 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Team"
          items={[
            {
              text: "We are building in the exact operating chaos we want to remove.",
              tone: "ink",
            },
            {
              text: "The edge is speed: user workflow, prototype, and pitch in one day.",
              tone: "blue",
            },
            {
              text: "Next step: convert the strongest pilot signal into a paid design partner.",
              tone: "green",
            },
          ]}
          subtitle="End with names, roles, contact info, and the clearest ask."
          title={
            <>
              The team that
              <br />
              turns ops into product.
            </>
          }
          tone="ink"
        />

        <SlideVisual>
          <div className="absolute inset-4 rounded-lg border border-slate-950 bg-slate-950 p-6 text-white shadow-[14px_16px_0_rgba(16,20,24,0.14)]">
            <div className="flex h-full flex-col justify-between">
              <div>
                <OfficeOSMark className="h-20 w-20" />
                <div className="mt-8 text-[56px] font-black leading-[0.9] tracking-normal">
                  OfficeOS
                </div>
                <p className="mt-4 max-w-[420px] text-2xl font-bold leading-tight text-slate-300">
                  AI operating memory for teams that cannot afford dropped
                  handoffs.
                </p>
              </div>

              <div className="grid gap-3">
                {roles.map((role) => (
                  <div
                    className="rounded-md border border-white/12 bg-white/8 p-4 text-lg font-bold leading-tight"
                    key={role}
                  >
                    {role}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm font-black">
                <div className="rounded-md bg-white p-3 text-slate-950">
                  team@officeos.ai
                </div>
                <div className="rounded-md bg-blue-600 p-3">officeos.ai</div>
                <div className="rounded-md bg-emerald-400 p-3 text-slate-950">
                  GitHub / Demo
                </div>
              </div>
            </div>
          </div>
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
