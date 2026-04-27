import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPagePrefixes = ["/dashboard", "/tasks", "/leads", "/calls", "/properties", "/site-visits", "/reports", "/team", "/campaigns"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = protectedPagePrefixes.some((path) => pathname.startsWith(path));
  const isProtectedApi = pathname.startsWith("/api") && !pathname.startsWith("/api/auth");

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/leads/:path*", "/calls/:path*", "/properties/:path*", "/site-visits/:path*", "/reports/:path*", "/team/:path*", "/campaigns/:path*", "/api/:path*"],
};
