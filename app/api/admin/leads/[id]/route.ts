import { NextResponse } from "next/server";
import { adminSession, requestOrigin } from "@/lib/crm/session";
import { leadAction, type LeadAction } from "@/lib/crm/leads";
import { isDay, isRecordId, isStageChoice, parseMoney } from "@/lib/crm/format";

/**
 * What the owner did to a lead: the forms on a lead's page post here.
 *
 *   action=stage      stage=<an open stage, or lost / not_a_fit / below_floor>
 *   action=call_held | no_show | qualified | not_a_fit
 *   action=details    next_step, due, fee, notes
 *
 * It writes to the database and does nothing else. In particular it sends no
 * email, to the lead or to anyone: the page promises that beside the buttons.
 *
 * OWNER ONLY, AND ONLY FROM THIS SITE'S OWN PAGE. The same two checks as
 * Sign out, for the same reasons: a link on another site must not be able to
 * move a lead, and a signed-out browser must not be able to either.
 *
 * WHAT WAS TYPED IS CHECKED HERE, before it goes near the database: the id
 * is a record id, the stage is one of the stages, a date is a date, a fee is
 * an amount. A field that fails is left as it was and named when the page
 * comes back; the fields that passed are saved, so a mistyped fee does not
 * cost the notes typed beside it.
 *
 * The answer is always a redirect back to the lead's page. Nothing about the
 * lead is in that address except the record id it already had.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIMPLE: LeadAction[] = ["call_held", "no_show", "qualified", "not_a_fit"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = requestOrigin(request);
  if (request.headers.get("origin") !== origin) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  if (!(await adminSession())) {
    return NextResponse.redirect(new URL("/admin/sign-in/", origin), 303);
  }

  const { id } = await params;
  if (!isRecordId(id)) {
    return NextResponse.json({ error: "No such lead." }, { status: 404 });
  }

  const form = await request.formData().catch(() => null);
  const text = (name: string) => {
    const value = form?.get(name);
    return typeof value === "string" ? value.trim() : "";
  };

  const action = text("action");
  const problems: string[] = [];
  let args: Record<string, unknown> | null = null;

  if (action === "stage") {
    const stage = text("stage");
    if (isStageChoice(stage)) args = { stage };
  } else if ((SIMPLE as string[]).includes(action)) {
    args = {};
  } else if (action === "details") {
    args = { next_step: text("next_step").slice(0, 200), notes: text("notes").slice(0, 5000) };

    const due = text("due");
    if (!due) args.due = null;
    else if (isDay(due)) args.due = due;
    else problems.push("due");

    const fee = text("fee");
    const cents = fee ? parseMoney(fee) : null;
    if (!fee) args.fee_cents = null;
    else if (cents !== null) args.fee_cents = cents;
    else problems.push("fee");
  }

  if (args === null) {
    problems.push("refused");
  } else {
    const { status } = await leadAction(id, action as LeadAction, args);
    if (status === "failed") problems.push("save");
    if (status === "refused") problems.push("refused");
    // "gone": the page this redirects to says the lead is not there.
  }

  const query = problems.length > 0 ? `?problem=${problems.join(",")}` : "";
  // Changing the stage is done at the top of the page; everything else is
  // done in the panel, so the page comes back with the panel in view.
  const anchor = action === "stage" ? "" : "#after-the-call";
  const response = NextResponse.redirect(new URL(`/admin/leads/${id.toLowerCase()}/${query}${anchor}`, origin), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
