"use client";

import { useRef, useState } from "react";
import { site } from "@/content/site";
import { buttonClasses } from "@/lib/buttonStyles";
import { FIELD, LABEL, REQUIRED } from "@/lib/formStyles";
import { track, trackInquiry } from "@/lib/analytics";
import { readAttribution } from "@/lib/attribution";

/**
 * The booking inquiry form.
 *
 * Every SEO decision on this site exists to deliver a qualified event organizer
 * to this component, so it is designed around one tension: each additional
 * field costs completions, and each missing field costs an email round trip.
 *
 * The compromise made here is that only four fields are required — name, email,
 * organization, and what they want the session to do. Everything that helps
 * quote accurately (date, city, audience size, budget) is optional and asked
 * for anyway, because an organizer who is serious fills them in and one who is
 * not was never going to book.
 *
 * The budget field is deliberately a range selector rather than a free text
 * box. It gets an honest answer far more often, and it means the fee never has
 * to be published on the site to filter out unqualified inquiries.
 */

/*
 * Bands start AT the published floor, not below it.
 *
 * These used to open at "Under $10,000". Beside a page that says engagements
 * start at $20,000, that is an invitation to the exact inquiry the floor exists
 * to prevent — and on paid traffic each one costs a click and a reply.
 *
 * No band is capped at the top for the same reason the floor has no ceiling:
 * a number on a web page should never talk a larger budget down.
 *
 * Keep in step with `site.fee` in content/site.ts.
 */
const BUDGET_RANGES = [
  "$20,000 – $30,000",
  "$30,000 – $50,000",
  "Over $50,000",
  "Not yet determined",
];

const FORMATS = [
  "Keynote (45–60 min)",
  "Keynote + Q&A",
  "Fireside chat / moderated",
  "Workshop or executive session",
  "Podcast or media interview",
  "Not sure yet",
];

type Status = "idle" | "sending" | "sent" | "error";

export function InquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // `contact_form_start` fires once, on the first focus anywhere in the form —
  // the spec's measure of intent, and the denominator for the drop-off
  // between starting the form and sending it.
  const started = useRef(false);
  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track("contact_form_start", { location: "contact" });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    const formData = new FormData(event.currentTarget);
    /*
      Attribution is merged in here rather than read from this page's URL,
      because an ad click almost never lands directly on /contact/ — it lands
      on a landing page or the homepage and walks here. See lib/attribution.ts.
    */
    const payload = { ...Object.fromEntries(formData.entries()), ...readAttribution() };

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
      // Fires only here — on a confirmed 200 from the API, never on page load.
      trackInquiry("contact");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="border-t-2 border-navy bg-tint p-6 sm:p-8">
        <h2 className="!text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-extrabold">Thank you — that went straight to Steve’s team.</h2>
        <p className="mt-3">
          A confirmation is already on its way to your inbox. Steve reads every one of
          these himself and will reply personally. If your event is on a
          tight timeline, reply to the confirmation or email{" "}
          <a className="font-semibold text-action underline underline-offset-4" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          directly and say so.
        </p>
      </div>
    );
  }

  /*
   * Field styles are shared with the other two forms — lib/formStyles.ts. The
   * 16px text size in there is a floor, not a preference: iOS Safari
   * force-zooms the page when a field's text is under 16px and does not zoom
   * back out. This form was 0.95rem once and did exactly that. Do not shrink it.
   */
  const field = FIELD;
  const label = LABEL;

  return (
    <form onSubmit={handleSubmit} onFocusCapture={onStart} className="space-y-5">
      {/*
        Honeypot. Named to look like a real field to a naive bot but hidden from
        people and from screen readers. Anything that fills it in is rejected
        server-side. This is the whole spam defence — a public form on a site
        whose entire purpose is being found by strangers cannot sit behind a
        captcha without costing real inquiries.
      */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/*
        THE OUTCOME QUESTION COMES FIRST. The Built for Change spec: "The
        inquiry destination should foreground this question… it should not be
        buried at the bottom of the form." It is the philosophical
        differentiator — every keynote is built from the answer — and it used
        to be the last field, after nine logistics questions.
      */}
      <div>
        <label className={label} htmlFor="message">
          What do you need this session to accomplish? <span className={REQUIRED}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Who is in the room, what moment is the organization in, and what should be different when they walk out."
          className={field}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">Your name <span className={REQUIRED}>*</span></label>
          <input id="name" name="name" type="text" required autoComplete="name" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="email">Email <span className={REQUIRED}>*</span></label>
          <input id="email" name="email" type="email" required autoComplete="email" className={field} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="organization">Organization <span className={REQUIRED}>*</span></label>
          <input id="organization" name="organization" type="text" required autoComplete="organization" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="eventName">Event name</label>
          <input id="eventName" name="eventName" type="text" className={field} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="eventDate">Event date</label>
          <input id="eventDate" name="eventDate" type="date" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="location">City</label>
          <input id="location" name="location" type="text" placeholder="Austin, TX" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="audienceSize">Audience size</label>
          <input id="audienceSize" name="audienceSize" type="text" inputMode="numeric" placeholder="250" className={field} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="format">Format</label>
          <select id="format" name="format" defaultValue="" className={field}>
            <option value="">Select a format</option>
            {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="budget">Budget range</label>
          <select id="budget" name="budget" defaultValue="" className={field}>
            <option value="">Select a range</option>
            {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="border-l-4 border-action bg-tint px-4 py-3 text-[0.9375rem] text-navy">
          {error}{" "}
          <a className="font-semibold underline underline-offset-2" href={`mailto:${site.email}`}>
            Email {site.email} instead
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className={buttonClasses("primary", "w-full sm:w-auto sm:px-10")}
      >
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </button>

      <p className="text-[0.875rem] text-ink-faint">
        Your details are used only to answer this inquiry. No list, no newsletter signup, no third party.
      </p>
    </form>
  );
}
