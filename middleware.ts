import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // 1. Force Admins to the Control Center if they are on public pages
  if (token?.role === "ADMIN" && !pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 2. Protect admin routes from non-admins
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
