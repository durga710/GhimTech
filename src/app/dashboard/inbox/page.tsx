import type { Metadata } from "next";
import { Inbox as InboxIcon } from "lucide-react";
import { getInbox } from "@/lib/dashboard/data";
import { InboxList } from "@/components/dashboard/inbox/inbox-list";

export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

/**
 * Inbox — incoming "send me a message" submissions from the public contact
 * form. Server component: auth + DB via getInbox(); the InboxList client
 * component handles read/archive/reply interactivity.
 */
export default async function InboxPage() {
  const { messages, unreadCount } = await getInbox();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-signal-400/10 border border-signal-400/20">
            <InboxIcon className="h-5 w-5 text-signal-300" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Inbox</h1>
            <p className="text-sm text-zinc-500">Messages from your contact form</p>
          </div>
        </div>
        <div className="text-right font-mono text-[11px] text-zinc-500">
          <div>{messages.length} total</div>
          {unreadCount > 0 && <div className="text-flare-400">{unreadCount} unread</div>}
        </div>
      </header>

      <InboxList initialMessages={messages} />
    </div>
  );
}
