/**
 * End-to-end check of the CRM's lead screens: the Leads list at /admin/ and
 * a lead's own page at /admin/leads/<id>/.
 *
 * Two kinds of claim are tested. First, that these screens show a prospect's
 * details to the owner and to nobody else, and never ask the database for
 * more than they show. Second, that what they show is right: the counts, the
 * labels, what needs the owner, what is hidden.
 *
 * Runs the real, built site against a stand-in for the database
 * (scripts/mock-fetch.mjs). Every person in it is made up.
 *
 *   npm run build && node scripts/test-admin-leads.mjs
 *
 * What it cannot cover is the database itself: that the real service accepts
 * these queries. That is checked on a preview, signed in.
 */
import assert from "node:assert/strict";
import { OWNER, SETTINGS, check, passedCount, session, withServer, words } from "./admin-test-kit.mjs";

// ---------------------------------------------------------------------------
// Made-up leads, shaped as the database returns them
// ---------------------------------------------------------------------------
const hoursAgo = (h) => new Date(Date.now() - h * 3_600_000).toISOString();
const ID = {
  dana: "11111111-1111-4111-8111-111111111111",
  marcus: "22222222-2222-4222-8222-222222222222",
  priya: "33333333-3333-4333-8333-333333333333",
  test: "44444444-4444-4444-8444-444444444444",
  nobody: "99999999-9999-4999-8999-999999999999",
};
const inquiry = (id, extra = {}) => ({
  id,
  created_at: hoursAgo(5),
  form: "contact",
  is_test: false,
  environment: "production",
  message: "A message.",
  event_name: null,
  event_date: null,
  location: null,
  audience_size: null,
  format: null,
  budget_band: null,
  budget_answer: null,
  source: null,
  landing_page: null,
  gclid: null,
  wbraid: null,
  gbraid: null,
  utm_source: null,
  utm_term: null,
  notified_at: hoursAgo(5),
  notify_error: null,
  ...extra,
});

const LEADS = [
  {
    id: ID.dana,
    name: "Dana Reyes",
    organization: "Northfield Health",
    email: "dana.reyes@northfieldhealth.example",
    stage: "inquiry",
    is_test: false,
    created_at: hoursAgo(3),
    inquiries: [
      inquiry("a1111111-1111-4111-8111-111111111111", {
        created_at: hoursAgo(3),
        form: "landing:ai-change-speaker",
        gclid: "Cj0abc",
        utm_term: "ai keynote speaker",
        budget_band: "$20,000 – $30,000",
        event_date: "2027-03-12",
        event_name: "Leadership Summit",
        audience_size: "300",
        message: 'About 300 directors. <script>alert("x")</script> We want a plan, not a pep talk.',
        notified_at: hoursAgo(3),
      }),
    ],
    lead_events: [
      { id: 1, at: hoursAgo(3), kind: "inquiry_received", actor: "system", detail: {}, inquiry_id: "a1111111-1111-4111-8111-111111111111" },
      { id: 2, at: hoursAgo(3), kind: "notify_sent", actor: "system", detail: { resend_id: "re_1" }, inquiry_id: "a1111111-1111-4111-8111-111111111111" },
      { id: 3, at: hoursAgo(3), kind: "ack_sent", actor: "system", detail: {}, inquiry_id: "a1111111-1111-4111-8111-111111111111" },
    ],
  },
  {
    id: ID.marcus,
    name: "Marcus <b>Lee</b>",
    organization: "Calder Logistics",
    email: "marcus@calder.example",
    stage: "inquiry",
    is_test: false,
    created_at: hoursAgo(1),
    inquiries: [
      inquiry("b2222222-2222-4222-8222-222222222222", {
        created_at: hoursAgo(1),
        notified_at: null,
        notify_error: "Resend 500: boom",
        message: "Is the roundtable something you run for 400 people?",
      }),
    ],
    lead_events: [
      { id: 4, at: hoursAgo(1), kind: "inquiry_received", actor: "system", detail: {}, inquiry_id: "b2222222-2222-4222-8222-222222222222" },
      { id: 5, at: hoursAgo(1), kind: "notify_failed", actor: "system", detail: { error: "Resend 500: boom" }, inquiry_id: "b2222222-2222-4222-8222-222222222222" },
    ],
  },
  {
    id: ID.priya,
    name: "Priya Nair",
    organization: "Westmark Credit Union League",
    email: "priya@westmark.example",
    stage: "inquiry",
    is_test: false,
    created_at: hoursAgo(80),
    inquiries: [
      inquiry("c3333333-3333-4333-8333-333333333333", { created_at: hoursAgo(30), message: "Following up with a date.", event_date: "Q2 2027" }),
      inquiry("c3333333-3333-4333-8333-33333333333a", { created_at: hoursAgo(80), message: "First note, no date yet.", utm_source: "newsletter" }),
    ],
    lead_events: [
      { id: 6, at: hoursAgo(80), kind: "inquiry_received", actor: "system", detail: {}, inquiry_id: "c3333333-3333-4333-8333-33333333333a" },
      { id: 7, at: hoursAgo(30), kind: "inquiry_received", actor: "system", detail: {}, inquiry_id: "c3333333-3333-4333-8333-333333333333" },
    ],
  },
  {
    id: ID.test,
    name: "Test inquiry",
    organization: "Sent from the CRM",
    email: OWNER,
    stage: "inquiry",
    is_test: true,
    created_at: hoursAgo(2),
    inquiries: [inquiry("d4444444-4444-4444-8444-444444444444", { created_at: hoursAgo(2), is_test: true })],
    lead_events: [
      { id: 8, at: hoursAgo(2), kind: "inquiry_received", actor: "system", detail: {}, inquiry_id: "d4444444-4444-4444-8444-444444444444" },
    ],
  },
];
// The list query asks for events newest first; the page asks oldest first.
const forList = (leads) => leads.map((l) => ({ ...l, lead_events: [...l.lead_events].reverse() }));

await withServer("The lead screens", SETTINGS, async (site) => {
  // -------------------------------------------------------------------------
  console.log("  Who can see them");

  await check("signed out, neither screen shows anything, and the database is never asked", async () => {
    site.database({ leads: forList(LEADS) });
    for (const pathname of ["/admin/", `/admin/leads/${ID.dana}/`, "/admin/?tests=1"]) {
      const res = await site.get(pathname);
      assert.equal(res.status, 307, pathname);
      assert.equal(site.where(res), "/admin/sign-in/", pathname);
      const body = await res.text();
      assert.ok(!body.includes("Dana Reyes") && !body.includes("Northfield"), `${pathname} leaked a lead`);
    }
    assert.equal(site.reads().length, 0, "a signed-out request reached the database");
  });

  await check("a session for anyone but the owner is signed out too", async () => {
    site.database({ leads: forList(LEADS) });
    const res = await site.get(`/admin/leads/${ID.dana}/`, session("stranger@example.test"));
    assert.equal(site.where(res), "/admin/sign-in/");
    assert.equal(site.reads().length, 0);
  });

  // -------------------------------------------------------------------------
  console.log("  The Leads list");

  await check("it lists real leads, newest activity first, and counts what needs you", async () => {
    site.database({ leads: forList(LEADS) });
    const { status, html } = await site.page("/admin/");
    assert.equal(status, 200);
    const text = words(html);
    assert.ok(text.includes("3 inquiries. 1 needs you."), text.slice(0, 400));
    const order = ["Marcus", "Dana Reyes", "Priya Nair"].map((name) => html.indexOf(`<strong class="block text-[15px] text-navy">${name}`));
    assert.ok(order.every((at) => at > 0), "a lead is missing from the table");
    assert.deepEqual([...order].sort((a, b) => a - b), order, "the leads are not in order of latest activity");
    assert.match(html, /<title>Leads \| Speaking CRM<\/title>/);
  });

  await check("each row says where they came from, their budget, the event, and the last thing that happened", async () => {
    site.database({ leads: forList(LEADS) });
    const text = words((await site.page("/admin/")).html);
    assert.ok(text.includes("Google Ads · AI page"));
    assert.ok(text.includes("Organic · contact page"));
    assert.ok(text.includes("$20,000 – $30,000"));
    assert.ok(text.includes("Not asked"));
    assert.ok(text.includes("12 Mar 2027"));
    assert.ok(text.includes("Q2 2027"));
    assert.ok(text.includes("Not decided"));
    assert.ok(text.includes("Instant reply sent · 3 hours ago"));
    assert.ok(text.includes("Email to you failed · 1 hour ago"));
    assert.ok(text.includes("Inquiry received · yesterday"));
    assert.ok(text.includes("New inquiry"));
  });

  await check("an inquiry the inbox never got is put at the top, not left in the table", async () => {
    site.database({ leads: forList(LEADS) });
    const { html } = await site.page("/admin/");
    const text = words(html);
    assert.ok(text.includes("The email to you failed"));
    assert.ok(text.includes("This inquiry was saved here, but the email telling you about it did not send."));
    assert.ok(html.indexOf("The email to you failed") < html.indexOf("Budget answer"), "the card is below the table");
    const only = words((await site.page("/admin/?show=needs")).html);
    assert.ok(only.includes("Calder Logistics"));
    assert.ok(!only.includes("Westmark Credit Union League"), "the filter did not filter");
  });

  await check("test inquiries are hidden unless asked for", async () => {
    site.database({ leads: forList(LEADS) });
    const hidden = words((await site.page("/admin/")).html);
    assert.ok(!hidden.includes("Sent from the CRM"), "a test is in the list");
    assert.ok(hidden.includes("1 test inquiry is hidden. Show them"));
    const shown = await site.page("/admin/?tests=1");
    const text = words(shown.html);
    assert.ok(text.includes("Sent from the CRM"));
    assert.ok(text.includes("Hide test inquiries"));
    // Still counted apart: the summary is about prospects.
    assert.ok(text.includes("3 inquiries. 1 needs you."));
  });

  await check("no email address is asked for or shown, and a lead is addressed by its record id", async () => {
    site.database({ leads: forList(LEADS) });
    const { html } = await site.page("/admin/?tests=1");
    const select = new URL(site.reads()[0].url).searchParams.get("select");
    assert.ok(!/(^|[,(])email([,)]|$)/.test(select), `the list asked for email: ${select}`);
    assert.ok(!select.includes("reply_token"), "the list asked for the reply token");
    assert.ok(!select.includes("message"), "the list asked for what they wrote");
    assert.ok(html.includes(`href="/admin/leads/${ID.dana}/"`));
    const links = [...html.matchAll(/href="(\/admin\/[^"]*)"/g)].map((m) => m[1]);
    for (const link of links) {
      assert.ok(!/@|dana|marcus|priya|northfield/i.test(link), `a link carries a person: ${link}`);
    }
  });

  await check("a name is shown as text, never run as markup", async () => {
    site.database({ leads: forList(LEADS) });
    const { html } = await site.page("/admin/");
    assert.ok(html.includes("Marcus &lt;b&gt;Lee&lt;/b&gt;"));
    assert.ok(!html.includes("<strong class=\"block text-[15px] text-navy\">Marcus <b>Lee</b>"));
  });

  await check("before the first inquiry: an explanation, a test button, and what is connected", async () => {
    site.database({ leads: [] });
    const { status, html } = await site.page("/admin/");
    assert.equal(status, 200);
    const text = words(html);
    assert.ok(text.includes("No inquiries yet."));
    assert.ok(text.includes("Nothing has come in yet."));
    assert.ok(text.includes("Send a test inquiry to myself"));
    const form = /<form[^>]*action="\/api\/admin\/test-inquiry\/"[^>]*>/.exec(html)?.[0] ?? "";
    assert.ok(form.includes('method="post"'), "the test button is not a form that posts");
    assert.ok(text.includes("Is everything connected?"));
    assert.match(text, /Inquiry form\s+Connected/);
    assert.match(text, /Email sending\s+Connected/);
    assert.match(text, /Google Calendar Booked calls will not appear here until it is\s+Not connected/);
    assert.match(text, /Follow-up emails Emails 2 and 3 are off until you turn them on\s+Off/);
    assert.ok(!text.includes("hidden."));
  });

  await check("when only tests exist, it is still 'no inquiries yet', and the tests are one click away", async () => {
    site.database({ leads: forList(LEADS.filter((l) => l.is_test)) });
    const text = words((await site.page("/admin/")).html);
    assert.ok(text.includes("No inquiries yet."));
    assert.ok(text.includes("Nothing has come in yet."));
    assert.ok(text.includes("1 test inquiry is hidden. Show them"));
  });

  await check("a database that cannot be read says so, and never looks like an empty list", async () => {
    for (const leadsMode of ["error", "garbage"]) {
      site.database({ leads: forList(LEADS), leadsMode });
      const { status, html } = await site.page("/admin/");
      assert.equal(status, 200, leadsMode);
      const text = words(html);
      assert.ok(text.includes("The lead records could not be read."), leadsMode);
      assert.ok(text.includes("Inquiries are still reaching your inbox."), leadsMode);
      assert.ok(!text.includes("No inquiries yet."), `${leadsMode}: an unreadable list was shown as empty`);
      assert.ok(!text.includes("Nothing has come in yet."), leadsMode);
    }
  });

  // -------------------------------------------------------------------------
  console.log("  A lead's page");

  await check("the brief: who, where from, budget, when, and what they wrote", async () => {
    site.database({ leads: LEADS });
    const { status, html } = await site.page(`/admin/leads/${ID.dana}/`);
    assert.equal(status, 200);
    const text = words(html);
    assert.ok(text.includes("Dana Reyes"));
    assert.ok(text.includes("Northfield Health · dana.reyes@northfieldhealth.example"));
    assert.ok(text.includes("Brief for the call"));
    assert.ok(text.includes("Google Ads · searched “ai keynote speaker” · AI ad page"));
    assert.ok(text.includes("$20,000 – $30,000"));
    assert.ok(text.includes("The range they chose"));
    assert.ok(text.includes("12 March 2027"));
    assert.ok(text.includes("Leadership Summit"));
    assert.ok(text.includes("Audience size 300"));
    assert.ok(text.includes("We want a plan, not a pep talk."));
    assert.match(html, /<title>Lead \| Speaking CRM<\/title>/);
    assert.ok(!html.includes("<title>Dana"), "the tab title names the lead");
  });

  await check("what they wrote is shown as text, never run as markup", async () => {
    site.database({ leads: LEADS });
    const { html } = await site.page(`/admin/leads/${ID.dana}/`);
    assert.ok(html.includes("&lt;script&gt;alert("), "the message was not escaped");
    assert.ok(!/<script>alert\(/.test(html), "the message's script tag is live in the page");
  });

  await check("the timeline tells it in order, and says how they arrived", async () => {
    site.database({ leads: LEADS });
    const { html } = await site.page(`/admin/leads/${ID.dana}/`);
    const text = words(html);
    const order = ["Inquiry received", "Inquiry emailed to you", "Instant reply sent to them"].map((t) => text.indexOf(t));
    assert.ok(order.every((at) => at > 0));
    assert.deepEqual([...order].sort((a, b) => a - b), order);
    assert.ok(text.includes("From the AI ad page, after a Google ad click"));
  });

  await check("a lead whose email to you failed says so, with the reason", async () => {
    site.database({ leads: LEADS });
    const text = words((await site.page(`/admin/leads/${ID.marcus}/`)).html);
    assert.ok(text.includes("The email to you failed"));
    assert.ok(text.includes("Resend 500: boom"));
    assert.ok(text.includes("From the contact page"));
  });

  await check("a second inquiry from the same person is on the same page, the latest as the brief", async () => {
    site.database({ leads: LEADS });
    const text = words((await site.page(`/admin/leads/${ID.priya}/`)).html);
    assert.ok(text.includes("Following up with a date."));
    assert.ok(text.includes("Earlier inquiries"));
    assert.ok(text.includes("First note, no date yet."));
    assert.ok(text.includes("Newsletter · contact page"));
    assert.ok(text.indexOf("Following up with a date.") < text.indexOf("Earlier inquiries"));
  });

  await check("a test is labelled as one on its own page", async () => {
    site.database({ leads: LEADS });
    const text = words((await site.page(`/admin/leads/${ID.test}/`)).html);
    assert.ok(text.includes("This is a test, not a prospect."));
  });

  await check("it asks the database for that one lead, and not for the reply token", async () => {
    site.database({ leads: LEADS });
    await site.page(`/admin/leads/${ID.dana}/`);
    const reads = site.reads();
    assert.equal(reads.length, 1);
    const params = new URL(reads[0].url).searchParams;
    assert.equal(params.get("id"), `eq.${ID.dana}`);
    assert.ok(!params.get("select").includes("reply_token"));
    assert.equal(reads[0].headers.apikey, "test-secret-not-a-key");
  });

  await check("an address that is not a record id never reaches the database", async () => {
    site.database({ leads: LEADS });
    for (const bad of ["not-an-id", "1", `${ID.dana}&select=*`, "..%2F..%2Fsecret", `${ID.dana.slice(0, -1)}`]) {
      const { status } = await site.page(`/admin/leads/${bad}/`);
      assert.equal(status, 404, bad);
    }
    assert.equal(site.reads().length, 0, "a malformed id was sent to the database");
  });

  await check("a lead that does not exist gets the CRM's own 'not here', with no analytics and no site menu", async () => {
    site.database({ leads: LEADS });
    const { status, html } = await site.page(`/admin/leads/${ID.nobody}/`);
    assert.equal(status, 404);
    // A "not here" from a page built on demand arrives as the page's data
    // and is drawn by the browser, so it is looked for in the source, not in
    // the markup. A browser check covers what it looks like.
    assert.ok(html.includes("That page isn’t here."));
    assert.ok(html.includes("Back to Leads"));
    assert.ok(!/<script[^>]*type="application\/ld\+json"/.test(html), "the public entity markup is on a CRM page");
    assert.ok(!/<(script|link)[^>]*googletagmanager/.test(html));
    assert.ok(!/<header[^>]*>[\s\S]*Build Your Keynote/.test(html), "the public site's header is on a CRM page");
  });

  await check("an unreadable database is said plainly here too", async () => {
    site.database({ leads: LEADS, leadsMode: "error" });
    const { status, html } = await site.page(`/admin/leads/${ID.dana}/`);
    assert.equal(status, 200);
    assert.ok(words(html).includes("The lead records could not be read."));
  });

  await check("no lead screen carries analytics or the public entity markup", async () => {
    site.database({ leads: forList(LEADS) });
    for (const pathname of ["/admin/", "/admin/?tests=1"]) {
      const { html } = await site.page(pathname);
      assert.ok(!/<script[^>]*type="application\/ld\+json"/.test(html), pathname);
      assert.ok(!/<(script|link)[^>]*googletagmanager/.test(html), pathname);
      assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    }
    site.database({ leads: LEADS });
    const lead = await site.page(`/admin/leads/${ID.dana}/`);
    assert.ok(!/<script[^>]*type="application\/ld\+json"/.test(lead.html));
    assert.match(lead.html, /<meta name="robots" content="noindex, nofollow"/);
    assert.ok((lead.res.headers.get("cache-control") ?? "").includes("no-store"));
  });

  // -------------------------------------------------------------------------
  console.log("  The test button");

  await check("it sends a real inquiry through the real form, from the owner's own address", async () => {
    site.database({ leads: [] });
    const res = await site.post("/api/admin/test-inquiry/", { origin: site.origin, cookie: session() });
    assert.equal(res.status, 303);
    assert.equal(site.where(res), "/admin/?tests=1&sent=ok");
    const calls = site.calls();
    const save = calls.find((c) => c.url.endsWith("/rpc/crm_record_inquiry"));
    assert.ok(save, "the test inquiry was not saved");
    assert.equal(save.body.p.email, OWNER);
    assert.equal(save.body.p.is_test, true);
    assert.equal(save.body.p.form, "contact");
    assert.equal(save.body.p.organization, "Sent from the CRM");
    const emails = calls.filter((c) => c.url.startsWith("https://api.resend.com/"));
    assert.equal(emails.length, 2);
    for (const email of emails) assert.deepEqual(email.body.to, [OWNER]);
    assert.ok(emails[0].body.subject.startsWith("[Test] "));
    const after = words((await site.page("/admin/?tests=1&sent=ok")).html);
    assert.ok(after.includes("A test inquiry was sent."));
  });

  await check("if the form fails, the button says so", async () => {
    site.database({ leads: [], notify: "fail" });
    const res = await site.post("/api/admin/test-inquiry/", { origin: site.origin, cookie: session() });
    assert.equal(site.where(res), "/admin/?tests=1&sent=failed");
    const after = words((await site.page("/admin/?tests=1&sent=failed")).html);
    assert.ok(after.includes("The test inquiry could not be sent."));
  });

  await check("only the owner can press it, and only from this site's own page", async () => {
    site.database({ leads: [] });
    const signedOut = await site.post("/api/admin/test-inquiry/", { origin: site.origin });
    assert.equal(signedOut.status, 303);
    assert.equal(site.where(signedOut), "/admin/sign-in/");
    const elsewhere = await site.post("/api/admin/test-inquiry/", { origin: "https://evil.example", cookie: session() });
    assert.equal(elsewhere.status, 403);
    const noOrigin = await site.post("/api/admin/test-inquiry/", { cookie: session() });
    assert.equal(noOrigin.status, 403);
    const byLink = await site.get("/api/admin/test-inquiry/", session());
    assert.equal(byLink.status, 405);
    assert.equal(site.calls().length, 0, "something was sent");
  });
});

// ---------------------------------------------------------------------------
// The database not connected at all
// ---------------------------------------------------------------------------
await withServer(
  "Database not connected",
  { ...SETTINGS, SUPABASE_URL: "", SUPABASE_SECRET_KEY: "" },
  async (site) => {
    await check("the list says the records cannot be read, rather than 'no inquiries yet'", async () => {
      site.database({});
      const { status, html } = await site.page("/admin/");
      assert.equal(status, 200);
      const text = words(html);
      assert.ok(text.includes("The lead records could not be read."));
      assert.ok(text.includes("The CRM database is not connected."));
      assert.ok(!text.includes("No inquiries yet."));
    });
  },
);

console.log(`\n${passedCount()} checks passed.`);
