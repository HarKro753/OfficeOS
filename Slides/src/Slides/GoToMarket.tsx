import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function GoToMarket() {
  return (
    <SlideShell label="06 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Go-to-market"
          items={[
            {
              text: "Pilot with ownership-ready teams that already have an app, users, and a backlog.",
              tone: "blue",
            },
            {
              text: "Measure delivery capacity: release cycle time, support load, QA misses, and owner hours saved.",
              tone: "green",
            },
            {
              text: "Partner with strategy-led agencies that want to keep accounts alive after launch.",
              tone: "orange",
            },
            {
              text: "Scale only after the account motion proves monthly retention.",
              tone: "rose",
            },
          ]}
          subtitle="Start with teams that already know where the product should go."
          title={
            <>
              Partner before
              <br />
              scaling.
            </>
          }
          tone="green"
        />
      </SlideGrid>
    </SlideShell>
  );
}
