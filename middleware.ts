import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_TOKEN_COOKIE = "authToken";

const PUBLIC_ROUTES = [
  "/",                 // login/home
  "/auth",
  "/btoblogin",
  "/verify-login",
  "/registration",
  "/forget-password",
] as const;

const PROTECTED_PREFIXES = ["/wholesaler"] as const;

const DEFAULT_PROTECTED_ROUTE = "/wholesaler";
const DEFAULT_PUBLIC_ROUTE = "/";

function normalize(pathname: string) {
  // keep "/" as-is; otherwise strip trailing slash for consistency
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function isPublicRoute(pathname: string): boolean {
  const p = normalize(pathname);
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return p === "/";
    return p === route || p.startsWith(`${route}/`);
  });
}

function isProtectedRoute(pathname: string): boolean {
  const p = normalize(pathname);
  return PROTECTED_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = normalize(url.pathname);

  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const isAuthenticated = !!authToken;

  const publicRoute = isPublicRoute(pathname);
  const protectedRoute = isProtectedRoute(pathname);

  // 1) Authenticated users must NOT access public routes (e.g., "/", "/auth", etc.)
  if (isAuthenticated && publicRoute) {
    if (pathname !== DEFAULT_PROTECTED_ROUTE) {
      const redirectUrl = new URL(DEFAULT_PROTECTED_ROUTE, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 2) Unauthenticated users must NOT access protected routes (e.g., "/wholesaler")
  if (!isAuthenticated && protectedRoute) {
    const redirectUrl = new URL(DEFAULT_PUBLIC_ROUTE, request.url);
    // preserve intended destination so you can redirect after login
    const next = url.pathname + (url.search || "");
    redirectUrl.searchParams.set("next", next);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude Next internals and assets to avoid unnecessary middleware work
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
