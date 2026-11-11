import "server-only";

/*
 * "Sign in with Google", written out by hand.
 *
 * WHY NO LIBRARY. The site runs on three packages on purpose, and this is a
 * small, fixed conversation: send the visitor to Google, get a code back,
 * swap the code for a statement of who they are. Google documents each step
 * (developers.google.com/identity/openid-connect/openid-connect) and none of
 * them needs more than `fetch`.
 *
 * WHAT IS ASKED FOR: `openid email` and nothing else. Not the profile, not
 * the calendar. Reading the calendar is a separate consent on a later screen,
 * so the account that signs in and the account whose calendar is read can be
 * different ones.
 *
 * WHY THE TOKEN'S SIGNATURE IS NOT CHECKED. The identity token arrives in the
 * body of an HTTPS response from Google's own token endpoint, in exchange for
 * a code and this site's client secret. Google's guidance for exactly that
 * case is that the token can be trusted as coming from Google without
 * verifying its signature, because TLS has already proved who sent it. Its
 * CLAIMS are still checked, every one that matters: who issued it, who it was
 * issued to, that it has not expired, that it answers the question this site
 * asked (the nonce), and that Google has verified the address.
 *
 * NOTHING HERE DECIDES WHO IS ALLOWED IN. This file reports the address
 * Google vouches for. Whether that address is the owner's is decided in the
 * callback route, against `ADMIN_GOOGLE_EMAIL`.
 */

const AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";
const ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);

export function googleSignInUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
}): string {
  const url = new URL(AUTHORIZE);
  url.search = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: "openid email",
    state: input.state,
    nonce: input.nonce,
    // Always show the account chooser. Without it, a browser signed in to
    // the wrong Google account is sent straight back as that account, and
    // "Try a different account" would loop.
    prompt: "select_account",
  }).toString();
  return url.toString();
}

export type GoogleIdentity =
  | { ok: true; email: string }
  /** Google answered, and the address is real but unverified, or missing. */
  | { ok: false; kind: "unverified" }
  /** The exchange itself went wrong. Nothing is known about who it was. */
  | { ok: false; kind: "failed"; reason: string };

export async function exchangeCodeForIdentity(input: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  nonce: string;
}): Promise<GoogleIdentity> {
  let res: Response;
  try {
    res = await fetch(TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: input.code,
        client_id: input.clientId,
        client_secret: input.clientSecret,
        redirect_uri: input.redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    return { ok: false, kind: "failed", reason: err instanceof Error ? err.message : "network error" };
  }

  if (!res.ok) {
    // Google's error body names the problem ("invalid_grant", "redirect_uri_mismatch")
    // and contains no secret, so it is safe to log.
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    return { ok: false, kind: "failed", reason: `Google answered ${res.status}: ${detail}` };
  }

  const body = (await res.json().catch(() => null)) as { id_token?: unknown } | null;
  const claims = typeof body?.id_token === "string" ? readClaims(body.id_token) : null;
  if (!claims) return { ok: false, kind: "failed", reason: "no readable identity token" };

  if (typeof claims.iss !== "string" || !ISSUERS.has(claims.iss)) {
    return { ok: false, kind: "failed", reason: "the token was not issued by Google" };
  }
  if (claims.aud !== input.clientId) {
    return { ok: false, kind: "failed", reason: "the token was issued to a different client" };
  }
  if (typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now()) {
    return { ok: false, kind: "failed", reason: "the token has expired" };
  }
  if (claims.nonce !== input.nonce) {
    return { ok: false, kind: "failed", reason: "the token answers a different sign-in" };
  }
  if (typeof claims.email !== "string" || claims.email_verified !== true) {
    return { ok: false, kind: "unverified" };
  }
  return { ok: true, email: claims.email.trim().toLowerCase() };
}

/** The middle part of a JWT, as an object. Null if it is not one. */
function readClaims(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const data: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
