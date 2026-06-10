"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/dashboard/dashboard-sidebar";
import { cn } from "@/lib/utils";

/**
 * Mobile dashboard navigation. The sidebar is desktop-only (hidden below
 * `lg`), which previously left phones with NO dashboard navigation at all —
 * this horizontally-scrollable rail under the topbar fills that gap.
 */
export function DashboardMobileNav({ inboxUnread = 0 }: { inboxUnread?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard sections"
      className="lg:hidden sticky top-[57px] z-20 backdrop-blur-xl bg-ink-950/70 border-b border-white/[0.06]"
    >
      <ul className="flex items-center gap-1 overflow-x-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors",
                  active
                    ? "bg-signal-400/15 text-signal-200 border border-signal-400/25"
                    : "text-zinc-400 border border-transparent hover:text-zinc-200 hover:bg-white/[0.04]",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
                {item.href === "/dashboard/inbox" && inboxUnread > 0 && (
                  <span className="ml-0.5 rounded-full bg-flare-400/20 px-1.5 font-mono text-[10px] text-flare-200">
                    {inboxUnread}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
