/**
 * Check of how the CRM counts (lib/crm/reports.ts).
 *
 * One rule matters more than the rest: a form fill is never counted as a
 * booked call, and a booked call is never counted as an engagement. Every
 * count on the Reports page is one of the small pure functions checked here,
 * with made-up leads and no site running.
 *
 *   node --no-warnings scripts/test-crm-reports.mjs
 *
 * Node runs the TypeScript files as they are; that works because reports.ts
 * imports only format.ts, by its full file name.
 */
import assert from "node:assert/strict";
import {
  adCounts,
  bySource,
  campaignDay,
  costPer,
  firstInquiry,
  funnel,
  gateStatus,
  inPeriod,
  latestInquiry,
  periodFrom,
} from "../lib/crm/reports.ts";

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const NOW = new Date("2026-11-12T18:00:00Z"); // Thu 12 Nov, noon Central
const daysAgo = (d) => new Date(NOW.getTime() - d * 86_400_000).toISOString();

let n = 0;
/** A made-up lead. `ad` is whether the FIRST inquiry followed an ad click. */
const lead = ({ stage = "inquiry", reached = stage === "closed" ? "inquiry" : stage, closed_reason = null, qualified = null, days = 1, ad = false, form = "contact", budget = {}, inquiries } = {}) => ({
  id: `lead-${++n}`,
  created_at: daysAgo(days),
  stage,
  reached,
  closed_reason,
  qualified,
  inquiries: inquiries ?? [{ created_at: daysAgo(days), form, gclid: ad ? "Cj0abc" : null, wbraid: null, gbraid: null, utm_source: null, ...budget }],
});

console.log("\nThe funnel");

check("an inquiry is an inquiry, and nothing more", () => {
  const f = funnel([lead(), lead(), lead()]);
  assert.deepEqual(f, { inquiries: 3, budgetFit: 0, callBooked: 0, callHeld: 0, proposalSent: 0, booked: 0 });
});

check("a booked call is counted as a booked call, and not as held, proposed or booked", () => {
  const f = funnel([lead({ stage: "call_booked" })]);
  assert.deepEqual(f, { inquiries: 1, budgetFit: 0, callBooked: 1, callHeld: 0, proposalSent: 0, booked: 0 });
});

check("each stage counts the leads that got at least that far", () => {
  const f = funnel([
    lead(),
    lead({ stage: "call_booked" }),
    lead({ stage: "call_held" }),
    lead({ stage: "proposal_sent" }),
    lead({ stage: "contract_out" }),
    lead({ stage: "booked" }),
  ]);
  assert.deepEqual(f, { inquiries: 6, budgetFit: 0, callBooked: 5, callHeld: 4, proposalSent: 3, booked: 1 });
});

check("a contract out is not a booking", () => {
  assert.equal(funnel([lead({ stage: "contract_out" })]).booked, 0);
});

check("a no-show still booked a call, and did not hold one", () => {
  // Back to being an inquiry, without forgetting that a call was booked.
  const f = funnel([lead({ stage: "inquiry", reached: "call_booked" })]);
  assert.equal(f.callBooked, 1);
  assert.equal(f.callHeld, 0);
});

check("a closed lead keeps what it did, but a lost booking is not an engagement", () => {
  const lostAfterProposal = lead({ stage: "closed", reached: "proposal_sent", closed_reason: "lost" });
  const lostAfterBooking = lead({ stage: "closed", reached: "booked", closed_reason: "lost" });
  const turnedAway = lead({ stage: "closed", reached: "inquiry", closed_reason: "below_floor" });
  const f = funnel([lostAfterProposal, lostAfterBooking, turnedAway]);
  assert.deepEqual(f, { inquiries: 3, budgetFit: 0, callBooked: 2, callHeld: 2, proposalSent: 2, booked: 0 });
});

check("budget fit is what they last told us: a yes, a possibly, or a range", () => {
  const f = funnel([
    lead({ budget: { budget_answer: "yes" } }),
    lead({ budget: { budget_answer: "possibly" } }),
    lead({ budget: { budget_answer: "not_sure" } }),
    lead({ budget: { budget_answer: "below" } }),
    lead({ budget: { budget_band: "$20,000 – $30,000" } }),
    lead({ budget: { budget_band: "Not yet determined" } }),
    lead(),
  ]);
  assert.equal(f.budgetFit, 3);
  // A later inquiry replaces an earlier answer.
  const changedMind = lead({
    inquiries: [
      { created_at: daysAgo(9), form: "contact", budget_answer: "below" },
      { created_at: daysAgo(2), form: "contact", budget_answer: "yes" },
    ],
  });
  assert.equal(funnel([changedMind]).budgetFit, 1);
});

console.log("\nBy source");

check("a lead belongs to the source of its first inquiry, whatever order they arrive in", () => {
  const organicFirst = lead({
    stage: "booked",
    inquiries: [
      // Newest first, as the database may return them.
      { created_at: daysAgo(1), form: "landing:ai-change-speaker", gclid: "Cj0abc" },
      { created_at: daysAgo(20), form: "contact", gclid: null },
    ],
  });
  assert.equal(firstInquiry(organicFirst).form, "contact");
  assert.equal(latestInquiry(organicFirst).form, "landing:ai-change-speaker");
  assert.deepEqual(bySource([organicFirst]), [
    { source: "Organic · contact page", inquiries: 1, callsBooked: 1, callsHeld: 1, booked: 1 },
  ]);
  // And so it is not an ad lead either.
  assert.equal(adCounts([organicFirst], null).inquiries, 0);
});

check("one row per source, the busiest first, each lead counted once", () => {
  const rows = bySource([
    lead({ ad: true, form: "landing:ai-change-speaker" }),
    lead({ ad: true, form: "landing:ai-change-speaker", stage: "call_held" }),
    lead({ ad: true, form: "landing:ai-change-speaker", stage: "call_booked" }),
    lead({ ad: true, form: "landing:organizational-change-speaker", stage: "booked" }),
    lead({ stage: "call_booked" }),
    lead(),
  ]);
  assert.deepEqual(rows, [
    { source: "Google Ads · AI page", inquiries: 3, callsBooked: 2, callsHeld: 1, booked: 0 },
    { source: "Organic · contact page", inquiries: 2, callsBooked: 1, callsHeld: 0, booked: 0 },
    { source: "Google Ads · change page", inquiries: 1, callsBooked: 1, callsHeld: 1, booked: 1 },
  ]);
  assert.equal(rows.reduce((sum, row) => sum + row.inquiries, 0), 6);
  assert.deepEqual(bySource([]), []);
});

console.log("\nThe period");

check("a period counts the leads who first inquired within it", () => {
  const leads = [lead({ days: 5 }), lead({ days: 45 }), lead({ days: 200 })];
  assert.equal(inPeriod(leads, "30", NOW).length, 1);
  assert.equal(inPeriod(leads, "90", NOW).length, 2);
  assert.equal(inPeriod(leads, "all", NOW).length, 3);
  assert.equal(periodFrom("30"), "30");
  assert.equal(periodFrom("all"), "all");
  for (const other of [undefined, "", "90", "7", "all time", "30; drop"]) assert.equal(periodFrom(other), "90");
});

console.log("\nThe spend gates");

check("only leads whose first inquiry followed an ad click count toward a gate", () => {
  const leads = [
    lead({ ad: true }),
    lead({ ad: true, stage: "call_held", qualified: true }),
    lead({ ad: true, stage: "booked", qualified: true }),
    lead({ stage: "booked", qualified: true }), // organic: a booking, but not the ads'
  ];
  assert.deepEqual(adCounts(leads, null), { inquiries: 3, qualified: 2, qualifiedCallsHeld: 2, booked: 1 });
});

check("qualified is the owner's word, and a qualified call held needs both", () => {
  const leads = [
    lead({ ad: true, stage: "call_held", qualified: null }), // held, not yet judged
    lead({ ad: true, stage: "call_held", qualified: false }), // held, not a fit
    lead({ ad: true, stage: "call_booked", qualified: true }), // judged qualified, no call recorded
    lead({ ad: true, stage: "closed", reached: "call_held", closed_reason: "lost", qualified: true }), // qualified, then lost
  ];
  assert.deepEqual(adCounts(leads, null), { inquiries: 4, qualified: 2, qualifiedCallsHeld: 1, booked: 0 });
});

check("the count starts on the campaign's first day, in Central time", () => {
  const before = lead({ ad: true, days: 30 });
  const after = lead({ ad: true, days: 2 });
  assert.equal(adCounts([before, after], "2026-11-01").inquiries, 1);
  assert.equal(adCounts([before, after], null).inquiries, 2);
  // 04:00 UTC on 1 Nov is still 31 Oct in Chicago: before the first day.
  const eve = { ...lead({ ad: true }), created_at: "2026-11-01T04:00:00Z" };
  assert.equal(adCounts([eve], "2026-11-01").inquiries, 0);
  const firstMorning = { ...lead({ ad: true }), created_at: "2026-11-01T15:00:00Z" };
  assert.equal(adCounts([firstMorning], "2026-11-01").inquiries, 1);
});

check("the day of the campaign: 1 on its first day, nothing before there is one", () => {
  assert.equal(campaignDay("2026-11-12", NOW), 1);
  assert.equal(campaignDay("2026-10-21", NOW), 23);
  assert.equal(campaignDay("2026-11-20", NOW), -7);
  assert.equal(campaignDay(null, NOW), null);
  assert.equal(campaignDay("soon", NOW), null);
});

check("a gate is met once the count is there, and not met only once its time has run out", () => {
  const gate1 = { needs: 1, byDay: 60, byClicks: 300 };
  assert.equal(gateStatus({ ...gate1, soFar: 0, day: 23, clicks: 96 }), "not_yet");
  assert.equal(gateStatus({ ...gate1, soFar: 1, day: 23, clicks: 96 }), "met");
  assert.equal(gateStatus({ ...gate1, soFar: 0, day: 60, clicks: 96 }), "not_yet"); // day 60 itself is still in time
  assert.equal(gateStatus({ ...gate1, soFar: 0, day: 61, clicks: 96 }), "not_met");
  assert.equal(gateStatus({ ...gate1, soFar: 0, day: 23, clicks: 300 }), "not_met"); // out of clicks first
  assert.equal(gateStatus({ ...gate1, soFar: 5, day: 200, clicks: 900 }), "met"); // met late is still met
  // No start date and no clicks typed in: nothing has run out.
  assert.equal(gateStatus({ ...gate1, soFar: 0, day: null, clicks: null }), "not_yet");
  const gate2 = { needs: 3, byDay: 90 };
  assert.equal(gateStatus({ ...gate2, soFar: 2, day: 90, clicks: 5000 }), "not_yet"); // clicks do not close this one
  assert.equal(gateStatus({ ...gate2, soFar: 2, day: 91 }), "not_met");
  assert.equal(gateStatus({ ...gate2, soFar: 3, day: 91 }), "met");
});

check("cost per call is spend over calls, and nothing when either is missing", () => {
  assert.equal(costPer(69000, 1), 69000);
  assert.equal(costPer(69000, 2), 34500);
  assert.equal(costPer(100000, 3), 33333);
  assert.equal(costPer(69000, 0), null);
  assert.equal(costPer(null, 2), null);
  assert.equal(costPer(undefined, 2), null);
  assert.equal(costPer(0, 2), 0);
});

console.log(`\n${passed} checks passed.`);
