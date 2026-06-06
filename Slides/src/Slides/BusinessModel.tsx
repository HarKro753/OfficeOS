import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function BusinessModel() {
  return (
    <SlideShell label="05 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Business model + evidence"
          items={[
            {
              text: "Launch creates the first sale: scoped delivery, fixes, migration, or release work.",
              tone: "blue",
            },
            {
              text: "Operations create the account: monthly keep-alive for releases, QA, monitoring, and support load.",
              tone: "green",
            },
            {
              text: "Add-ons compound retention: paywalls, analytics, onboarding, notifications, and growth loops.",
              tone: "orange",
            },
            {
              text: "Evidence today: shipped demo flow, public repo, and pilot conversations with ownership-ready teams.",
              tone: "rose",
            },
          ]}
          subtitle="Delivery upfront. Lifecycle recurring."
          title={
            <>
              Launch once.
              <br />
              Operate monthly.
            </>
          }
          tone="green"
        />
      </SlideGrid>
    </SlideShell>
  );
}
