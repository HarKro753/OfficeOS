import type { ReactNode } from "react";
import { FileFormatIcon } from "./file-format-icon";
import type { WorkspaceItem, WorkspaceItemId } from "../types";

type EditorHeaderProps = {
  activeItemId: WorkspaceItemId;
  actions?: ReactNode;
  closeWorkspaceItem: (itemId: WorkspaceItemId) => void;
  openItems: WorkspaceItem[];
  selectWorkspaceItem: (itemId: WorkspaceItemId) => void;
};

export function EditorHeader({
  actions,
  activeItemId,
  closeWorkspaceItem,
  openItems,
  selectWorkspaceItem,
}: EditorHeaderProps) {
  return (
    <header className="flex min-h-[42px] items-center justify-between border-b border-[#D8DEE4] bg-[#F8FAFC]">
      <div className="flex min-w-0 items-stretch self-stretch overflow-hidden">
        {openItems.map((item) => {
          const active = activeItemId === item.id;

          return (
            <div
              key={item.id}
              className={`group flex min-w-[132px] max-w-[204px] items-center border-r border-[#D8DEE4] transition ${
                active
                  ? "bg-white text-[#101418]"
                  : "bg-[#EEF2F5] text-[#46515D] hover:bg-white"
              }`}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-2 self-stretch px-3 text-left focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-inset"
                onClick={() => selectWorkspaceItem(item.id)}
                type="button"
              >
                <FileFormatIcon item={item} />
                <span className="mono min-w-0 flex-1 truncate text-xs font-black">
                  {item.label}
                </span>
              </button>
              <button
                aria-label={`Close ${item.label}`}
                className="mr-1 grid h-5 w-5 shrink-0 place-items-center rounded text-[#8A94A0] transition hover:bg-[#E5EAF0] hover:text-[#101418] focus:outline-none focus:ring-2 focus:ring-[#101418] focus:ring-offset-1"
                onClick={() => closeWorkspaceItem(item.id)}
                type="button"
              >
                x
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 px-2">{actions}</div>
    </header>
  );
}
