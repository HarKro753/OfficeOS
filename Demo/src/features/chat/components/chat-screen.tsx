"use client";

import { useRouter } from "next/navigation";
import { ChatIntakePanel } from "./chat-intake-panel";

export function ChatScreen() {
  const router = useRouter();

  return (
    <main className="flex min-h-dvh bg-[#E9EDF2] p-2 text-[#101418] sm:p-3">
      <div className="mx-auto flex min-h-[calc(100dvh-1rem)] w-full max-w-[1180px] sm:min-h-[calc(100dvh-1.5rem)]">
        <ChatIntakePanel
          frame="page"
          onApproved={() => router.push("/?approved=1")}
          onClose={() => router.push("/")}
          onReviewSource={(requestId) =>
            router.push(`/source?origin=chat&requestId=${requestId}`)
          }
        />
      </div>
    </main>
  );
}
