/*
 * Stand-ins for the two services the inquiry route calls.
 *
 * Loaded into `next start` by scripts/test-inquiry-route.mjs, through
 * NODE_OPTIONS=--import, before Next.js itself. It replaces `fetch` for
 * exactly two destinations — Resend, and the pretend CRM address the test
 * sets as SUPABASE_URL — and passes everything else through untouched.
 *
 * The point is to run the REAL route, built the way a deploy builds it, with
 * no key for either service and no email sent to anyone.
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
    if (!toResend && !toCrm) return real(input, init);

    const now = control();
    const headers = Object.fromEntries(new Headers(init.headers ?? {}).entries());
    const body = typeof init.body === "string" ? JSON.parse(init.body) : null;
    fs.appendFileSync(LOG, JSON.stringify({ url, headers, body }) + "\n");

    if (toCrm) {
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
