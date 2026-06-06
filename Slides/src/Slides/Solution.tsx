import Image from "next/image";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

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

        <SlideVisual className="grid place-items-center p-0">
          <Image
            alt="OfficeOS delivery workflow moving specs through delivery, QA, TestFlight, release prep, and upload."
            className="w-[min(900px,calc(100%+180px))] max-w-none -translate-x-16 object-contain drop-shadow-[0_24px_44px_rgba(16,20,24,0.10)]"
            height={773}
            src="/Solution.png"
            width={2204}
          />
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
