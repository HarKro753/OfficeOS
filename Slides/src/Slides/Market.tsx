import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function Market() {
  return (
    <SlideShell
      label="04 / Market"
    >
      <SlideGrid>
        <SlideIntro
          eyebrow="Market + competition"
          items={[
            {
              text: "Founders and agencies already know the direction.",
              tone: "blue",
            },
            {
              text: "The status quo is handoff-heavy delivery after launch.",
              tone: "green",
            },
            {
              text: "OfficeOS is the operator that keeps accounts alive.",
              tone: "orange",
            },
          ]}
          subtitle="Start where there is already an app, a backlog, and no clear owner for the next release."
          title={
            <>
              <span className="whitespace-nowrap">Start where</span>
              <br />
              <span className="whitespace-nowrap">direction exists.</span>
            </>
          }
          tone="green"
        />
      </SlideGrid>
    </SlideShell>
  );
}
