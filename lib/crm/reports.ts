/*
 * How the CRM counts: the funnel, the sources, the spend gates.
 *
 * Pure, like format.ts: leads in, numbers out, no database and no request, so
 * every rule here is checked directly (scripts/test-crm-reports.mjs). It
 * imports only format.ts, by its full file name, which is what lets Node run
 * both files as they are.
 *
 * THE RULE THESE COUNTS KEEP. A form fill is never counted as a booked call,
 * and a booked call is never counted as an engagement:
 *
 *   - "Call booked", "Call held" and "Proposal sent" count the leads that got
 *     AT LEAST that far. `reached` only moves when the owner (or, later, the
 *     calendar) says a thing happened, so an inquiry alone is never in them.
 *   - "Booked" counts only the leads that are booked NOW. One that was booked
 *     and then lost is not an engagement.
 *
 * A LEAD BELONGS TO THE SOURCE OF ITS FIRST INQUIRY. Someone who found the
 * site on their own and inquired again after an ad click is still organic, so
 * no lead is counted under two sources.
 *
 * TESTS ARE NEVER COUNTED. The caller reads only real leads.
 */
import { budgetFits, cameFromAnAd, centralIsoDay, daysBetween, isDay, sourceLabel, stageRank, type SourceFields } from "./format.ts";

export type ReportInquiry = SourceFields & {
  created_at: string;
  budget_answer?: string | null;
  budget_band?: string | null;
};

export type ReportLead = {
  id: string;
  created_at: string;
  stage: string;
  reached: string;
  closed_reason: string | null;
  qualified: boolean | null;
  inquiries: ReportInquiry[];
};

const byTime = (a: ReportInquiry, b: ReportInquiry) => Date.parse(a.created_at) - Date.parse(b.created_at);

/** The inquiry that first brought this lead in. */
export function firstInquiry(lead: ReportLead): ReportInquiry | undefined {
  return [...lead.inquiries].sort(byTime)[0];
}

/** The most recent thing this lead told us. */
export function latestInquiry(lead: ReportLead): ReportInquiry | undefined {
  return [...lead.inquiries].sort(byTime).at(-1);
}

export const PERIODS = { "30": 30, "90": 90, all: null } as const;
export type Period = keyof typeof PERIODS;

/** The period a page was asked for, or 90 days when it was asked for nothing sensible. */
export function periodFrom(value: string | undefined): Period {
  return value === "30" || value === "all" ? value : "90";
}

/** The leads who first inquired within the period. */
export function inPeriod(leads: ReportLead[], period: Period, now: Date): ReportLead[] {
  const days = PERIODS[period];
  if (days === null) return leads;
  const since = now.getTime() - days * 86_400_000;
  return leads.filter((lead) => Date.parse(lead.created_at) >= since);
}

const gotAsFarAs = (lead: ReportLead, stage: string) => stageRank(lead.reached) >= stageRank(stage);
const isBooked = (lead: ReportLead) => lead.stage === "booked";

export type Funnel = {
  inquiries: number;
  budgetFit: number;
  callBooked: number;
  callHeld: number;
  proposalSent: number;
  booked: number;
};

export function funnel(leads: ReportLead[]): Funnel {
  const count = (test: (lead: ReportLead) => boolean) => leads.filter(test).length;
  return {
    inquiries: leads.length,
    budgetFit: count((lead) => budgetFits(latestInquiry(lead) ?? {})),
    callBooked: count((lead) => gotAsFarAs(lead, "call_booked")),
    callHeld: count((lead) => gotAsFarAs(lead, "call_held")),
    proposalSent: count((lead) => gotAsFarAs(lead, "proposal_sent")),
    booked: count(isBooked),
  };
}

export type SourceRow = { source: string; inquiries: number; callsBooked: number; callsHeld: number; booked: number };

/** One row per source, the busiest first. */
export function bySource(leads: ReportLead[]): SourceRow[] {
  const rows = new Map<string, SourceRow>();
  for (const lead of leads) {
    const source = sourceLabel(firstInquiry(lead) ?? {});
    const row = rows.get(source) ?? { source, inquiries: 0, callsBooked: 0, callsHeld: 0, booked: 0 };
    row.inquiries += 1;
    if (gotAsFarAs(lead, "call_booked")) row.callsBooked += 1;
    if (gotAsFarAs(lead, "call_held")) row.callsHeld += 1;
    if (isBooked(lead)) row.booked += 1;
    rows.set(source, row);
  }
  return [...rows.values()].sort((a, b) => b.inquiries - a.inquiries || a.source.localeCompare(b.source));
}

export type AdCounts = { inquiries: number; qualified: number; qualifiedCallsHeld: number; booked: number };

/**
 * What the ads have produced since the campaign began. Before there is a
 * start date, every lead from an ad click is counted.
 */
export function adCounts(leads: ReportLead[], startedOn: string | null): AdCounts {
  const fromAds = leads.filter((lead) => {
    if (!cameFromAnAd(firstInquiry(lead) ?? {})) return false;
    return startedOn && isDay(startedOn) ? centralIsoDay(new Date(lead.created_at)) >= startedOn : true;
  });
  return {
    inquiries: fromAds.length,
    qualified: fromAds.filter((lead) => lead.qualified === true).length,
    qualifiedCallsHeld: fromAds.filter((lead) => lead.qualified === true && gotAsFarAs(lead, "call_held")).length,
    booked: fromAds.filter(isBooked).length,
  };
}

/**
 * Which day of the campaign today is: 1 on its first day. Null when there is
 * no start date; zero or less when it has not begun.
 */
export function campaignDay(startedOn: string | null, now: Date): number | null {
  if (!startedOn || !isDay(startedOn)) return null;
  return daysBetween(startedOn, centralIsoDay(now)) + 1;
}

export type GateStatus = "met" | "not_yet" | "not_met";

/**
 * Where a spend gate stands. Met once the count is there, whenever that is.
 * Not met only once its day (or, where the gate has one, its click count)
 * has passed without it.
 */
export function gateStatus(gate: {
  soFar: number;
  needs: number;
  byDay: number;
  day: number | null;
  byClicks?: number;
  clicks?: number | null;
}): GateStatus {
  if (gate.soFar >= gate.needs) return "met";
  const outOfDays = gate.day !== null && gate.day > gate.byDay;
  const outOfClicks = gate.byClicks !== undefined && typeof gate.clicks === "number" && gate.clicks >= gate.byClicks;
  return outOfDays || outOfClicks ? "not_met" : "not_yet";
}

/** Spend divided by a count, in cents, or null when either is missing. */
export function costPer(spendCents: number | null | undefined, count: number): number | null {
  if (typeof spendCents !== "number" || count <= 0) return null;
  return Math.round(spendCents / count);
}
