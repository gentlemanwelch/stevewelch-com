import { NextResponse } from "next/server";
import { site } from "@/content/site";

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

  const details: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Organization", organization],
    ["Event", clean(body.eventName, 200)],
    ["Date", clean(body.eventDate, 40)],
    ["Location", clean(body.location, 200)],
    ["Audience size", clean(body.audienceSize, 40)],
    ["Format", clean(body.format, 100)],
    ["Budget", clean(body.budget, 100)],
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
  const attribution: [string, string][] = [
    ["Source", clean(body.source, 200)],
    ["Landing page", clean(body.landingPage, 100)],
    ["Google click ID (gclid)", clean(body.gclid, 300)],
    ["wbraid", clean(body.wbraid, 300)],
    ["gbraid", clean(body.gbraid, 300)],
    ["utm_source", clean(body.utm_source, 100)],
    ["utm_medium", clean(body.utm_medium, 100)],
    ["utm_campaign", clean(body.utm_campaign, 200)],
    ["utm_term (keyword)", clean(body.utm_term, 200)],
    ["utm_content", clean(body.utm_content, 200)],
    ["Referrer", clean(body.referrer, 300)],
  ].filter(([, value]) => value.length > 0) as [string, string][];

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL ?? site.email;
  const from = process.env.INQUIRY_FROM_EMAIL;

  if (!apiKey || !from) {
    console.error(
      "[inquiry] Email delivery is not configured. Set RESEND_API_KEY and " +
        "INQUIRY_FROM_EMAIL. Inquiry received from:",
      email,
    );
    return NextResponse.json(
      { error: "The form is not connected to email yet." },
      { status: 503 },
    );
  }

  const html = [
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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      // Replying to the notification replies to the organizer, which removes a
      // copy-paste from every response Steve sends.
      reply_to: email,
      subject: `${clean(body.landingPage, 100) ? "[Ads] " : ""}Speaking inquiry — ${organization}${
        clean(body.eventName, 200) ? ` (${clean(body.eventName, 200)})` : ""
      }`,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[inquiry] Resend rejected the send:", response.status, detail);
    return NextResponse.json({ error: "The message could not be sent." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
