import Image from "next/image";
import { SlideIntro, SlideShell, SlideVisual } from "@/components/SlideShell";

export function WhyNow() {
  return (
    <SlideShell label="03 / How It Works">
      <div className="grid h-[calc(100%-54px)] grid-cols-[360px_1fr] items-center gap-5 pt-5">
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

        <SlideVisual className="grid place-items-center p-0">
          <Image
            alt="Human-led OfficeOS workflow pipeline from accepted request to delivered mobile app update."
            className="w-[min(100%,850px)] max-w-full object-contain drop-shadow-[0_24px_44px_rgba(36,87,255,0.10)]"
            height={799}
            src="/HowItWorks.png"
            width={2131}
          />
        </SlideVisual>
      </div>
    </SlideShell>
  );
}
