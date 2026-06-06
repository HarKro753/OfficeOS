import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function Solution() {
  return (
    <SlideShell label="02 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Solution + product"
          items={[
            {
              text: "You set the direction: what should change, why it matters, and what cannot break.",
              tone: "orange",
            },
            {
              text: "OfficeOS owns execution: delivery, QA, release prep, and upload.",
              tone: "blue",
            },
            {
              text: "Every release has an operator, not a loose chain of handoffs.",
              tone: "green",
            },
          ]}
          subtitle="You direct. OfficeOS delivers."
          title={
            <>
              OfficeOS owns
              <br />
              delivery.
            </>
          }
          tone="blue"
        />
      </SlideGrid>
    </SlideShell>
  );
}
