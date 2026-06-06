import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function Solution() {
  return (
    <SlideShell label="02 / Solution">
      <SlideGrid>
        <SlideIntro
          eyebrow="Accountable delivery"
          items={[
            {
              text: "You set the direction.",
              tone: "orange",
            },
            {
              text: "OfficeOS owns execution.",
              tone: "blue",
            },
            {
              text: "Every release has an operator.",
              tone: "green",
            },
          ]}
          subtitle="You direct. OfficeOS delivers."
          title={
            <>
              <span className="whitespace-nowrap">OfficeOS owns</span>
              <br />
              <span className="whitespace-nowrap">delivery.</span>
            </>
          }
          tone="blue"
        />
      </SlideGrid>
    </SlideShell>
  );
}
