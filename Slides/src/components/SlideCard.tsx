import type { ReactNode } from "react";

type SlideCardTone = "blue" | "green" | "orange" | "rose";

type SlideCardProps = {
  children: ReactNode;
  label: string;
  tone: SlideCardTone;
};

const dotToneClasses = {
  blue: "bg-blue-600",
  green: "bg-emerald-500",
  orange: "bg-amber-400",
  rose: "bg-rose-500",
} as const;

export function SlideCard({ children, label, tone }: SlideCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/85 p-5 shadow-[8px_10px_0_rgba(16,20,24,0.08)]">
      <div className="mb-3 flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${dotToneClasses[tone]}`} />
        <span className="font-mono text-xs font-black uppercase text-slate-500">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
