import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { AuthSession } from "@/lib/auth-types";

function getSessionFromRequest(request: NextRequest): AuthSession | null {
  try {
    const sessionCookie = request.cookies.get("auth-session");
    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as AuthSession;
    return session;
  } catch (error) {
    console.error("Get session error in middleware:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes - no auth required
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/signup/organization",
    "/super-admin/signup",
    "/api/auth",
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get session from cookie
  const session = getSessionFromRequest(request);

  // Protected routes - require authentication
  if (!session) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Super-admin routes - require super_admin role
  if (pathname.startsWith("/super-admin") && !pathname.startsWith("/super-admin/signup")) {
    if (session.role !== "super_admin") {
      // Non-super-admins cannot access super-admin routes
      if (session.role === "player") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/org/dashboard", request.url));
      }
    }
  }

  // Block super-admins from accessing org and player routes
  if (session.role === "super_admin") {
    if (pathname.startsWith("/org") || pathname.startsWith("/dashboard") || 
        pathname.startsWith("/profile") || pathname.startsWith("/stats") || 
        pathname.startsWith("/training") || pathname.startsWith("/nutrition") || 
        pathname.startsWith("/injury-prevention") || pathname.startsWith("/analytics")) {
      return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
    }
  }

  // Organization routes - require org role
  if (pathname.startsWith("/org")) {
    if (session.role === "player") {
      // Players cannot access org routes
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (session.role !== "player" && !session.organizationId) {
      // Org user must have organizationId
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Player-only routes - require player role
  const playerOnlyRoutes = [
    "/dashboard",
    "/profile",
    "/stats",
    "/training",
    "/nutrition",
    "/injury-prevention",
    "/analytics",
  ];
  if (playerOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (session.role !== "player") {
      // Org users cannot access player routes
      return NextResponse.redirect(new URL("/org/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
