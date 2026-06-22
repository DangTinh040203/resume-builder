import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALIZED_PREFIX = /^\/(vi|ja|zh|th|hi|es|fr|ar|ko|de)(?=\/|$)/;

function stripLocalePrefix(pathname: string): string {
  const stripped = pathname.replace(LOCALIZED_PREFIX, "");
  return stripped === ""
    ? "/"
    : stripped.startsWith("/")
      ? stripped
      : `/${stripped}`;
}

function localePrefix(pathname: string): string {
  const match = pathname.match(LOCALIZED_PREFIX);
  return match?.[1] ? `/${match[1]}` : "";
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const { isAuthenticated } = await auth();
  const pathname = req.nextUrl.pathname;
  const bare = stripLocalePrefix(pathname);
  const prefix = localePrefix(pathname);

  if (isAuthenticated && bare.startsWith("/auth")) {
    return NextResponse.redirect(new URL(`${prefix}/not-found`, req.url));
  }

  if (!isAuthenticated && bare.startsWith("/builder")) {
    const signInUrl = new URL(`${prefix}/auth/sign-in`, req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlMiddleware(req);
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
