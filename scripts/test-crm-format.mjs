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
  budgetFits,
  budgetLabel,
  centralDay,
  centralIsoDay,
  clockTime,
  countOf,
  dayAndTime,
  dayLabel,
  daysBetween,
  dueState,
  eventLabel,
  eventNote,
  eventTitle,
  isDay,
  isRecordId,
  isStageChoice,
  money,
  nextStepLine,
  parseCount,
  parseMoney,
  sourceDetail,
  sourceLabel,
  stageChipLabel,
  stageChoices,
  stageLabel,
  stageRank,
  stageTone,
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
  assert.deepEqual(budgetLabel({ budget_answer: "below" }), { label: "Below $20,000", tone: "muted", note: "Under the floor" });
});

check("which answers leave room for the fee", () => {
  assert.equal(budgetFits({ budget_answer: "yes" }), true);
  assert.equal(budgetFits({ budget_answer: "possibly" }), true);
  assert.equal(budgetFits({ budget_answer: "not_sure" }), false);
  assert.equal(budgetFits({ budget_answer: "below" }), false);
  assert.equal(budgetFits({ budget_band: "$30,000 – $50,000" }), true);
  assert.equal(budgetFits({ budget_band: "Not yet determined" }), false);
  assert.equal(budgetFits({}), false);
  // The new form's answer wins over an old range.
  assert.equal(budgetFits({ budget_answer: "below", budget_band: "Over $50,000" }), false);
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

console.log("\nStages");

check("the six open stages in order, and anything else is not one", () => {
  assert.deepEqual(
    ["inquiry", "call_booked", "call_held", "proposal_sent", "contract_out", "booked"].map(stageRank),
    [0, 1, 2, 3, 4, 5],
  );
  assert.equal(stageRank("closed"), -1);
  assert.equal(stageRank("lost"), -1);
  assert.equal(stageRank(null), -1);
});

check("a stage is named in plain words, and a closed lead says why", () => {
  assert.equal(stageLabel("proposal_sent"), "Proposal sent");
  assert.equal(stageLabel("contract_out"), "Contract out");
  assert.equal(stageLabel("booked"), "Booked");
  assert.equal(stageLabel("closed", "below_floor"), "Closed · below floor");
  assert.equal(stageLabel("closed", "not_a_fit"), "Closed · not a fit");
  assert.equal(stageLabel("closed", "lost"), "Closed · lost");
  assert.equal(stageLabel("closed"), "Closed");
  assert.equal(stageChipLabel({ stage: "booked", fee_cents: 2000000 }), "Booked · $20,000");
  assert.equal(stageChipLabel({ stage: "booked", fee_cents: null }), "Booked");
  // A fee on a lead that is not booked is not a booking.
  assert.equal(stageChipLabel({ stage: "proposal_sent", fee_cents: 2500000 }), "Proposal sent");
  assert.equal(stageChipLabel({ stage: "closed", closed_reason: "lost", fee_cents: 2500000 }), "Closed · lost");
  assert.deepEqual(["inquiry", "call_booked", "booked", "closed"].map(stageTone), ["plain", "action", "yes", "muted"]);
});

check("the stage menu always shows where the lead really is", () => {
  const open = stageChoices("call_booked", null);
  assert.equal(open.current, "call_booked");
  assert.deepEqual(
    open.choices.map((c) => c.label),
    ["New inquiry", "Call booked", "Call held", "Proposal sent", "Contract out", "Booked", "Lost"],
  );
  assert.equal(stageChoices("closed", "lost").current, "lost");
  assert.equal(stageChoices("closed", "lost").choices.length, 7);
  const notAFit = stageChoices("closed", "not_a_fit");
  assert.equal(notAFit.current, "not_a_fit");
  assert.deepEqual(notAFit.choices.at(-1), { value: "not_a_fit", label: "Closed · not a fit" });
  assert.equal(stageChoices("closed", "below_floor").choices.at(-1).label, "Closed · below floor");
  for (const ok of ["inquiry", "booked", "lost", "not_a_fit", "below_floor"]) assert.equal(isStageChoice(ok), true, ok);
  for (const bad of ["", "closed", "won", "Booked", "booked; drop table leads"]) assert.equal(isStageChoice(bad), false, bad);
});

console.log("\nMoney, and what is typed");

check("money is shown in dollars, with cents only when there are some", () => {
  assert.equal(money(2500000), "$25,000");
  assert.equal(money(69000), "$690");
  assert.equal(money(125050), "$1,250.50");
  assert.equal(money(0), "$0");
});

check("an amount can be typed the ways a person types one, and nothing else is taken for one", () => {
  assert.equal(parseMoney("25000"), 2500000);
  assert.equal(parseMoney("$25,000"), 2500000);
  assert.equal(parseMoney(" $ 25,000 "), 2500000);
  assert.equal(parseMoney("1,250.50"), 125050);
  assert.equal(parseMoney("25k"), 2500000);
  assert.equal(parseMoney("2.5K"), 250000);
  assert.equal(parseMoney("0"), 0);
  // What money() shows can be typed straight back in.
  assert.equal(parseMoney(money(2500000)), 2500000);
  assert.equal(parseMoney(money(125050)), 125050);
  for (const bad of ["", "abc", "-500", "25,000 or so", "1.234", "$", "1e9", "25kk", "99999999999"]) {
    assert.equal(parseMoney(bad), null, bad);
  }
  assert.equal(parseCount("96"), 96);
  assert.equal(parseCount("1,204"), 1204);
  for (const bad of ["", "9.5", "-3", "about 90", "1e3"]) assert.equal(parseCount(bad), null, bad);
});

console.log("\nNext steps and due dates");

check("a day is a real calendar day, written one way", () => {
  assert.equal(isDay("2026-11-13"), true);
  assert.equal(isDay("2028-02-29"), true);
  for (const bad of ["", "2026-02-30", "2026-13-01", "13/11/2026", "2026-11-13T00:00", "tomorrow"]) {
    assert.equal(isDay(bad), false, bad);
  }
  assert.equal(daysBetween("2026-11-12", "2026-11-13"), 1);
  assert.equal(daysBetween("2026-11-12", "2026-11-12"), 0);
  assert.equal(daysBetween("2026-11-12", "2026-10-31"), -12);
  assert.equal(daysBetween("2026-12-31", "2027-01-01"), 1);
});

check("due is judged against today in Central time, not the server's", () => {
  // 03:30 UTC on the 13th is still the evening of the 12th in Chicago.
  const now = new Date("2026-11-13T03:30:00Z");
  assert.equal(centralIsoDay(now), "2026-11-12");
  assert.equal(dueState("2026-11-12", now), "today");
  assert.equal(dueState("2026-11-13", now), "later");
  assert.equal(dueState("2026-11-11", now), "overdue");
  assert.equal(dueState(null, now), "none");
  assert.equal(dueState("soon", now), "none");
  assert.equal(centralIsoDay(new Date("2026-03-05T18:00:00Z")), "2026-03-05");
});

check("a next step reads as a line, with its day", () => {
  const now = new Date("2026-11-12T18:00:00Z");
  assert.equal(dayLabel("2026-11-13", now), "Fri 13 Nov");
  assert.equal(dayLabel("2027-01-20", now), "Wed 20 Jan 2027");
  assert.equal(dayLabel("not a day", now), "not a day");
  assert.equal(nextStepLine("Send proposal", "2026-11-13", now), "Send proposal by Fri 13 Nov");
  assert.equal(nextStepLine("Send proposal", null, now), "Send proposal");
  assert.equal(nextStepLine("", "2026-11-13", now), "Due Fri 13 Nov");
  assert.equal(nextStepLine(null, null, now), "");
  assert.equal(nextStepLine("  ", "", now), "");
});

console.log("\nWhat the owner did");

check("each thing the owner records has a title, and none is drawn as a problem", () => {
  const now = new Date("2026-11-12T18:00:00Z");
  assert.deepEqual(eventTitle("stage_changed", { from: "call_held", to: "proposal_sent" }), {
    title: "Moved to Proposal sent",
    problem: false,
  });
  assert.equal(eventTitle("stage_changed", { from: "proposal_sent", to: "lost" }).title, "Closed · lost");
  assert.equal(eventTitle("stage_changed").title, "Stage changed");
  assert.equal(eventTitle("call_held").title, "Call held");
  assert.equal(eventTitle("no_show").title, "No-show");
  assert.equal(eventTitle("qualified").title, "Marked as a qualified opportunity");
  assert.equal(eventTitle("not_a_fit").title, "Closed · not a fit");
  assert.equal(eventTitle("next_step_set", { next_step: "Send proposal", due: null }).title, "Next step set");
  assert.equal(eventTitle("next_step_set", { next_step: null, due: null }).title, "Next step cleared");
  assert.equal(eventTitle("fee_set", { fee_cents: 2500000 }).title, "Fee set");
  assert.equal(eventTitle("fee_set", { fee_cents: null }).title, "Fee removed");
  assert.equal(eventTitle("notes_saved").title, "Notes saved");
  assert.equal(eventTitle("reopened").title, "Reopened");

  assert.equal(eventNote("stage_changed", { from: "call_held", to: "proposal_sent" }, now), "From Call held");
  assert.equal(eventNote("stage_changed", { from: "not_a_fit", to: "call_held" }, now), "From Closed · not a fit");
  assert.equal(eventNote("next_step_set", { next_step: "Send proposal", due: "2026-11-13" }, now), "Send proposal by Fri 13 Nov");
  assert.equal(eventNote("fee_set", { fee_cents: 2500000 }, now), "$25,000");
  assert.equal(eventNote("fee_set", { fee_cents: null }, now), "");
  assert.equal(eventNote("reopened", {}, now), "They inquired again");
  // The notes themselves are never on the timeline.
  assert.equal(eventNote("notes_saved", { anything: "x" }, now), "");
  assert.equal(eventNote("call_held", undefined, now), "");
});

check("the list names a move by where the lead now is", () => {
  assert.equal(activityLabel("stage_changed", { stage: "proposal_sent" }), "Moved to Proposal sent");
  assert.equal(activityLabel("stage_changed", { stage: "closed", closed_reason: "lost" }), "Closed · lost");
  assert.equal(activityLabel("stage_changed"), "Stage changed");
  assert.equal(activityLabel("no_show"), "No-show");
  assert.equal(activityLabel("qualified"), "Marked qualified");
  assert.equal(activityLabel("next_step_set"), "Next step set");
  assert.equal(activityLabel("next_step_set", { stage: "inquiry", next_step: "Send proposal" }), "Next step set");
  assert.equal(activityLabel("next_step_set", { stage: "inquiry", next_step: null, next_step_due: null }), "Next step cleared");
  assert.equal(activityLabel("fee_set", { stage: "inquiry", fee_cents: 2500000 }), "Fee set");
  assert.equal(activityLabel("fee_set", { stage: "inquiry", fee_cents: null }), "Fee removed");
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
