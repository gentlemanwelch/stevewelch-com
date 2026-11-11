import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/*
 * Who may open /admin: one Google account, and the cookie that remembers it.
 *
 * THE WHOLE ACCESS RULE IS ONE EMAIL ADDRESS. `ADMIN_GOOGLE_EMAIL` names the
 * single Google account that may sign in. There are no users, roles or
 * passwords here, and nothing to administer: Google proves who is at the
 * keyboard (lib/crm/google.ts), and this file decides whether that person is
 * the owner.
 *
 * FOUR SETTINGS, all in the Vercel project and nowhere else:
 *
 *   ADMIN_GOOGLE_EMAIL          — the one address allowed in
 *   ADMIN_SESSION_SECRET        — at least 32 random characters; signs the cookie
 *   GOOGLE_OAUTH_CLIENT_ID      — from the Google sign-in client
 *   GOOGLE_OAUTH_CLIENT_SECRET  — from the same place
 *
 * WITH ANY OF THEM MISSING THE DOOR IS SHUT, NOT OPEN. `adminConfig()` returns
 * null, no session can be read or made, and every admin page sends the
 * visitor to a sign-in page that says sign-in is not set up.
 *
 * THE COOKIE holds the address and an expiry, signed with HMAC-SHA256. It is
 * not encrypted because it holds nothing secret; it is signed because it must
 * not be forgeable. Three things are checked on EVERY request, not once at
 * sign-in: the signature, the expiry, and that the address is still the one
 * in `ADMIN_GOOGLE_EMAIL` — so changing that setting, or the secret, signs
 * everyone out at once.
 *
 * EVERY ADMIN PAGE, ROUTE AND ACTION CALLS `requireAdmin()` ITSELF. A layout
 * is not a guard: Next.js does not re-run a layout on navigation between its
 * pages, so a check that lived only there would be skipped on the second
 * page. There is deliberately no `proxy.ts`; the check sits beside the data
 * it protects.
 */

export const SESSION_COOKIE = "swc_admin";

/*
 * The short-lived cookie that ties a sign-in's two halves together: it is set
 * when the visitor is sent to Google and read when Google sends them back. It
 * is scoped to the sign-in routes, so no page ever receives it.
 */
export const HANDSHAKE_COOKIE = "swc_admin_signin";
export const HANDSHAKE_PATH = "/api/admin/auth/";
export const HANDSHAKE_SECONDS = 10 * 60;

/** How long a sign-in lasts. After this the owner signs in again. */
const SESSION_SECONDS = 7 * 24 * 60 * 60;

export type AdminConfig = {
  email: string;
  secret: string;
  clientId: string;
  clientSecret: string;
};

export function adminConfig(): AdminConfig | null {
  const email = process.env.ADMIN_GOOGLE_EMAIL?.trim().toLowerCase();
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  // A short secret is a guessable one. Refusing it here means a weak value
  // typed in a hurry shuts the door rather than propping it open.
  if (!email || !secret || secret.length < 32 || !clientId || !clientSecret) return null;
  return { email, secret, clientId, clientSecret };
}

/**
 * Signs a value for one purpose.
 *
 * The purpose is part of what is signed, so a signature made for the sign-in
 * handshake can never be presented as a session, or the other way round.
 */
export function signFor(purpose: string, value: string, secret: string): string {
  return createHmac("sha256", secret).update(`${purpose}:${value}`).digest("base64url");
}

/** Constant-time, and safe on strings of different lengths. */
export function sameString(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) {
    timingSafeEqual(y, y);
    return false;
  }
  return timingSafeEqual(x, y);
}

/** Packs a small object into `<body>.<signature>`. */
export function seal(purpose: string, data: Record<string, unknown>, secret: string): string {
  const body = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${body}.${signFor(purpose, body, secret)}`;
}

/** The object back, or null if the value is malformed or the signature is not ours. */
export function unseal(
  purpose: string,
  value: string | undefined,
  secret: string,
): Record<string, unknown> | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  if (!sameString(parts[1], signFor(purpose, parts[0], secret))) return null;
  try {
    const data: unknown = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function createSessionValue(config: AdminConfig, now = Date.now()): string {
  return seal(
    "session",
    { email: config.email, exp: Math.floor(now / 1000) + SESSION_SECONDS },
    config.secret,
  );
}

export function readSessionValue(
  value: string | undefined,
  config: AdminConfig,
  now = Date.now(),
): { email: string } | null {
  const data = unseal("session", value, config.secret);
  if (!data) return null;
  if (typeof data.exp !== "number" || data.exp <= Math.floor(now / 1000)) return null;
  if (typeof data.email !== "string" || !sameString(data.email, config.email)) return null;
  return { email: data.email };
}

/**
 * The address the visitor actually used to reach this site: scheme and host.
 *
 * NOT `new URL(request.url).origin`. Behind a proxy — which is how the site
 * runs on Vercel, and how `next start` runs too — the URL Next.js hands a
 * route can carry the server's own idea of its hostname rather than the one
 * in the visitor's address bar. Sign-in needs the real one twice: Google must
 * send the visitor back to the host they started on (the handshake cookie
 * lives there and nowhere else), and Sign out compares it with the page that
 * asked. The forwarded headers are what the platform sets to say what the
 * visitor typed; the plain Host header covers a server with no proxy.
 *
 * A caller who forges these headers can only change where THEIR OWN sign-in
 * is sent back to, and Google refuses any return address that is not
 * registered on the sign-in client.
 */
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const first = (value: string | null) => value?.split(",")[0]?.trim() || null;
  const host =
    first(request.headers.get("x-forwarded-host")) ?? first(request.headers.get("host")) ?? url.host;
  const scheme = first(request.headers.get("x-forwarded-proto")) ?? url.protocol.replace(":", "");
  return `${scheme}://${host}`;
}

/** What every cookie this area sets has in common. */
export function cookieOptions(maxAge: number, path = "/") {
  return {
    httpOnly: true,
    // Off only on a laptop running `next dev` over plain http.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path,
    maxAge,
  };
}

export function sessionCookieOptions() {
  return cookieOptions(SESSION_SECONDS);
}

/** The signed-in owner, or null. For route handlers, which answer for themselves. */
export async function adminSession(): Promise<{ email: string } | null> {
  const config = adminConfig();
  if (!config) return null;
  const store = await cookies();
  return readSessionValue(store.get(SESSION_COOKIE)?.value, config);
}

/** The signed-in owner, or a redirect to the sign-in page. For pages. */
export async function requireAdmin(): Promise<{ email: string }> {
  const session = await adminSession();
  if (!session) redirect("/admin/sign-in/");
  return session;
}
