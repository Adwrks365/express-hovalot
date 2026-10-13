import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isVercelPreviewHost } from "@/lib/env";
import { LEGACY_REDIRECTS } from "@/lib/legacy-redirect-paths";
import { resolveWpShortlinkPath } from "@/lib/wp-shortlinks";

function applyPreviewNoIndex(request: NextRequest, response: NextResponse) {
  const host = request.headers.get("host") || "";
  if (isVercelPreviewHost(host)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/" || pathname === "") {
    const postId = searchParams.get("p");
    if (postId) {
      const dest = resolveWpShortlinkPath(postId);
      if (dest) {
        const url = request.nextUrl.clone();
        url.pathname = dest;
        url.search = "";
        return applyPreviewNoIndex(request, NextResponse.redirect(url, 301));
      }
    }
  }

  const legacyDest = LEGACY_REDIRECTS[pathname];
  if (legacyDest) {
    const url = request.nextUrl.clone();
    url.pathname = legacyDest;
    url.search = "";
    return applyPreviewNoIndex(request, NextResponse.redirect(url, 301));
  }

  const response = NextResponse.next();
  return applyPreviewNoIndex(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|media/|icon-|apple-touch-icon|.*\\.(?:ico|png|webp|svg|jpg|jpeg|gif|woff2?)).*)",
  ],
};
