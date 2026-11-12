import { NextResponse } from "next/server";
import { adminSession, requestOrigin } from "@/lib/crm/session";
import { saveAdNumbers } from "@/lib/crm/leads";
import { isDay, parseCount, parseMoney } from "@/lib/crm/format";
import { periodFrom } from "@/lib/crm/reports";

/**
 * The numbers typed in from Google Ads on the Reports page: the first day of
 * the campaign, spend to date, clicks to date.
 *
 * Owner only, and only from this site's own page, like every other form in
 * the CRM. A field left empty is cleared; a field that is not a date, an
 * amount or a whole number is left as it was and named when the page comes
 * back, and the fields that passed are saved.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (request.headers.get("origin") !== origin) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  if (!(await adminSession())) {
    return NextResponse.redirect(new URL("/admin/sign-in/", origin), 303);
  }

  const form = await request.formData().catch(() => null);
  const text = (name: string) => {
    const value = form?.get(name);
    return typeof value === "string" ? value.trim() : "";
  };

  const problems: string[] = [];
  const args: Record<string, unknown> = {};

  const started = text("started");
  if (!started) args.campaign_started_on = null;
  else if (isDay(started)) args.campaign_started_on = started;
  else problems.push("started");

  const spend = text("spend");
  const cents = spend ? parseMoney(spend) : null;
  if (!spend) args.spend_cents = null;
  else if (cents !== null) args.spend_cents = cents;
  else problems.push("spend");

  const clicks = text("clicks");
  const count = clicks ? parseCount(clicks) : null;
  if (!clicks) args.clicks = null;
  else if (count !== null) args.clicks = count;
  else problems.push("clicks");

  if (Object.keys(args).length > 0 && !(await saveAdNumbers(args))) problems.push("save");

  const query = new URLSearchParams();
  const period = periodFrom(text("period"));
  if (period !== "90") query.set("period", period);
  if (problems.length > 0) query.set("problem", problems.join(","));
  const search = query.toString() ? `?${query.toString().replace(/%2C/g, ",")}` : "";

  const response = NextResponse.redirect(new URL(`/admin/reports/${search}#ad-numbers`, origin), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
