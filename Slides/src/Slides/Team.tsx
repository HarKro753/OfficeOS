import { SlideCard } from "@/components/SlideCard";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

const proofPoints = [
  { text: "Months lost to handoff, not code.", tone: "blue" },
  { text: "Around 40 App Store review cycles.", tone: "green" },
  { text: "Paywalls, analytics, monitoring, releases.", tone: "orange" },
  { text: "AI lowers code cost. Ownership gets scarcer.", tone: "rose" },
] as const;

export function Team() {
  return (
    <SlideShell label="07 / Why Us">
      <SlideGrid>
        <SlideIntro
          eyebrow="Why us / why now"
          items={[
            {
              text: "We shipped through the mess.",
              tone: "blue",
            },
            {
              text: "We know the breakpoints.",
              tone: "green",
            },
            {
              text: "Ownership is the bottleneck.",
              tone: "orange",
            },
            {
              text: "We can keep apps alive.",
              tone: "rose",
            },
          ]}
          subtitle="We have lived the failure modes."
          title={
            <>
              <span className="whitespace-nowrap">We know where</span>
              <br />
              <span className="whitespace-nowrap">apps break.</span>
            </>
          }
          tone="orange"
        />

        <SlideVisual className="grid content-center gap-4">
          {proofPoints.map(({ text, tone }, index) => (
            <SlideCard key={text} label={`Proof ${index + 1}`} tone={tone}>
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
