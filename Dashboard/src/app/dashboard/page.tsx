"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthGate, useAuthSession } from "@/features/auth";
import { ChatIntakePanel } from "@/features/chat";
import { SourcePackageOverlay } from "@/features/markdown-editor";
import {
  projectStageIndex,
  DashboardSidebar,
  type ProjectStage,
  type ProjectWorkflowState,
  type ProjectVersion,
  type UpdateReport,
  type UpdateRequest,
  UpdateReportOverlay,
  updateReport,
  updateScreenshots,
  useProjectWorkflow,
} from "@/features/project-workflow";
import {
  createYukaHistoryRequest,
  listCustomerRequests,
  type CustomerRequest,
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
  Send,
  ShieldCheck,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

type ProjectWorkflow = ReturnType<typeof useProjectWorkflow>;
type BackendWorkflow = {
  activeRequest: UpdateRequest | null;
  reports: UpdateReport[];
  requestOverlays: RequestOverlayData[];
  versions: ProjectVersion[];
};

type RequestOverlayData = {
  createdAt: string;
  criteria: CustomerRequest["criteria"];
  deliverables: CustomerRequest["deliverables"];
  generatedMarkdown: string;
  id: string;
  status: CustomerRequest["status"];
  title: string;
};

const stages: Array<{
  activeDetail: string;
  detail: string;
  icon: LucideIcon;
  id: ProjectStage;
  label: string;
}> = [
  {
    activeDetail: "OfficeOS is validating the submitted request package.",
    detail: "The submitted request is contradiction-free and ready to build.",
    icon: Send,
    id: "request-sent",
    label: "Request sent",
  },
  {
    activeDetail: "OfficeOS is implementing the submitted update.",
    detail: "OfficeOS finished applying the submitted update.",
    icon: Hammer,
    id: "in-implementation",
    label: "In implementation",
  },
  {
    activeDetail: "OfficeOS is preparing the answer and evidence package.",
    detail: "The answer was sent back with the required evidence attached.",
    icon: ClipboardCheck,
    id: "resolved",
    label: "Resolved",
  },
];

function completedThrough(request: UpdateRequest | null) {
  if (!request) return projectStageIndex("resolved");
  if (request.status === "draft") return -1;
  if (request.status === "sent") return projectStageIndex("request-sent");
  if (request.status === "implementing") return projectStageIndex("request-sent");
  return projectStageIndex("resolved");
}

function activeIndex(request: UpdateRequest | null) {
  if (!request) return projectStageIndex("resolved");
  if (request.status === "draft") return -1;
  if (request.status === "sent") return projectStageIndex("in-implementation");
  if (request.status === "implementing") return projectStageIndex("in-implementation");
  return projectStageIndex("resolved");
}

function showRequestSentToast(versionTarget: string) {
  toast.success(`Request sent for v${versionTarget}.`, {
    description: "The submitted change request is contradiction-free.",
    duration: 6000,
    id: "officeos-request-sent",
  });
}

function backendRequestToWorkflowRequest(
  request: CustomerRequest | undefined,
): UpdateRequest | null {
  if (!request) return null;

  const resolved = request.status === "resolved";
  const implementing = request.status === "in_progress";

  return {
    createdAt: request.created_at,
    generatedAt: request.created_at,
    id: request.id,
    reportId: `report-${request.id}`,
    sentAt: request.created_at,
    sourceReady: true,
    stage: resolved
      ? "resolved"
      : implementing
        ? "in-implementation"
        : "request-sent",
    status: resolved ? "resolved" : implementing ? "implementing" : "sent",
    summary:
      "Add Product History as a top-level tab while preserving Scanner, Explore, and Product Details.",
    title: request.title,
    versionTarget: "1.1",
  };
}

function backendRequestToReport(request: CustomerRequest): UpdateReport {
  const report = updateReport(request.id, `report-${request.id}`);
  const answerMarkdown = request.deliverables.find(
    (deliverable) => deliverable.kind === "answer_markdown",
  );

  return {
    ...report,
    acceptance: request.criteria.map((criterion) => criterion.title),
    createdAt: request.answer_sent_at ?? request.updated_at,
    id: `report-${request.id}`,
    requestId: request.id,
    response: {
      answerMarkdownUrl: answerMarkdown?.download_url ?? undefined,
      evidenceVideos: request.criteria.map((criterion, index) => {
        const video = request.deliverables.find(
          (deliverable) =>
            deliverable.kind === "evidence_video" &&
            deliverable.acceptance_criterion_id === criterion.id,
        );

        return {
          criterionId: criterion.id,
          criteria: criterion.title,
          description: criterion.description,
          videoLabel: video?.filename ?? `History verification ${index + 1}`,
          videoSrc: video?.download_url ?? undefined,
        };
      }),
    },
    sentAt: request.answer_sent_at ?? request.updated_at,
    status:
      request.status === "resolved"
        ? "resolved"
        : request.status === "in_progress"
          ? "in-implementation"
          : "request-sent",
    title: request.title,
  };
}

function backendRequestsToWorkflow(requests: CustomerRequest[]): BackendWorkflow {
  const sortedRequests = [...requests].sort((left, right) =>
    right.created_at.localeCompare(left.created_at),
  );
  const latest = sortedRequests[0];
  const backendReports = sortedRequests
    .filter((request) => request.status === "resolved")
    .map(backendRequestToReport);
  const backendVersions = sortedRequests.map((request): ProjectVersion => ({
    createdAt: request.answer_sent_at ?? request.created_at,
    id: `version-${request.id}`,
    reportId: request.status === "resolved" ? `report-${request.id}` : undefined,
    screenshots: updateScreenshots,
    status: request.status === "resolved" ? "live" : "pending",
    summary:
      request.status === "resolved"
        ? "Admin response sent with answer Markdown and acceptance evidence."
        : request.status === "in_progress"
          ? "OfficeOS is preparing the response package."
          : "Request submitted to OfficeOS and waiting for admin review.",
    title: request.title,
    version: "1.1",
  }));

  return {
    activeRequest: latest?.status === "resolved"
      ? null
      : backendRequestToWorkflowRequest(latest),
    reports: backendReports,
    requestOverlays: sortedRequests.map((request) => ({
      createdAt: request.created_at,
      criteria: request.criteria,
      deliverables: request.deliverables,
      generatedMarkdown: request.generated_markdown,
      id: request.id,
      status: request.status,
      title: request.title,
    })),
    versions: backendVersions,
  };
}

function DashboardPageLayout({
  app,
  children,
}: {
  app: ProjectWorkflowState["app"];
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <Toaster />
      <section className="mx-auto grid w-full max-w-[1440px] gap-3 lg:grid-cols-[244px_minmax(0,1fr)]">
        <DashboardSidebar app={app} />
        {children}
      </section>
    </main>
  );
}

function ExternalReference({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-[#C8D0D8] bg-white px-2 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function StatusIndicator({
  active,
  complete,
  loading,
}: {
  active: boolean;
  complete: boolean;
  loading: boolean;
}) {
  const label = complete ? "done" : active ? "in progress" : "queued";

  return (
    <span
      className={`mono inline-flex h-6 items-center gap-1.5 rounded border bg-white px-1.5 text-[8px] font-black uppercase ${
        complete
          ? "border-[#B6DCC8] text-[#107A48]"
          : active
            ? "border-[#C8D6FF] text-[#183FBF]"
            : "border-[#D8DEE4] text-[#687482]"
      }`}
    >
      {complete ? (
        <CheckCircle2 className="h-3 w-3 text-[#20B26B]" />
      ) : loading ? (
        <LoaderCircle className="h-3 w-3 animate-spin text-[#2457FF]" />
      ) : active ? (
        <Circle className="h-3 w-3 fill-[#2457FF] text-[#2457FF]" />
      ) : (
        <Circle className="h-3 w-3 text-[#8A94A0]" />
      )}
      {label}
    </span>
  );
}

function VersionStatusIndicator({
  status,
}: {
  status: ProjectVersion["status"];
}) {
  const live = status === "live";

  return (
    <span
      className={`mono inline-flex h-6 w-fit items-center gap-1.5 rounded border bg-white px-2 text-[8px] font-black uppercase ${
        live
          ? "border-[#B6DCC8] text-[#107A48]"
          : "border-[#D8DEE4] text-[#687482]"
      }`}
    >
      {live ? (
        <CheckCircle2 className="h-3 w-3 text-[#20B26B]" />
      ) : (
        <Circle className="h-3 w-3 text-[#8A94A0]" />
      )}
      {status}
    </span>
  );
}

function LifecycleStage({
  currentVersion,
  request,
}: {
  currentVersion: ProjectWorkflowState["app"]["currentVersion"];
  request: UpdateRequest | null;
}) {
  const doneIndex = completedThrough(request);
  const currentIndex = activeIndex(request);
  const displayedVersion = request?.versionTarget ?? currentVersion;
  const hasLoadingRequest = Boolean(request);

  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Project state
          </div>
          <h2 className="mt-1 text-2xl font-black leading-tight">
            Request sent to resolved
          </h2>
        </div>
        <span className="mono rounded-md border border-[#D8DEE4] bg-[#F8FAFC] px-2.5 py-1.5 text-[10px] font-black uppercase text-[#46515D]">
          v{displayedVersion}
        </span>
      </div>

      <ol className="mt-4 grid gap-2 lg:grid-cols-3">
        {stages.map((stage, index) => {
          const complete = index <= doneIndex;
          const active = !complete && index === currentIndex;
          const StageIcon = stage.icon;

          return (
            <li
              className="min-h-[148px] rounded-md border border-[#D8DEE4] bg-white p-3"
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
                <StatusIndicator
                  active={active}
                  complete={complete}
                  loading={active && hasLoadingRequest}
                />
              </div>
              <div className="mono mt-4 text-[9px] font-black uppercase text-[#687482]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-1 text-sm font-black">{stage.label}</h3>
              <p className="mt-2 text-xs font-bold leading-5 text-[#46515D]">
                {complete
                  ? stage.detail
                  : active
                    ? stage.activeDetail
                    : "This stage is not active yet."}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function VersionHistoryWorkspace({
  onOpenReport,
  versions,
}: {
  onOpenReport: (reportId: string) => void;
  versions: ProjectWorkflow["state"]["versions"];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <VersionHistory onOpenReport={onOpenReport} versions={versions} />
    </section>
  );
}

function VersionHistory({
  onOpenReport,
  versions,
}: {
  onOpenReport: (reportId: string) => void;
  versions: ProjectWorkflow["state"]["versions"];
}) {
  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Version history
          </div>
          <h2 className="mt-1 text-lg font-black">Versioned app baselines</h2>
        </div>
        <ShieldCheck className="h-5 w-5 text-[#20B26B]" />
      </div>
      <ol className="mt-3 divide-y divide-[#E5EAF0] border-t border-[#E5EAF0]">
        {versions.length ? (
          versions.map((version) => (
            <VersionRow
              key={version.id}
              onOpenReport={onOpenReport}
              version={version}
            />
          ))
        ) : (
          <li className="px-3 py-4 text-xs font-bold leading-5 text-[#46515D]">
            No backend requests have been submitted yet.
          </li>
        )}
      </ol>
    </section>
  );
}

function VersionRow({
  onOpenReport,
  version,
}: {
  onOpenReport: (reportId: string) => void;
  version: ProjectVersion;
}) {
  const content = (
    <>
      <div className="mono text-sm font-black text-[#183FBF]">
        v{version.version}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black">{version.title}</div>
        <p className="mt-1 text-xs font-bold leading-5 text-[#46515D]">
          {version.summary}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <VersionStatusIndicator status={version.status} />
        <span className="inline-flex h-8 translate-y-1 items-center justify-center gap-1.5 rounded-md bg-[#101418] px-2.5 text-[10px] font-black text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          {version.reportId ? "Review report" : "Review request"}
          <ClipboardCheck className="h-3 w-3" />
        </span>
      </div>
    </>
  );

  return (
    <li className="border-b border-[#E5EAF0] last:border-b-0">
      <button
        className="group relative grid w-full gap-3 px-3 py-3 text-left transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-inset sm:grid-cols-[72px_1fr_auto] sm:items-center"
        onClick={() =>
          onOpenReport(version.reportId ?? version.id.replace(/^version-/, ""))
        }
        type="button"
      >
        {content}
      </button>
    </li>
  );
}

function DashboardOverviewWorkspace({
  app,
  onCreateUpdate,
  onOpenReport,
  request,
  versions,
}: {
  app: ProjectWorkflow["state"]["app"];
  onCreateUpdate: () => void;
  onOpenReport: (reportId: string) => void;
  request: ProjectWorkflow["state"]["activeRequest"];
  versions: ProjectWorkflow["state"]["versions"];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <header className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="mono text-[10px] font-black uppercase text-[#46515D]">
              Dashboard / {app.platform}
            </div>
            <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
              <h1 className="text-3xl font-black leading-none">{app.name}</h1>
            </div>
            <div className="mono mt-2 truncate text-[10px] font-black uppercase text-[#8A94A0]">
              {app.bundleId}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExternalReference href={app.appStoreUrl} label="App Store" />
            <ExternalReference href={app.posthogUrl} label="PostHog" />
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#101418] px-3 text-xs font-black text-white transition hover:bg-[#26313B] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              onClick={onCreateUpdate}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Create update
            </button>
          </div>
        </div>
      </header>

      <LifecycleStage currentVersion={app.currentVersion} request={request} />
      <VersionHistoryWorkspace
        onOpenReport={onOpenReport}
        versions={versions}
      />
    </section>
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

function RequestDocumentOverlay({
  onClose,
  request,
}: {
  onClose: () => void;
  request: RequestOverlayData;
}) {
  const statusLabel =
    request.status === "in_progress" ? "in progress" : request.status;
  const answerMarkdown = request.deliverables.find(
    (deliverable) => deliverable.kind === "answer_markdown",
  );
  const evidenceVideos = request.criteria.map((criterion, index) => {
    const deliverable = request.deliverables.find(
      (current) =>
        current.kind === "evidence_video" &&
        current.acceptance_criterion_id === criterion.id,
    );

    return {
      criterion,
      deliverable,
      label: deliverable?.filename ?? `History verification ${index + 1}`,
    };
  });
  const hasResponsePackage =
    Boolean(answerMarkdown?.download_url) ||
    evidenceVideos.some((evidence) => evidence.deliverable?.download_url);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#101418]/40 p-2 text-[#101418] sm:p-4">
      <button
        aria-label="Close request"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={`Request ${request.title}`}
        aria-modal="true"
        className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-[1120px] flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-white shadow-[0_28px_120px_rgba(16,20,24,0.34)] sm:max-h-[calc(100dvh-2rem)]"
        role="dialog"
      >
        <header className="sticky top-0 z-10 border-b border-[#D8DEE4] bg-white px-3 py-2 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="mono text-[10px] font-black uppercase text-[#46515D]">
                Backend request / {statusLabel}
              </div>
              <h2 className="mt-0.5 text-lg font-black leading-tight sm:text-xl">
                {request.title}
              </h2>
            </div>
            <button
              aria-label="Close request"
              className="grid h-8 w-8 place-items-center rounded-md border border-[#C8D0D8] bg-white text-[#46515D] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 overflow-auto bg-[#F8FAFC] p-4 sm:p-5">
          <div className="grid gap-4">
            <section className="border border-[#C8D0D8] bg-white p-5">
              <div className="mono text-[10px] font-black uppercase text-[#2457FF]">
                Request package
              </div>
              <h3 className="mt-2 text-3xl font-black leading-tight">
                Waiting for admin response
              </h3>
              <p className="mt-4 max-w-[760px] text-sm font-bold leading-7 text-[#46515D]">
                This is the backend request currently moving through OfficeOS.
                Once the admin attaches an answer and evidence videos, this row
                becomes a resolved report.
              </p>
            </section>

            <article className="min-w-0 border border-[#C8D0D8] bg-white p-5">
              <div className="mono text-[10px] font-black uppercase text-[#2457FF]">
                Generated source of truth
              </div>
              <div className="mt-4 max-w-none space-y-3 text-sm font-bold leading-7 text-[#26313B]">
                <ReactMarkdown>{request.generatedMarkdown}</ReactMarkdown>
              </div>
            </article>

            <section className="border border-[#C8D0D8] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="mono text-[10px] font-black uppercase text-[#2457FF]">
                    Response package
                  </div>
                  <h3 className="mt-2 text-2xl font-black leading-tight">
                    Mock answer and evidence videos
                  </h3>
                </div>
                {answerMarkdown?.download_url ? (
                  <a
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-2.5 text-[10px] font-black text-[#101418] transition hover:bg-[#EEF2F5]"
                    href={answerMarkdown.download_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Answer .md
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>

              {hasResponsePackage ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {evidenceVideos.map((evidence) => (
                    <article
                      className="overflow-hidden rounded-md border border-[#D8DEE4] bg-[#F8FAFC]"
                      key={evidence.criterion.id}
                    >
                      {evidence.deliverable?.download_url ? (
                        <video
                          aria-label={evidence.label}
                          className="aspect-video w-full bg-[#101418] object-cover"
                          controls
                          preload="metadata"
                        >
                          <source
                            src={evidence.deliverable.download_url}
                            type="video/mp4"
                          />
                          {evidence.label}
                        </video>
                      ) : (
                        <div className="grid aspect-video place-items-center bg-[#EEF2F5] text-[#687482]">
                          <Video className="h-5 w-5" />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="mono text-[9px] font-black uppercase text-[#687482]">
                          {evidence.deliverable ? "video attached" : "pending"}
                        </div>
                        <h4 className="mt-1 text-xs font-black leading-5">
                          {evidence.criterion.title}
                        </h4>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm font-bold leading-6 text-[#46515D]">
                  No answer or evidence videos have been attached yet.
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflow = useProjectWorkflow();
  const { session } = useAuthSession();
  const token = session?.token;
  const [chatOpen, setChatOpen] = useState(false);
  const [backendRequests, setBackendRequests] = useState<CustomerRequest[]>([]);
  const backendWorkflow = useMemo(
    () => backendRequestsToWorkflow(backendRequests),
    [backendRequests],
  );
  const hasResolvedBackendRequest = backendRequests.some(
    (request) => request.status === "resolved",
  );
  const app = {
    ...workflow.state.app,
    currentVersion: hasResolvedBackendRequest ? "1.1" : "1.0",
  };
  const activeRequest =
    backendWorkflow.activeRequest ?? workflow.state.activeRequest;
  const versions = backendWorkflow.versions;
  const reports = backendWorkflow.reports;
  const requestSent =
    searchParams.get("sent") === "1" || searchParams.get("approved") === "1";
  const reportId = searchParams.get("reportId");
  const sourceOpen = searchParams.get("source") === "1";
  const selectedReport = reportId
    ? reports.find((report) => report.id === reportId) ?? null
    : null;
  const selectedRequestOverlay =
    reportId && !selectedReport
      ? backendWorkflow.requestOverlays.find((request) => request.id === reportId) ??
        null
      : null;

  useEffect(() => {
    if (!token) return;

    let active = true;
    listCustomerRequests(token)
      .then((requests) => {
        if (!active) return;
        setBackendRequests(requests);
      })
      .catch((error) => {
        if (!active) return;
        toast.error("Backend requests could not be loaded.", {
          description:
            error instanceof Error ? error.message : "Please refresh the page.",
        });
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!requestSent) return;

    showRequestSentToast("1.1");
    router.replace("/dashboard");
  }, [requestSent, router]);

  const openSourceReview = (requestId = activeRequest?.id) => {
    if (!requestId) return;

    router.push("/dashboard?source=1");
  };

  const handleRequestSent = async () => {
    setChatOpen(false);
    if (!token) return;

    try {
      const createdRequest = await createYukaHistoryRequest(token);
      setBackendRequests((current) => [createdRequest, ...current]);
    } catch (error) {
      toast.error("Backend request was not created.", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
      return;
    }
    router.push("/dashboard?sent=1");
  };

  const openReport = (nextReportId: string) => {
    if (!nextReportId) return;

    setChatOpen(false);
    router.push(`/dashboard?reportId=${encodeURIComponent(nextReportId)}`);
  };

  const closeReport = () => {
    router.replace("/dashboard");
  };

  const closeSourceReview = () => {
    router.replace("/dashboard");
  };

  return (
    <DashboardPageLayout app={app}>
      <DashboardOverviewWorkspace
        app={app}
        onCreateUpdate={() => setChatOpen(true)}
        onOpenReport={openReport}
        request={activeRequest}
        versions={versions}
      />

      {selectedReport ? (
        <UpdateReportOverlay onClose={closeReport} report={selectedReport} />
      ) : null}

      {selectedRequestOverlay ? (
        <RequestDocumentOverlay
          onClose={closeReport}
          request={selectedRequestOverlay}
        />
      ) : null}

      {sourceOpen ? (
        <SourcePackageOverlay
          onClose={closeSourceReview}
          onRequestSent={handleRequestSent}
          request={activeRequest}
        />
      ) : null}

      <DashboardDrawer
        onClose={() => setChatOpen(false)}
        open={chatOpen}
        title="Create update"
      >
        <ChatIntakePanel
          onClose={() => setChatOpen(false)}
          onRequestSent={handleRequestSent}
          onReviewSource={(requestId) => openSourceReview(requestId)}
          workflow={workflow}
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
