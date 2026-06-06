import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function BusinessModel() {
  return (
    <SlideShell label="05 / Business Model">
      <SlideGrid>
        <SlideIntro
          eyebrow="Revenue model"
          items={[
            {
              text: "Launch creates the first sale.",
              tone: "blue",
            },
            {
              text: "Operations create the account.",
              tone: "green",
            },
            {
              text: "Add-ons compound retention.",
              tone: "orange",
            },
          ]}
          subtitle="Delivery upfront. Lifecycle recurring."
          title={
            <>
              <span className="whitespace-nowrap">Launch once.</span>
              <br />
              <span className="whitespace-nowrap">Operate monthly.</span>
            </>
          }
          tone="green"
        />
      </SlideGrid>
    </SlideShell>
  );
}
