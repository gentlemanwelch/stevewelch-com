/*
 * Stand-ins for the outside services the site's server calls.
 *
 * Loaded into `next start` by the scripts/test-*.mjs checks, through
 * NODE_OPTIONS=--import, before Next.js itself. It replaces `fetch` for
 * exactly three destinations: Resend, the pretend CRM address the tests set
 * as SUPABASE_URL, and Google's token endpoint — and passes everything else
 * through untouched.
 *
 * The point is to run the REAL routes, built the way a deploy builds them,
 * with no key for any service, no email sent to anyone, and nobody's Google
 * account involved.
 *
 * Every intercepted call is appended to MOCK_LOG as one line of JSON. What
 * each service answers is read from MOCK_CONTROL on every call, so the test
 * changes the weather between cases without restarting the server.
 *
 * Does nothing unless both variables are set, so loading it by accident into
 * a real server changes nothing.
 */
import fs from "node:fs";

const LOG = process.env.MOCK_LOG;
const CONTROL = process.env.MOCK_CONTROL;

if (LOG && CONTROL) {
  const real = globalThis.fetch;
  const seen = new Map();

  const control = () => {
    try {
      return JSON.parse(fs.readFileSync(CONTROL, "utf8"));
    } catch {
      return {};
    }
  };

  const json = (status, value) =>
    new Response(JSON.stringify(value), {
      status,
      headers: { "content-type": "application/json" },
    });

  globalThis.fetch = async function mockFetch(input, init = {}) {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const toResend = url.startsWith("https://api.resend.com/");
    const toCrm = url.startsWith("http://crm.mock/");
    const toGoogle = url.startsWith("https://oauth2.googleapis.com/token");
    if (!toResend && !toCrm && !toGoogle) return real(input, init);

    const now = control();
    const headers = Object.fromEntries(new Headers(init.headers ?? {}).entries());
    // Google's token endpoint takes a form, the other two take JSON.
    const body =
      typeof init.body !== "string"
        ? null
        : toGoogle
          ? Object.fromEntries(new URLSearchParams(init.body))
          : JSON.parse(init.body);
    fs.appendFileSync(LOG, JSON.stringify({ url, headers, body }) + "\n");

    if (toGoogle) {
      /*
       * Google, answering the exchange of a sign-in code. `now.google.claims`
       * overrides any claim, so a test can make "Google" vouch for a stranger,
       * an unverified address, the wrong client, or an expired statement.
       * The signature is a placeholder: the site trusts this token because of
       * where it came from, not because of how it is signed.
       */
      const google = now.google ?? {};
      if (google.mode === "throw") throw new TypeError("fetch failed");
      if (google.mode === "refuse") return json(400, { error: "invalid_grant" });
      if (google.mode === "garbage") return json(200, { id_token: "not-a-token" });
      const part = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
      const claims = {
        iss: "https://accounts.google.com",
        aud: "test-client-id",
        exp: Math.floor(Date.now() / 1000) + 3600,
        email: "owner@example.test",
        email_verified: true,
        nonce: google.nonce,
        ...(google.claims ?? {}),
      };
      return json(200, {
        access_token: "unused",
        id_token: `${part({ alg: "RS256", typ: "JWT" })}.${part(claims)}.placeholder`,
      });
    }

    if (toCrm) {
      /*
       * A read of the leads table, for the CRM screens. `now.leads` is the
       * table; an `id=eq.` filter picks one row, as the real service would.
       * `now.leadsMode` makes the read fail or hang.
       */
      if (url.includes("/rest/v1/leads?")) {
        if (now.leadsMode === "error") return new Response('{"message":"permission denied for table leads"}', { status: 401 });
        if (now.leadsMode === "garbage") return json(200, { not: "a list" });
        const asked = new URL(url).searchParams;
        const wanted = asked.get("id");
        // The reports ask for real leads only, as a filter, and the real
        // service applies it. So does this one.
        const rows = (now.leads ?? []).filter((row) => asked.get("is_test") !== "is.false" || !row.is_test);
        return json(200, wanted ? rows.filter((row) => `eq.${row.id}` === wanted) : rows);
      }
      /* The ad numbers as last typed in: `now.adWeeks`, newest first. */
      if (url.includes("/rest/v1/ad_weeks?")) {
        if (now.adMode === "error") return new Response('{"message":"permission denied for table ad_weeks"}', { status: 401 });
        return json(200, (now.adWeeks ?? []).slice(0, 1));
      }
      /*
       * Something the owner did to a lead, or the ad numbers being saved.
       * `now.action` / `now.adSave` is what the database answers;
       * `now.writeMode: "error"` makes it fail outright.
       */
      if (url.endsWith("/rpc/crm_lead_action") || url.endsWith("/rpc/crm_save_ad_numbers")) {
        if (now.writeMode === "error") return new Response("the database is unavailable", { status: 503 });
        const answer = url.endsWith("/rpc/crm_lead_action") ? now.action : now.adSave;
        return json(200, answer ?? { ok: true, changed: true });
      }
      if (!url.endsWith("/rpc/crm_record_inquiry")) return json(200, true);
      if (now.crm === "error") {
        return new Response('relation "public.leads" does not exist', { status: 500 });
      }
      if (now.crm === "hang") {
        // Never answers. Only the caller's own timeout ends it.
        return new Promise((_, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(init.signal.reason ?? new Error("aborted")),
          );
        });
      }
      return json(200, {
        lead_id: "11111111-1111-4111-8111-111111111111",
        inquiry_id: "22222222-2222-4222-8222-222222222222",
        new_lead: true,
        new_inquiry: true,
      });
    }

    const kind = (headers["idempotency-key"] ?? "").startsWith("inquiry-ack/") ? "ack" : "notify";
    const mode = now[kind] ?? "ok";
    const count = seen.get(`${now.case}/${kind}`) ?? 0;
    seen.set(`${now.case}/${kind}`, count + 1);

    if (mode === "throw") throw new TypeError("fetch failed");
    if (mode === "fail") return json(500, { name: "internal_server_error", message: "boom" });
    if (mode === "conflict-always" || (mode === "conflict-once" && count === 0)) {
      return json(409, {
        name: "concurrent_idempotent_requests",
        message: "Same idempotency key used while original request is still in progress.",
      });
    }
    return json(200, { id: `re_${kind}` });
  };
}
