import type { useProjectWorkflow } from "@/features/project-workflow";
import { Clock3 } from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";

type ProjectWorkflow = ReturnType<typeof useProjectWorkflow>;

type DeliveryLogWorkspaceProps = {
  logs: ProjectWorkflow["state"]["logs"];
};

export function DeliveryLogWorkspace({ logs }: DeliveryLogWorkspaceProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <WorkspaceHeader eyebrow="Operations" title="Delivery log" />
      <LiveLogs logs={logs} />
    </section>
  );
}

function LiveLogs({ logs }: DeliveryLogWorkspaceProps) {
  return (
    <section className="border border-[#C8D0D8] bg-white p-4 shadow-[0_18px_70px_rgba(16,20,24,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mono text-[10px] font-black uppercase text-[#46515D]">
            Live updates
          </div>
          <h2 className="mt-1 text-lg font-black">Delivery log</h2>
        </div>
        <Clock3 className="h-5 w-5 text-[#2457FF]" />
      </div>

      <ol className="mt-3 space-y-2">
        {logs.map((log) => (
          <li
            className="rounded-md border border-[#D8DEE4] bg-[#F8FAFC] p-3"
            key={log.id}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xs font-black">{log.title}</h3>
              <span
                className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  log.tone === "green"
                    ? "bg-[#20B26B]"
                    : log.tone === "blue"
                      ? "bg-[#2457FF]"
                      : "bg-[#8A94A0]"
                }`}
              />
            </div>
            <p className="mt-1 text-xs font-bold leading-5 text-[#46515D]">
              {log.detail}
            </p>
            <div className="mono mt-2 text-[9px] font-black uppercase text-[#8A94A0]">
              {new Date(log.at).toLocaleString()}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
