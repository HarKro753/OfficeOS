"use client";

import type { ReactNode } from "react";

type DashboardDrawerProps = {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function DashboardDrawer({
  children,
  onClose,
  open,
  title,
}: DashboardDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#101418]/32 text-[#101418]">
      <button
        aria-label="Close drawer"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        className="relative flex h-full w-full max-w-[560px] flex-col border-l border-[#C8D0D8] bg-white shadow-[-24px_0_80px_rgba(16,20,24,0.22)]"
      >
        {children}
      </section>
    </div>
  );
}
