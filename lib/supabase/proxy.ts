import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

// Refreshes the user's auth session on every request so it doesn't expire.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value)
        );
      },
    },
  });

  // Don't put code between createServerClient and getClaims(); it can
  // cause users to be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const path = request.nextUrl.pathname;
  const isPublic = path.startsWith("/login") || path.startsWith("/auth");

  // Logged out → login page. Logged in → skip the login page.
  if (signedIn === isPublic && !path.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = signedIn ? "/" : "/login";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    // Keep any refreshed session cookies.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}
