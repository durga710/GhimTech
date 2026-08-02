"use client";
/**
 * Authenticated application shell: sidebar navigation scoped by role,
 * top bar with session controls, responsive down to mobile.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Wordmark, cx } from "@ghimtech/ui";
import { api, clearSession, getToken, getUser, type SessionUser } from "@/lib/api";

const NAV: Array<{ href: string; label: string; roles: SessionUser["role"][] }> = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "PREPARER", "REVIEWER", "AUDITOR"] },
  { href: "/clients", label: "Clients", roles: ["ADMIN", "PREPARER", "REVIEWER", "AUDITOR"] },
  {
    href: "/returns",
    label: "Returns",
    roles: ["ADMIN", "PREPARER", "REVIEWER", "AUDITOR", "CLIENT"],
  },
  {
    href: "/documents",
    label: "Documents",
    roles: ["ADMIN", "PREPARER", "REVIEWER", "AUDITOR", "CLIENT"],
  },
  { href: "/audit", label: "Audit log", roles: ["ADMIN", "AUDITOR"] },
  { href: "/admin", label: "Administration", roles: ["ADMIN"] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/sign-in");
      return;
    }
    setUser(getUser());
    setReady(true);
  }, [router]);

  async function signOut() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Session may already be gone; clearing locally is what matters.
    }
    clearSession();
    router.replace("/sign-in");
  }

  if (!ready) return null;

  const links = NAV.filter((item) => !user || item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen">
      <aside className="no-print hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:flex">
        <div className="px-5 py-5">
          <Link href="/dashboard">
            <Wordmark />
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 px-3" aria-label="Primary">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4 text-xs text-slate-400 dark:border-slate-800">
          Tax year 2025 · rules v2025.1
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
          <div className="md:hidden">
            <Link href="/dashboard">
              <Wordmark compact />
            </Link>
          </div>
          <div className="hidden text-sm text-slate-500 md:block">
            Private preparation environment — all activity is audited
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {user.name} <span className="text-slate-400">· {user.role.toLowerCase()}</span>
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
