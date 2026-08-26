"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";

/**
 * The paid-search inquiry form.
 *
 * Shorter than the organic booking form on purpose: a visitor who arrived from
 * an ad has less invested than one who read three pages first, and every extra
 * field costs completions. Date, city and audience size can be asked in the
 * reply. Budget stays, because it is what makes the reply useful.
 *
 * ATTRIBUTION is the thing this form does that the other one does not. Google
 * appends a `gclid` to every ad click; capturing it and sending it with the
 * inquiry is what lets a $15,000 booking be traced back to the keyword that
 * produced it. Without it, campaign performance is measured in form fills —
 * which is measuring the wrong thing when one booking pays for a year of ads.
 */

const BUDGET_RANGES = [
  "Under $10,000",
  "$10,000 – $15,000",
  "$15,000 – $25,000",
  "Over $25,000",
  "Not yet determined",
];

type Status = "idle" | "sending" | "sent" | "error";

export function LandingInquiryForm({
  campaign,
  ctaLabel,
}: {
  campaign: string;
  ctaLabel: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const attribution = useRef<Record<string, string>>({});

  /*
   * Read the click identifiers once on mount.
   *
   * This runs in an effect rather than during render because it touches
   * window.location — which does not exist while the page is being prerendered,
   * and would make the server and client markup disagree if it did.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const captured: Record<string, string> = {};
    for (const key of [
      "gclid", // Google Ads click id — the one that matters for attribution
      "wbraid", // iOS web-to-app click id
      "gbraid", // iOS app-to-web click id
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term", // the actual keyword, when the campaign passes it through
      "utm_content",
    ]) {
      const value = params.get(key);
      if (value) captured[key] = value.slice(0, 300);
    }
    captured.landingPage = campaign;
    if (document.referrer) captured.referrer = document.referrer.slice(0, 300);
    attribution.current = captured;
  }, [campaign]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(form.entries()),
      ...attribution.current,
      source: `Google Ads landing page: ${campaign}`,
    };

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong sending your message.");
      }
      setStatus("sent");

      /*
       * Fire the Google Ads conversion, if the tag is on the page.
       *
       * Guarded rather than assumed: the tag only exists once
       * NEXT_PUBLIC_GOOGLE_ADS_ID and a conversion label are configured, and a
       * missing tag must never break a successful submission. A booking that
       * arrived but did not report is a reporting problem; a booking lost to a
       * thrown error is a lost booking.
       */
      const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
      const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION;
      if (typeof w.gtag === "function" && sendTo) {
        w.gtag("event", "conversion", { send_to: sendTo });
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-[var(--radius-card)] bg-[var(--color-tint)] p-6">
        <p className="text-lg font-bold text-[var(--color-ink)]">
          Thank you — that went straight to Steve.
        </p>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          You will normally hear back within two business days. On a tight timeline?
          Email{" "}
          <a className="underline underline-offset-2" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          and say so.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-[var(--color-line)] bg-white px-4 py-3 text-[0.95rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — hidden from people and from assistive tech, rejected server-side. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor={`website-${campaign}`}>Website</label>
        <input id={`website-${campaign}`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="sr-only" htmlFor={`name-${campaign}`}>Your name</label>
        <input id={`name-${campaign}`} name="name" required autoComplete="name" placeholder="Your name" className={field} />
      </div>
      <div>
        <label className="sr-only" htmlFor={`email-${campaign}`}>Email</label>
        <input id={`email-${campaign}`} name="email" type="email" required autoComplete="email" placeholder="Email" className={field} />
      </div>
      <div>
        <label className="sr-only" htmlFor={`org-${campaign}`}>Organization</label>
        <input id={`org-${campaign}`} name="organization" required autoComplete="organization" placeholder="Organization" className={field} />
      </div>
      <div>
        <label className="sr-only" htmlFor={`budget-${campaign}`}>Budget range</label>
        <select id={`budget-${campaign}`} name="budget" defaultValue="" className={field}>
          <option value="">Budget range (optional)</option>
          {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label className="sr-only" htmlFor={`msg-${campaign}`}>About your event</label>
        <textarea
          id={`msg-${campaign}`}
          name="message"
          required
          rows={3}
          placeholder="Your event — date, audience, and what the session should accomplish"
          className={field}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-[var(--color-tint)] px-4 py-3 text-sm text-[var(--color-blue-deep)]">
          {error} <a className="underline" href={`mailto:${site.email}`}>Email {site.email} instead</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-[var(--radius-pill)] bg-[var(--color-blue)] px-6 py-3.5 font-bold text-white transition-colors hover:bg-[var(--color-navy)] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : ctaLabel}
      </button>

      <p className="text-xs text-[var(--color-ink-faint)]">
        Used only to answer this inquiry. No list, no newsletter, no third party.
      </p>
    </form>
  );
}
