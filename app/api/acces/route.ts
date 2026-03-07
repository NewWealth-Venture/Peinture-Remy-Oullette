import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "app_gate";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request) {
  const code = process.env.APP_ACCESS_CODE;
  if (!code) {
    return NextResponse.json({ ok: true });
  }
  const body = await request.json();
  const submitted = typeof body.code === "string" ? body.code.trim() : "";
  if (submitted !== code) {
    return NextResponse.json({ error: "Code incorrect." }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return NextResponse.json({ ok: true });
}
