/**
 * End-to-end check of what happens to a lead after the inquiry: the "After
 * the call" panel on a lead's page and the route its buttons post to, the
 * Pipeline, the Reports, and what the Leads list gained with them.
 *
 * Three kinds of claim are tested. That only the owner can change a lead,
 * and only from this site's own page. That what is typed is checked before
 * it goes near the database, and that pressing a button emails nobody. And
 * that the screens count honestly: a form fill is never shown as a booked
 * call, and a booked call is never shown as an engagement.
 *
 * Runs the real, built site against a stand-in for the database
 * (scripts/mock-fetch.mjs). Every person in it is made up.
 *
 *   npm run build && node scripts/test-admin-outcome.mjs
 *
 * What it cannot cover is the database's own half: that each action changes
 * the lead as it should. That is in supabase/migrations/002_crm_outcome.sql,
 * and was checked against the real database, in a transaction that was
 * rolled back, before the migration was applied.
 */
import assert from "node:assert/strict";
import { SETTINGS, check, passedCount, session, withServer, words } from "./admin-test-kit.mjs";

// ---------------------------------------------------------------------------
// Days, as the screens show them
// ---------------------------------------------------------------------------
const hoursAgo = (h) => new Date(Date.now() - h * 3_600_000).toISOString();
const daysAgo = (d) => hoursAgo(d * 24);
const centralDay = (date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
/** A calendar day, counted from today in Central time: "2026-11-13". */
const dayFromToday = (n) => {
  const [y, m, d] = centralDay(new Date()).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
/** That day the way the CRM writes it: "Fri 13 Nov", with the year if it is not this one. */
const dayLabel = (day) => {
  const at = new Date(`${day}T00:00:00Z`);
  const part = (options) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(at);
  const year = day.slice(0, 4) === centralDay(new Date()).slice(0, 4) ? "" : ` ${day.slice(0, 4)}`;
  return `${part({ weekday: "short" })} ${Number(day.slice(8))} ${part({ month: "short" })}${year}`;
};

const TODAY = dayFromToday(0);
const IN_THREE_DAYS = dayFromToday(3);
const YESTERDAY = dayFromToday(-1);

// ---------------------------------------------------------------------------
// Made-up leads, shaped as the database returns them
// ---------------------------------------------------------------------------
const ID = {
  sam: "a0000000-0000-4000-8000-000000000001",
  jordan: "a0000000-0000-4000-8000-000000000002",
  dana: "a0000000-0000-4000-8000-000000000003",
  priya: "a0000000-0000-4000-8000-000000000004",
  elena: "a0000000-0000-4000-8000-000000000005",
  tom: "a0000000-0000-4000-8000-000000000006",
  marcus: "a0000000-0000-4000-8000-000000000007",
  test: "a0000000-0000-4000-8000-000000000008",
};

let eventId = 0;
const lead = (id, name, organization, days, fields = {}, inquiry = {}, events = []) => ({
  id,
  name,
  organization,
  email: `${name.split(" ")[0].toLowerCase()}@${organization.split(" ")[0].toLowerCase()}.example`,
  stage: "inquiry",
  reached: fields.stage && fields.stage !== "closed" ? fields.stage : "inquiry",
  closed_reason: null,
  qualified: null,
  next_step: null,
  next_step_due: null,
  fee_cents: null,
  notes: null,
  is_test: false,
  created_at: daysAgo(days),
  ...fields,
  inquiries: [
    {
      id: id.replace(/^a/, "b"),
      created_at: daysAgo(days),
      form: "contact",
      is_test: Boolean(fields.is_test),
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
      notified_at: daysAgo(days),
      notify_error: null,
      ...inquiry,
    },
  ],
  lead_events: [
    { id: ++eventId, at: daysAgo(days), kind: "inquiry_received", actor: "system", detail: {}, inquiry_id: id.replace(/^a/, "b") },
    ...events.map(([hours, kind, detail = {}]) => ({ id: ++eventId, at: hoursAgo(hours), kind, actor: "steve", detail, inquiry_id: null })),
  ],
});

const ad = (page) => ({ form: `landing:${page}`, gclid: "Cj0abc" });

const LEADS = [
  lead(
    ID.sam, "Sam Whitaker", "Summit Peak Partners", 10,
    { stage: "proposal_sent", qualified: true, fee_cents: 2500000, next_step: "Follow up", next_step_due: IN_THREE_DAYS, notes: "Liked the roundtable idea." },
    { budget_answer: "yes", event_date: "2027-06-04" },
    [
      [200, "call_held"],
      [199, "qualified"],
      [150, "stage_changed", { from: "call_held", to: "proposal_sent" }],
      [149, "fee_set", { fee_cents: 2500000 }],
      [148, "next_step_set", { next_step: "Follow up", due: IN_THREE_DAYS }],
    ],
  ),
  lead(
    ID.jordan, "Jordan Blake", "Keystone Manufacturing", 20,
    { stage: "booked", qualified: true, fee_cents: 2000000 },
    { ...ad("organizational-change-speaker"), budget_band: "$20,000 – $30,000", event_date: "2027-01-20" },
    [[100, "stage_changed", { from: "contract_out", to: "booked" }]],
  ),
  lead(
    ID.dana, "Dana Reyes", "Northfield Health", 2,
    { stage: "call_booked", next_step: "Prep the brief", next_step_due: TODAY },
    { ...ad("ai-change-speaker"), budget_answer: "yes", event_date: "2027-03-12" },
    [[30, "stage_changed", { from: "inquiry", to: "call_booked" }], [29, "next_step_set", { next_step: "Prep the brief", due: TODAY }]],
  ),
  lead(ID.priya, "Priya Nair", "Westmark Credit Union League", 3),
  lead(
    ID.elena, "Elena Ruiz", "Harbor Arts Council", 120,
    { stage: "closed", reached: "call_held", closed_reason: "lost", next_step: "Chase", next_step_due: YESTERDAY },
    { budget_answer: "possibly" },
    [[2000, "call_held"], [1900, "stage_changed", { from: "call_held", to: "lost" }]],
  ),
  lead(
    ID.tom, "Tom Okafor", "Brightline Software", 40,
    { stage: "closed", reached: "call_held", closed_reason: "not_a_fit", qualified: false },
    { ...ad("ai-change-speaker"), budget_answer: "not_sure" },
    [[900, "call_held"], [899, "not_a_fit"]],
  ),
  lead(
    ID.marcus, "Marcus Lee", "Calder Logistics", 5,
    { stage: "inquiry", reached: "call_booked", next_step: "Rebook", next_step_due: YESTERDAY },
    {},
    [[60, "stage_changed", { from: "inquiry", to: "call_booked" }], [26, "next_step_set", { next_step: "Rebook", due: YESTERDAY }], [25, "no_show"]],
  ),
  lead(ID.test, "Test inquiry", "Sent from the CRM", 1, { stage: "call_held", is_test: true }, {}, [[5, "call_held"]]),
];
// The list and the pipeline ask for events newest first; a lead's page asks oldest first.
const forList = (leads) => leads.map((l) => ({ ...l, lead_events: [...l.lead_events].reverse() }));

const AD_WEEK = (startedDaysAgo) => [
  { entered_at: hoursAgo(20), campaign_started_on: dayFromToday(-startedDaysAgo), spend_cents: 69000, clicks: 96 },
];

/** The button that follows a hidden action field: its opening tag. */
const button = (html, action) =>
  new RegExp(`<input[^>]*value="${action}"[^>]*>\\s*(<button[^>]*>)`).exec(html)?.[1] ?? "";
const field = (html, name) => new RegExp(`<(?:input|textarea)[^>]*name="${name}"[^>]*>`).exec(html)?.[0] ?? "";

await withServer("After the inquiry", SETTINGS, async (site) => {
  const LEAD = `/api/admin/leads/${ID.sam}/`;
  const ADS = "/api/admin/reports/ad-numbers/";

  // -------------------------------------------------------------------------
  console.log("  Who can use them");

  await check("signed out, the new screens show nothing and the database is never asked", async () => {
    site.database({ leads: forList(LEADS), adWeeks: AD_WEEK(22) });
    for (const pathname of ["/admin/pipeline/", "/admin/reports/", "/admin/reports/?period=all", "/admin/pipeline/?tests=1"]) {
      const res = await site.get(pathname);
      assert.equal(res.status, 307, pathname);
      assert.equal(site.where(res), "/admin/sign-in/", pathname);
      assert.ok(!(await res.text()).includes("Sam Whitaker"), `${pathname} leaked a lead`);
    }
    const stranger = await site.get("/admin/reports/", session("stranger@example.test"));
    assert.equal(site.where(stranger), "/admin/sign-in/");
    assert.equal(site.calls().length, 0, "a signed-out request reached the database");
  });

  await check("signed out, nothing can be changed", async () => {
    site.database({ leads: LEADS });
    for (const [pathname, fields] of [[LEAD, { action: "call_held" }], [ADS, { spend: "690" }]]) {
      const signedOut = await site.post(pathname, { origin: site.origin }, fields);
      assert.equal(signedOut.status, 303, pathname);
      assert.equal(site.where(signedOut), "/admin/sign-in/", pathname);
      const stranger = await site.post(pathname, { origin: site.origin, cookie: session("stranger@example.test") }, fields);
      assert.equal(site.where(stranger), "/admin/sign-in/", pathname);
    }
    assert.equal(site.calls().length, 0, "something was written");
  });

  await check("a form on another site cannot change a lead, and a link cannot either", async () => {
    site.database({ leads: LEADS });
    for (const [pathname, fields] of [[LEAD, { action: "not_a_fit" }], [ADS, { spend: "690" }]]) {
      const elsewhere = await site.post(pathname, { origin: "https://evil.example", cookie: session() }, fields);
      assert.equal(elsewhere.status, 403, pathname);
      const noOrigin = await site.post(pathname, { cookie: session() }, fields);
      assert.equal(noOrigin.status, 403, pathname);
      const byLink = await site.get(pathname, session());
      assert.equal(byLink.status, 405, pathname);
    }
    assert.equal(site.calls().length, 0, "something was written");
  });

  // -------------------------------------------------------------------------
  console.log("  A lead's page: after the call");

  await check("the panel is there, says it emails nobody, and every control is a form that posts", async () => {
    site.database({ leads: LEADS });
    const { status, html } = await site.page(`/admin/leads/${ID.sam}/`);
    assert.equal(status, 200);
    const text = words(html);
    assert.ok(text.includes("After the call"));
    assert.ok(text.includes("One press each. Nothing here emails the lead."));
    assert.ok(text.includes("Was it a qualified opportunity?"));
    const forms = html.match(new RegExp(`<form[^>]*action="${LEAD}"[^>]*>`, "g")) ?? [];
    assert.equal(forms.length, 6, "the stage, four presses, and the details");
    for (const form of forms) assert.ok(form.includes('method="post"'), form);
    const actions = [...html.matchAll(/<input[^>]*name="action"[^>]*>/g)].map((m) => /value="([^"]*)"/.exec(m[0])?.[1]);
    assert.deepEqual(actions, ["stage", "call_held", "no_show", "qualified", "not_a_fit", "details"]);
  });

  await check("the stage menu offers the stages, and shows the one the lead is at", async () => {
    site.database({ leads: LEADS });
    const { html } = await site.page(`/admin/leads/${ID.sam}/`);
    const options = [...html.matchAll(/<option value="([^"]*)"([^>]*)>([^<]*)<\/option>/g)].map((m) => ({
      value: m[1],
      selected: m[2].includes("selected"),
      label: m[3],
    }));
    assert.deepEqual(
      options.map((o) => o.label),
      ["New inquiry", "Call booked", "Call held", "Proposal sent", "Contract out", "Booked", "Lost"],
    );
    assert.deepEqual(options.filter((o) => o.selected).map((o) => o.value), ["proposal_sent"]);
    assert.ok(words(html).includes("Change"));
  });

  await check("what is already recorded is shown as recorded", async () => {
    site.database({ leads: LEADS });
    const sam = (await site.page(`/admin/leads/${ID.sam}/`)).html;
    assert.ok(button(sam, "call_held").includes('aria-pressed="true"'), "Call held should read as recorded");
    assert.ok(button(sam, "qualified").includes('aria-pressed="true"'), "Qualified should read as recorded");
    assert.ok(button(sam, "not_a_fit").includes('aria-pressed="false"'));
    // A proposal is out: the call plainly happened, so "No-show" does not apply.
    assert.ok(button(sam, "no_show").includes("disabled"));

    const dana = (await site.page(`/admin/leads/${ID.dana}/`)).html;
    assert.ok(button(dana, "call_held").includes('aria-pressed="false"'), "a booked call is not a held call");
    assert.ok(button(dana, "qualified").includes('aria-pressed="false"'));
    assert.ok(!button(dana, "no_show").includes("disabled"));
  });

  await check("a no-show is back to an inquiry, with the call not marked as held", async () => {
    site.database({ leads: LEADS });
    const { html } = await site.page(`/admin/leads/${ID.marcus}/`);
    assert.ok(button(html, "call_held").includes('aria-pressed="false"'));
    assert.ok(!button(html, "no_show").includes("disabled"));
    assert.match(html, /<option value="inquiry" selected=""[^>]*>New inquiry/);
    assert.ok(words(html).includes("No-show"));
  });

  await check("a lead closed as not a fit says so in the menu, and can be reopened from it", async () => {
    site.database({ leads: LEADS });
    const { html } = await site.page(`/admin/leads/${ID.tom}/`);
    assert.match(html, /<option value="not_a_fit" selected=""[^>]*>Closed · not a fit/);
    assert.ok(button(html, "not_a_fit").includes('aria-pressed="true"'));
    assert.ok(button(html, "no_show").includes("disabled"));
    const elena = (await site.page(`/admin/leads/${ID.elena}/`)).html;
    assert.match(elena, /<option value="lost" selected=""[^>]*>Lost/);
    assert.ok(!elena.includes("Closed · lost</option>"), "Lost is offered twice");
  });

  await check("the next step, the due date, the fee and the notes come back as they were saved", async () => {
    site.database({ leads: LEADS });
    const { html } = await site.page(`/admin/leads/${ID.sam}/`);
    assert.ok(field(html, "next_step").includes('value="Follow up"'));
    assert.ok(field(html, "due").includes(`value="${IN_THREE_DAYS}"`));
    assert.ok(field(html, "due").includes('type="date"'));
    assert.ok(field(html, "fee").includes('value="$25,000"'));
    assert.match(html, /<textarea[^>]*name="notes"[^>]*>Liked the roundtable idea\.<\/textarea>/);
    const empty = (await site.page(`/admin/leads/${ID.priya}/`)).html;
    assert.ok(field(empty, "next_step").includes('value=""'));
    assert.ok(field(empty, "fee").includes('value=""'));
  });

  await check("the timeline tells what the owner did, in order, without repeating the notes", async () => {
    site.database({ leads: LEADS });
    const text = words((await site.page(`/admin/leads/${ID.sam}/`)).html);
    const order = ["Inquiry received", "Call held", "Marked as a qualified opportunity", "Moved to Proposal sent From Call held", "Fee set $25,000", `Next step set Follow up by ${dayLabel(IN_THREE_DAYS)}`];
    const timeline = text.slice(text.indexOf("What has happened"));
    const at = order.map((entry) => timeline.indexOf(entry));
    assert.ok(at.every((i) => i >= 0), `missing: ${order.filter((_, i) => at[i] < 0).join(" | ")}`);
    assert.deepEqual([...at].sort((a, b) => a - b), at, "the timeline is out of order");
    assert.ok(!timeline.includes("Liked the roundtable idea."), "the notes are on the timeline");
  });

  // -------------------------------------------------------------------------
  console.log("  Recording what happened");

  await check("each press records exactly one fact, for that lead, and emails nobody", async () => {
    for (const action of ["call_held", "no_show", "qualified", "not_a_fit"]) {
      site.database({ leads: LEADS });
      const res = await site.submit(LEAD, { action });
      assert.equal(res.status, 303, action);
      assert.equal(site.where(res), `/admin/leads/${ID.sam}/#after-the-call`, action);
      const writes = site.writes("crm_lead_action");
      assert.equal(writes.length, 1, action);
      assert.deepEqual(writes[0].body, { p_lead_id: ID.sam, p_action: action, p_args: {} }, action);
      assert.equal(writes[0].headers.apikey, "test-secret-not-a-key");
      assert.equal(site.emails().length, 0, `${action} sent an email`);
      assert.equal(site.calls().length, 1, `${action} did more than one thing`);
    }
  });

  await check("a stage is changed only to a real stage", async () => {
    site.database({ leads: LEADS });
    const res = await site.submit(LEAD, { action: "stage", stage: "contract_out" });
    assert.equal(site.where(res), `/admin/leads/${ID.sam}/`);
    assert.deepEqual(site.writes("crm_lead_action")[0].body.p_args, { stage: "contract_out" });
    for (const stage of ["lost", "not_a_fit", "below_floor", "inquiry", "booked"]) {
      site.database({ leads: LEADS });
      await site.submit(LEAD, { action: "stage", stage });
      assert.deepEqual(site.writes("crm_lead_action")[0]?.body.p_args, { stage }, stage);
    }
    for (const stage of ["", "closed", "won", "Booked", "booked'; drop table leads; --"]) {
      site.database({ leads: LEADS });
      const refused = await site.submit(LEAD, { action: "stage", stage });
      assert.equal(site.where(refused), `/admin/leads/${ID.sam}/?problem=refused`, stage);
      assert.equal(site.calls().length, 0, `"${stage}" reached the database`);
    }
  });

  await check("the details are tidied and checked before they are saved", async () => {
    site.database({ leads: LEADS });
    const res = await site.submit(LEAD, {
      action: "details",
      next_step: "  Send proposal  ",
      due: IN_THREE_DAYS,
      fee: " $25,000 ",
      notes: "  Wants the roundtable for 400.\nBoard meets in March.  ",
    });
    assert.equal(site.where(res), `/admin/leads/${ID.sam}/#after-the-call`);
    assert.deepEqual(site.writes("crm_lead_action")[0].body, {
      p_lead_id: ID.sam,
      p_action: "details",
      p_args: {
        next_step: "Send proposal",
        notes: "Wants the roundtable for 400.\nBoard meets in March.",
        due: IN_THREE_DAYS,
        fee_cents: 2500000,
      },
    });
    assert.equal(site.emails().length, 0);

    site.database({ leads: LEADS });
    await site.submit(LEAD, { action: "details", next_step: "", due: "", fee: "25k", notes: "" });
    assert.deepEqual(site.writes("crm_lead_action")[0].body.p_args, { next_step: "", notes: "", due: null, fee_cents: 2500000 });

    site.database({ leads: LEADS });
    await site.submit(LEAD, { action: "details", next_step: "x".repeat(500), due: "", fee: "", notes: "n".repeat(9000) });
    const long = site.writes("crm_lead_action")[0].body.p_args;
    assert.equal(long.next_step.length, 200);
    assert.equal(long.notes.length, 5000);
    assert.equal(long.fee_cents, null);
  });

  await check("a mistyped fee or date is left as it was, said plainly, and does not cost the rest", async () => {
    site.database({ leads: LEADS });
    const res = await site.submit(LEAD, { action: "details", next_step: "Send proposal", due: "next Friday", fee: "about 25", notes: "Keep these." });
    assert.equal(site.where(res), `/admin/leads/${ID.sam}/?problem=due,fee#after-the-call`);
    const args = site.writes("crm_lead_action")[0].body.p_args;
    assert.deepEqual(args, { next_step: "Send proposal", notes: "Keep these." }, "the fields that passed were not saved, or a bad one was");
    const text = words((await site.page(`/admin/leads/${ID.sam}/?problem=due,fee`)).html);
    assert.ok(text.includes("The due date was not saved, because it was not a date."));
    assert.ok(text.includes("The fee was not saved. Type an amount, like 25000 or $25,000."));
  });

  await check("a database that does not answer is said plainly, not passed over", async () => {
    site.database({ leads: LEADS, writeMode: "error" });
    const res = await site.submit(LEAD, { action: "call_held" });
    assert.equal(site.where(res), `/admin/leads/${ID.sam}/?problem=save#after-the-call`);
    const text = words((await site.page(`/admin/leads/${ID.sam}/?problem=save`)).html);
    assert.ok(text.includes("That change was not saved."));
    // A lead that has been removed: the page it goes back to says it is not there.
    site.database({ leads: LEADS, action: { ok: false, reason: "no_such_lead" } });
    const gone = await site.submit(LEAD, { action: "call_held" });
    assert.equal(site.where(gone), `/admin/leads/${ID.sam}/#after-the-call`);
    // And a problem that is not one of the known ones shows nothing at all.
    const odd = words((await site.page(`/admin/leads/${ID.sam}/?problem=<script>alert(1)</script>`)).html);
    assert.ok(!odd.includes("alert(1)"));
    for (const made of ["constructor", "toString,__proto__", "save,constructor"]) {
      const page = await site.page(`/admin/leads/${ID.sam}/?problem=${made}`);
      assert.equal(page.status, 200, made);
      assert.ok(!page.html.includes("[native code]") && !page.html.includes("function Object"), made);
      const reports = await site.page(`/admin/reports/?problem=${made}`);
      assert.equal(reports.status, 200, made);
      assert.ok(!reports.html.includes("[native code]"), made);
    }
  });

  await check("an unknown action, or an address that is not a record id, never reaches the database", async () => {
    site.database({ leads: LEADS });
    for (const action of ["", "delete", "promote", "stage; drop"]) {
      const res = await site.submit(LEAD, { action });
      assert.equal(site.where(res), `/admin/leads/${ID.sam}/?problem=refused#after-the-call`, action);
    }
    for (const bad of ["not-an-id", "1", `${ID.sam}&select=*`, ID.sam.slice(0, -1)]) {
      const res = await site.submit(`/api/admin/leads/${bad}/`, { action: "call_held" });
      assert.equal(res.status, 404, bad);
    }
    assert.equal(site.calls().length, 0, "something reached the database");
  });

  // -------------------------------------------------------------------------
  console.log("  The Leads list");

  await check("a next step that has come due is put at the top; a closed lead's is not", async () => {
    site.database({ leads: forList(LEADS) });
    const text = words((await site.page("/admin/")).html);
    assert.ok(text.includes("7 inquiries. 2 need you."), text.slice(0, 300));
    assert.ok(text.includes("Next step due today Dana Reyes, Northfield Health Prep the brief"));
    assert.ok(text.includes(`Next step overdue Marcus Lee, Calder Logistics Rebook · was due ${dayLabel(YESTERDAY)}`));
    // Elena's step was due yesterday too, but she is closed.
    assert.ok(!/Next step overdue Elena/.test(text));
  });

  await check("each row says the stage as it really is, and what is next", async () => {
    site.database({ leads: forList(LEADS) });
    const text = words((await site.page("/admin/")).html);
    assert.ok(text.includes("Next step"), "the column is missing");
    assert.ok(text.includes("Booked · $20,000"));
    assert.ok(text.includes("Proposal sent"));
    assert.ok(text.includes("Closed · lost"));
    assert.ok(text.includes("Closed · not a fit"));
    assert.ok(text.includes(`Follow up by ${dayLabel(IN_THREE_DAYS)}`));
    assert.ok(text.includes("Moved to Booked"));
    assert.match(text, /No-show · yesterday/);
    // Priya has no next step, and the column says so rather than staying blank.
    assert.match(text, /Priya Nair.*?Inquiry received · 3 days ago None/);
  });

  await check("the filters count what they show, and show what they count", async () => {
    site.database({ leads: forList(LEADS) });
    const all = words((await site.page("/admin/")).html);
    for (const tab of ["All 7", "Need you 2", "Call booked 1", "Closed 2"]) assert.ok(all.includes(tab), tab);
    const names = (html) => [...html.matchAll(/<strong class="block text-\[15px\] text-navy">([^<]*)</g)].map((m) => m[1]);
    const table = (html) => [...new Set(names(html))].sort();
    assert.deepEqual(table((await site.page("/admin/?show=closed")).html), ["Elena Ruiz", "Tom Okafor"]);
    assert.deepEqual(table((await site.page("/admin/?show=booked")).html), ["Dana Reyes"]);
    assert.deepEqual(table((await site.page("/admin/?show=needs")).html), ["Dana Reyes", "Marcus Lee"]);
    assert.equal(table((await site.page("/admin/?show=nonsense")).html).length, 7);
  });

  // -------------------------------------------------------------------------
  console.log("  The Pipeline");

  await check("every open lead is in the column of the stage it is at, and nowhere else", async () => {
    site.database({ leads: forList(LEADS) });
    const { status, html } = await site.page("/admin/pipeline/");
    assert.equal(status, 200);
    assert.match(html, /<title>Pipeline \| Speaking CRM<\/title>/);
    const text = words(html);
    assert.ok(text.includes("Where every open inquiry stands. A booked call is not a booked engagement."));
    const columns = [...html.matchAll(/<section aria-labelledby="stage-(\w+)"[^>]*>([\s\S]*?)<\/section>/g)].map((m) => ({
      stage: m[1],
      names: [...m[2].matchAll(/<strong[^>]*>([^<]*)<\/strong>/g)].map((n) => n[1]),
      text: words(m[2]),
    }));
    assert.deepEqual(
      columns.map((c) => [c.stage, c.names.sort()]),
      [
        ["inquiry", ["Marcus Lee", "Priya Nair"]],
        ["call_booked", ["Dana Reyes"]],
        ["call_held", []],
        ["proposal_sent", ["Sam Whitaker"]],
        ["contract_out", []],
        ["booked", ["Jordan Blake"]],
      ],
    );
    assert.match(columns[0].text, /New inquiry\s+2/);
    assert.match(columns[2].text, /Call held\s+0\s+None/);
    assert.match(columns[5].text, /Booked\s+1/);
  });

  await check("a card says what the lead is worth and what is next, and flags what needs you", async () => {
    site.database({ leads: forList(LEADS) });
    const text = words((await site.page("/admin/pipeline/")).html);
    assert.ok(text.includes(`Sam Whitaker Summit Peak Partners $25,000 · Follow up by ${dayLabel(IN_THREE_DAYS)}`));
    assert.ok(text.includes("Jordan Blake Keystone Manufacturing $20,000 · 20 Jan 2027"));
    assert.ok(text.includes(`Dana Reyes Northfield Health Prep the brief by ${dayLabel(TODAY)} Needs you`));
    assert.ok(text.includes(`Marcus Lee Calder Logistics Rebook by ${dayLabel(YESTERDAY)} Needs you`));
    assert.ok(text.includes("Priya Nair Westmark Credit Union League Inquiry received 3 days ago"));
    assert.ok(!text.includes("Sam Whitaker Summit Peak Partners $25,000 · Follow up by " + dayLabel(IN_THREE_DAYS) + " Needs you"));
  });

  await check("closed leads are counted at the foot, not drawn, and the count leads to them", async () => {
    site.database({ leads: forList(LEADS) });
    const { html } = await site.page("/admin/pipeline/");
    const text = words(html);
    assert.ok(text.includes("Closed: 0 below $20,000 · 1 not a fit · 1 lost. Show"), text.slice(-400));
    assert.ok(!text.includes("Elena Ruiz") && !text.includes("Tom Okafor"));
    assert.match(html, /<a[^>]*href="\/admin\/\?show=closed"[^>]*>Show<\/a>/);
  });

  await check("tests are kept off the board unless asked for, and no email address is asked for or shown", async () => {
    site.database({ leads: forList(LEADS) });
    const plain = (await site.page("/admin/pipeline/")).html;
    assert.ok(!plain.includes("Sent from the CRM"));
    assert.ok(words(plain).includes("1 test inquiry is hidden. Show them"));
    const reads = site.reads();
    assert.equal(reads.length, 1);
    const select = new URL(reads[0].url).searchParams.get("select");
    assert.ok(!select.includes("email") && !select.includes("reply_token") && !select.includes("message") && !select.includes("notes"));
    assert.ok(!plain.includes("@summit.example"));
    const withTests = words((await site.page("/admin/pipeline/?tests=1")).html);
    assert.match(withTests, /Call held\s+1\s+Test inquiry Sent from the CRM/);
    assert.ok(withTests.includes("Hide test inquiries"));
  });

  await check("a database that cannot be read says so, and never looks like an empty board", async () => {
    site.database({ leads: [], leadsMode: "error" });
    const text = words((await site.page("/admin/pipeline/")).html);
    assert.ok(text.includes("The lead records could not be read."));
    assert.ok(!text.includes("None"));
  });

  // -------------------------------------------------------------------------
  console.log("  The Reports");

  const funnelOf = (text) => {
    const m = /Inquiries\s+(\d+)\s+Budget fit or approval pending\s+(\d+)\s+Call booked\s+(\d+)\s+Call held\s+(\d+)\s+Proposal sent\s+(\d+)\s+Booked\s+(\d+)/.exec(text);
    return m ? m.slice(1).map(Number) : null;
  };

  await check("the funnel counts by stage: an inquiry is not a call, and a call is not a booking", async () => {
    site.database({ leads: LEADS, adWeeks: AD_WEEK(22) });
    const { status, html } = await site.page("/admin/reports/");
    assert.equal(status, 200);
    assert.match(html, /<title>Reports \| Speaking CRM<\/title>/);
    const text = words(html);
    assert.ok(text.includes("Counted by stage, so a form fill is never mistaken for a booking."));
    // The last 90 days: six leads. Elena, 120 days back, is outside it.
    assert.deepEqual(funnelOf(text), [6, 3, 5, 3, 2, 1], text.slice(0, 600));
    assert.deepEqual(funnelOf(words((await site.page("/admin/reports/?period=all")).html)), [7, 4, 6, 4, 2, 1]);
    assert.deepEqual(funnelOf(words((await site.page("/admin/reports/?period=30")).html)), [5, 3, 4, 2, 2, 1]);
    assert.deepEqual(funnelOf(words((await site.page("/admin/reports/?period=nonsense")).html)), [6, 3, 5, 3, 2, 1]);
  });

  await check("the period that is on is marked as on", async () => {
    site.database({ leads: LEADS });
    const on = (html) => /<a[^>]*aria-current="true"[^>]*>([^<]*)<\/a>/.exec(html.slice(html.indexOf("<main")))?.[1];
    assert.equal(on((await site.page("/admin/reports/")).html), "Last 90 days");
    assert.equal(on((await site.page("/admin/reports/?period=30")).html), "Last 30 days");
    assert.equal(on((await site.page("/admin/reports/?period=all")).html), "All time");
  });

  await check("each source is counted once, by where a lead first came from", async () => {
    site.database({ leads: LEADS, adWeeks: AD_WEEK(22) });
    const text = words((await site.page("/admin/reports/")).html);
    assert.match(text, /Source\s+Inquiries\s+Calls booked\s+Calls held\s+Booked\s+Organic · contact page\s+3\s+2\s+1\s+0\s+Google Ads · AI page\s+2\s+2\s+1\s+0\s+Google Ads · change page\s+1\s+1\s+1\s+1/);
    site.database({ leads: [] });
    const empty = words((await site.page("/admin/reports/")).html);
    assert.ok(empty.includes("No inquiries in this period."));
    assert.deepEqual(funnelOf(empty), [0, 0, 0, 0, 0, 0]);
  });

  await check("the spend gates keep count from the campaign's first day, and say where each stands", async () => {
    site.database({ leads: LEADS, adWeeks: AD_WEEK(22) });
    const text = words((await site.page("/admin/reports/")).html);
    assert.ok(text.includes("Day 23 of the campaign. You apply these; the page only keeps count."), text.slice(text.indexOf("Spend gates"), text.indexOf("Spend gates") + 300));
    // Tom came from an ad too, but 40 days ago: before this campaign began.
    assert.match(text, /Gate 1 · day 60 or 300 clicks Needs at least 1 inquiry from an ad click\. So far: 2\.\s+Met/);
    assert.match(text, /Gate 2 · day 90 Needs at least 3 qualified leads from ad clicks\. So far: 1\.\s+Not yet/);
    assert.match(text, /Gate 3 · day 180 Needs at least 1 booking from an ad click\. So far: 1\.\s+Met/);

    // Day 101: gate 2's day has passed without its three.
    site.database({ leads: LEADS, adWeeks: AD_WEEK(100) });
    const late = words((await site.page("/admin/reports/")).html);
    assert.ok(late.includes("Day 101 of the campaign."));
    assert.match(late, /from an ad click\. So far: 3\.\s+Met/);
    assert.match(late, /Gate 2 · day 90 Needs at least 3 qualified leads from ad clicks\. So far: 1\.\s+Not met/);

    // A campaign that began after these leads arrived has produced nothing yet.
    site.database({ leads: LEADS, adWeeks: AD_WEEK(0) });
    const fresh = words((await site.page("/admin/reports/")).html);
    assert.ok(fresh.includes("Day 1 of the campaign."));
    assert.match(fresh, /Gate 1 · day 60 or 300 clicks Needs at least 1 inquiry from an ad click\. So far: 0\.\s+Not yet/);
  });

  await check("before there is a first day, the page says so and does not invent one", async () => {
    site.database({ leads: LEADS, adWeeks: [] });
    const text = words((await site.page("/admin/reports/")).html);
    assert.ok(text.includes("The campaign has no first day yet."));
    assert.ok(!/Day \d+ of the campaign/.test(text));
    assert.match(text, /Cost per qualified call held\s+—\s+Type in the spend to see this/);
    site.database({ leads: LEADS, adWeeks: [{ entered_at: hoursAgo(1), campaign_started_on: dayFromToday(8), spend_cents: null, clicks: null }] });
    const ahead = words((await site.page("/admin/reports/")).html);
    assert.ok(ahead.includes(`The campaign begins ${dayLabel(dayFromToday(8))}.`));
  });

  await check("the cost of a qualified call held is spend over those calls, from ads only", async () => {
    site.database({ leads: LEADS, adWeeks: AD_WEEK(22) });
    const { html } = await site.page("/admin/reports/");
    assert.match(words(html), /Cost per qualified call held\s+\$690\s+1 so far from ads/);
    assert.ok(field(html, "spend").includes('value="$690"'));
    assert.ok(field(html, "clicks").includes('value="96"'));
    assert.ok(field(html, "started").includes(`value="${dayFromToday(-22)}"`));
    // Sam is qualified and had his call, but found the site on his own.
    const organicOnly = LEADS.filter((l) => l.id !== ID.jordan);
    site.database({ leads: organicOnly, adWeeks: AD_WEEK(22) });
    assert.match(words((await site.page("/admin/reports/")).html), /Cost per qualified call held\s+—\s+None so far from ads/);
  });

  await check("the report asks for no names, and never counts a test", async () => {
    site.database({ leads: LEADS, adWeeks: AD_WEEK(22) });
    const { html } = await site.page("/admin/reports/?period=all");
    const reads = site.reads();
    assert.equal(reads.length, 1);
    const params = new URL(reads[0].url).searchParams;
    assert.equal(params.get("is_test"), "is.false");
    for (const column of ["name", "organization", "email", "message", "notes", "reply_token", "next_step"]) {
      assert.ok(!params.get("select").includes(column), `the report asked for ${column}`);
    }
    for (const person of ["Sam Whitaker", "Summit Peak", "Test inquiry", "@"]) assert.ok(!words(html).includes(person), person);
    // The test lead had a call held. It is in none of these numbers.
    assert.deepEqual(funnelOf(words(html)), [7, 4, 6, 4, 2, 1]);
    assert.ok(words(html).includes("Test inquiries are never counted here."));
  });

  await check("a report that cannot be read says so, and shows no zeros in its place", async () => {
    site.database({ leads: LEADS, leadsMode: "error" });
    const text = words((await site.page("/admin/reports/")).html);
    assert.ok(text.includes("The report could not be read."));
    assert.equal(funnelOf(text), null);
    site.database({ leads: LEADS, adMode: "error" });
    assert.ok(words((await site.page("/admin/reports/")).html).includes("The report could not be read."));
  });

  // -------------------------------------------------------------------------
  console.log("  Typing in the ad numbers");

  await check("the numbers are read the way they are typed, and an empty field clears its number", async () => {
    site.database({ leads: LEADS });
    const res = await site.submit(ADS, { started: dayFromToday(-22), spend: " $1,690.50 ", clicks: "1,204", period: "90" });
    assert.equal(res.status, 303);
    assert.equal(site.where(res), "/admin/reports/#ad-numbers");
    assert.deepEqual(site.writes("crm_save_ad_numbers")[0].body, {
      p: { campaign_started_on: dayFromToday(-22), spend_cents: 169050, clicks: 1204 },
    });
    site.database({ leads: LEADS });
    const cleared = await site.submit(ADS, { started: "", spend: "", clicks: "", period: "all" });
    assert.equal(site.where(cleared), "/admin/reports/?period=all#ad-numbers");
    assert.deepEqual(site.writes("crm_save_ad_numbers")[0].body, {
      p: { campaign_started_on: null, spend_cents: null, clicks: null },
    });
    assert.equal(site.emails().length, 0);
  });

  await check("a number that is not a number is left as it was, and the rest is saved", async () => {
    site.database({ leads: LEADS });
    const res = await site.submit(ADS, { started: "last Tuesday", spend: "lots", clicks: "9.5", period: "30" });
    assert.equal(site.where(res), "/admin/reports/?period=30&problem=started,spend,clicks#ad-numbers");
    assert.equal(site.calls().length, 0, "nothing passed, so nothing should be sent");
    const text = words((await site.page("/admin/reports/?period=30&problem=started,spend,clicks")).html);
    assert.ok(text.includes("The first day was not saved, because it was not a date."));
    assert.ok(text.includes("The spend was not saved."));
    assert.ok(text.includes("The clicks were not saved."));

    site.database({ leads: LEADS });
    const partly = await site.submit(ADS, { started: dayFromToday(-3), spend: "lots", clicks: "40" });
    assert.equal(site.where(partly), "/admin/reports/?problem=spend#ad-numbers");
    assert.deepEqual(site.writes("crm_save_ad_numbers")[0].body, { p: { campaign_started_on: dayFromToday(-3), clicks: 40 } });

    site.database({ leads: LEADS, writeMode: "error" });
    const down = await site.submit(ADS, { started: "", spend: "690", clicks: "96" });
    assert.equal(site.where(down), "/admin/reports/?problem=save#ad-numbers");
    assert.ok(words((await site.page("/admin/reports/?problem=save")).html).includes("Those numbers were not saved."));
  });

  // -------------------------------------------------------------------------
  console.log("  Kept private");

  await check("the menu offers the screens that exist, and the new ones carry no analytics", async () => {
    site.database({ leads: forList(LEADS), adWeeks: AD_WEEK(22) });
    for (const pathname of ["/admin/pipeline/", "/admin/reports/"]) {
      const { html, res } = await site.page(pathname);
      const menu = [...html.matchAll(/<a[^>]*href="(\/admin\/[^"]*)"[^>]*>(Leads|Pipeline|Reports|Workflow|Settings)<\/a>/g)].map((m) => `${m[2]} ${m[1]}`);
      assert.deepEqual([...new Set(menu)], ["Leads /admin/", "Pipeline /admin/pipeline/", "Reports /admin/reports/"], pathname);
      assert.match(html, new RegExp(`<a[^>]*aria-current="page"[^>]*href="${pathname}"|<a[^>]*href="${pathname}"[^>]*aria-current="page"`), pathname);
      assert.ok(!/<script[^>]*type="application\/ld\+json"/.test(html), pathname);
      assert.ok(!/<(script|link)[^>]*googletagmanager/.test(html), pathname);
      assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
      assert.ok((res.headers.get("cache-control") ?? "").includes("no-store"), pathname);
    }
  });
});

console.log(`\n${passedCount()} checks passed.`);
