import "server-only";
import { randomUUID } from "node:crypto";
import { crmConfigured, crmRpc } from "@/lib/crm/db";

/*
 * Saving an inquiry to the CRM.
 *
 * THE ONE RULE: NOTHING HERE MAY COST AN INQUIRY. The email to Steve is the
 * transaction; this record is a copy of it. So neither function below ever
 * throws. A save that fails is reported to the caller, who says so at the top
 * of the email, and the organizer never sees an error for it.
 *
 * The tables and the two database functions these call are in
 * supabase/migrations/001_crm_storage.sql.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * The id that makes a retry the same inquiry.
 *
 * The form generates it in the browser the first time it is sent and reuses
 * it on every retry (lib/submissionId.ts). Anything that is not a well-formed
 * id — an old cached copy of the form, a script posting by hand — gets a fresh
 * one here, which means it is saved and sent as its own inquiry, exactly as
 * every submission was before this existed.
 */
export function submissionIdFrom(value: unknown): string {
  return typeof value === "string" && UUID.test(value) ? value.toLowerCase() : randomUUID();
}

/** "production", "preview" or "development". Vercel sets it; a laptop does not. */
export function environmentName(): string {
  return process.env.VERCEL_ENV ?? "development";
}

/**
 * Whether this inquiry is a test rather than a prospect.
 *
 * Two ways to be one: it was sent anywhere other than the live site, or it
 * was sent FROM the address inquiries are delivered TO. Nobody books himself,
 * so an inquiry from the owner's own address is the owner checking the form.
 * Tests are saved, marked, and left out of every report.
 */
export function isTestInquiry(email: string, ownerEmail: string, environment: string): boolean {
  return (
    environment !== "production" ||
    email.trim().toLowerCase() === ownerEmail.trim().toLowerCase()
  );
}

export type InquiryRecord = {
  submission_id: string;
  form: string;
  environment: string;
  is_test: boolean;
  name: string;
  email: string;
  organization: string;
  message: string;
  event_name: string;
  event_date: string;
  location: string;
  audience_size: string;
  format: string;
  budget_band: string;
  source: string;
  landing_page: string;
  gclid: string;
  wbraid: string;
  gbraid: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  referrer: string;
};

export type SaveResult =
  /** The CRM is not switched on for this deployment. Nothing to report. */
  | { status: "off" }
  | { status: "saved"; leadId: string; inquiryId: string }
  /** It should have been saved and was not. The email to Steve says so. */
  | { status: "failed"; reason: string };

export async function recordInquiry(record: InquiryRecord): Promise<SaveResult> {
  if (!crmConfigured()) return { status: "off" };

  try {
    const row = await crmRpc<{ lead_id?: string; inquiry_id?: string }>("crm_record_inquiry", {
      p: record,
    });
    if (!row?.lead_id || !row?.inquiry_id) {
      throw new Error("the database answered without an id");
    }
    return { status: "saved", leadId: row.lead_id, inquiryId: row.inquiry_id };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown error";
    console.error("[inquiry] not saved to the CRM:", reason);
    return { status: "failed", reason };
  }
}

/**
 * Records what became of one of the form's two emails.
 *
 * `kind` is "notify" (the inquiry email to Steve) or "ack" (the instant reply
 * to the organizer). Does nothing unless the inquiry was saved, and a failure
 * to record is logged and dropped: the email itself has already gone or
 * failed, and that outcome is not changed by losing the note about it.
 */
export async function noteInquiryEmail(
  saved: SaveResult,
  kind: "notify" | "ack",
  ok: boolean,
  detail: Record<string, string> = {},
): Promise<void> {
  if (saved.status !== "saved") return;

  try {
    await crmRpc("crm_note_inquiry_email", {
      p_inquiry_id: saved.inquiryId,
      p_kind: kind,
      p_ok: ok,
      p_detail: detail,
    });
  } catch (err) {
    console.error(
      `[inquiry] could not record the ${kind} email:`,
      err instanceof Error ? err.message : err,
    );
  }
}
