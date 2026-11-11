import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { autoReplySubject, autoReplyText, autoReplyHtml } from "@/content/auto-reply";
import {
  environmentName,
  isTestInquiry,
  noteInquiryEmail,
  recordInquiry,
  submissionIdFrom,
} from "@/lib/crm/inquiries";
import { leadRecipient, sendOnce } from "@/lib/crm/resend";

/**
 * Booking inquiry endpoint.
 *
 * Delivery goes through Resend, which needs two environment variables:
 *
 *   RESEND_API_KEY      — from resend.com
 *   INQUIRY_TO_EMAIL    — where inquiries land (defaults to site.email)
 *   INQUIRY_FROM_EMAIL  — a verified sender on a domain you control
 *
 * When the key is absent the route says so plainly and returns 503 rather than
 * pretending to succeed. A booking form that silently swallows a $15,000
 * inquiry is worse than no form at all, and the client surfaces the direct
 * mailto link when it sees this failure.
 *
 * Resend is called over plain fetch rather than the SDK to keep this app's
 * dependency list at three packages. The API is one POST.
 *
 * THE CRM RECORD. Each inquiry is also saved to the CRM database (lib/crm/),
 * when SUPABASE_URL and SUPABASE_SECRET_KEY are set. Three things about that:
 *
 *   1. It is a copy. The email to Steve is the transaction, and nothing about
 *      the save may cost it: a save that fails is logged, announced at the top
 *      of that email, and never shown to the organizer.
 *   2. It happens FIRST, so the email can say whether it worked. A record that
 *      exists with no email sent is the useful kind of inconsistency — the CRM
 *      knows about an inquiry the inbox missed. The reverse would be silent.
 *   3. Without the two settings nothing is saved, and nothing else in this
 *      route waits on them: both emails go out as they always have.
 *
 * ONE SUBMISSION, ONE OF EACH EMAIL. The form sends an id with every
 * submission and reuses it on a retry (lib/submissionId.ts), so the record is
 * one row however many times it is sent. Both sends below are keyed on that
 * id and the attempt number, so a double click produces one inquiry email and
 * one acknowledgement — see `sendOnce` in lib/crm/resend.ts.
 */

export const runtime = "nodejs";

type Payload = Record<string, unknown>;

/** Guards against header injection and absurd inputs before anything is sent. */
function clean(value: unknown, max = 2000): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: only a bot fills a field that is positioned off-screen and
  // hidden from assistive technology. Answer 200 so it does not learn.
  if (clean(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  const organization = clean(body.organization, 200);
  const message = clean(body.message, 5000);

  if (!name || !email || !organization || !message) {
    return NextResponse.json(
      { error: "Please fill in your name, email, organization, and message." },
      { status: 400 },
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
  }

  const eventName = clean(body.eventName, 200);
  const eventDate = clean(body.eventDate, 40);
  const location = clean(body.location, 200);
  const audienceSize = clean(body.audienceSize, 40);
  const format = clean(body.format, 100);
  const budget = clean(body.budget, 100);

  const details: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Organization", organization],
    ["Event", eventName],
    ["Date", eventDate],
    ["Location", location],
    ["Audience size", audienceSize],
    ["Format", format],
    ["Budget", budget],
  ].filter(([, value]) => value.length > 0) as [string, string][];

  /*
   * Paid-search attribution.
   *
   * Sent only when the inquiry came from a landing page, and kept in a separate
   * block so it never clutters an organic inquiry. The gclid is the valuable
   * one: it is what lets a booking be traced back to the keyword that produced
   * it, which is the difference between measuring form fills and measuring
   * revenue. One $15,000 booking can justify a year of ad spend, and without
   * this you cannot tell which campaign produced it.
   */
  const source = clean(body.source, 200);
  const landingPage = clean(body.landingPage, 100);
  const gclid = clean(body.gclid, 300);
  const wbraid = clean(body.wbraid, 300);
  const gbraid = clean(body.gbraid, 300);
  const utmSource = clean(body.utm_source, 100);
  const utmMedium = clean(body.utm_medium, 100);
  const utmCampaign = clean(body.utm_campaign, 200);
  const utmTerm = clean(body.utm_term, 200);
  const utmContent = clean(body.utm_content, 200);
  const referrer = clean(body.referrer, 300);

  const attribution: [string, string][] = [
    ["Source", source],
    ["Landing page", landingPage],
    ["Google click ID (gclid)", gclid],
    ["wbraid", wbraid],
    ["gbraid", gbraid],
    ["utm_source", utmSource],
    ["utm_medium", utmMedium],
    ["utm_campaign", utmCampaign],
    ["utm_term (keyword)", utmTerm],
    ["utm_content", utmContent],
    ["Referrer", referrer],
  ].filter(([, value]) => value.length > 0) as [string, string][];

  /*
   * The "[Ads] " prefix on the notification subject.
   *
   * Added ONLY when a Google click identifier is present — gclid, wbraid or
   * gbraid — because Google appends those to an ad click and nothing else
   * does. It used to key on `landingPage`, which is also recorded for any
   * utm-tagged arrival (a newsletter link, a social post), so those inquiries
   * were labelled as paid when no ad had been clicked. An inquiry with no
   * click identifier is unlabelled wherever it was submitted; the "Where this
   * came from" block in the body still names the page.
   */
  const fromAdClick = Boolean(gclid || wbraid || gbraid);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL ?? site.email;
  const from = process.env.INQUIRY_FROM_EMAIL;

  /*
   * Save it to the CRM before anything is sent — see "THE CRM RECORD" above.
   *
   * `submissionId` is what makes a second send of the same form the same
   * inquiry, in the record here and in both emails below.
   *
   * A test is an inquiry sent anywhere but the live site, or sent from the
   * address inquiries are delivered to. It is saved and marked, its subject
   * says so, and it stays out of every report.
   */
  const submissionId = submissionIdFrom(body.submission_id);
  /*
   * Which try this is. The form starts at 1 and adds one each time it shows
   * the organizer an error, so "Send" pressed again after a failure is a new
   * attempt with its own send key and is really sent, while a double click is
   * the same attempt and is sent once. Anything else is treated as the first.
   */
  const attempt =
    typeof body.attempt === "number" && Number.isInteger(body.attempt) && body.attempt >= 1 && body.attempt <= 50
      ? body.attempt
      : 1;
  const environment = environmentName();
  const isTest = isTestInquiry(email, to, environment);

  const saved = await recordInquiry({
    submission_id: submissionId,
    // Both forms name themselves. A copy of the form cached from before they
    // did is told apart by the one thing only the landing form ever sent.
    form: clean(body.form, 60) || (source.startsWith("Google Ads landing page") ? "landing" : "contact"),
    environment,
    is_test: isTest,
    name,
    email,
    organization,
    message,
    event_name: eventName,
    event_date: eventDate,
    location,
    audience_size: audienceSize,
    format,
    budget_band: budget,
    source,
    landing_page: landingPage,
    gclid,
    wbraid,
    gbraid,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    utm_content: utmContent,
    referrer,
  });

  if (!apiKey || !from) {
    console.error(
      "[inquiry] Email delivery is not configured. Set RESEND_API_KEY and " +
        "INQUIRY_FROM_EMAIL. Inquiry received from:",
      email,
    );
    await noteInquiryEmail(saved, "notify", false, { error: "Email delivery is not configured." });
    return NextResponse.json(
      { error: "The form is not connected to email yet." },
      { status: 503 },
    );
  }

  const html = [
    /*
     * Said first, in the one email that is certain to be read. Without this
     * line a database outage would look like nothing at all: inquiries would
     * keep arriving and the CRM would quietly stop knowing about them.
     */
    ...(saved.status === "failed"
      ? [
          `<p style="margin:0 0 16px;padding:10px 12px;border-left:4px solid #b91c1c;background:#fef2f2;color:#7f1d1d">` +
            `<strong>This inquiry was not saved to the CRM.</strong> It exists only in this email. ` +
            `The database said: ${escapeHtml(saved.reason.slice(0, 300))}</p>`,
        ]
      : []),
    ...(isTest
      ? [
          `<p style="margin:0 0 16px;padding:10px 12px;border-left:4px solid #a16207;background:#fefce8;color:#713f12">` +
            `<strong>Test inquiry.</strong> Sent from ${escapeHtml(environment)}` +
            `${environment === "production" ? ", from the address inquiries are delivered to" : ""}.` +
            `${saved.status === "saved" ? " It is marked as a test in the CRM and left out of the reports." : ""}</p>`,
        ]
      : []),
    `<h2>New speaking inquiry</h2>`,
    `<table cellpadding="6" style="border-collapse:collapse">`,
    ...details.map(
      ([k, v]) =>
        `<tr><td style="font-weight:600">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`,
    ),
    `</table>`,
    `<h3>What they need the session to accomplish</h3>`,
    `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    ...(attribution.length > 0
      ? [
          `<h3>Where this came from</h3>`,
          `<table cellpadding="6" style="border-collapse:collapse;font-size:13px;color:#555">`,
          ...attribution.map(
            ([k, v]) =>
              `<tr><td style="font-weight:600">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`,
          ),
          `</table>`,
        ]
      : []),
  ].join("");

  const notified = await sendOnce(
    apiKey,
    {
      from,
      to: [to],
      // Replying to the notification replies to the organizer, which removes a
      // copy-paste from every response Steve sends.
      reply_to: email,
      subject: `${isTest ? "[Test] " : ""}${fromAdClick ? "[Ads] " : ""}Speaking inquiry — ${organization}${
        eventName ? ` (${eventName})` : ""
      }`,
      html,
    },
    `inquiry-notify/${submissionId}/${attempt}`,
  );

  if (!notified.ok) {
    console.error("[inquiry] Resend rejected the send:", notified.status, notified.detail);
    // The record now knows what the inbox does not: an inquiry arrived and
    // Steve was never told. The organizer is shown the direct address.
    await noteInquiryEmail(saved, "notify", false, {
      error: `Resend ${notified.status}: ${notified.detail}`.slice(0, 500),
    });
    return NextResponse.json({ error: "The message could not be sent." }, { status: 502 });
  }

  /*
   * The instant acknowledgement to the organizer.
   *
   * ORDER AND ERROR HANDLING ARE THE WHOLE POINT HERE. The notification to
   * Steve is sent and checked FIRST, above. Only then is the auto-reply
   * attempted, and its failure is logged and swallowed — never returned.
   *
   * Reason: these two emails are not equally important. If the auto-reply
   * fails, an organizer misses a courtesy and Steve still gets the booking.
   * If a failed auto-reply were allowed to produce a 502, the organizer would
   * be told their message did not send, and would go and email a different
   * speaker — losing a $20,000 booking that had, in fact, already arrived.
   * Never let the nicety fail the transaction.
   *
   * Sent FROM Steve with reply_to Steve, so a reply lands in his inbox and the
   * thread is already started when he answers.
   *
   * OFF THE LIVE SITE IT GOES TO STEVE, NOT TO THE ADDRESS TYPED. See
   * `leadRecipient`: a preview build must never email whoever's address was
   * typed into it while testing.
   */
  const ack = { name, organization, eventName, eventDate };
  const recipient = leadRecipient(email, to, environment);

  const [, acknowledged] = await Promise.all([
    noteInquiryEmail(saved, "notify", true, notified.id ? { resend_id: notified.id } : {}),
    sendOnce(
      apiKey,
      {
        from: `${site.name} <${from}>`,
        to: [recipient.to],
        reply_to: to,
        subject: `${
          recipient.redirectedFrom ? `[Test: would go to ${recipient.redirectedFrom}] ` : ""
        }${autoReplySubject(ack)}`,
        text: autoReplyText(ack),
        html: autoReplyHtml(ack),
      },
      `inquiry-ack/${submissionId}/${attempt}`,
    ),
  ]);

  if (acknowledged.ok) {
    await noteInquiryEmail(saved, "ack", true, acknowledged.id ? { resend_id: acknowledged.id } : {});
  } else {
    console.error("[inquiry] auto-reply not sent:", acknowledged.status, acknowledged.detail);
    await noteInquiryEmail(saved, "ack", false, {
      error: `Resend ${acknowledged.status}: ${acknowledged.detail}`.slice(0, 500),
    });
  }

  return NextResponse.json({ ok: true });
}
