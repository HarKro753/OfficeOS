"use client";

import { Toaster as Sonner } from "sonner";
import type { ComponentProps } from "react";

type ToasterProps = ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      closeButton
      position="top-right"
      toastOptions={{
        duration: 6000,
        classNames: {
          closeButton:
            "border-[#D8DEE4] bg-white text-[#46515D] hover:bg-[#F8FAFC]",
          description: "text-[#46515D]",
          title: "font-black text-[#101418]",
          toast:
            "rounded-md border-[#D8DEE4] bg-white text-[#101418] shadow-[0_18px_70px_rgba(16,20,24,0.20)]",
        },
      }}
      {...props}
    />
  );
}
