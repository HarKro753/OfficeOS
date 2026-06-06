import type { ReactNode } from "react";

type SlideCardTone = "blue" | "green" | "orange" | "rose" | "ink";

type SlideCardProps = {
  children: ReactNode;
  label: string;
  metric?: string;
  tone: SlideCardTone;
};

const dotToneClasses = {
  blue: "bg-blue-600",
  green: "bg-emerald-500",
  ink: "bg-slate-950",
  orange: "bg-amber-400",
  rose: "bg-rose-500",
} as const;

export function SlideCard({ children, label, metric, tone }: SlideCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-[8px_10px_0_rgba(16,20,24,0.08)] backdrop-blur">
      <div className="mb-3 flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${dotToneClasses[tone]}`} />
        <span className="font-mono text-xs font-black uppercase text-slate-500">
          {label}
        </span>
      </div>
      {metric ? (
        <div className="mb-2 text-[38px] font-black leading-none text-slate-950">
          {metric}
        </div>
      ) : null}
      {children}
    </div>
  );
}
