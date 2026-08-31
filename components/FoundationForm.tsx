"use client";

import { useState } from "react";
import { foundation } from "@/content/foundation";
import { site } from "@/content/site";

/**
 * The Foundation's partnership enquiry form.
 *
 * WHAT THIS REPLACES. The original page embeds `[gravityform id="4"]` — Gravity
 * Forms, a WordPress plugin. Its field definitions live in the WordPress
 * database, and a WXR export carries pages, posts and media only, so nothing in
 * this repo describes it. These fields are transcribed from Steve's screenshot
 * of the live form, which showed "Step 1 of 3 — Basic Information" and its ten
 * fields. Steps two and three are not recoverable from anything here; the
 * fastest way to get them is a Gravity Forms JSON export off the live site.
 *
 * ONE STEP, NOT THREE, DELIBERATELY. A three-step wizard whose last two steps
 * are guesses would be worse than the ten real fields asked plainly, and a
 * progress bar reading "33%" over a form with nothing behind it is a lie to the
 * person filling it in. The free-text box at the end is here because the
 * original's step one collects contact details and nothing about the work — an
 * organisation that reaches the end of this form should be able to say what it
 * actually does.
 *
 * Posts to /api/foundation, which is separate from the booking route because
 * that one treats a field called `website` as a bot trap and this form asks for
 * a real one.
 */
export function FoundationForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError(null);

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      // Trailing slash on purpose: next.config sets trailingSlash, so posting
      // to the bare path answers 308 and the browser has to send the whole body
      // twice. A redirect on the one request that carries a real enquiry.
      const res = await fetch("/api/foundation/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setError(json.error ?? "That did not send.");
        return;
      }
      setState("sent");
    } catch {
      setState("error");
      setError("That did not send.");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <h3 className="text-[var(--color-blue-deep)]">Thank you — that reached us.</h3>
        <p className="mt-3 leading-relaxed text-[var(--color-ink-soft)]">
          Steve and Nicole read these themselves. You will hear back.
        </p>
      </div>
    );
  }

  const f = foundation.form.fields;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="organization" label={f.organization} required span2 />
        <Field name="contact" label={f.contact} required span2 />
        <Field name="email" label={f.email} type="email" required />
        <Field name="phone" label={f.phone} type="tel" autoComplete="tel" />
        <Field name="url" label={f.url} type="url" placeholder="https://" span2 />

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-[var(--color-blue-deep)]">
            Mailing address
          </legend>
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            <Field name="street" label={f.street} autoComplete="address-line1" span2 />
            <Field name="city" label={f.city} autoComplete="address-level2" />
            <Field name="region" label={f.region} autoComplete="address-level1" />
            <Field name="postalCode" label={f.postalCode} autoComplete="postal-code" />
            <Field name="country" label={f.country} autoComplete="country-name" />
          </div>
        </fieldset>

        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-[var(--color-blue-deep)]">
            What are you building?
          </span>
          <textarea
            name="about"
            rows={5}
            className="mt-2 w-full rounded-lg border border-[var(--color-line)] px-4 py-3 text-[var(--color-ink)] outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-[var(--color-blue)]/30"
          />
        </label>
      </div>

      {/*
        The bot trap. Off-screen rather than display:none, because some bots
        skip hidden inputs, and out of the accessibility tree and the tab order
        so no person ever meets it.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label>
          Nickname
          <input type="text" name="nickname" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-coral)] px-7 py-3 font-bold text-white transition-colors hover:bg-[var(--color-coral-dark)] disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : foundation.form.submit}
        </button>
        {state === "error" && (
          <p role="alert" className="text-sm text-[var(--color-ink-soft)]">
            {error}{" "}
            <a
              href={`mailto:${site.email}`}
              className="font-semibold text-[var(--color-accent)] underline underline-offset-4"
            >
              Email {site.email} instead.
            </a>
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  span2 = false,
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  span2?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={span2 ? "sm:col-span-2" : undefined}>
      <span className="text-sm font-semibold text-[var(--color-blue-deep)]">
        {label}
        {required && <span className="text-[var(--color-accent)]"> *</span>}
      </span>
      <input
        {...rest}
        type={type}
        name={name}
        required={required}
        className="mt-2 w-full rounded-lg border border-[var(--color-line)] px-4 py-3 text-[var(--color-ink)] outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-[var(--color-blue)]/30"
      />
    </label>
  );
}
