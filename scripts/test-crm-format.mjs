/**
 * Check of the words the CRM uses (lib/crm/format.ts).
 *
 * These are the labels Steve reads to decide who to call: where a lead came
 * from, what they said about budget, when things happened. Each is a small
 * pure function, so each is checked directly, with no site running.
 *
 *   node scripts/test-crm-format.mjs
 *
 * Node runs the TypeScript file as it is; that works because format.ts
 * imports nothing.
 */
import assert from "node:assert/strict";
import {
  activityLabel,
  arrivalSentence,
  budgetLabel,
  centralDay,
  clockTime,
  countOf,
  dayAndTime,
  eventLabel,
  eventTitle,
  isRecordId,
  sourceDetail,
  sourceLabel,
  stageLabel,
  timeAgo,
} from "../lib/crm/format.ts";

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

console.log("\nWhere a lead came from");

check("an ad click on an ad page is Google Ads and names the page", () => {
  const i = { form: "landing:ai-change-speaker", gclid: "Cj0abc", utm_term: "ai keynote speaker" };
  assert.equal(sourceLabel(i), "Google Ads · AI page");
  assert.equal(sourceDetail(i), "Google Ads · searched “ai keynote speaker” · AI ad page");
  assert.equal(arrivalSentence(i), "From the AI ad page, after a Google ad click");
});

check("each ad page has a short name, and an unknown one still reads sensibly", () => {
  assert.equal(sourceLabel({ form: "landing:organizational-change-speaker", gbraid: "x" }), "Google Ads · change page");
  assert.equal(sourceLabel({ form: "landing:keynote-speaker", wbraid: "x" }), "Google Ads · keynote page");
  assert.equal(sourceLabel({ form: "landing:wellness-speaker", gclid: "x" }), "Google Ads · wellness page");
  assert.equal(sourceLabel({ form: "landing:future-of-work-speaker", gclid: "x" }), "Google Ads · future of work page");
  assert.equal(arrivalSentence({ form: "landing" }), "From an ad page");
});

check("no click identifier means it was not an ad, wherever the form was", () => {
  assert.equal(sourceLabel({ form: "contact" }), "Organic · contact page");
  assert.equal(sourceLabel({ form: "landing:ai-change-speaker" }), "Organic · AI page");
  assert.equal(sourceLabel({}), "Organic · contact page");
  assert.equal(arrivalSentence({ form: "contact" }), "From the contact page");
  assert.equal(sourceDetail({ form: "contact" }), "Organic · contact page");
});

check("a tagged link is named by its tag; an ad click still wins over a tag", () => {
  assert.equal(sourceLabel({ form: "contact", utm_source: "newsletter" }), "Newsletter · contact page");
  assert.equal(sourceLabel({ form: "contact", utm_source: "newsletter", gclid: "x" }), "Google Ads · contact page");
});

console.log("\nThe budget answer");

check("the four answers of the new form", () => {
  assert.deepEqual(budgetLabel({ budget_answer: "yes" }), { label: "Yes", tone: "yes", note: "$20,000 is within range" });
  assert.equal(budgetLabel({ budget_answer: "possibly" }).label, "Possibly");
  assert.equal(budgetLabel({ budget_answer: "not_sure" }).label, "Not sure");
  assert.deepEqual(budgetLabel({ budget_answer: "below" }), { label: "Below $20,000", tone: "warn", note: "Under the floor" });
});

check("today's forms: a range is a yes, and no answer is said plainly", () => {
  assert.deepEqual(budgetLabel({ budget_band: "$30,000 – $50,000" }), {
    label: "$30,000 – $50,000",
    tone: "yes",
    note: "The range they chose",
  });
  assert.equal(budgetLabel({ budget_band: "Not yet determined" }).label, "Not determined");
  assert.equal(budgetLabel({}).label, "Not asked");
  assert.equal(budgetLabel({ budget_band: "  " }).label, "Not asked");
  // The new answer wins when both are present.
  assert.equal(budgetLabel({ budget_answer: "possibly", budget_band: "Over $50,000" }).label, "Possibly");
});

console.log("\nDates and times");

check("an event date from the form is written out; anything else is kept as typed", () => {
  assert.equal(eventLabel("2027-03-12"), "12 Mar 2027");
  assert.equal(eventLabel("2027-03-12", "long"), "12 March 2027");
  assert.equal(eventLabel("2027-01-05"), "5 Jan 2027");
  assert.equal(eventLabel("Q2 2027"), "Q2 2027");
  assert.equal(eventLabel(""), "Not decided");
  assert.equal(eventLabel(null), "Not decided");
  assert.equal(eventLabel("2027-13-40"), "2027-13-40");
});

check("times are Central, whatever the clock on the machine says", () => {
  // 15:41 UTC on 10 Nov is 9:41 AM Central Standard Time.
  const winter = new Date("2026-11-10T15:41:00Z");
  assert.equal(dayAndTime(winter), "Tue 10 Nov, 9:41 AM");
  assert.equal(clockTime(winter), "9:41 AM");
  // 14:41 UTC on 10 Jul is 9:41 AM Central Daylight Time.
  assert.equal(dayAndTime(new Date("2026-07-10T14:41:00Z")), "Fri 10 Jul, 9:41 AM");
  // 03:30 UTC is still the evening before in Chicago.
  assert.equal(dayAndTime(new Date("2026-11-11T03:30:00Z")), "Tue 10 Nov, 9:30 PM");
  assert.equal(centralDay(new Date("2026-11-11T03:30:00Z")), centralDay(winter));
  assert.notEqual(centralDay(new Date("2026-11-11T07:30:00Z")), centralDay(winter));
});

check("how long ago, the way a person would say it", () => {
  const now = new Date("2026-11-12T21:00:00Z"); // Thu 12 Nov, 3:00 PM Central
  const ago = (iso) => timeAgo(new Date(iso), now);
  assert.equal(ago("2026-11-12T20:59:30Z"), "just now");
  assert.equal(ago("2026-11-12T20:40:00Z"), "20 minutes ago");
  assert.equal(ago("2026-11-12T19:55:00Z"), "1 hour ago");
  assert.equal(ago("2026-11-12T18:00:00Z"), "3 hours ago");
  // 9:30 PM the evening before: more than 12 hours, and a different day there.
  assert.equal(ago("2026-11-12T03:30:00Z"), "yesterday");
  // 23 hours ago is yesterday, not "23 hours ago".
  assert.equal(ago("2026-11-11T22:00:00Z"), "yesterday");
  assert.equal(ago("2026-11-10T15:00:00Z"), "2 days ago");
  assert.equal(ago("2026-11-06T15:00:00Z"), "6 days ago");
  assert.equal(ago("2026-11-02T15:00:00Z"), "2 Nov");
  assert.equal(ago("2025-12-30T15:00:00Z"), "30 Dec 2025");
  // A clock slightly ahead never produces "in the future".
  assert.equal(ago("2026-11-12T21:00:20Z"), "just now");
});

console.log("\nWhat happened");

check("each recorded event has a title, and failures are marked as problems", () => {
  assert.deepEqual(eventTitle("inquiry_received"), { title: "Inquiry received", problem: false });
  assert.deepEqual(eventTitle("notify_failed"), { title: "The email to you failed", problem: true });
  assert.deepEqual(eventTitle("ack_failed"), { title: "The instant reply failed", problem: true });
  assert.equal(eventTitle("ack_sent").problem, false);
  assert.equal(activityLabel("notify_sent"), "Emailed to you");
  assert.equal(activityLabel("ack_sent"), "Instant reply sent");
});

check("an event this code has never heard of is still shown, in plain words", () => {
  assert.deepEqual(eventTitle("call_booked"), { title: "Call booked", problem: false });
  assert.equal(eventTitle("calendar_sync_failed").problem, true);
  assert.equal(activityLabel("call_booked"), "Call booked");
  assert.equal(stageLabel("inquiry"), "New inquiry");
  assert.equal(stageLabel("call_booked"), "Call booked");
});

console.log("\nSmall things");

check("counting, and telling a record id from anything else", () => {
  assert.equal(countOf(1, "inquiry", "inquiries"), "1 inquiry");
  assert.equal(countOf(0, "inquiry", "inquiries"), "0 inquiries");
  assert.equal(countOf(7, "inquiry", "inquiries"), "7 inquiries");
  assert.equal(isRecordId("3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b"), true);
  assert.equal(isRecordId("3F2B8C1E-5A4D-4E6F-9A7B-0C1D2E3F4A5B"), true);
  for (const bad of ["", "1", "not-an-id", "3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b&select=*", "3f2b8c1e5a4d4e6f9a7b0c1d2e3f4a5b", "../etc"]) {
    assert.equal(isRecordId(bad), false, bad);
  }
});

console.log(`\n${passed} checks passed.`);
