"use client";

import { useState } from "react";
import { foundation } from "@/content/foundation";
import { buttonClasses } from "@/lib/buttonStyles";
import { FIELD, LABEL, REQUIRED } from "@/lib/formStyles";
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
      /*
       * NO trackInquiry HERE. It used to be called with "foundation", and
       * trackInquiry sends `booking_inquiry` — the site's one conversion, the
       * GA4 key event — and the Google Ads conversion with it. So a school
       * asking the Foundation for support was counted as a keynote booking
       * inquiry, in the number the ad spend is judged by. This form is not a
       * booking and must not report as one.
       */
    } catch {
      setState("error");
      setError("That did not send.");
    }
  }

  if (state === "sent") {
    return (
      <div role="status" className="border-t-2 border-navy bg-tint p-6 sm:p-8">
        <h3 className="font-extrabold">{foundation.form.thanksHeading}</h3>
        <p className="mt-3 leading-relaxed">{foundation.form.thanksBody}</p>
      </div>
    );
  }

  const f = foundation.form.fields;

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="organization" label={f.organization} required span2 />
        <Field name="contact" label={f.contact} required span2 />
        <Field name="email" label={f.email} type="email" required />
        <Field name="phone" label={f.phone} type="tel" autoComplete="tel" />
        <Field name="url" label={f.url} type="url" placeholder="https://" span2 />

        <fieldset className="sm:col-span-2">
          <legend className="eyebrow !text-[0.875rem] font-bold text-navy">
            {foundation.form.addressLegend}
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
          <span className={LABEL}>{foundation.form.about}</span>
          <textarea name="about" rows={5} className={FIELD} />
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
          className={buttonClasses("primary")}
        >
          {state === "sending" ? "Sending…" : foundation.form.submit}
        </button>
        {state === "error" && (
          <p role="alert" className="text-[0.9375rem] text-navy">
            {error}{" "}
            <a
              href={`mailto:${site.email}`}
              className="font-semibold text-action underline underline-offset-4"
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
      <span className={LABEL}>
        {label}
        {required && <span className={REQUIRED}> *</span>}
      </span>
      <input {...rest} type={type} name={name} required={required} className={FIELD} />
    </label>
  );
}
