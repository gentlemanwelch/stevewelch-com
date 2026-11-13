import "server-only";
import { crmConfigured, crmRpc, crmSelect } from "@/lib/crm/db";
import { dueState, isRecordId } from "@/lib/crm/format";
import type { ReportLead } from "@/lib/crm/reports";

/*
 * Reading leads for the CRM screens.
 *
 * Four reads: every lead for the list and the pipeline, one lead with
 * everything about it for its own page, the bare facts of every real lead
 * for the reports, and the count beside "Leads" in the menu. Each answers with `ok: false` and a reason instead of
 * throwing, so a screen can say "the records could not be read" in its own
 * layout rather than fall over.
 *
 * And the writes: what the owner did to a lead, and the weekly ad numbers.
 * Each is one database function, so a change and its line on the timeline
 * are saved together or not at all.
 *
 * WHAT IS LEFT OUT ON PURPOSE.
 *
 *   - The list never asks for an email address. It shows names and
 *     organizations; the address is on the lead's own page, one lead at a
 *     time.
 *   - No read asks for `reply_token`, the private half of a lead's reply
 *     address. Nothing on a screen needs it.
 *   - The reports read asks for no name, no organization and no message: a
 *     count needs none of them.
 *
 * CALLERS MUST HAVE CALLED `requireAdmin()` FIRST. These functions read with
 * the database's secret key and do not check who is asking.
 */

export type InquiryRow = {
  id: string;
  created_at: string;
  form: string;
  is_test: boolean;
  environment?: string;
  message?: string;
  event_name?: string | null;
  event_date: string | null;
  location?: string | null;
  audience_size?: string | null;
  format?: string | null;
  budget_band: string | null;
  budget_answer: string | null;
  source: string | null;
  landing_page: string | null;
  gclid: string | null;
  wbraid: string | null;
  gbraid: string | null;
  utm_source: string | null;
  utm_term?: string | null;
  notified_at: string | null;
  notify_error: string | null;
};

export type EventRow = {
  id?: number;
  at: string;
  kind: string;
  actor?: string;
  detail?: Record<string, unknown>;
  inquiry_id?: string | null;
};

export type LeadRow = {
  id: string;
  name: string;
  organization: string;
  email?: string;
  stage: string;
  /** The furthest open stage this lead has got to. */
  reached: string;
  closed_reason: string | null;
  qualified: boolean | null;
  next_step: string | null;
  next_step_due: string | null;
  fee_cents: number | null;
  notes?: string | null;
  is_test: boolean;
  created_at: string;
  inquiries: InquiryRow[];
  lead_events: EventRow[];
};

export type Read<T> = { ok: true; value: T } | { ok: false; reason: string };

const LIST_QUERY = [
  "select=id,name,organization,stage,reached,closed_reason,qualified,next_step,next_step_due,fee_cents," +
    "is_test,created_at," +
    "inquiries(id,created_at,form,is_test,budget_band,budget_answer,event_date,source,landing_page," +
    "gclid,wbraid,gbraid,utm_source,notified_at,notify_error)," +
    "lead_events(kind,at)",
  "order=created_at.desc",
  "inquiries.order=created_at.desc",
  "lead_events.order=at.desc",
  // Far more than a speaker's pipeline holds. If it is ever reached, the
  // list needs pages, and the screen says so rather than hiding the rest.
  "limit=500",
].join("&");

const ONE_QUERY = [
  "select=id,name,organization,email,stage,reached,closed_reason,qualified,next_step,next_step_due," +
    "fee_cents,notes,is_test,created_at," +
    "inquiries(id,created_at,form,is_test,environment,message,event_name,event_date,location," +
    "audience_size,format,budget_band,budget_answer,source,landing_page,gclid,wbraid,gbraid," +
    "utm_source,utm_term,notified_at,notify_error)," +
    "lead_events(id,at,kind,actor,detail,inquiry_id)",
  "inquiries.order=created_at.desc",
  // Two entries written in the same moment are told apart by which came first.
  "lead_events.order=at.asc,id.asc",
].join("&");

/*
 * For the reports. Real leads only, and only what a count needs. The limit
 * is the most the database returns in one answer; a report that reached it
 * would be an undercount, so the screen says so.
 */
export const REPORT_LIMIT = 1000;
const REPORT_QUERY = [
  "select=id,created_at,stage,reached,closed_reason,qualified," +
    "inquiries(created_at,form,gclid,wbraid,gbraid,utm_source,budget_answer,budget_band)",
  "is_test=is.false",
  "order=created_at.desc",
  `limit=${REPORT_LIMIT}`,
].join("&");

const AD_QUERY = "select=entered_at,campaign_started_on,spend_cents,clicks&order=entered_at.desc,id.desc&limit=1";

export const LIST_LIMIT = 500;

function reasonFrom(err: unknown): string {
  return err instanceof Error ? err.message : "unknown error";
}

/** Every lead, newest activity first. */
export async function listLeads(): Promise<Read<LeadRow[]>> {
  if (!crmConfigured()) return { ok: false, reason: "The CRM database is not connected." };
  try {
    const rows = await crmSelect<LeadRow>("leads", LIST_QUERY);
    const latest = (lead: LeadRow) =>
      Math.max(Date.parse(lead.created_at), ...lead.lead_events.map((e) => Date.parse(e.at)));
    return { ok: true, value: [...rows].sort((a, b) => latest(b) - latest(a)) };
  } catch (err) {
    console.error("[admin] leads could not be read:", reasonFrom(err));
    return { ok: false, reason: reasonFrom(err) };
  }
}

/** One lead with its inquiries and its timeline, or null if there is none. */
export async function getLead(id: string): Promise<Read<LeadRow | null>> {
  // Checked here as well as by the page: this value goes into a query.
  if (!isRecordId(id)) return { ok: true, value: null };
  if (!crmConfigured()) return { ok: false, reason: "The CRM database is not connected." };
  try {
    const rows = await crmSelect<LeadRow>("leads", `id=eq.${id.toLowerCase()}&${ONE_QUERY}`);
    return { ok: true, value: rows[0] ?? null };
  } catch (err) {
    console.error("[admin] a lead could not be read:", reasonFrom(err));
    return { ok: false, reason: reasonFrom(err) };
  }
}

/** Every real lead, with only what the reports count. */
export async function reportLeads(): Promise<Read<ReportLead[]>> {
  if (!crmConfigured()) return { ok: false, reason: "The CRM database is not connected." };
  try {
    return { ok: true, value: await crmSelect<ReportLead>("leads", REPORT_QUERY) };
  } catch (err) {
    console.error("[admin] the report could not be read:", reasonFrom(err));
    return { ok: false, reason: reasonFrom(err) };
  }
}

export type AdNumbers = {
  entered_at: string;
  campaign_started_on: string | null;
  spend_cents: number | null;
  clicks: number | null;
};

/** The ad numbers as last typed in, or null if none ever were. */
export async function adNumbers(): Promise<Read<AdNumbers | null>> {
  if (!crmConfigured()) return { ok: false, reason: "The CRM database is not connected." };
  try {
    const rows = await crmSelect<AdNumbers>("ad_weeks", AD_QUERY);
    return { ok: true, value: rows[0] ?? null };
  } catch (err) {
    console.error("[admin] the ad numbers could not be read:", reasonFrom(err));
    return { ok: false, reason: reasonFrom(err) };
  }
}

export type LeadAction = "stage" | "call_held" | "no_show" | "qualified" | "not_a_fit" | "details";

/**
 * Records one thing the owner did to a lead. Never throws: the answer says
 * whether it was saved, and if not, whether the lead is gone or the database
 * did not answer.
 */
export async function leadAction(
  id: string,
  action: LeadAction,
  args: Record<string, unknown>,
): Promise<{ status: "saved" | "gone" | "refused" | "failed" }> {
  if (!isRecordId(id) || !crmConfigured()) return { status: "failed" };
  try {
    const result = await crmRpc<{ ok?: boolean; reason?: string }>("crm_lead_action", {
      p_lead_id: id.toLowerCase(),
      p_action: action,
      p_args: args,
    });
    if (result?.ok) return { status: "saved" };
    return { status: result?.reason === "no_such_lead" ? "gone" : "refused" };
  } catch (err) {
    console.error("[admin] a change to a lead was not saved:", reasonFrom(err));
    return { status: "failed" };
  }
}

/** Saves the ad numbers. Only the keys given are changed. Never throws. */
export async function saveAdNumbers(args: Record<string, unknown>): Promise<boolean> {
  if (!crmConfigured()) return false;
  try {
    const result = await crmRpc<{ ok?: boolean }>("crm_save_ad_numbers", { p: args });
    return Boolean(result?.ok);
  } catch (err) {
    console.error("[admin] the ad numbers were not saved:", reasonFrom(err));
    return false;
  }
}

/*
 * What "needs you" looks at, and nothing else: whether an email to the owner
 * failed, and whether an open lead's next step has come due. Kept this narrow
 * so the menu's number can be worked out from a read that names nobody.
 */
type NotifyFacts = Pick<InquiryRow, "notified_at" | "notify_error">;
export type NeedsFacts = {
  stage: string;
  next_step_due: string | null;
  is_test?: boolean;
  inquiries: NotifyFacts[];
};

/** An inquiry the CRM holds that the inbox never got: saved, but not emailed. */
export function inquiryNeedsYou(inquiry: NotifyFacts): boolean {
  return !inquiry.notified_at && Boolean(inquiry.notify_error);
}

/** Whether the email about one of this lead's inquiries never reached the owner. */
export function leadEmailFailed(lead: Pick<NeedsFacts, "inquiries">): boolean {
  return lead.inquiries.some(inquiryNeedsYou);
}

/** An open lead whose next step is due today, or was due before today. */
export function leadStepDue(lead: Pick<NeedsFacts, "stage" | "next_step_due">, now: Date): "today" | "overdue" | null {
  if (lead.stage === "closed") return null;
  const state = dueState(lead.next_step_due, now);
  return state === "today" || state === "overdue" ? state : null;
}

export function leadNeedsYou(lead: NeedsFacts, now: Date): boolean {
  return leadEmailFailed(lead) || leadStepDue(lead, now) !== null;
}

/**
 * The number beside "Leads" in the menu: how many prospects need the owner.
 *
 * A TEST NEVER COUNTS, whether or not the screen is showing tests. The number
 * is about prospects, and it has to mean the same thing on every screen.
 */
export function countNeedsYou(leads: NeedsFacts[], now: Date): number {
  return leads.filter((lead) => !lead.is_test && leadNeedsYou(lead, now)).length;
}

const NEEDS_QUERY = [
  "select=stage,next_step_due,inquiries(notified_at,notify_error)",
  "is_test=is.false",
  `limit=${REPORT_LIMIT}`,
].join("&");

/**
 * That number, for a screen that has not read the list itself (a lead's own
 * page, the reports). It asks for no name, no organization and no address:
 * a count needs none of them. The Leads list and the Pipeline already hold
 * every lead and use `countNeedsYou` on what they have.
 *
 * NULL WHEN IT COULD NOT BE READ. The menu then shows no number, which is
 * honest; a zero would say "nothing needs you" on no evidence. It never
 * throws: a menu decoration must not take a screen down with it.
 */
export async function needsYouCount(now: Date): Promise<number | null> {
  if (!crmConfigured()) return null;
  try {
    return countNeedsYou(await crmSelect<NeedsFacts>("leads", NEEDS_QUERY), now);
  } catch (err) {
    console.error("[admin] the menu's count could not be read:", reasonFrom(err));
    return null;
  }
}
