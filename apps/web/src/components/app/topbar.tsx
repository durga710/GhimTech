'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { GhimTechTaxLockup } from '@/components/brand/logo';
import { DEMO_TAX_YEAR } from '@/lib/demo/practice';
import { Icon } from './icons';
import { RoleSwitcher } from './role-switcher';
import { ROLE_LABEL, useSession } from './session';
import { ThemeToggle } from './theme-toggle';

/**
 * The masthead.
 *
 * It carries the lockup, one search field that covers clients and returns, the
 * tax year the workspace is filing, and the three account controls. Everything
 * else belongs in the rail — a top bar that grows past this is a top bar nobody
 * can scan.
 */
export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }): React.JSX.Element {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line-subtle bg-surface px-3 sm:px-4">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="inline-flex size-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-canvas-alt hover:text-ink md:hidden"
      >
        <Icon name="menu" />
      </button>

      <Link
        href="/app"
        aria-label="GhimTech Tax workspace, dashboard"
        className="shrink-0 rounded-sm text-ink"
      >
        <GhimTechTaxLockup markSize={26} scale={0.95} />
      </Link>

      <SearchField />

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <p className="hidden items-center gap-1.5 rounded-md border border-line-subtle bg-surface-sunken px-2.5 py-1 text-micro text-ink-muted sm:inline-flex">
          <span className="uppercase tracking-[0.08em]">Tax year</span>
          <span className="tabular font-semibold text-ink">{DEMO_TAX_YEAR}</span>
        </p>

        <RoleSwitcher className="max-lg:hidden" />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

function SearchField(): React.JSX.Element {
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState('');

  return (
    <form
      role="search"
      className="hidden min-w-0 flex-1 md:block md:max-w-sm"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        router.push(trimmed ? `/app/clients?q=${encodeURIComponent(trimmed)}` : '/app/clients');
      }}
    >
      <label htmlFor={id} className="sr-only">
        Search clients and returns
      </label>
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
        />
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients and returns"
          className="h-9 w-full rounded-md border border-line bg-surface-sunken pl-8 pr-3 text-sm text-ink placeholder:text-ink-subtle transition-[border-color,background-color] hover:border-line-strong focus:bg-surface"
        />
      </div>
    </form>
  );
}

function UserMenu(): React.JSX.Element {
  const { user, role } = useSession();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    function onPointerDown(event: MouseEvent): void {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  function close(returnFocus: boolean): void {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === 'Tab') {
      close(false);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (items.length === 0) return;

    event.preventDefault();
    const index = items.findIndex((item) => item === document.activeElement);
    const step = event.key === 'ArrowDown' ? 1 : -1;
    items[(index + step + items.length) % items.length]?.focus();
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex items-center gap-2 rounded-md border border-line-subtle bg-surface px-1.5 py-1 text-left transition-colors hover:bg-canvas-alt"
      >
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-tint text-micro font-semibold text-accent-text"
        >
          {user.initials}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight lg:flex">
          <span className="truncate text-xs font-medium text-ink">{user.name}</span>
          <span className="truncate text-micro text-ink-subtle">{ROLE_LABEL[role]}</span>
        </span>
        <Icon name="chevron-down" className="size-4 text-ink-subtle" />
        <span className="sr-only">Account menu</span>
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-[calc(100%+0.375rem)] z-40 w-64 rounded-lg border border-line-subtle bg-surface-raised p-1.5 shadow-lg"
        >
          <div className="border-b border-line-subtle px-2.5 pb-2.5 pt-1.5">
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
            <p className="mt-1 text-micro text-ink-subtle">
              {user.title} · signed in as {ROLE_LABEL[role].toLowerCase()}
            </p>
          </div>

          <MenuLink href="/app/settings" onSelect={() => close(false)}>
            Profile and practice settings
          </MenuLink>
          <MenuLink href="/app/security" onSelect={() => close(false)}>
            Security centre
          </MenuLink>
          <MenuLink href="/sign-in" onSelect={() => close(false)}>
            Sign out
          </MenuLink>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  onSelect,
  children,
}: {
  href: string;
  onSelect: () => void;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onSelect}
      className="block rounded-md px-2.5 py-2 text-sm text-ink-muted transition-colors hover:bg-canvas-alt hover:text-ink focus:bg-canvas-alt focus:text-ink"
    >
      {children}
    </Link>
  );
}
