import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const sealed = request.cookies.get(sessionOptions.cookieName!)?.value;
  if (!sealed) return false;

  try {
    const data = await unsealData<SessionData>(sealed, {
      password: sessionOptions.password as string,
    });
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Läuft auf allen Seiten außer statischen Assets und /api/cron
  // (der Cron-Job wird separat über ein Secret geschützt, nicht über die Session).
  matcher: ["/((?!api/cron|_next/static|_next/image|favicon.ico).*)"],
};
