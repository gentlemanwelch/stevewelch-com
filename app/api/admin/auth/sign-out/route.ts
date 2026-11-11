import { NextResponse } from "next/server";
import { SESSION_COOKIE, cookieOptions, requestOrigin } from "@/lib/crm/session";

/**
 * Sign out: forget the session cookie and return to the sign-in page.
 *
 * A POST, from the form in the admin menu, never a link. A sign-out that
 * answers a GET can be triggered by any page that embeds an image pointing at
 * it. The Origin check is the same idea from the other side: the request must
 * come from this site's own pages.
 *
 * It does not need a valid session. Signing out an expired or absent session
 * is still just "make sure this browser holds no cookie".
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (request.headers.get("origin") !== origin) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  // 303, so the browser follows with a GET rather than re-sending the POST.
  const response = NextResponse.redirect(new URL("/admin/sign-in/", origin), 303);
  response.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
