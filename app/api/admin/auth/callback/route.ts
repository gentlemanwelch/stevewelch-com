import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  HANDSHAKE_COOKIE,
  HANDSHAKE_PATH,
  SESSION_COOKIE,
  adminConfig,
  cookieOptions,
  createSessionValue,
  requestOrigin,
  sameString,
  sessionCookieOptions,
  unseal,
} from "@/lib/crm/session";
import { exchangeCodeForIdentity } from "@/lib/crm/google";

/**
 * Sign-in, second half: Google sends the visitor back here.
 *
 * THREE OUTCOMES, and only one of them opens the door:
 *
 *   /admin/                  the address Google vouches for is the owner's.
 *                            The session cookie is set.
 *   /admin/denied/           Google vouches for somebody, and it is not the
 *                            owner, or the address is not one Google has
 *                            verified. No cookie.
 *   /admin/sign-in/?problem  the sign-in did not complete: cancelled at
 *                            Google, a stale or missing handshake, a return
 *                            that does not match what this browser started,
 *                            or Google refusing the code. No cookie.
 *
 * The handshake cookie is cleared on every one of them. It is good for one
 * return, and a second arrival with the same values is not a sign-in.
 *
 * WHAT IS LOGGED. That a sign-in was refused, and why an exchange failed. Not
 * the address of whoever was refused: a stranger who tried the door has not
 * agreed to be written down.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = requestOrigin(request);

  const leave = (path: string) => {
    const response = NextResponse.redirect(new URL(path, origin));
    response.cookies.set(HANDSHAKE_COOKIE, "", cookieOptions(0, HANDSHAKE_PATH));
    response.headers.set("Cache-Control", "no-store");
    return response;
  };

  const config = adminConfig();
  if (!config) return leave("/admin/sign-in/");

  const store = await cookies();
  const handshake = unseal("signin", store.get(HANDSHAKE_COOKIE)?.value, config.secret);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (
    !code ||
    !state ||
    !handshake ||
    typeof handshake.state !== "string" ||
    typeof handshake.nonce !== "string" ||
    typeof handshake.exp !== "number" ||
    handshake.exp <= Math.floor(Date.now() / 1000) ||
    !sameString(state, handshake.state)
  ) {
    return leave("/admin/sign-in/?problem=1");
  }

  const identity = await exchangeCodeForIdentity({
    code,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    // Must be the very address the first half sent to Google.
    redirectUri: `${origin}/api/admin/auth/callback/`,
    nonce: handshake.nonce,
  });

  if (!identity.ok && identity.kind === "failed") {
    console.error("[admin] sign-in did not complete:", identity.reason);
    return leave("/admin/sign-in/?problem=1");
  }

  if (!identity.ok || !sameString(identity.email, config.email)) {
    console.error("[admin] sign-in refused: not the owner's account");
    return leave("/admin/denied/");
  }

  const response = leave("/admin/");
  response.cookies.set(SESSION_COOKIE, createSessionValue(config), sessionCookieOptions());
  return response;
}
