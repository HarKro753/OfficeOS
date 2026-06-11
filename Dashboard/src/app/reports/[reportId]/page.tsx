"use client";

import { AuthGate, SignOutButton, useAuthSession } from "@/features/auth";
import {
  criterionHasVideo,
  getCustomerRequest,
  requestHasAnswer,
  type CustomerRequest,
} from "@/features/requests";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReportPage() {
  return (
    <AuthGate>
      <ReportPageContent />
    </AuthGate>
  );
}

function ReportPageContent() {
  const auth = useAuthSession();
  const params = useParams<{ reportId: string }>();
  const [request, setRequest] = useState<CustomerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.session?.token) return;

    const hydrationTimer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      getCustomerRequest(auth.session?.token ?? "", params.reportId)
        .then((nextRequest) => setRequest(nextRequest))
        .catch((caught) =>
          setError(
            caught instanceof Error ? caught.message : "Could not load report.",
          ),
        )
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, [auth.session?.token, params.reportId]);

  const answer = request?.deliverables.find(
    (deliverable) => deliverable.kind === "answer_markdown",
  );

  return (
    <main className="min-h-dvh bg-[#E9EDF2] text-[#101418]">
      <header className="border-b border-[#C8D0D8] bg-white">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              href="/dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            {request ? (
              <span className="mono inline-flex h-9 items-center rounded-md border border-[#D8DEE4] bg-[#F8FAFC] px-2 text-[10px] font-black uppercase text-[#46515D]">
                {request.status.replace("_", " ")}
              </span>
            ) : null}
          </div>
          <SignOutButton variant="header" />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-5 sm:px-6 lg:px-8">
        {loading ? (
          <section className="grid min-h-[320px] place-items-center border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)]">
            <LoaderCircle className="h-7 w-7 animate-spin text-[#2457FF]" />
          </section>
        ) : null}

        {error ? (
          <section className="border border-[#F3C2C2] bg-[#FFF7F7] p-5 text-sm font-bold text-[#8B1E1E]">
            {error}
          </section>
        ) : null}

        {request ? (
          <>
            <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                Backend request report
              </div>
              <h1 className="mt-2 text-4xl font-black leading-none tracking-normal">
                {request.title}
              </h1>
              <p className="mt-3 max-w-[780px] text-sm font-bold leading-6 text-[#46515D]">
                {request.raw_spec_text}
              </p>
            </section>

            <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
              <div className="flex items-center gap-2 text-sm font-black">
                <FileText className="h-4 w-4 text-[#183FBF]" />
                Generated Markdown
              </div>
              <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap text-xs font-bold leading-5 text-[#46515D]">
                {request.generated_markdown}
              </pre>
            </section>

            <section className="border border-[#C8D0D8] bg-white p-5 shadow-[0_18px_70px_rgba(16,20,24,0.04)] sm:p-6">
              <div className="flex items-center gap-2 text-sm font-black">
                <ClipboardCheck className="h-4 w-4 text-[#183FBF]" />
                Returned Report Package
              </div>
              <div className="mt-4 grid gap-2">
                <ReportRow
                  href={answer?.download_url ?? null}
                  label="Answer Markdown"
                  ready={requestHasAnswer(request)}
                />
                {request.criteria.map((criterion) => {
                  const video = request.deliverables.find(
                    (deliverable) =>
                      deliverable.kind === "evidence_video" &&
                      deliverable.acceptance_criterion_id === criterion.id,
                  );
                  return (
                    <ReportRow
                      href={video?.download_url ?? null}
                      key={criterion.id}
                      label={criterion.title}
                      ready={criterionHasVideo(request, criterion.id)}
                    />
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function ReportRow({
  href,
  label,
  ready,
}: {
  href: string | null;
  label: string;
  ready: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-[#E5EAF0] bg-[#F8FAFC] p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-black">
          {ready ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#20B26B]" />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-[#8A94A0]" />
          )}
          <span className="truncate">{label}</span>
        </div>
        <div className="mono mt-1 text-[8px] font-black uppercase text-[#687482]">
          {ready ? "attached" : "pending"}
        </div>
      </div>
      {href ? (
        <a
          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md border border-[#C8D0D8] bg-white px-2 text-[10px] font-black text-[#101418] transition hover:bg-[#EEF2F5]"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          Open
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : null}
    </div>
  );
}
