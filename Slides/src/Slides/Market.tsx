import { SlideCard } from "@/components/SlideCard";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

const marketProof = [
  { label: "Volume", text: "7.8M App Store submissions in 2024.", tone: "blue" },
  { label: "Friction", text: "1.9M were rejected before release.", tone: "rose" },
  { label: "Spend", text: "Average app projects run near $90k.", tone: "green" },
  { label: "Wedge", text: "Start with teams that already have direction.", tone: "orange" },
] as const;

export function Market() {
  return (
    <SlideShell label="04 / Market">
      <SlideGrid>
        <SlideIntro
          eyebrow="Market + competition"
          items={[
            {
              text: "Apps are already being built.",
              tone: "blue",
            },
            {
              text: "Code tools stop at output.",
              tone: "orange",
            },
            {
              text: "Agencies stop at handoff.",
              tone: "rose",
            },
            {
              text: "OfficeOS keeps accounts alive.",
              tone: "green",
            },
          ]}
          subtitle="The gap is after the build."
          title={
            <>
              <span className="whitespace-nowrap">Demand exists.</span>
              <br />
              <span className="whitespace-nowrap">Ownership does not.</span>
            </>
          }
          tone="green"
        />

        <SlideVisual className="grid content-center gap-4">
          {marketProof.map(({ label, text, tone }) => (
            <SlideCard key={label} label={label} tone={tone}>
              <p className="m-0 text-2xl font-extrabold leading-tight text-slate-950">
                {text}
              </p>
            </SlideCard>
          ))}
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
