import { SlideGrid, SlideIntro, SlideShell } from "@/components/SlideShell";

export function WhyNow() {
  return (
    <SlideShell label="03 / 07">
      <SlideGrid>
        <SlideIntro
          eyebrow="Why now"
          items={[
            {
              text: "AI lowers the cost of writing code, but ownership after launch gets scarcer.",
              tone: "rose",
            },
            {
              text: "Agents can now do the repeatable work: tickets, tests, release notes, checks, and upload prep.",
              tone: "green",
            },
            {
              text: "Human gates stay in place for direction, approval, and risk decisions.",
              tone: "blue",
            },
          ]}
          subtitle="The bottleneck is moving from code production to accountable product operation."
          title={
            <>
              Request in.
              <br />
              Update out.
            </>
          }
          tone="green"
        />
      </SlideGrid>
    </SlideShell>
  );
}
