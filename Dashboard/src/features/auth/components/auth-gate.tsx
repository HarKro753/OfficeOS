"use client";

import { LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAuthSession } from "../hooks/use-auth-session";

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuthSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (auth.status === "authenticated") return children;

  const submitCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail || password.length < 8 || submitting) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await auth.authenticate(mode, {
        email: cleanEmail,
        password,
      });
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Could not sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-[#E9EDF2] p-3 text-[#101418]">
      <section className="w-full max-w-[460px] border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.08)]">
        <header className="flex items-center gap-3">
          <Image
            alt="OfficeOS"
            className="h-10 w-10 shrink-0"
            height={40}
            src="/officeos-logo.svg"
            width={40}
          />
          <div>
            <div className="text-xl font-black leading-none">OfficeOS</div>
            <div className="mono mt-1 text-[10px] font-black uppercase text-[#46515D]">
              Account access
            </div>
          </div>
        </header>

        <div className="mt-5 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2457FF]" />
            <p className="text-sm font-bold leading-6 text-[#46515D]">
              Sign in with your email and password before opening the dashboard.
            </p>
          </div>
        </div>

        {auth.status === "loading" ? (
          <div className="mt-4 flex min-h-20 items-center justify-center">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#2457FF]" />
          </div>
        ) : (
          <form className="mt-4 grid gap-3" onSubmit={submitCredentials}>
            <div className="grid grid-cols-2 gap-2 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-1">
              {(["login", "register"] as const).map((nextMode) => (
                <button
                  className={`min-h-9 rounded px-2 text-xs font-black capitalize transition ${
                    mode === nextMode
                      ? "bg-white text-[#101418] shadow-sm"
                      : "text-[#687482] hover:bg-white"
                  }`}
                  key={nextMode}
                  onClick={() => {
                    setMode(nextMode);
                    setFormError(null);
                  }}
                  type="button"
                >
                  {nextMode}
                </button>
              ))}
            </div>
            <label className="grid gap-1.5">
              <span className="text-xs font-black text-[#26313B]">Email</span>
              <input
                className="min-h-11 rounded-md border border-[#C8D0D8] bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#101418]"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black text-[#26313B]">
                Password
              </span>
              <input
                className="min-h-11 rounded-md border border-[#C8D0D8] bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#101418]"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                type="password"
                value={password}
              />
            </label>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-sm font-black text-white transition hover:bg-[#26313B] disabled:cursor-not-allowed disabled:bg-[#A9B5C2]"
              disabled={!email.trim() || password.length < 8 || submitting}
              type="submit"
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <LockKeyhole className="h-4 w-4" />
              )}
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        )}

        {formError || auth.error ? (
          <div className="mt-4 rounded-md border border-[#F3C2C2] bg-[#FFF7F7] p-3 text-xs font-bold leading-5 text-[#8B1E1E]">
            {formError ?? auth.error}
          </div>
        ) : null}
      </section>
    </main>
  );
}
