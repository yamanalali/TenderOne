import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/tenders",
  "/analyses",
  "/company-profile",
  "/templates",
  "/payments",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!needsAuth) return NextResponse.next();

  const session = request.cookies.get("tp_session");
  if (!session?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tenders/:path*",
    "/analyses/:path*",
    "/company-profile/:path*",
    "/templates/:path*",
    "/payments/:path*",
    "/admin/:path*",
  ],
};
