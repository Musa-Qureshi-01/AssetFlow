import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getSessionUser } from "@/lib/auth-session";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    const response = NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({ user });
}
