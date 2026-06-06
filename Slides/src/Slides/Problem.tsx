import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function Problem() {
  return (
    <SlideShell label="01 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Problem + customer"
          items={[
            {
              text: "The first build is when an app finally meets real users.",
              tone: "orange",
            },
            {
              text: "Their behavior changes the roadmap, support load, and release priorities.",
              tone: "orange",
            },
            {
              text: "Someone has to own the next move after launch, not just ship the first version.",
              tone: "blue",
            },
          ]}
          subtitle="For founders and agencies launching mobile apps, the real work starts after users touch the product."
          title={
            <>
              The app ships.
              <br />
              Ownership begins.
            </>
          }
          tone="orange"
        />
      </SlideGrid>
    </SlideShell>
  );
}
