/**
 * Role-based permissions. The API enforces these server-side on every route;
 * the web app uses the same map to decide what to render. Client access is
 * additionally scoped to their own records at the service layer.
 */
import type { Role } from "./enums.js";

export const PERMISSIONS = [
  "users:manage",
  "providers:configure",
  "security:configure",
  "taxyears:configure",
  "clients:read",
  "clients:write",
  "clients:read-own",
  "returns:read",
  "returns:write",
  "returns:read-own",
  "returns:calculate",
  "returns:review",
  "returns:approve",
  "returns:sign",
  "documents:read",
  "documents:write",
  "documents:read-own",
  "documents:upload-own",
  "documents:delete",
  "efile:submit",
  "efile:read",
  "audit:read",
  "reports:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ADMIN: PERMISSIONS,
  PREPARER: [
    "clients:read",
    "clients:write",
    "returns:read",
    "returns:write",
    "returns:calculate",
    "returns:review",
    "documents:read",
    "documents:write",
    "efile:submit",
    "efile:read",
    "reports:read",
  ],
  REVIEWER: [
    "clients:read",
    "returns:read",
    "returns:calculate",
    "returns:review",
    "returns:approve",
    "documents:read",
    "efile:read",
    "reports:read",
  ],
  CLIENT: [
    "clients:read-own",
    "returns:read-own",
    "returns:sign",
    "documents:read-own",
    "documents:upload-own",
  ],
  AUDITOR: [
    "clients:read",
    "returns:read",
    "documents:read",
    "efile:read",
    "audit:read",
    "reports:read",
  ],
};

export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
