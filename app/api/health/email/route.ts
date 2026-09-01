import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { site } from "@/content/site";

/**
 * Email delivery self-test.
 *
 * The booking form is the conversion point of the whole site, and its failure
 * mode is quiet: if the Resend key is wrong, expired, or sending from a domain
 * Resend has not verified, the organizer sees an error and the direct mailto
 * fallback, but nobody here finds out. A key that stops working in March is
 * discovered in June by noticing the inbox has gone oddly calm.
 *
 * So this route exists to turn "is email working?" into one URL. Open it and
 * it answers in plain sentences: is the key set, does Resend accept it, is the
 * From domain verified, and — with ?send=1 — does a real message arrive.
 *
 * SECURITY
 *
 * It is off unless DIAG_TOKEN is set in the environment, and a request without
 * the matching token gets a 404, identical to the route not existing. There is
 * no separate "wrong token" answer, because that would confirm to a prober
 * that the endpoint is here.
 *
 * The test send always goes to the configured inquiry address and never to an
 * address from the query string. A diagnostic that mails wherever it is told
 * is an open relay wearing a lab coat.
 *
 * Nothing here ever echoes the key. It reports whether Resend accepted it,
 * which is the only fact worth knowing and the only one safe to print.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const notFound = () =>
  new NextResponse("This page could not be found.", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });

/** Constant-time compare that does not leak length through early return. */
function tokenMatches(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still burn a comparison so a wrong length is not measurably faster.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

type Check = { label: string; ok: boolean | null; detail: string };

export async function GET(request: Request) {
  const expected = process.env.DIAG_TOKEN;
  if (!expected) return notFound();

  const url = new URL(request.url);
  const supplied = url.searchParams.get("token") ?? "";
  if (!tokenMatches(supplied, expected)) return notFound();

  const checks: Check[] = [];
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;
  const to = process.env.INQUIRY_TO_EMAIL ?? site.email;

  checks.push({
    label: "RESEND_API_KEY is set",
    ok: Boolean(apiKey),
    detail: apiKey
      ? `Yes — ${apiKey.length} characters, starts with "${apiKey.slice(0, 3)}".`
      : "No. The booking form will answer 503 and show the direct email address instead.",
  });

  checks.push({
    label: "INQUIRY_FROM_EMAIL is set",
    ok: Boolean(from),
    detail: from
      ? `Yes — ${from}`
      : "No. Both forms answer 503 and show the direct email address — they will not " +
        "guess a sender, because guessing one that Resend has not verified fails in a way " +
        "that looks like a bad key.",
  });

  checks.push({
    label: "INQUIRY_TO_EMAIL is set",
    ok: true,
    detail: process.env.INQUIRY_TO_EMAIL
      ? `Yes — ${to}`
      : `Not set, so inquiries fall back to ${to}. That is a real inbox, so this is safe.`,
  });

  // Ask Resend directly. A 401 here is the definitive answer to "is the key
  // working" — everything else is inference.
  let domains: { name: string; status: string }[] | null = null;
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) {
        checks.push({
          label: "Resend accepts the key",
          ok: false,
          detail:
            `No — Resend answered ${res.status}. The key is wrong, revoked, or belongs to ` +
            "another account. Create a new one at resend.com/api-keys and paste it into " +
            "the Vercel environment variables, then redeploy.",
        });
      } else if (!res.ok) {
        checks.push({
          label: "Resend accepts the key",
          ok: null,
          detail: `Unclear — Resend answered ${res.status}. That is usually Resend itself having a moment; try again shortly.`,
        });
      } else {
        const body = (await res.json()) as { data?: { name: string; status: string }[] };
        domains = body.data ?? [];
        checks.push({
          label: "Resend accepts the key",
          ok: true,
          detail: `Yes. The account has ${domains.length} domain${domains.length === 1 ? "" : "s"} registered.`,
        });
      }
    } catch (err) {
      checks.push({
        label: "Resend accepts the key",
        ok: null,
        detail: `Could not reach Resend at all: ${err instanceof Error ? err.message : "unknown error"}.`,
      });
    }
  }

  // A verified key sending from an unverified domain is the failure that looks
  // most like a broken key, so name it separately.
  if (domains && from) {
    const fromDomain = from.split("@")[1]?.toLowerCase() ?? "";
    const match = domains.find((d) => d.name.toLowerCase() === fromDomain);
    if (!match) {
      checks.push({
        label: `The From domain (${fromDomain}) is verified in Resend`,
        ok: false,
        detail:
          `No — Resend has no domain called ${fromDomain}. It knows about: ` +
          `${domains.map((d) => `${d.name} (${d.status})`).join(", ") || "none at all"}. ` +
          "Either add and verify that domain, or set INQUIRY_FROM_EMAIL to an address on a domain that is already verified.",
      });
    } else if (match.status !== "verified") {
      checks.push({
        label: `The From domain (${fromDomain}) is verified in Resend`,
        ok: false,
        detail:
          `Not yet — its status is "${match.status}". The DNS records Resend asks for are not all in place at IONOS. ` +
          "Sends will be rejected until they are.",
      });
    } else {
      checks.push({
        label: `The From domain (${fromDomain}) is verified in Resend`,
        ok: true,
        detail: "Yes. Mail from this address is signed and will not be treated as forged.",
      });
    }
  }

  // The end-to-end proof. Opt in, because it puts a real message in the inbox.
  if (url.searchParams.get("send") === "1" && apiKey && from) {
    try {
      /*
       * Deliberately the SAME payload shape the booking form sends — same
       * fields, reply_to included, html rather than text. A simpler test send
       * can succeed where the real one fails, which would send whoever is
       * debugging in exactly the wrong direction.
       */
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: to,
          subject: "Test — the booking form can send email",
          html:
            "<h2>Email delivery self-test</h2>" +
            "<p>If you are reading this, the booking form works end to end: the key is " +
            "good, the sending domain is verified, and inquiries will arrive here.</p>" +
            "<p>Nobody filled in a form to produce this. It came from " +
            "<code>/api/health/email/?send=1</code>.</p>",
        }),
      });
      if (res.ok) {
        checks.push({
          label: "A real test message was sent",
          ok: true,
          detail: `Resend accepted it for ${to}. Check that inbox — and the spam folder, which is where an unverified domain lands.`,
        });
      } else {
        checks.push({
          label: "A real test message was sent",
          ok: false,
          detail:
            `No — Resend answered ${res.status}. Its exact words: ` +
            `${(await res.text().catch(() => "")).slice(0, 800) || "(empty response)"}`,
        });
      }
    } catch (err) {
      checks.push({
        label: "A real test message was sent",
        ok: false,
        detail: `No — the request failed: ${err instanceof Error ? err.message : "unknown error"}.`,
      });
    }
  }

  const failed = checks.some((c) => c.ok === false);
  const unknown = checks.some((c) => c.ok === null);
  const verdict = failed
    ? "The booking form cannot send email right now."
    : unknown
      ? "Mostly fine, but one check could not be completed."
      : url.searchParams.get("send") === "1"
        ? "Email delivery works end to end."
        : "Everything checks out. Add ?send=1 to the URL to prove it with a real message.";

  const rows = checks
    .map((c) => {
      const mark = c.ok === true ? "✓" : c.ok === false ? "✕" : "?";
      const colour = c.ok === true ? "#15803d" : c.ok === false ? "#b91c1c" : "#a16207";
      return `<tr>
        <td style="padding:10px 12px;border-top:1px solid #e5e5e5;color:${colour};font-weight:700;font-size:18px;vertical-align:top">${mark}</td>
        <td style="padding:10px 12px;border-top:1px solid #e5e5e5">
          <strong>${escapeHtml(c.label)}</strong><br>
          <span style="color:#555">${escapeHtml(c.detail)}</span>
        </td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html><meta charset="utf-8"><title>Email delivery check</title>
<meta name="robots" content="noindex,nofollow">
<meta name="viewport" content="width=device-width,initial-scale=1">
<div style="max-width:44rem;margin:3rem auto;padding:0 1.25rem;font:16px/1.55 system-ui,sans-serif;color:#111">
  <h1 style="font-size:1.6rem;margin:0 0 .25rem">Email delivery check</h1>
  <p style="margin:0 0 1.5rem;color:#555">${escapeHtml(verdict)}</p>
  <table style="width:100%;border-collapse:collapse">${rows}</table>
  <p style="margin-top:2rem;font-size:13px;color:#777">
    Checked ${new Date().toUTCString()}. This page is not indexed and needs the token to open.
    It never shows the API key itself — only whether Resend accepts it.
  </p>
</div>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
