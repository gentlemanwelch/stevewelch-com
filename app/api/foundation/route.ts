import { NextResponse } from "next/server";
import { site } from "@/content/site";

/**
 * Welch Family Foundation partnership enquiries.
 *
 * Separate from /api/inquiry rather than a flag on it, for one concrete reason
 * beyond tidiness: that route uses a field named `website` as its honeypot, and
 * this form has a REAL website field. Sharing the route would have meant every
 * organisation that filled in its own URL being silently discarded as a bot — a
 * failure that looks like nothing at all from both ends. This one's honeypot is
 * `nickname`.
 *
 * Same Resend variables as the booking route: RESEND_API_KEY, INQUIRY_TO_EMAIL,
 * INQUIRY_FROM_EMAIL. Without the key it returns 503 and says so, rather than
 * accepting a submission it cannot deliver.
 */

export const runtime = "nodejs";

function clean(value: unknown, max = 500): string {
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
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Hidden from sight and from assistive technology; only a bot fills it.
  // Answer 200 so it learns nothing.
  if (clean(body.nickname)) return NextResponse.json({ ok: true });

  const organization = clean(body.organization, 200);
  const contact = clean(body.contact, 200);
  const email = clean(body.email, 200);

  if (!organization || !contact || !email) {
    return NextResponse.json(
      { error: "Organization, contact and email are required." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address looks wrong." }, { status: 400 });
  }

  const rows: [string, string][] = [
    ["Organization", organization],
    ["Contact", contact],
    ["Email", email],
    ["Phone", clean(body.phone, 60)],
    ["Website", clean(body.url, 300)],
    [
      "Mailing address",
      [
        clean(body.street, 200),
        [clean(body.city, 100), clean(body.region, 100)].filter(Boolean).join(", "),
        [clean(body.postalCode, 40), clean(body.country, 100)].filter(Boolean).join(" "),
      ]
        .filter(Boolean)
        .join(" · "),
    ],
    ["About", clean(body.about, 4000)],
  ];

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is not configured yet.", fallbackEmail: site.email },
      { status: 503 },
    );
  }

  const text = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const html = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<p><strong>${k}:</strong><br>${escapeHtml(v)}</p>`)
    .join("");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.INQUIRY_FROM_EMAIL ?? `website@${new URL(site.url).hostname}`,
        to: [process.env.INQUIRY_TO_EMAIL ?? site.email],
        reply_to: email,
        subject: `Foundation enquiry — ${organization}`,
        text,
        html,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
  } catch {
    return NextResponse.json(
      { error: "That did not send.", fallbackEmail: site.email },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
