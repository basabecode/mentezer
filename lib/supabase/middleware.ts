import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";
import { authDebug } from "@/lib/auth/debug";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  authDebug("middleware.getUser", {
    path: request.nextUrl.pathname,
    hasUser: Boolean(user),
    userId: user?.id ?? null,
    email: user?.email ?? null,
  });

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
  const isDemoRoute = request.nextUrl.pathname.startsWith("/demo");

  const isPublicRoute = request.nextUrl.pathname === "/" || isAuthRoute || isDemoRoute;

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    authDebug("middleware.redirect", {
      path: request.nextUrl.pathname,
      reason: "missing_user",
      destination: "/login",
    });
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    authDebug("middleware.redirect", {
      path: request.nextUrl.pathname,
      reason: "authenticated_user_on_auth_route",
      destination: "/dashboard",
      userId: user.id,
    });
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
