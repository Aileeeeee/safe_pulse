import { NextRequest, NextResponse } from "next/server";

// Added your new views explicitly to the public whitelist
const PUBLIC_ROUTES  = ["/login", "/signup", "/welcome", "/request-access"];
const PRIVATE_PREFIX = ["/dashboard", "/incidents", "/alerts", "/analytics", "/team", "/activity", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Checking against your specific token storage tracking configuration key
  const token = request.cookies.get("sp_access")?.value;

  // Redirect authenticated active users directly to work dashboard context
  if (token && PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Intercept unauthenticated entries onto restricted dashboard features
  if (!token && PRIVATE_PREFIX.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/welcome", request.url); // Send them to welcome onboarding path
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png).*)"],
};
