"use client";

import { useState } from "react";
import { site } from "@/content/site";

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

const BUDGET_RANGES = [
  "Under $10,000",
  "$10,000 – $15,000",
  "$15,000 – $25,000",
  "Over $25,000",
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

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
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
        <h2 className="text-2xl">Thank you — that went straight to Steve’s team.</h2>
        <p className="mt-3 text-[var(--color-ink-soft)]">
          You will normally hear back within two business days. If your event is on a
          tight timeline, reply to the confirmation or email{" "}
          <a className="text-[var(--color-accent)] underline underline-offset-4" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          directly and say so.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-[0.95rem] text-[var(--color-ink)] transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]";
  const label = "mb-1.5 block text-sm font-medium text-[var(--color-ink)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">Your name <span className="text-[var(--color-accent)]">*</span></label>
          <input id="name" name="name" type="text" required autoComplete="name" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="email">Email <span className="text-[var(--color-accent)]">*</span></label>
          <input id="email" name="email" type="email" required autoComplete="email" className={field} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="organization">Organization <span className="text-[var(--color-accent)]">*</span></label>
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

      <div>
        <label className={label} htmlFor="message">
          What do you need this session to accomplish? <span className="text-[var(--color-accent)]">*</span>
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

      {error && (
        <p role="alert" className="rounded-lg bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent)]">
          {error}{" "}
          <a className="underline underline-offset-2" href={`mailto:${site.email}`}>
            Email {site.email} instead
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-[var(--color-accent)] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--color-ink)] disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </button>

      <p className="text-xs text-[var(--color-ink-faint)]">
        Your details are used only to answer this inquiry. No list, no newsletter signup, no third party.
      </p>
    </form>
  );
}
