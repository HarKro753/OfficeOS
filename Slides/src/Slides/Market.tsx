import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function Market() {
  return (
    <SlideShell
      footnote="Replace the customer count and pricing with validated numbers before submission."
      label="04 / 07"
    >
      <SlideGrid>
        <SlideIntro
          eyebrow="Market + competition"
          items={[
            {
              text: "Beachhead: founders, product owners, and agencies with apps already in users' hands.",
              tone: "blue",
            },
            {
              text: "Status quo: freelancers, internal PMs, agencies, spreadsheets, TestFlight notes, and emergency fixes.",
              tone: "green",
            },
            {
              text: "OfficeOS wins by operating the app after launch, not selling another project-management surface.",
              tone: "orange",
            },
          ]}
          subtitle="The first market is teams with direction and users, but no dedicated operator to keep the app moving."
          title={
            <>
              Start where
              <br />
              direction exists.
            </>
          }
          tone="green"
        />
      </SlideGrid>
    </SlideShell>
  );
}
