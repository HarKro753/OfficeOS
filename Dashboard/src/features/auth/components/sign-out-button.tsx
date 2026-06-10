"use client";

import { LogOut } from "lucide-react";
import { clearAuthSession } from "../stores/auth-session-storage";

const adminTokenStorageKey = "officeos-admin-api-token";

type SignOutButtonProps = {
  variant?: "header" | "sidebar";
};

export function SignOutButton({ variant = "sidebar" }: SignOutButtonProps) {
  const signOut = () => {
    clearAuthSession();
    window.localStorage.removeItem(adminTokenStorageKey);
    window.location.assign("/");
  };

  const className =
    variant === "header"
      ? "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
      : "inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-2 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1";

  return (
    <button className={className} onClick={signOut} type="button">
      <LogOut className="h-4 w-4" />
      Log out
    </button>
  );
}
