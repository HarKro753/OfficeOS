import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function Team() {
  return (
    <SlideShell label="07 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Team"
          items={[
            {
              text: "We shipped through the mess: handoffs, QA, TestFlight, App Store review, and release prep.",
              tone: "blue",
            },
            {
              text: "We know the breakpoints: paywalls, analytics, monitoring, support, and updates.",
              tone: "green",
            },
            {
              text: "Ownership is the bottleneck. We are building the operator that keeps apps alive.",
              tone: "orange",
            },
            {
              text: "Add names, contact info, demo URL, and GitHub repo before pitching.",
              tone: "rose",
            },
          ]}
          subtitle="We have lived the failure modes."
          title={
            <>
              We know where
              <br />
              apps break.
            </>
          }
          tone="orange"
        />
      </SlideGrid>
    </SlideShell>
  );
}
