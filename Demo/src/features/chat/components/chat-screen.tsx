"use client";

import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Eye,
  Loader2,
  Send,
} from "lucide-react";
import { useProjectWorkflow } from "@/features/project-workflow";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

type ChatMessage = {
  id: string;
  speaker: "assistant" | "user";
  body: string;
  kind?: "progress" | "ready";
};

type StreamingMessage = {
  fullText: string;
  id: string;
} | null;

const initialMessage =
  "Describe the app you want OfficeOS to build. Include the users, core screens, flows, assets, integrations, and the design direction you want preserved.";

const questionResponse = [
  "What is the app called?",
  "Who is the primary user?",
  "What problem should the app solve first?",
  "What should the user be able to do in the first session?",
  "Which screens must exist in the initial build?",
  "What data, files, or assets should the app use?",
  "Which integrations are required, if any?",
  "What should be explicitly out of scope?",
  "What visual style should the app follow?",
  "What acceptance criteria would make the app ready to build?",
].join("\n");

const progressSteps = [
  "Writing SPEC.md",
  "Writing DESIGN.md",
  "Writing ChangeRequest.md",
  "Preparing source package in templates",
  "Checking empty source handoff",
];

function buildInitialMessages(sourceReady = false): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      id: "assistant-initial",
      speaker: "assistant",
      body: initialMessage,
    },
  ];

  if (sourceReady) {
    messages.push({
      id: "assistant-ready",
      speaker: "assistant",
      kind: "ready",
      body: "Source package is ready for approval.",
    });
  }

  return messages;
}

export function ChatScreen() {
  const router = useRouter();
  const workflow = useProjectWorkflow();
  const { approveGeneratedRequest, ensureGeneratedRequest } = workflow;
  const hasGeneratedSource = Boolean(workflow.state.activeRequest?.sourceReady);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(hasGeneratedSource),
  );
  const [submittedCount, setSubmittedCount] = useState(0);
  const [progressCount, setProgressCount] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [streamingMessage, setStreamingMessage] =
    useState<StreamingMessage>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStreaming = streamingMessage !== null;

  const sourceReady = useMemo(
    () =>
      messages.some(
        (message) => message.kind === "ready" && message.body.length > 0,
      ) && !isStreaming,
    [isStreaming, messages],
  );
  const generatedRequest = workflow.state.activeRequest?.sourceReady
    ? workflow.state.activeRequest
    : null;

  useEffect(() => {
    endRef.current?.scrollIntoView({
      block: "end",
      behavior: isWorking || isStreaming ? "auto" : "smooth",
    });
  }, [messages, progressCount, isWorking, isStreaming]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 154)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 154 ? "auto" : "hidden";
  }, [draft]);

  useEffect(() => {
    if (!isWorking) return;

    if (progressCount >= progressSteps.length) {
      const timeout = window.setTimeout(() => {
        const assistantMessageId = "assistant-ready";

        ensureGeneratedRequest();
        setMessages((previous) => [
          ...previous,
          {
            id: assistantMessageId,
            speaker: "assistant",
            kind: "ready",
            body: "",
          },
        ]);
        setStreamingMessage({
          id: assistantMessageId,
          fullText: "Source package is ready for approval.",
        });
        setIsWorking(false);
      }, 420);

      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setProgressCount((value) => value + 1);
    }, 620);

    return () => window.clearTimeout(timeout);
  }, [ensureGeneratedRequest, isWorking, progressCount]);

  useEffect(() => {
    if (!streamingMessage) return;

    const currentMessage = messages.find(
      (message) => message.id === streamingMessage.id,
    );
    const currentLength = currentMessage?.body.length ?? 0;

    const timeout = window.setTimeout(() => {
      if (currentLength >= streamingMessage.fullText.length) {
        setStreamingMessage(null);
        return;
      }

      const nextBody = streamingMessage.fullText.slice(0, currentLength + 4);

      setMessages((previous) =>
        previous.map((message) =>
          message.id === streamingMessage.id
            ? {
                ...message,
                body: nextBody,
              }
            : message,
        ),
      );

      if (nextBody.length >= streamingMessage.fullText.length) {
        setStreamingMessage(null);
      }
    }, currentLength >= streamingMessage.fullText.length ? 0 : 24);

    return () => window.clearTimeout(timeout);
  }, [messages, streamingMessage]);

  const submitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanDraft = draft.trim();
    if (!cleanDraft || isWorking || isStreaming) return;

    const nextCount = submittedCount + 1;
    setSubmittedCount(nextCount);
    setDraft("");
    setMessages((previous) => [
      ...previous,
      {
        id: `user-${Date.now()}`,
        speaker: "user",
        body: cleanDraft,
      },
    ]);

    if (nextCount === 1) {
      const assistantMessageId = "assistant-questions";

      setMessages((previous) => [
        ...previous,
        {
          id: assistantMessageId,
          speaker: "assistant",
          body: "",
        },
      ]);
      setStreamingMessage({
        id: assistantMessageId,
        fullText: questionResponse,
      });
      return;
    }

    if (!sourceReady) {
      setProgressCount(0);
      setIsWorking(true);
      setMessages((previous) => [
        ...previous,
        {
          id: "assistant-progress",
          speaker: "assistant",
          kind: "progress",
          body: "",
        },
      ]);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const approveRequest = () => {
    approveGeneratedRequest();
    router.push("/?approved=1");
  };

  return (
    <main className="flex min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <section className="mx-auto flex min-h-[calc(100dvh-1rem)] w-full max-w-[1180px] flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-white shadow-[0_18px_70px_rgba(16,20,24,0.10)] sm:min-h-[calc(100dvh-1.5rem)]">
        <header className="flex min-h-[58px] items-center justify-between gap-3 border-b border-[#D8DEE4] bg-[#F8FAFC] px-3 py-2 sm:px-4">
          <div className="min-w-0">
            <div className="text-base font-black leading-tight">OfficeOS</div>
            <div className="mono mt-1 text-[10px] font-black uppercase text-[#46515D]">
              App source intake
            </div>
          </div>

          <Link
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <section className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5">
            {messages.map((message) => {
              const assistant = message.speaker === "assistant";

              return (
                <article
                  className={`flex ${assistant ? "justify-start" : "justify-end"}`}
                  key={message.id}
                >
                  <div
                    className={`max-w-[min(760px,88%)] rounded-md px-4 py-3 ${
                      assistant
                        ? "border border-[#D8DEE4] bg-[#F8FAFC]"
                        : "bg-[#101418] text-white"
                    }`}
                  >
                    {message.kind === "progress" ? (
                      <div className="space-y-2">
                        {progressSteps
                          .slice(
                            0,
                            Math.min(progressCount + 1, progressSteps.length),
                          )
                          .map((step, index) => {
                            const complete = index < progressCount;
                            const active = index === progressCount;

                            return (
                              <div
                                className="mono flex items-center gap-2 text-xs font-black uppercase text-[#46515D]"
                                key={step}
                              >
                                {complete ? (
                                  <CheckCircle2 className="h-4 w-4 text-[#20B26B]" />
                                ) : active ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-[#2457FF]" />
                                ) : (
                                  <CircleDot className="h-4 w-4 text-[#8A94A0]" />
                                )}
                                <span>{step}</span>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="whitespace-pre-line text-sm font-bold leading-6">
                        {message.body}
                      </p>
                    )}

                    {message.kind === "ready" &&
                    streamingMessage?.id !== message.id &&
                    message.body.length > 0 ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-3 text-xs font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                          href={`/source?origin=chat&requestId=${
                            generatedRequest?.id ?? "request-yuka-explore-update"
                          }`}
                        >
                          <Eye className="h-4 w-4" />
                          View spec
                        </Link>
                        <button
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#20B26B] px-3 text-xs font-black text-white transition hover:bg-[#188C54] focus:outline-none focus:ring-2 focus:ring-[#20B26B] focus:ring-offset-1"
                          onClick={approveRequest}
                          type="button"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve request
                        </button>
                        <span className="mono text-[10px] font-black uppercase text-[#46515D]">
                          Demo/templates
                        </span>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
            <div ref={endRef} />
          </div>
        </section>

        <form
          className="border-t border-[#D8DEE4] bg-white px-4 py-3 sm:px-6"
          onSubmit={submitPrompt}
        >
          <div className="mx-auto flex w-full max-w-[880px] items-end gap-3">
            <label className="sr-only" htmlFor="chat-prompt">
              Message OfficeOS
            </label>
            <textarea
              ref={textareaRef}
              className="max-h-[154px] min-h-11 flex-1 resize-none rounded-md border border-[#C8D0D8] bg-white px-3 py-2.5 text-sm font-bold leading-6 outline-none placeholder:text-[#8A94A0] focus:ring-2 focus:ring-[#101418]"
              disabled={isWorking || isStreaming}
              id="chat-prompt"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isWorking
                  ? "OfficeOS is preparing the source package..."
                  : isStreaming
                    ? "OfficeOS is responding..."
                  : submittedCount === 0
                    ? "Describe your project..."
                    : "Answer the questions or add build details..."
              }
              rows={1}
              value={draft}
            />
            <button
              aria-label="Send message"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#101418] text-white transition hover:bg-[#26313B] disabled:cursor-not-allowed disabled:bg-[#A9B5C2] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
              disabled={!draft.trim() || isWorking || isStreaming}
              type="submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
