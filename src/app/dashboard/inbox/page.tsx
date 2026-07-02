import type { Metadata } from "next";
import { Inbox as InboxIcon } from "lucide-react";
import { getInbox } from "@/lib/dashboard/data";
import { InboxList } from "@/components/dashboard/inbox/inbox-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

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
      <DashboardPageHeader
        eyebrow="Incoming"
        icon={InboxIcon}
        title="Inbox"
        description={`Messages from your contact form. ${messages.length} total, ${unreadCount} unread.`}
        tone="signal"
      />

      <InboxList initialMessages={messages} />
    </div>
  );
}
