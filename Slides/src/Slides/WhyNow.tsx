import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function WhyNow() {
  return (
    <SlideShell label="03 / How It Works">
      <SlideGrid>
        <SlideIntro
          eyebrow="AI-native workflow"
          items={[
            {
              text: "Request becomes workflow.",
              tone: "orange",
            },
            {
              text: "Human gates stay in place.",
              tone: "green",
            },
            {
              text: "Agents do the repeatable work.",
              tone: "blue",
            },
          ]}
          subtitle="Humans steer. Agents execute."
          title={
            <>
              <span className="whitespace-nowrap">Request in.</span>
              <br />
              <span className="whitespace-nowrap">Update out.</span>
            </>
          }
          tone="green"
        />
      </SlideGrid>
    </SlideShell>
  );
}
