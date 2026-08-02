"use client";
/**
 * API client. The bearer token lives in sessionStorage (cleared when the tab
 * closes) and is attached per request; there are no auth cookies, so CSRF
 * does not apply. 401 responses clear the session and bounce to sign-in.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "ghimtech.session";
const USER_KEY = "ghimtech.user";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "PREPARER" | "REVIEWER" | "CLIENT" | "AUDITOR";
  passwordResetForced?: boolean;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function getUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

export function setSession(token: string, user: SessionUser): void {
  window.sessionStorage.setItem(TOKEN_KEY, token);
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (response.status === 401 && options.auth !== false) {
    clearSession();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/sign-in")) {
      window.location.href = "/sign-in";
    }
  }
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    throw new ApiError(
      response.status,
      (body as { error?: string })?.error ?? response.statusText,
      body,
    );
  }
  return body as T;
}

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
