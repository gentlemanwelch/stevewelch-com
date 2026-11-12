import "server-only";
import { crmConfigured, crmSelect } from "@/lib/crm/db";
import { isRecordId } from "@/lib/crm/format";

/*
 * Reading leads for the CRM screens.
 *
 * Two reads: every lead for the list, and one lead with everything about it
 * for its own page. Both answer with `ok: false` and a reason instead of
 * throwing, so a screen can say "the records could not be read" in its own
 * layout rather than fall over.
 *
 * WHAT IS LEFT OUT ON PURPOSE.
 *
 *   - The list never asks for an email address. It shows names and
 *     organizations; the address is on the lead's own page, one lead at a
 *     time.
 *   - Neither read asks for `reply_token`, the private half of a lead's
 *     reply address. Nothing on a screen needs it.
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
  is_test: boolean;
  created_at: string;
  inquiries: InquiryRow[];
  lead_events: EventRow[];
};

export type Read<T> = { ok: true; value: T } | { ok: false; reason: string };

const LIST_QUERY = [
  "select=id,name,organization,stage,is_test,created_at," +
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
  "select=id,name,organization,email,stage,is_test,created_at," +
    "inquiries(id,created_at,form,is_test,environment,message,event_name,event_date,location," +
    "audience_size,format,budget_band,budget_answer,source,landing_page,gclid,wbraid,gbraid," +
    "utm_source,utm_term,notified_at,notify_error)," +
    "lead_events(id,at,kind,actor,detail,inquiry_id)",
  "inquiries.order=created_at.desc",
  "lead_events.order=at.asc",
].join("&");

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

/** An inquiry the CRM holds that the inbox never got: saved, but not emailed. */
export function inquiryNeedsYou(inquiry: InquiryRow): boolean {
  return !inquiry.notified_at && Boolean(inquiry.notify_error);
}

export function leadNeedsYou(lead: LeadRow): boolean {
  return lead.inquiries.some(inquiryNeedsYou);
}
