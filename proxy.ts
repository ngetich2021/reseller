import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "visitor_id";

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const response = NextResponse.next();

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  event.waitUntil(
    prisma.pageView.create({ data: { path: pathname, visitorId } }).catch(() => {})
  );

  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|admin|_next/static|_next/image|favicon.ico|apple-icon.png|icon.png|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map|woff|woff2|ttf)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
