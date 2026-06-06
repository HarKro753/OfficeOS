import type { ReactNode } from "react";

type WorkspaceHeaderProps = {
  action?: ReactNode;
  eyebrow: string;
  title: string;
};

export function WorkspaceHeader({
  action,
  eyebrow,
  title,
}: WorkspaceHeaderProps) {
  return (
    <header className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            {eyebrow}
          </div>
          <h1 className="mt-1 text-3xl font-black leading-none">{title}</h1>
        </div>
        {action}
      </div>
    </header>
  );
}
