import type {
  ProjectStage,
  ProjectWorkflowState,
  UpdateRequest,
} from "@/features/project-workflow";
import { projectStageIndex } from "@/features/project-workflow";
import { CheckCircle2, Circle, Clock3, Hammer, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const stages: Array<{
  detail: string;
  icon: LucideIcon;
  id: ProjectStage;
  label: string;
}> = [
  {
    detail: "The update request has source and a report attached.",
    icon: Send,
    id: "request-created",
    label: "Request created",
  },
  {
    detail: "A human approved the generated update package.",
    icon: CheckCircle2,
    id: "human-approved",
    label: "Human approved",
  },
  {
    detail: "OfficeOS is implementing the approved update.",
    icon: Hammer,
    id: "in-implementation",
    label: "In implementation",
  },
  {
    detail: "The delivered version is the live baseline.",
    icon: CheckCircle2,
    id: "live",
    label: "Live",
  },
];

function completedThrough(request: UpdateRequest | null) {
  if (!request) return projectStageIndex("live");
  if (request.status === "generated") return projectStageIndex("request-created");
  if (request.status === "approved") return projectStageIndex("human-approved");
  return projectStageIndex("human-approved");
}

function activeIndex(request: UpdateRequest | null) {
  if (!request) return projectStageIndex("live");
  if (request.status === "generated") return projectStageIndex("human-approved");
  if (request.status === "approved") return projectStageIndex("in-implementation");
  return projectStageIndex("in-implementation");
}

type LifecycleStageProps = {
  currentVersion: ProjectWorkflowState["app"]["currentVersion"];
  request: UpdateRequest | null;
};

export function LifecycleStage({
  currentVersion,
  request,
}: LifecycleStageProps) {
  const doneIndex = completedThrough(request);
  const currentIndex = activeIndex(request);
  const displayedVersion = request?.versionTarget ?? currentVersion;

  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Project state
          </div>
          <h2 className="mt-1 text-2xl font-black leading-tight">
            Request created to live
          </h2>
        </div>
        <span className="mono rounded-md border border-[#D8DEE4] bg-[#F8FAFC] px-2.5 py-1.5 text-[10px] font-black uppercase text-[#46515D]">
          v{displayedVersion}
        </span>
      </div>

      <ol className="mt-4 grid gap-2 lg:grid-cols-4">
        {stages.map((stage, index) => {
          const complete = index <= doneIndex;
          const active = !complete && index === currentIndex;
          const Icon = complete ? CheckCircle2 : active ? Clock3 : Circle;

          return (
            <li
              className={`min-h-[148px] rounded-md border p-3 ${
                complete
                  ? "border-[#B6DCC8] bg-[#F1FBF6]"
                  : active
                    ? "border-[#C8D6FF] bg-[#F4F7FF]"
                    : "border-[#D8DEE4] bg-[#F8FAFC]"
              }`}
              key={stage.id}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${
                    complete
                      ? "border-[#107A48] bg-[#20B26B] text-white"
                      : active
                        ? "border-[#C8D6FF] bg-[#EDF3FF] text-[#2457FF]"
                        : "border-[#D8DEE4] bg-white text-[#8A94A0]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={`mono rounded px-1.5 py-1 text-[8px] font-black uppercase ${
                    complete
                      ? "bg-[#EAF8F1] text-[#107A48]"
                      : active
                        ? "bg-[#EDF3FF] text-[#183FBF]"
                        : "bg-white text-[#8A94A0]"
                  }`}
                >
                  {complete ? "done" : active ? "waiting" : "queued"}
                </span>
              </div>
              <div className="mono mt-4 text-[9px] font-black uppercase text-[#687482]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-1 text-sm font-black">{stage.label}</h3>
              <p className="mt-2 text-xs font-bold leading-5 text-[#46515D]">
                {complete
                  ? stage.detail
                  : active
                    ? `Waiting for ${stage.label.toLowerCase()}.`
                    : "This stage is not active yet."}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
