"use client";

import { Toaster } from "@/components/ui/sonner";
import { SignOutButton, useAuthSession } from "@/features/auth";
import {
  attachMockResponse,
  criterionHasVideo,
  listAdminRequests,
  requestHasAnswer,
  resolveAdminRequest,
  startAdminRequest,
  uploadAnswerMarkdown,
  uploadCriterionVideo,
  type AdminCriterion,
  type AdminRequest,
  type AdminRequestStatus,
} from "@/features/admin";
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LoaderCircle,
  PlaySquare,
  RefreshCcw,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

function AdminSidebar() {
  return (
    <aside className="flex min-h-0 flex-col rounded-md border border-[#C8D0D8] bg-[#F8FAFC] shadow-[0_18px_70px_rgba(16,20,24,0.08)] lg:sticky lg:top-3 lg:h-[calc(100dvh-1.5rem)]">
      <header className="border-b border-[#D8DEE4] p-3">
        <div className="flex items-center gap-2">
          <Image
            alt="OfficeOS"
            className="h-9 w-9 shrink-0"
            height={36}
            src="/officeos-logo.svg"
            width={36}
          />
          <div className="min-w-0">
            <div className="text-lg font-black leading-none">OfficeOS</div>
            <div className="mono mt-1 text-[9px] font-black uppercase text-[#46515D]">
              Admin
            </div>
          </div>
        </div>
      </header>
      <nav className="min-h-0 flex-1 overflow-auto p-3" aria-label="Admin">
        <div className="mono px-1 pb-2 text-[10px] font-black uppercase text-[#46515D]">
          Operations
        </div>
        {[
          ["Requests", ClipboardCheck],
        ].map(([label, Icon]) => (
          <button
            className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-[#46515D] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
            key={label as string}
            type="button"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-xs font-black">
              {label as string}
            </span>
          </button>
        ))}
      </nav>
      <footer className="border-t border-[#D8DEE4] p-3">
        <SignOutButton />
      </footer>
    </aside>
  );
}

function StatusBadge({ status }: { status: AdminRequestStatus }) {
  const label =
    status === "submitted"
      ? "submitted"
      : status === "in_progress"
        ? "in progress"
        : "resolved";

  return (
    <span className="mono inline-flex h-6 items-center gap-1.5 rounded border border-[#D8DEE4] bg-white px-1.5 text-[8px] font-black uppercase text-[#46515D]">
      {status === "resolved" ? (
        <CheckCircle2 className="h-3 w-3 text-[#20B26B]" />
      ) : (
        <ShieldCheck className="h-3 w-3 text-[#2457FF]" />
      )}
      {label}
    </span>
  );
}

function criterionUploadId(criterionId: string) {
  return `criterion-video-${criterionId}`;
}

function MarkdownDocumentOverlay({
  content,
  eyebrow,
  onClose,
  title,
}: {
  content: string;
  eyebrow: string;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#101418]/40 p-2 text-[#101418] sm:p-4">
      <button
        aria-label="Close document"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        aria-modal="true"
        className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-[980px] flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-white shadow-[0_28px_120px_rgba(16,20,24,0.34)] sm:max-h-[calc(100dvh-2rem)]"
        role="dialog"
      >
        <header className="sticky top-0 z-10 border-b border-[#D8DEE4] bg-white px-3 py-2 sm:px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                {eyebrow}
              </div>
              <h2 className="mt-0.5 truncate text-lg font-black leading-tight sm:text-xl">
                {title}
              </h2>
            </div>
            <button
              aria-label="Close document"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#C8D0D8] bg-white text-[#46515D] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 overflow-auto bg-[#F8FAFC] p-4 sm:p-5">
          <article className="border border-[#C8D0D8] bg-white p-5">
            <div className="max-w-none space-y-4 text-sm font-bold leading-7 text-[#26313B]">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function MarkdownPreviewButton({
  content,
  label,
  onOpen,
}: {
  content: string;
  label: string;
  onOpen: () => void;
}) {
  return (
    <button
      className="group min-h-[180px] rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3 text-left transition hover:border-[#101418] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#101418]"
      onClick={onOpen}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black">
          <FileText className="h-4 w-4 text-[#183FBF]" />
          {label}
        </div>
        <span className="mono text-[9px] font-black uppercase text-[#687482] group-hover:text-[#101418]">
          Open
        </span>
      </div>
      <div className="mt-3 line-clamp-6 whitespace-pre-wrap text-xs font-bold leading-5 text-[#46515D]">
        {content}
      </div>
    </button>
  );
}

function AdminAccessGate({ children }: { children: ReactNode }) {
  const auth = useAuthSession();
  const [mode, setMode] = useState<"login" | "bootstrap">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapToken, setBootstrapToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (auth.status === "authenticated" && auth.session?.user.role === "admin") {
    return children;
  }

  const submitAdminAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = email.trim();
    const cleanBootstrapToken = bootstrapToken.trim();
    if (
      !cleanEmail ||
      password.length < 8 ||
      submitting ||
      (mode === "bootstrap" && !cleanBootstrapToken)
    ) {
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const session =
        mode === "bootstrap"
          ? await auth.bootstrapAdmin(
              { email: cleanEmail, password },
              cleanBootstrapToken,
            )
          : await auth.authenticate("login", {
              email: cleanEmail,
              password,
            });

      if (session.user.role !== "admin") {
        auth.logout();
        setFormError("This account is not an admin.");
      }
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Could not access admin.",
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
              Admin access
            </div>
          </div>
        </header>

        <div className="mt-5 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2457FF]" />
            <p className="text-sm font-bold leading-6 text-[#46515D]">
              Log in with an admin account, or use the bootstrap token from
              `ADMIN_BOOTSTRAP_TOKEN` in `.env` to create or promote an admin.
            </p>
          </div>
        </div>

        {auth.status === "loading" ? (
          <div className="mt-4 flex min-h-20 items-center justify-center">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#2457FF]" />
          </div>
        ) : (
          <form className="mt-4 grid gap-3" onSubmit={submitAdminAccess}>
            <div className="grid grid-cols-2 gap-2 rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-1">
              {(["login", "bootstrap"] as const).map((nextMode) => (
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
                  {nextMode === "login" ? "Admin login" : "Bootstrap"}
                </button>
              ))}
            </div>
            <label className="grid gap-1.5">
              <span className="text-xs font-black text-[#26313B]">Email</span>
              <input
                className="min-h-11 rounded-md border border-[#C8D0D8] bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#101418]"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
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
            {mode === "bootstrap" ? (
              <label className="grid gap-1.5">
                <span className="text-xs font-black text-[#26313B]">
                  Bootstrap token
                </span>
                <input
                  className="min-h-11 rounded-md border border-[#C8D0D8] bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#101418]"
                  onChange={(event) => setBootstrapToken(event.target.value)}
                  placeholder="ADMIN_BOOTSTRAP_TOKEN from .env"
                  type="password"
                  value={bootstrapToken}
                />
              </label>
            ) : null}
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-sm font-black text-white transition hover:bg-[#26313B] disabled:cursor-not-allowed disabled:bg-[#A9B5C2]"
              disabled={
                !email.trim() ||
                password.length < 8 ||
                submitting ||
                (mode === "bootstrap" && !bootstrapToken.trim())
              }
              type="submit"
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {mode === "login" ? "Open admin" : "Bootstrap admin"}
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

export default function AdminPage() {
  return (
    <AdminAccessGate>
      <AdminPageContent />
    </AdminAccessGate>
  );
}

function AdminPageContent() {
  const auth = useAuthSession();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDocument, setOpenDocument] = useState<{
    content: string;
    eyebrow: string;
    title: string;
  } | null>(null);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedId) ?? requests[0],
    [requests, selectedId],
  );

  const activeAdminToken = auth.session?.token || "";

  const refreshRequests = async (token = activeAdminToken) => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const nextRequests = await listAdminRequests(token);
      setRequests(nextRequests);
      setSelectedId((current) => {
        if (nextRequests.some((request) => request.id === current)) return current;
        return nextRequests[0]?.id ?? "";
      });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Could not load requests.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.session?.token) return;

    const hydrationTimer = window.setTimeout(() => {
      void refreshRequests(auth.session?.token);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.session?.token]);

  const replaceSelectedRequest = (nextRequest: AdminRequest) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === nextRequest.id ? nextRequest : request,
      ),
    );
  };

  const startSelected = async () => {
    if (!activeAdminToken || !selectedRequest) return;

    setSaving(true);
    try {
      replaceSelectedRequest(
        await startAdminRequest(activeAdminToken, selectedRequest.id),
      );
      toast.success("Request marked in progress.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not start request.");
    } finally {
      setSaving(false);
    }
  };

  const uploadAnswer = async (file: File | undefined) => {
    if (!activeAdminToken || !selectedRequest || !file) return;

    setSaving(true);
    try {
      replaceSelectedRequest(
        await uploadAnswerMarkdown(activeAdminToken, selectedRequest.id, file),
      );
      toast.success("Answer Markdown uploaded.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not upload answer.");
    } finally {
      setSaving(false);
    }
  };

  const attachMockResponseForSelected = async () => {
    if (!activeAdminToken || !selectedRequest) return;

    setSaving(true);
    try {
      replaceSelectedRequest(
        await attachMockResponse(activeAdminToken, selectedRequest.id),
      );
      toast.success("Mock response persisted.");
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Could not persist mock response.",
      );
    } finally {
      setSaving(false);
    }
  };

  const uploadVideo = async (criterion: AdminCriterion, file: File | undefined) => {
    if (!activeAdminToken || !selectedRequest || !file) return;

    setSaving(true);
    try {
      replaceSelectedRequest(
        await uploadCriterionVideo(
          activeAdminToken,
          selectedRequest.id,
          criterion.id,
          file,
        ),
      );
      toast.success("Evidence video uploaded.", {
        description: criterion.title,
      });
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not upload video.");
    } finally {
      setSaving(false);
    }
  };

  const resolveSelected = async () => {
    if (!activeAdminToken || !selectedRequest) return;

    setSaving(true);
    try {
      replaceSelectedRequest(
        await resolveAdminRequest(activeAdminToken, selectedRequest.id),
      );
      toast.success("Request resolved and answer sent.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not resolve request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <Toaster />
      <section className="mx-auto grid w-full max-w-[1440px] gap-3 lg:grid-cols-[244px_minmax(0,1fr)]">
        <AdminSidebar />
        <section className="grid min-w-0 gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
          <section className="border border-[#C8D0D8] bg-white p-3 shadow-[0_18px_70px_rgba(16,20,24,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                  Admin requests
                </div>
              </div>
              <button
                aria-label="Refresh requests"
                className="grid h-8 w-8 place-items-center rounded-md border border-[#C8D0D8] bg-white transition hover:bg-[#EEF2F5]"
                disabled={!activeAdminToken || loading}
                onClick={() => void refreshRequests()}
                type="button"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
              </button>
            </div>

            {error ? (
              <div className="mt-3 rounded-md border border-[#F3C2C2] bg-[#FFF7F7] p-3 text-xs font-bold text-[#8B1E1E]">
                {error}
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              {requests.length ? (
                requests.map((request) => (
                  <button
                    className={`w-full rounded-md border px-2.5 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#101418] ${
                      request.id === selectedRequest?.id
                        ? "border-[#101418] bg-[#F8FAFC]"
                        : "border-[#D8DEE4] bg-white hover:bg-[#F8FAFC]"
                    }`}
                    key={request.id}
                    onClick={() => setSelectedId(request.id)}
                    type="button"
                  >
                    <div className="grid gap-2">
                      <div className="min-w-0 text-xs font-black">
                        {request.title}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="mono min-w-0 truncate text-[8px] font-black uppercase text-[#687482]">
                          {request.id}
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3 text-xs font-bold text-[#46515D]">
                  {activeAdminToken
                    ? "No backend requests returned yet."
                    : "Log in as an admin to load backend requests."}
                </div>
              )}
            </div>

          </section>

          {selectedRequest ? (
            <section className="min-w-0 border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.06)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                    Request detail
                  </div>
                  <h2 className="mt-1 text-2xl font-black">
                    {selectedRequest.title}
                  </h2>
                  <div className="mono mt-2 truncate text-[10px] font-black uppercase text-[#8A94A0]">
                    {selectedRequest.id}
                  </div>
                </div>
                <StatusBadge status={selectedRequest.status} />
              </div>

              <div className="mt-4">
                <MarkdownPreviewButton
                  content={selectedRequest.generated_markdown}
                  label="Generated source of truth"
                  onOpen={() =>
                    setOpenDocument({
                      content: selectedRequest.generated_markdown,
                      eyebrow: "Generated source of truth",
                      title: selectedRequest.title,
                    })
                  }
                />
              </div>

              <section className="mt-4 rounded-md border border-[#D8DEE4] bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black">Acceptance evidence</div>
                  <span className="mono text-[9px] font-black uppercase text-[#687482]">
                    Video required per criterion
                  </span>
                </div>
                <div className="mt-2 divide-y divide-[#E2E7EC]">
                  {selectedRequest.criteria.map((criterion) => {
                    const hasVideo = criterionHasVideo(
                      selectedRequest,
                      criterion.id,
                    );
                    return (
                      <div
                        className="flex items-center justify-between gap-3 py-2"
                        key={criterion.id}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-black">
                            {criterion.title}
                          </div>
                          <div className="mono mt-1 text-[8px] font-black uppercase text-[#687482]">
                            {hasVideo ? "video attached" : "missing video"}
                          </div>
                        </div>
                        <label
                          className="inline-flex min-h-8 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-2 text-[10px] font-black transition hover:bg-[#EEF2F5]"
                          htmlFor={criterionUploadId(criterion.id)}
                        >
                          <PlaySquare className="h-3.5 w-3.5" />
                          Attach video
                        </label>
                        <input
                          accept="video/*"
                          className="sr-only"
                          id={criterionUploadId(criterion.id)}
                          onChange={(event) =>
                            void uploadVideo(
                              criterion,
                              event.currentTarget.files?.[0],
                            )
                          }
                          type="file"
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5]">
                    <Upload className="h-4 w-4" />
                    Upload answer .md
                    <input
                      accept=".md,text/markdown,text/plain"
                      className="sr-only"
                      onChange={(event) =>
                        void uploadAnswer(event.currentTarget.files?.[0])
                      }
                      type="file"
                    />
                  </label>
                  <button
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] disabled:opacity-60"
                    disabled={saving}
                    onClick={() => void attachMockResponseForSelected()}
                    type="button"
                  >
                    <FileText className="h-4 w-4" />
                    Mock response
                  </button>
                  <button
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] disabled:opacity-60"
                    disabled={
                      saving || selectedRequest.status !== "submitted"
                    }
                    onClick={() => void startSelected()}
                    type="button"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Start
                  </button>
                </div>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-xs font-black text-white transition hover:bg-[#26313B] disabled:opacity-60"
                  disabled={
                    saving ||
                    !requestHasAnswer(selectedRequest) ||
                    selectedRequest.criteria.some(
                      (criterion) =>
                        criterion.required_video &&
                        !criterionHasVideo(selectedRequest, criterion.id),
                    )
                  }
                  onClick={() => void resolveSelected()}
                  type="button"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Resolve and send answer
                </button>
              </footer>
            </section>
          ) : (
            <section className="grid min-h-[460px] place-items-center border border-[#C8D0D8] bg-white p-4 text-center shadow-[0_18px_70px_rgba(16,20,24,0.06)]">
              <div>
                <ClipboardCheck className="mx-auto h-8 w-8 text-[#8A94A0]" />
                <h2 className="mt-3 text-xl font-black">No request selected</h2>
                <p className="mt-2 text-sm font-bold text-[#46515D]">
                  Load requests from the backend to review pilot submissions.
                </p>
              </div>
            </section>
          )}
        </section>
      </section>
      {openDocument ? (
        <MarkdownDocumentOverlay
          content={openDocument.content}
          eyebrow={openDocument.eyebrow}
          onClose={() => setOpenDocument(null)}
          title={openDocument.title}
        />
      ) : null}
    </main>
  );
}
