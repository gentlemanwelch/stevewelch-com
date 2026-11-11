/**
 * End-to-end check of the booking inquiry route (app/api/inquiry/route.ts).
 *
 * This is the one request on the site that carries money, and the route now
 * does three things in a fixed order — save to the CRM, email Steve, reply to
 * the organizer — where the failure of one must never cost the next. Those
 * rules are easy to break by accident and impossible to see by reading, so
 * this runs the real, built route against stand-ins for the two services it
 * calls (scripts/mock-fetch.mjs) and checks each rule.
 *
 * It needs no key and sends no email.
 *
 *   npm run build && node scripts/test-inquiry-route.mjs
 *
 * What it cannot cover is the two real services themselves: that Supabase
 * accepts the secret key, and that Resend honours the idempotency key. Those
 * are checked on a preview deployment.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

if (!existsSync(".next/BUILD_ID")) {
  console.error("No build found. Run `npm run build` first.");
  process.exit(1);
}

const dir = mkdtempSync(path.join(tmpdir(), "inquiry-route-"));
const LOG = path.join(dir, "calls.ndjson");
const CONTROL = path.join(dir, "control.json");

const OWNER = "owner@example.test";
const LEAD = "dana@northfield.example";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const EMAIL_ON = {
  RESEND_API_KEY: "re_test_key",
  INQUIRY_FROM_EMAIL: "website@send.example.test",
  INQUIRY_TO_EMAIL: OWNER,
};
const CRM_ON = { SUPABASE_URL: "http://crm.mock", SUPABASE_SECRET_KEY: "test-secret-not-a-key" };

const inquiry = (extra = {}) => ({
  name: "Dana Reyes",
  email: LEAD,
  organization: "Northfield Health",
  message: "Leadership offsite, 200 people.",
  eventName: "Leadership Summit",
  eventDate: "2027-03-12",
  budget: "$20,000 – $30,000",
  form: "contact",
  submission_id: "3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b",
  ...extra,
});

let caseNumber = 0;
let passed = 0;

/** Starts the built site with the given settings and hands back a `post`. */
async function withServer(label, settings, run) {
  const port = 4300 + Math.floor(Math.random() * 600);
  const env = { ...process.env };
  for (const name of [
    "VERCEL_ENV",
    "SUPABASE_URL",
    "SUPABASE_SECRET_KEY",
    "RESEND_API_KEY",
    "INQUIRY_FROM_EMAIL",
    "INQUIRY_TO_EMAIL",
  ]) {
    delete env[name];
  }
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    {
      env: {
        ...env,
        ...settings,
        NODE_OPTIONS: `--import ${pathToFileURL(path.resolve("scripts/mock-fetch.mjs")).href}`,
        MOCK_LOG: LOG,
        MOCK_CONTROL: CONTROL,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  child.stdout.on("data", (d) => (output += d));
  child.stderr.on("data", (d) => (output += d));

  const post = async (payload, weather = {}) => {
    writeFileSync(CONTROL, JSON.stringify({ ...weather, case: String(++caseNumber) }));
    writeFileSync(LOG, "");
    const started = Date.now();
    const res = await fetch(`http://127.0.0.1:${port}/api/inquiry/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const calls = readFileSync(LOG, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    return {
      status: res.status,
      json: await res.json(),
      ms: Date.now() - started,
      calls,
      saves: calls.filter((c) => c.url.endsWith("/rpc/crm_record_inquiry")),
      notes: calls.filter((c) => c.url.endsWith("/rpc/crm_note_inquiry_email")),
      notifies: calls.filter((c) => (c.headers["idempotency-key"] ?? "").startsWith("inquiry-notify/")),
      acks: calls.filter((c) => (c.headers["idempotency-key"] ?? "").startsWith("inquiry-ack/")),
    };
  };

  try {
    for (let i = 0; ; i++) {
      try {
        if ((await fetch(`http://127.0.0.1:${port}/robots.txt`)).ok) break;
      } catch {
        /* not listening yet */
      }
      if (i > 100) throw new Error(`The server did not start.\n${output}`);
      await new Promise((r) => setTimeout(r, 200));
    }
    console.log(`\n${label}`);
    await run(post);
  } finally {
    child.kill();
  }
}

async function check(name, fn) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

// ---------------------------------------------------------------------------
// The live site, CRM switched on
// ---------------------------------------------------------------------------
await withServer("Live site, CRM on", { ...EMAIL_ON, ...CRM_ON, VERCEL_ENV: "production" }, async (post) => {
  let firstNotifyKey = "";
  let firstAckKey = "";

  await check("saves first, then emails Steve, then replies to the organizer", async () => {
    const r = await post(inquiry({ gclid: "Cj0abc", landingPage: "/lp/ai-change-speaker/" }));
    assert.equal(r.status, 200);
    assert.deepEqual(r.json, { ok: true });
    assert.equal(r.calls[0].url, "http://crm.mock/rest/v1/rpc/crm_record_inquiry");
    assert.ok((r.calls[1].headers["idempotency-key"] ?? "").startsWith("inquiry-notify/"));

    const save = r.saves[0];
    assert.equal(save.headers.apikey, "test-secret-not-a-key");
    assert.equal(save.headers.authorization, "Bearer test-secret-not-a-key");
    const p = save.body.p;
    assert.equal(p.submission_id, "3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b");
    assert.equal(p.email, LEAD);
    assert.equal(p.form, "contact");
    assert.equal(p.environment, "production");
    assert.equal(p.is_test, false);
    assert.equal(p.budget_band, "$20,000 – $30,000");
    assert.equal(p.event_date, "2027-03-12");
    assert.equal(p.gclid, "Cj0abc");
    assert.equal(p.landing_page, "/lp/ai-change-speaker/");

    const notify = r.notifies[0].body;
    assert.deepEqual(notify.to, [OWNER]);
    assert.equal(notify.reply_to, LEAD);
    assert.equal(notify.subject, "[Ads] Speaking inquiry — Northfield Health (Leadership Summit)");
    assert.ok(!notify.html.includes("not saved"));
    assert.ok(!notify.html.includes("Test inquiry"));

    const ack = r.acks[0].body;
    assert.deepEqual(ack.to, [LEAD]);
    assert.equal(ack.reply_to, OWNER);
    assert.ok(!ack.subject.includes("[Test"));

    assert.deepEqual(
      r.notes.map((n) => [n.body.p_kind, n.body.p_ok, n.body.p_detail]),
      [
        ["notify", true, { resend_id: "re_notify" }],
        ["ack", true, { resend_id: "re_ack" }],
      ],
    );
    firstNotifyKey = r.notifies[0].headers["idempotency-key"];
    firstAckKey = r.acks[0].headers["idempotency-key"];
    assert.ok(firstNotifyKey.startsWith("inquiry-notify/3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b/1/"));
  });

  await check("the same submission sent again carries the same keys, so nothing is sent twice", async () => {
    const r = await post(inquiry({ gclid: "Cj0abc", landingPage: "/lp/ai-change-speaker/" }));
    assert.equal(r.status, 200);
    assert.equal(r.saves[0].body.p.submission_id, "3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b");
    assert.equal(r.notifies[0].headers["idempotency-key"], firstNotifyKey);
    assert.equal(r.acks[0].headers["idempotency-key"], firstAckKey);
  });

  await check("a retry after an error is a new attempt: same record, new keys, really sent", async () => {
    const r = await post(inquiry({ gclid: "Cj0abc", landingPage: "/lp/ai-change-speaker/", attempt: 2 }));
    assert.equal(r.status, 200);
    assert.equal(r.saves[0].body.p.submission_id, "3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b");
    assert.ok(r.notifies[0].headers["idempotency-key"].startsWith("inquiry-notify/3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b/2/"));
    assert.ok(r.acks[0].headers["idempotency-key"].startsWith("inquiry-ack/3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b/2/"));
    assert.notEqual(r.notifies[0].headers["idempotency-key"], firstNotifyKey);
    // The fingerprint half is unchanged: it is the same message.
    assert.equal(r.notifies[0].headers["idempotency-key"].split("/").pop(), firstNotifyKey.split("/").pop());
  });

  await check("a nonsense attempt number is treated as the first attempt", async () => {
    for (const attempt of [0, -3, 1.5, "2", 9999, null]) {
      const r = await post(inquiry({ gclid: "Cj0abc", landingPage: "/lp/ai-change-speaker/", attempt }));
      assert.equal(r.notifies[0].headers["idempotency-key"], firstNotifyKey, `attempt ${JSON.stringify(attempt)}`);
    }
  });

  await check("a corrected resubmission is sent again, not swallowed as a duplicate", async () => {
    const r = await post(inquiry({ gclid: "Cj0abc", landingPage: "/lp/ai-change-speaker/", message: "Corrected." }));
    assert.notEqual(r.notifies[0].headers["idempotency-key"], firstNotifyKey);
    assert.ok(r.notifies[0].headers["idempotency-key"].startsWith("inquiry-notify/3f2b8c1e-"));
  });

  await check("a failed save costs nothing: both emails go, and Steve's says so", async () => {
    const r = await post(inquiry(), { crm: "error" });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json, { ok: true });
    assert.ok(r.notifies[0].body.html.includes("This inquiry was not saved to the CRM."));
    assert.ok(r.notifies[0].body.html.includes("crm_record_inquiry answered 500"));
    assert.equal(r.acks.length, 1);
    assert.equal(r.notes.length, 0);
  });

  await check("a database that never answers is given up on, and the inquiry still arrives", async () => {
    const r = await post(inquiry(), { crm: "hang" });
    assert.equal(r.status, 200);
    assert.ok(r.ms >= 3500 && r.ms < 9000, `took ${r.ms}ms`);
    assert.ok(r.notifies[0].body.html.includes("This inquiry was not saved to the CRM."));
    assert.equal(r.acks.length, 1);
  });

  await check("if Steve's email fails the organizer is told, and the record knows", async () => {
    const r = await post(inquiry(), { notify: "fail" });
    assert.equal(r.status, 502);
    assert.equal(r.json.error, "The message could not be sent.");
    assert.equal(r.acks.length, 0);
    assert.equal(r.notes.length, 1);
    assert.equal(r.notes[0].body.p_kind, "notify");
    assert.equal(r.notes[0].body.p_ok, false);
    assert.ok(r.notes[0].body.p_detail.error.startsWith("Resend 500"));
  });

  await check("a network failure reaching Resend is a clean error, not a crash", async () => {
    const r = await post(inquiry(), { notify: "throw" });
    assert.equal(r.status, 502);
    assert.equal(r.json.error, "The message could not be sent.");
  });

  await check("a failed reply to the organizer never fails the inquiry", async () => {
    const r = await post(inquiry(), { ack: "fail" });
    assert.equal(r.status, 200);
    assert.deepEqual(
      r.notes.map((n) => [n.body.p_kind, n.body.p_ok]),
      [
        ["notify", true],
        ["ack", false],
      ],
    );
  });

  await check("a twin request in flight is waited for, then asked again with the same key", async () => {
    const r = await post(inquiry(), { notify: "conflict-once" });
    assert.equal(r.status, 200);
    assert.equal(r.notifies.length, 2);
    assert.equal(r.notifies[0].headers["idempotency-key"], r.notifies[1].headers["idempotency-key"]);
    assert.equal(r.acks.length, 1);
  });

  await check("a twin still in flight is trusted to deliver; the organizer sees no error", async () => {
    const r = await post(inquiry(), { notify: "conflict-always" });
    assert.equal(r.status, 200);
    assert.equal(r.notifies.length, 2);
  });

  await check("the honeypot answers 200 and does nothing", async () => {
    const r = await post(inquiry({ website: "http://spam.example" }));
    assert.equal(r.status, 200);
    assert.equal(r.calls.length, 0);
  });

  await check("an invalid inquiry is refused before anything is saved or sent", async () => {
    const bad = await post(inquiry({ email: "not-an-address" }));
    assert.equal(bad.status, 400);
    assert.equal(bad.calls.length, 0);
    const empty = await post(inquiry({ message: "" }));
    assert.equal(empty.status, 400);
    assert.equal(empty.calls.length, 0);
  });

  await check("a form with no id (an old cached copy) is given a fresh one each time", async () => {
    const a = await post(inquiry({ submission_id: undefined }));
    const b = await post(inquiry({ submission_id: "nonsense" }));
    const idA = a.saves[0].body.p.submission_id;
    const idB = b.saves[0].body.p.submission_id;
    assert.match(idA, UUID);
    assert.match(idB, UUID);
    assert.notEqual(idA, idB);
    assert.equal(a.status, 200);
  });

  await check("an inquiry from the owner's own address is a test, even on the live site", async () => {
    const r = await post(inquiry({ email: "Owner@Example.test" }));
    assert.equal(r.saves[0].body.p.is_test, true);
    assert.ok(r.notifies[0].body.subject.startsWith("[Test] Speaking inquiry"));
    assert.ok(r.notifies[0].body.html.includes("Test inquiry."));
    assert.ok(r.notifies[0].body.html.includes("marked as a test in the CRM"));
  });

  await check("a landing form cached from before forms named themselves is still a landing inquiry", async () => {
    const r = await post(inquiry({ form: undefined, source: "Google Ads landing page: ai-change-speaker" }));
    assert.equal(r.saves[0].body.p.form, "landing");
    const named = await post(inquiry({ form: "landing:ai-change-speaker" }));
    assert.equal(named.saves[0].body.p.form, "landing:ai-change-speaker");
  });
});

// ---------------------------------------------------------------------------
// A preview build
// ---------------------------------------------------------------------------
await withServer("Preview build, CRM on", { ...EMAIL_ON, ...CRM_ON, VERCEL_ENV: "preview" }, async (post) => {
  await check("off the live site, the reply goes to the owner and never to the address typed", async () => {
    const r = await post(inquiry());
    assert.equal(r.status, 200);
    assert.equal(r.saves[0].body.p.is_test, true);
    assert.equal(r.saves[0].body.p.environment, "preview");
    assert.ok(r.notifies[0].body.subject.startsWith("[Test] "));
    assert.deepEqual(r.acks[0].body.to, [OWNER]);
    assert.ok(r.acks[0].body.subject.startsWith(`[Test: would go to ${LEAD}] `));
    assert.ok(!JSON.stringify(r.acks[0].body.to).includes(LEAD));
  });
});

// ---------------------------------------------------------------------------
// The CRM switched off: the two settings absent
// ---------------------------------------------------------------------------
await withServer("Live site, CRM off", { ...EMAIL_ON, VERCEL_ENV: "production" }, async (post) => {
  await check("with no database settings nothing is saved and both emails go as before", async () => {
    const r = await post(inquiry());
    assert.equal(r.status, 200);
    assert.equal(r.saves.length, 0);
    assert.equal(r.notes.length, 0);
    assert.equal(r.notifies.length, 1);
    assert.equal(r.acks.length, 1);
    assert.equal(r.notifies[0].body.subject, "Speaking inquiry — Northfield Health (Leadership Summit)");
    assert.ok(!r.notifies[0].body.html.includes("not saved"));
    assert.deepEqual(r.acks[0].body.to, [LEAD]);
  });
});

// ---------------------------------------------------------------------------
// Email not connected
// ---------------------------------------------------------------------------
await withServer("Email not connected, CRM on", { ...CRM_ON, VERCEL_ENV: "production" }, async (post) => {
  await check("the inquiry is still saved, marked as never notified, and the form says so", async () => {
    const r = await post(inquiry());
    assert.equal(r.status, 503);
    assert.equal(r.saves.length, 1);
    assert.equal(r.notes.length, 1);
    assert.equal(r.notes[0].body.p_ok, false);
    assert.equal(r.notifies.length + r.acks.length, 0);
  });
});

console.log(`\n${passed} checks passed.`);
