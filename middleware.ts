import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "app_gate";
const GATE_PATH = "/acces";

export function middleware(request: NextRequest) {
  const code = process.env.APP_ACCESS_CODE;
  if (!code) {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname === GATE_PATH) {
    const cookie = request.cookies.get(COOKIE_NAME)?.value;
    if (cookie === code) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie === code) {
    return NextResponse.next();
  }
  const url = new URL(GATE_PATH, request.url);
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
