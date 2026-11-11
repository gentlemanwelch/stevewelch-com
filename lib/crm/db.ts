import "server-only";

/*
 * The CRM database: a Supabase project, reached over plain fetch.
 *
 * WHY NO CLIENT LIBRARY. This site runs on three packages on purpose, and what
 * the CRM needs from the database is a handful of HTTP calls. Supabase exposes
 * every function in the `public` schema at /rest/v1/rpc/<name>, so "save this
 * inquiry" is one POST.
 *
 * TWO SETTINGS, both in the Vercel project and nowhere else:
 *
 *   SUPABASE_URL         — https://<project>.supabase.co
 *   SUPABASE_SECRET_KEY  — the project's SECRET key. It bypasses row-level
 *                          security, which is the point: every table refuses
 *                          the browser-facing keys outright, so this key on
 *                          this server is the only way in.
 *
 * The secret key is read here and only here. This file imports "server-only",
 * so importing it from a client component fails the build rather than
 * shipping the key's name to a browser.
 *
 * THE SITE WORKS WITHOUT EITHER. When they are unset the CRM is simply off:
 * `crmConfigured()` is false and nothing in this folder is called.
 */

/*
 * How long a save may hold up a visitor's form.
 *
 * A healthy call returns in a few hundred milliseconds. Past four seconds the
 * database is in trouble, and the inquiry matters more than the record of it:
 * the caller gives up on the save and carries on to the email.
 */
const TIMEOUT_MS = 4000;

function config(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  return url && key ? { url, key } : null;
}

export function crmConfigured(): boolean {
  return config() !== null;
}

/**
 * Calls one database function and returns what it returned.
 *
 * Throws on anything other than success — a missing setting, a timeout, a
 * refusal — with a message safe to log: it never contains the key.
 */
export async function crmRpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const c = config();
  if (!c) throw new Error("The CRM database is not configured.");

  const res = await fetch(`${c.url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      // Both headers, which is what Supabase's own client sends. `apikey`
      // identifies the key; the gateway swaps the matching Authorization for
      // the role's token. Sending both works for the new sb_secret_ keys and
      // for a legacy service-role key alike.
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${fn} answered ${res.status}: ${detail.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
