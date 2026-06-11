"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthGate, useAuthSession } from "@/features/auth";
import { DashboardSidebar } from "@/features/project-workflow";
import {
  createCustomerRequest,
  criterionHasVideo,
  listCustomerRequests,
  listCustomerWorkspaces,
  requestHasAnswer,
  type CustomerRequest,
  type CustomerRequestStatus,
  type CustomerWorkspace,
} from "@/features/requests";
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Hammer,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Send,
  type LucideIcon,
} from "lucide-react";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";

const fallbackApp = {
  category: "Operations",
  currentVersion: "1.0",
  name: "Dashboard",
  platform: "Web",
};

const stages: Array<{
  detail: string;
  icon: LucideIcon;
  id: CustomerRequestStatus;
  label: string;
}> = [
  {
    detail: "The request is submitted and ready for OfficeOS review.",
    icon: Send,
    id: "submitted",
    label: "Submitted",
  },
  {
    detail: "OfficeOS is implementing and validating the requested update.",
    icon: Hammer,
    id: "in_progress",
    label: "In progress",
  },
  {
    detail: "The answer report and required evidence were sent back.",
    icon: ClipboardCheck,
    id: "resolved",
    label: "Resolved",
  },
];

function DashboardPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <Toaster />
      <section className="mx-auto grid w-full max-w-[1440px] gap-3 lg:grid-cols-[244px_minmax(0,1fr)]">
        <DashboardSidebar />
        {children}
      </section>
    </main>
  );
}

function statusLabel(status: CustomerRequestStatus) {
  if (status === "in_progress") return "in progress";
  return status;
}

function StatusBadge({ status }: { status: CustomerRequestStatus }) {
  const resolved = status === "resolved";

  return (
    <span
      className={`mono inline-flex h-6 w-fit items-center gap-1.5 rounded border bg-white px-2 text-[8px] font-black uppercase ${
        resolved
          ? "border-[#B6DCC8] text-[#107A48]"
          : "border-[#D8DEE4] text-[#46515D]"
      }`}
    >
      {resolved ? (
        <CheckCircle2 className="h-3 w-3 text-[#20B26B]" />
      ) : (
        <Circle className="h-3 w-3 text-[#2457FF]" />
      )}
      {statusLabel(status)}
    </span>
  );
}

function LifecycleStage({ request }: { request: CustomerRequest | null }) {
  const activeIndex = request
    ? stages.findIndex((stage) => stage.id === request.status)
    : -1;

  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Backend request state
          </div>
          <h2 className="mt-1 text-2xl font-black leading-tight">
            Submitted to resolved
          </h2>
        </div>
        {request ? <StatusBadge status={request.status} /> : null}
      </div>

      <ol className="mt-4 grid gap-2 lg:grid-cols-3">
        {stages.map((stage, index) => {
          const complete = activeIndex >= index && activeIndex !== -1;
          const active = activeIndex === index && request?.status !== "resolved";
          const StageIcon = stage.icon;

          return (
            <li
              className="min-h-[132px] rounded-md border border-[#D8DEE4] bg-white p-3"
              key={stage.id}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border bg-white ${
                    complete
                      ? "border-[#20B26B] text-[#107A48]"
                      : active
                        ? "border-[#2457FF] text-[#2457FF]"
                        : "border-[#D8DEE4] text-[#8A94A0]"
                  }`}
                >
                  <StageIcon className="h-4 w-4" />
                </span>
                <span className="mono inline-flex h-6 items-center gap-1.5 rounded border border-[#D8DEE4] bg-white px-1.5 text-[8px] font-black uppercase text-[#46515D]">
                  {complete ? "done" : active ? "active" : "queued"}
                </span>
              </div>
              <div className="mono mt-4 text-[9px] font-black uppercase text-[#687482]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-1 text-sm font-black">{stage.label}</h3>
              <p className="mt-2 text-xs font-bold leading-5 text-[#46515D]">
                {request ? stage.detail : "Create a backend request to start."}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function RequestHistory({
  onSelect,
  requests,
  selectedId,
}: {
  onSelect: (requestId: string) => void;
  requests: CustomerRequest[];
  selectedId: string;
}) {
  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Backend requests
          </div>
          <h2 className="mt-1 text-lg font-black">Submitted update queue</h2>
        </div>
        <FileText className="h-5 w-5 text-[#2457FF]" />
      </div>

      <ol className="mt-3 divide-y divide-[#E5EAF0] border-t border-[#E5EAF0]">
        {requests.length ? (
          requests.map((request) => (
            <li className="border-b border-[#E5EAF0] last:border-b-0" key={request.id}>
              <button
                className={`grid w-full gap-3 px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-inset sm:grid-cols-[1fr_auto] sm:items-center ${
                  request.id === selectedId ? "bg-[#F8FAFC]" : "hover:bg-[#F8FAFC]"
                }`}
                onClick={() => onSelect(request.id)}
                type="button"
              >
                <div className="min-w-0">
                  <div className="text-sm font-black">{request.title}</div>
                  <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#46515D]">
                    {request.raw_spec_text}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </button>
            </li>
          ))
        ) : (
          <li className="p-3 text-xs font-bold text-[#46515D]">
            No backend requests submitted yet.
          </li>
        )}
      </ol>
    </section>
  );
}

function RequestDetail({ request }: { request: CustomerRequest | null }) {
  if (!request) {
    return (
      <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
        <div className="text-sm font-black">No request selected</div>
        <p className="mt-2 text-xs font-bold leading-5 text-[#46515D]">
          Create or select a backend request to review its report state.
        </p>
      </section>
    );
  }

  const answer = request.deliverables.find(
    (deliverable) => deliverable.kind === "answer_markdown",
  );

  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Request report
          </div>
          <h2 className="mt-1 text-lg font-black">{request.title}</h2>
          <div className="mono mt-1 truncate text-[9px] font-black uppercase text-[#687482]">
            {request.id}
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <section className="rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3">
          <div className="text-sm font-black">Submitted spec</div>
          <p className="mt-2 text-xs font-bold leading-5 text-[#46515D]">
            {request.raw_spec_text}
          </p>
        </section>
        <section className="rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3">
          <div className="text-sm font-black">Generated Markdown</div>
          <pre className="mt-2 max-h-[180px] overflow-auto whitespace-pre-wrap text-xs font-bold leading-5 text-[#46515D]">
            {request.generated_markdown}
          </pre>
        </section>
      </div>

      <section className="mt-4 rounded-md border border-[#D8DEE4] bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-black">Returned report package</div>
          <span className="mono text-[9px] font-black uppercase text-[#687482]">
            {request.answer_sent_at ? "sent" : "pending"}
          </span>
        </div>
        <div className="mt-3 grid gap-2">
          <ReportPackageRow
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
              <ReportPackageRow
                href={video?.download_url ?? null}
                key={criterion.id}
                label={criterion.title}
                ready={criterionHasVideo(request, criterion.id)}
              />
            );
          })}
        </div>
      </section>
    </section>
  );
}

function ReportPackageRow({
  href,
  label,
  ready,
}: {
  href: string | null;
  label: string;
  ready: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-[#E5EAF0] bg-[#F8FAFC] p-2">
      <div className="min-w-0">
        <div className="truncate text-xs font-black">{label}</div>
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

function DashboardDrawer({
  children,
  onClose,
  open,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
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

function CreateRequestForm({
  onClose,
  onSubmit,
  saving,
}: {
  onClose: () => void;
  onSubmit: (values: { rawSpecText: string; title: string }) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState("");
  const [rawSpecText, setRawSpecText] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanSpec = rawSpecText.trim();
    if (!cleanTitle || !cleanSpec || saving) return;

    onSubmit({
      rawSpecText: cleanSpec,
      title: cleanTitle,
    });
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col bg-white" onSubmit={submit}>
      <header className="flex min-h-[58px] items-center justify-between gap-3 border-b border-[#D8DEE4] bg-[#F8FAFC] px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <div className="text-base font-black leading-tight">Create update</div>
          <div className="mono mt-1 text-[10px] font-black uppercase text-[#46515D]">
            Backend request
          </div>
        </div>
        <button
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5]"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </header>

      <section className="min-h-0 flex-1 overflow-auto px-4 py-5">
        <div className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-black text-[#26313B]">Title</span>
            <input
              className="min-h-11 rounded-md border border-[#C8D0D8] bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#101418]"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add product history tab"
              type="text"
              value={title}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-black text-[#26313B]">
              Request spec
            </span>
            <textarea
              className="min-h-[260px] resize-none rounded-md border border-[#C8D0D8] bg-white px-3 py-2.5 text-sm font-bold leading-6 outline-none focus:ring-2 focus:ring-[#101418]"
              onChange={(event) => setRawSpecText(event.target.value)}
              placeholder="Describe the changed behavior, affected screens, acceptance criteria, and what must stay unchanged."
              value={rawSpecText}
            />
          </label>
        </div>
      </section>

      <footer className="border-t border-[#D8DEE4] bg-white px-4 py-3">
        <button
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-sm font-black text-white transition hover:bg-[#26313B] disabled:cursor-not-allowed disabled:bg-[#A9B5C2]"
          disabled={!title.trim() || !rawSpecText.trim() || saving}
          type="submit"
        >
          {saving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send request
        </button>
      </footer>
    </form>
  );
}

function appFromWorkspace(workspace: CustomerWorkspace | null) {
  return {
    ...fallbackApp,
    category: workspace?.name ?? fallbackApp.category,
  };
}

function DashboardPageContent() {
  const auth = useAuthSession();
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [workspaces, setWorkspaces] = useState<CustomerWorkspace[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const token = auth.session?.token;
  const workspace = workspaces[0] ?? null;
  const app = appFromWorkspace(workspace);
  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedId) ?? requests[0] ?? null,
    [requests, selectedId],
  );

  const refreshBackendState = async (nextToken = token) => {
    if (!nextToken) return;

    setLoading(true);
    setError(null);
    try {
      const [nextWorkspaces, nextRequests] = await Promise.all([
        listCustomerWorkspaces(nextToken),
        listCustomerRequests(nextToken),
      ]);
      setWorkspaces(nextWorkspaces);
      setRequests(nextRequests);
      setSelectedId((current) => {
        if (nextRequests.some((request) => request.id === current)) return current;
        return nextRequests[0]?.id ?? "";
      });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Could not load backend requests.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    const hydrationTimer = window.setTimeout(() => {
      void refreshBackendState(token);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRequestSent = async ({
    rawSpecText,
    title,
  }: {
    rawSpecText: string;
    title: string;
  }) => {
    if (!token || !workspace) {
      toast.error("Backend workspace is not ready yet.");
      return;
    }

    setSaving(true);
    try {
      const request = await createCustomerRequest(token, {
        raw_spec_text: rawSpecText,
        title,
        workspace_id: workspace.id,
      });
      setRequests((current) => [request, ...current]);
      setSelectedId(request.id);
      setChatOpen(false);
      toast.success("Request sent to the backend.");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Could not send request.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardPageLayout>
      <section className="flex min-w-0 flex-col gap-3">
        <header className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                Dashboard / {app.platform}
              </div>
              <h1 className="mt-1 text-3xl font-black leading-none">
                {app.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] disabled:opacity-60"
                disabled={!token || loading}
                onClick={() => void refreshBackendState()}
                type="button"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Refresh
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-xs font-black text-white transition hover:bg-[#26313B] disabled:opacity-60"
                disabled={saving || !workspace}
                onClick={() => setChatOpen(true)}
                type="button"
              >
                <Plus className="h-4 w-4" />
                Create update
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-md border border-[#F3C2C2] bg-[#FFF7F7] p-3 text-xs font-bold text-[#8B1E1E]">
            {error}
          </div>
        ) : null}

        <LifecycleStage request={selectedRequest} />
        <RequestHistory
          onSelect={setSelectedId}
          requests={requests}
          selectedId={selectedRequest?.id ?? ""}
        />
        <RequestDetail request={selectedRequest} />
      </section>

      <DashboardDrawer
        onClose={() => setChatOpen(false)}
        open={chatOpen}
        title="Create update"
      >
        <CreateRequestForm
          onClose={() => setChatOpen(false)}
          onSubmit={(values) => void handleRequestSent(values)}
          saving={saving}
        />
      </DashboardDrawer>
    </DashboardPageLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthGate>
      <Suspense
        fallback={
          <main className="min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3" />
        }
      >
        <DashboardPageContent />
      </Suspense>
    </AuthGate>
  );
}
