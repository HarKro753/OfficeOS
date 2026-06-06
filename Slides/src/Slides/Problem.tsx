import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function Problem() {
  return (
    <SlideShell label="01 / Problem">
      <SlideGrid>
        <SlideIntro
          eyebrow="Ownership gap"
          items={[
            {
              text: "The app meets real users.",
              tone: "orange",
            },
            {
              text: "Their behavior changes the direction.",
              tone: "orange",
            },
            {
              text: "Someone has to own the next move.",
              tone: "blue",
            },
          ]}
          subtitle="The first build is when the product finally meets real users."
          title={
            <>
              <span className="whitespace-nowrap">The app ships.</span>
              <br />
              <span className="whitespace-nowrap">Ownership begins.</span>
            </>
          }
          tone="orange"
        />
      </SlideGrid>
    </SlideShell>
  );
}
