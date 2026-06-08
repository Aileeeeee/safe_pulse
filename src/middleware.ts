import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES  = ["/login", "/signup"];
const PRIVATE_PREFIX = ["/dashboard", "/incidents", "/alerts", "/analytics", "/team", "/activity", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sp_access")?.value;

  // Redirect authenticated users away from auth pages
  if (token && PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from private pages
  if (!token && PRIVATE_PREFIX.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png).*)"],
};
