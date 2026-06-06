import Image from "next/image";
import {
  SlideGrid,
  SlideIntro,
  SlideShell,
  SlideVisual,
} from "@/components/SlideShell";

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

        <SlideVisual className="grid place-items-center p-0">
          <Image
            alt="Business model diagram showing a launch fee connected to monthly keep-alive and recurring add-on services."
            className="w-[min(760px,calc(100%+96px))] max-w-none -translate-x-12 object-contain drop-shadow-[0_24px_44px_rgba(36,87,255,0.10)]"
            height={654}
            src="/BusinessModel.png"
            width={1372}
          />
        </SlideVisual>
      </SlideGrid>
    </SlideShell>
  );
}
