import Image from "next/image";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

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

        <SlideVisual className="grid place-items-center p-0">
          <Image
            alt="Product ownership gap from pre-launch build through real user signals to disconnected OfficeOS-style work layers."
            className="w-[min(760px,calc(100%+96px))] max-w-none -translate-x-12 object-contain drop-shadow-[0_24px_44px_rgba(16,20,24,0.10)]"
            height={758}
            src="/Problem.png"
            width={1359}
          />
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
