import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import {
  HANDSHAKE_COOKIE,
  HANDSHAKE_PATH,
  HANDSHAKE_SECONDS,
  adminConfig,
  cookieOptions,
  requestOrigin,
  seal,
} from "@/lib/crm/session";
import { googleSignInUrl } from "@/lib/crm/google";

/**
 * Sign-in, first half: send the visitor to Google.
 *
 * Two random values go with them. `state` comes back in the address Google
 * returns them to, and proves the return belongs to a sign-in this browser
 * started. `nonce` comes back INSIDE Google's signed statement, and proves the
 * statement answers this sign-in and not an older one. Both are kept in a
 * signed, ten-minute cookie that only the sign-in routes ever receive.
 *
 * The return address is built from the address the visitor used (see
 * `requestOrigin`), so the live site returns to the live site and a preview
 * returns to itself.
 * Google refuses any return address that is not registered on the sign-in
 * client, which is the real guard on that value. The trailing slash matters:
 * the site answers the bare path with a redirect, and Google compares the
 * address exactly.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = requestOrigin(request);
  const config = adminConfig();
  // Not set up: back to the sign-in page, which says so.
  if (!config) return NextResponse.redirect(new URL("/admin/sign-in/", origin));

  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");

  const response = NextResponse.redirect(
    googleSignInUrl({
      clientId: config.clientId,
      redirectUri: `${origin}/api/admin/auth/callback/`,
      state,
      nonce,
    }),
  );
  response.cookies.set(
    HANDSHAKE_COOKIE,
    seal(
      "signin",
      { state, nonce, exp: Math.floor(Date.now() / 1000) + HANDSHAKE_SECONDS },
      config.secret,
    ),
    cookieOptions(HANDSHAKE_SECONDS, HANDSHAKE_PATH),
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
