"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { buttonClasses } from "@/lib/buttonStyles";
import { FIELD } from "@/lib/formStyles";
import { track, trackInquiry } from "@/lib/analytics";
import { readAttribution } from "@/lib/attribution";

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

/* Must match InquiryForm and site.fee — see the note there. This is the form
   reached by paid clicks, so an under-budget option here costs real money. */
const BUDGET_RANGES = [
  "$20,000 – $30,000",
  "$30,000 – $50,000",
  "Over $50,000",
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
  const started = useRef(false);
  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track("contact_form_start", { location: `lp_${campaign}` });
  };

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
      ...readAttribution(),
      ...attribution.current,
      source: `Google Ads landing page: ${campaign}`,
    };

    try {
      // Trailing slash on purpose: next.config sets trailingSlash, so posting
      // to the bare path answers 308 and the browser has to send the whole body
      // twice. A redirect on the one request that carries a real enquiry.
      const res = await fetch("/api/inquiry/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong sending your message.");
      }
      setStatus("sent");
      trackInquiry("landing");

      /*
       * `trackInquiry` fires BOTH the GA4 event and the Google Ads conversion.
       * There used to be a second `gtag("event", "conversion")` here, reading
       * NEXT_PUBLIC_GOOGLE_ADS_CONVERSION — a name the README once told people
       * to set. With it set, every paid inquiry counted twice, and Smart
       * Bidding learns from exactly that number. Removed; do not add another.
       */
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="border-t-2 border-navy bg-tint p-6">
        <p className="text-lg font-bold text-navy">
          Thank you — that went straight to Steve’s team.
        </p>
        <p className="mt-2 text-[0.9375rem]">
          A confirmation is on its way to your inbox. Steve reads these himself and
          will reply personally. On a tight timeline?
          Email{" "}
          <a className="font-semibold text-action underline underline-offset-2" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          and say so.
        </p>
      </div>
    );
  }

  // Shared with the other forms — lib/formStyles.ts. 16px minimum: under
  // that iOS Safari zooms the page on focus and stays zoomed.
  const field = FIELD;

  return (
    <form onSubmit={handleSubmit} onFocusCapture={onStart} className="space-y-4">
      {/* Honeypot — hidden from people and from assistive tech, rejected server-side. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor={`website-${campaign}`}>Website</label>
        <input id={`website-${campaign}`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* The outcome question first — see the note in InquiryForm. */}
      <div>
        <label className="sr-only" htmlFor={`msg-${campaign}`}>What do you need this session to accomplish?</label>
        <textarea
          id={`msg-${campaign}`}
          name="message"
          required
          rows={3}
          placeholder="What do you need this session to accomplish? Date and audience help too."
          className={field}
        />
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

      {error && (
        <p role="alert" className="border-l-4 border-action bg-tint px-4 py-3 text-[0.9375rem] text-navy">
          {error} <a className="font-semibold underline" href={`mailto:${site.email}`}>Email {site.email} instead</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className={buttonClasses("primary", "w-full")}
      >
        {status === "sending" ? "Sending…" : ctaLabel}
      </button>

      <p className="text-[0.875rem] text-ink-faint">
        Used only to answer this inquiry. No list, no newsletter, no third party.
      </p>
    </form>
  );
}
