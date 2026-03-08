import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/reset-password"];
const LOGIN_PATH = "/login";
const DEFAULT_REDIRECT = "/accueil/overview";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const { response, user } = await updateSession(request);

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isPublic) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = request.nextUrl.searchParams.get("from") || DEFAULT_REDIRECT;
      url.searchParams.delete("from");
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (!user) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
