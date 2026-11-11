import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { site } from "@/content/site";
import { adminSession, requestOrigin } from "@/lib/crm/session";

/**
 * "Send a test inquiry to myself", the button on the empty Leads page.
 *
 * It does not imitate the booking form. It SENDS one: a real request to this
 * site's own /api/inquiry/, the same address the public form posts to. So
 * the test goes through everything a visitor's inquiry goes through — the
 * save, the email to Steve, the instant reply — and proves the whole chain
 * rather than a copy of it.
 *
 * The inquiry comes from the address inquiries are delivered to. That is what
 * marks it as a test (see `isTestInquiry` in lib/crm/inquiries.ts): it is
 * saved, labelled, and left out of every report, and both emails arrive in
 * the owner's own inbox.
 *
 * Owner only, and only when this site's own page asks: the same two checks
 * as Sign out, for the same reasons.
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

  let sent = false;
  try {
    const res = await fetch(`${origin}/api/inquiry/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test inquiry",
        email: process.env.INQUIRY_TO_EMAIL ?? site.email,
        organization: "Sent from the CRM",
        message: "A test sent from the Leads page of the CRM. Nothing to answer.",
        form: "contact",
        submission_id: randomUUID(),
        attempt: 1,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    sent = res.ok;
  } catch (err) {
    console.error("[admin] the test inquiry was not sent:", err instanceof Error ? err.message : err);
  }

  // Tests are hidden from the list by default; show them, so the one just
  // sent is on screen when the page comes back.
  const response = NextResponse.redirect(
    new URL(`/admin/?tests=1&sent=${sent ? "ok" : "failed"}`, origin),
    303,
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
