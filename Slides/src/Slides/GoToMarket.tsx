import { SlideCard } from "@/components/SlideCard";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

const stages = [
  { number: "01", copy: "Pilot with ownership-ready teams.", tone: "blue" },
  { number: "02", copy: "Measure delivery and support load.", tone: "green" },
  { number: "03", copy: "Partner with strategy-led agencies.", tone: "orange" },
  { number: "04", copy: "Scale when accounts stay alive.", tone: "rose" },
] as const;

export function GoToMarket() {
  return (
    <SlideShell label="06 / Go To Market">
      <SlideGrid>
        <SlideIntro
          eyebrow="Wedge"
          items={[
            {
              text: "Pilot with ready teams.",
              tone: "blue",
            },
            {
              text: "Prove delivery capacity.",
              tone: "green",
            },
            {
              text: "Partner before scaling.",
              tone: "orange",
            },
            {
              text: "Scale proven account motion.",
              tone: "rose",
            },
          ]}
          title={
            <>
              <span className="whitespace-nowrap">Start where</span>
              <br />
              <span className="whitespace-nowrap">direction exists.</span>
            </>
          }
          tone="green"
        />

        <SlideVisual className="grid content-center gap-4">
          {stages.map(({ number, copy, tone }) => (
            <SlideCard key={copy} label={`Stage ${number}`} tone={tone}>
              <p className="m-0 text-2xl font-extrabold leading-tight text-slate-950">
                {copy}
              </p>
            </SlideCard>
          ))}
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
