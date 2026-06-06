import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { FileFormatIcon } from "./file-format-icon";
import type { WorkspaceItem, WorkspaceItemId } from "../types";

type TemplateSidebarProps = {
  activeItemId: WorkspaceItemId;
  selectWorkspaceItem: (itemId: WorkspaceItemId) => void;
  workspaceItems: WorkspaceItem[];
};

export function TemplateSidebar({
  activeItemId,
  selectWorkspaceItem,
  workspaceItems,
}: TemplateSidebarProps) {
  return (
    <aside className="flex w-[220px] shrink-0 flex-col overflow-hidden rounded-md border border-[#C8D0D8] bg-[#F8FAFC] shadow-[0_18px_70px_rgba(16,20,24,0.08)]">
      <header className="px-3 py-3">
        <button
          className="mb-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-[#C8D0D8] bg-white px-2 text-[11px] font-black text-[#101418] transition hover:bg-[#EEF2F5] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
          type="button"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to chat
        </button>
        <div className="flex items-center gap-2">
          <Image
            alt="OfficeOS"
            className="h-9 w-9 shrink-0"
            height={36}
            src="/logo.svg"
            width={36}
          />
          <div className="min-w-0">
            <div className="text-lg font-black leading-none">OfficeOS</div>
            <div className="mono mt-1 text-[9px] font-black uppercase text-[#46515D]">
              Source package
            </div>
          </div>
        </div>
      </header>

      <div className="mt-3 min-h-0 flex-1 overflow-auto px-3">
        <div className="mono px-1 pb-2 text-[11px] font-black uppercase text-[#101418]">
          Source artifacts
        </div>
        <div className="space-y-1">
          {workspaceItems.map((item) => {
            const selected = activeItemId === item.id;

            return (
              <button
                key={item.id}
                className={`group flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1 ${
                  selected
                    ? "bg-[#E5EAF0] text-[#101418]"
                    : "text-[#46515D] hover:bg-white"
                }`}
                onClick={() => selectWorkspaceItem(item.id)}
                type="button"
              >
                <FileFormatIcon item={item} />
                <span className="mono truncate text-xs font-black">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
