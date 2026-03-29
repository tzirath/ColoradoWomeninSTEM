import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Protect /admin/* but allow /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Check allowlist
    const { data: allowed } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", user.email)
      .single();

    if (!allowed) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
    }
  }

  // Redirect already-logged-in users away from login page
  if (pathname === "/admin/login" && user) {
    const { data: allowed } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", user.email)
      .single();
    if (allowed) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
