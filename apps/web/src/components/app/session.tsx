'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppRole } from '@/lib/navigation';
import { DEMO_USERS, type DemoUser } from '@/lib/demo/practice';

/**
 * The signed-in role, for demonstration.
 *
 * This is a presentation concern and nothing more. It decides which navigation
 * items are listed and which screens explain themselves instead of rendering,
 * so that the shape of a role-restricted product can be seen. It is not an
 * authorisation boundary: a real deployment decides on the server, per request,
 * and a hidden link has never stopped anybody.
 */

export type StaffRole = Extract<AppRole, 'administrator' | 'preparer' | 'reviewer'>;

export const STAFF_ROLES: StaffRole[] = ['administrator', 'preparer', 'reviewer'];

export const ROLE_LABEL: Record<StaffRole, string> = {
  administrator: 'Administrator',
  preparer: 'Preparer',
  reviewer: 'Reviewer',
};

export const ROLE_SUMMARY: Record<StaffRole, string> = {
  administrator: 'Every screen, including users, providers, the security centre and audit history.',
  preparer: 'Clients, returns, documents and filing. No user or provider administration.',
  reviewer: 'The review queue and the audit history. Practice reports are not included.',
};

/** Which sample account each demonstration role signs in as. */
const ROLE_ACCOUNT: Record<StaffRole, string> = {
  administrator: 'u-101',
  preparer: 'u-102',
  reviewer: 'u-104',
};

const STORAGE_KEY = 'gt-demo-role';
const DEFAULT_ROLE: StaffRole = 'administrator';

const FALLBACK_USER: DemoUser = {
  id: 'u-000',
  name: 'Signed-in user',
  initials: 'SU',
  email: 'unknown@ridgelinetax.example',
  role: 'preparer',
  status: 'active',
  title: 'Staff',
  secondFactor: 'none',
  lastActiveAt: '—',
};

function isStaffRole(value: unknown): value is StaffRole {
  return value === 'administrator' || value === 'preparer' || value === 'reviewer';
}

export function demoUserForRole(role: StaffRole): DemoUser {
  return DEMO_USERS.find((user) => user.id === ROLE_ACCOUNT[role]) ?? FALLBACK_USER;
}

export interface SessionValue {
  role: StaffRole;
  setRole: (role: StaffRole) => void;
  user: DemoUser;
  /** False until the stored preference has been read on the client. */
  ready: boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [role, setRoleState] = useState<StaffRole>(DEFAULT_ROLE);
  const [ready, setReady] = useState(false);

  // Read after mount rather than during render: the server has no localStorage,
  // and reading it during render would hydrate into a different tree.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isStaffRole(stored)) setRoleState(stored);
    } catch {
      // A blocked storage API is not worth failing the workspace over.
    }
    setReady(true);
  }, []);

  const setRole = useCallback((next: StaffRole) => {
    setRoleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Same reasoning: the choice simply will not persist.
    }
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ role, setRole, user: demoUserForRole(role), ready }),
    [role, setRole, ready],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used inside the application shell.');
  }
  return value;
}

/** Whether a navigation item or screen lists the given role. */
export function roleAllows(role: StaffRole, allowed: readonly AppRole[]): boolean {
  return allowed.includes(role);
}
