import type { ReactNode } from "react";
import { OfficeOSMark } from "./OfficeOSMark";

type SlideShellProps = {
  label: string;
  children: ReactNode;
  footnote?: string;
  kicker?: string;
};

type SlideGridProps = {
  children: ReactNode;
  className?: string;
};

type SlideTone = "blue" | "green" | "orange" | "rose" | "ink";

type MessageSpineItem = {
  text: string;
  tone: SlideTone;
};

type MessageSpineProps = {
  items: readonly MessageSpineItem[];
};

type SlideIntroProps = {
  eyebrow: string;
  items: readonly MessageSpineItem[];
  subtitle?: string;
  title: ReactNode;
  tone?: SlideTone;
};

const spineToneClasses = {
  blue: "bg-blue-600 ring-blue-100",
  green: "bg-emerald-500 ring-emerald-100",
  ink: "bg-slate-950 ring-slate-200",
  orange: "bg-amber-400 ring-amber-100",
  rose: "bg-rose-500 ring-rose-100",
} as const;

const eyebrowToneClasses = {
  blue: {
    container: "border-blue-600/25 bg-blue-100 text-blue-800",
    dot: "bg-blue-600",
  },
  green: {
    container: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  ink: {
    container: "border-slate-950/15 bg-slate-100 text-slate-800",
    dot: "bg-slate-950",
  },
  orange: {
    container: "border-amber-400/25 bg-amber-50 text-amber-800",
    dot: "bg-amber-400",
  },
  rose: {
    container: "border-rose-500/20 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
} as const;

const slideCount = 7;

export function SlideShell({
  label,
  children,
  footnote,
  kicker = "AI BEAVERS Founder Hackathon",
}: SlideShellProps) {
  const currentSlide = Number(label.match(/^\d+/)?.[0] ?? 0);
  const progress =
    currentSlide > 0 ? Math.min(currentSlide / slideCount, 1) * 100 : 100;

  return (
    <section
      className="relative h-[768px] w-[1366px] shrink-0 overflow-hidden border border-slate-950/10 bg-[linear-gradient(90deg,rgba(36,87,255,0.07),rgba(255,255,255,0)_42%),linear-gradient(135deg,#ffffff_0%,#ffffff_52%,#f3fbf6_74%,#fff7e8_100%)] px-[58px] pb-[42px] pt-[46px] shadow-[0_28px_90px_rgba(16,20,24,0.16)]"
      aria-label={`OfficeOS ${label}`}
    >
      <div
        aria-label="Slide progress"
        aria-valuemax={slideCount}
        aria-valuemin={1}
        aria-valuenow={currentSlide || slideCount}
        className="absolute inset-x-0 top-0 h-2"
        role="progressbar"
      >
        <div
          className="h-full rounded-r-full bg-[linear-gradient(90deg,#2457ff,#20b26b,#f5a524)] shadow-[0_8px_24px_rgba(36,87,255,0.2)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="flex h-[54px] items-center justify-between gap-6">
        <div
          className="flex items-center gap-3.5 text-2xl font-extrabold leading-none text-[#101418]"
          aria-label="OfficeOS"
        >
          <OfficeOSMark />
          <span>OfficeOS</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-[12px] font-bold uppercase tracking-normal text-slate-400">
            {kicker}
          </div>
          <div className="font-mono text-[13px] font-semibold leading-none text-slate-500">
            {label}
          </div>
        </div>
      </header>

      {children}

      {footnote ? (
        <footer className="absolute bottom-6 left-[58px] max-w-[760px] text-[11px] font-medium leading-[1.3] text-slate-400">
          {footnote}
        </footer>
      ) : null}
    </section>
  );
}

export function SlideGrid({ children, className = "" }: SlideGridProps) {
  return (
    <div
      className={[
        "grid h-[calc(100%-54px)] grid-cols-1 content-center pt-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function SlideIntro({
  eyebrow,
  items,
  subtitle,
  title,
  tone = "blue",
}: SlideIntroProps) {
  const eyebrowClasses = eyebrowToneClasses[tone];

  return (
    <article className="min-w-0">
      <div
        className={`mb-4.5 inline-flex items-center gap-2 rounded-[7px] border px-2.5 py-1.75 text-[13px] font-bold leading-none ${eyebrowClasses.container}`}
      >
        <span
          className={`h-[7px] w-[7px] rounded-full ${eyebrowClasses.dot}`}
        />
        {eyebrow}
      </div>
      <h1 className="m-0 max-w-[760px] text-[76px] font-black leading-[0.88] tracking-normal text-[#101418]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-[26px] max-w-[690px] text-[27px] font-medium leading-[1.22] text-slate-600">
          {subtitle}
        </p>
      ) : null}
      <MessageSpine items={items} />
    </article>
  );
}

export function MessageSpine({ items }: MessageSpineProps) {
  return (
    <div className="mt-10 grid max-w-[840px] gap-[14px]" aria-label="Message spine">
      {items.map((line) => (
        <div
          className="grid grid-cols-[18px_1fr] items-start gap-4 text-[24px] font-bold leading-tight text-slate-900"
          key={line.text}
        >
          <span
            className={`mt-[10px] h-[11px] w-[11px] rounded-full ring-4 ${spineToneClasses[line.tone]}`}
          />
          {line.text}
        </div>
      ))}
    </div>
  );
}
