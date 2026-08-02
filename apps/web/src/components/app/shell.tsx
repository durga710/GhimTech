'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Drawer } from './drawer';
import { RoleSwitcher } from './role-switcher';
import { SessionProvider } from './session';
import { SidebarNav } from './sidebar';
import { TopBar } from './topbar';

/**
 * The operations shell.
 *
 * The frame is exactly one viewport tall and does not scroll. The masthead and
 * the rail are fixed; the content region is the only thing that moves, and it
 * is `flex-1 min-h-0` so that a nested full-height workspace — a return open
 * beside its diagnostics, for instance — can claim the whole region and manage
 * its own panes without the page acquiring a second scrollbar.
 */
export function AppShell({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <SessionProvider>
      <ShellFrame>{children}</ShellFrame>
    </SessionProvider>
  );
}

function ShellFrame({ children }: { children: ReactNode }): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <a href="#workspace-content" className="skip-link">
        Skip to content
      </a>

      <TopBar onOpenMenu={() => setMenuOpen(true)} />

      <div className="flex min-h-0 flex-1">
        {/*
          Icons between the tablet and desktop breakpoints, full labels above.
          The width step is deliberate rather than fluid: a rail that resizes
          continuously moves the content edge while you are reading it.
        */}
        <aside
          aria-label="Primary"
          className="hidden shrink-0 border-r border-line-subtle bg-surface md:block md:w-[4.5rem] lg:w-60"
        >
          <SidebarNav />
        </aside>

        <main id="workspace-content" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        side="left"
        title="Navigation"
        description="Every workspace destination available to your role."
        widthClassName="max-w-[18rem]"
      >
        <div className="flex flex-col gap-5">
          <RoleSwitcher layout="stacked" />
          <div className="border-t border-line-subtle pt-2">
            <SidebarNav collapsible={false} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
