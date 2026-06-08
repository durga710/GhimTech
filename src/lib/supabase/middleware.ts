import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

type MiddlewareSessionResult = {
  response: NextResponse;
  user: User | null;
  error: Error | null;
};

export async function updateSupabaseSession(
  request: NextRequest
): Promise<MiddlewareSessionResult> {
  let response = NextResponse.next({ request });

  try {
    const { url, anonKey } = getSupabasePublicConfig();

    const setAll: SetAllCookies = (cookiesToSet) => {
      cookiesToSet.forEach(({ name, value }) => {
        request.cookies.set(name, value);
      });

      response = NextResponse.next({ request });

      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
    };

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll,
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    response.headers.set("Cache-Control", "private, no-store");

    return {
      response,
      user,
      error: error ? new Error(error.message) : null,
    };
  } catch (error) {
    response.headers.set("Cache-Control", "private, no-store");
    return {
      response,
      user: null,
      error: error instanceof Error ? error : new Error("Supabase session update failed"),
    };
  }
}

export function responseWithAuthCookies(
  source: NextResponse,
  target: NextResponse
): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
  target.headers.set("Cache-Control", "private, no-store");
  return target;
}
