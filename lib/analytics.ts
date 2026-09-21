/*
 * Measurement for the paid-search campaign.
 *
 * WHY THIS IS HAND-WRITTEN AND NOT @next/third-parties: this app runs on three
 * dependencies — next, react, react-dom — and the inquiry route says plainly
 * why (see its header). A GA4 + Ads tag is about fifteen lines of script. It
 * is not worth a fourth package and a supply chain to maintain.
 *
 * WHY IT IS ENV-GATED: the site works today with no analytics at all, and must
 * keep working that way. Every function here is a no-op until the IDs are set
 * in Vercel, so nothing breaks in local development, in previews, or if the
 * variables are ever removed.
 *
 * These IDs are NOT secrets. A GA4 measurement ID and an Ads conversion label
 * are visible in the page source of every site that uses them — that is how
 * the tag works. They are NEXT_PUBLIC_ on purpose. Do not treat them as
 * credentials, and equally, do not put anything that IS a credential here.
 *
 * ON CONSENT: ads are planned for North America only, which keeps this out of
 * the EEA/UK consent-mode regime. If paid traffic is ever pointed at Europe,
 * this needs Google Consent Mode v2 and a banner BEFORE that happens — not
 * after.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
export const ADS_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

/** True when there is anything at all to load. */
export const analyticsEnabled = Boolean(GA_ID || ADS_ID);

type GtagArgs =
  | ["js", Date]
  | ["config", string, Record<string, unknown>?]
  | ["event", string, Record<string, unknown>?];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

/**
 * Records a booking inquiry.
 *
 * CALL THIS ON THE FORM'S SUCCESS STATE, NEVER ON PAGE LOAD. A conversion that
 * fires when the page renders counts every visitor as a lead, which teaches
 * Google's bidding to buy traffic that never enquires — the most expensive
 * mistake available in a paid-search account, and an easy one to make.
 *
 * `source` distinguishes the booking form from the Ads landing pages, so the
 * two can be read apart in GA4 without needing separate conversion actions.
 */
export function trackInquiry(source: "contact" | "landing" | "foundation") {
  if (typeof window === "undefined" || !window.gtag) return;

  // GA4: a custom event, so it can be marked as a key event in the GA4 UI.
  if (GA_ID) {
    window.gtag("event", "booking_inquiry", { source });
  }

  // Google Ads: the conversion action itself. Both halves of the identifier
  // are required — an ID without a label silently records nothing.
  if (ADS_ID && ADS_CONVERSION_LABEL) {
    window.gtag("event", "conversion", {
      send_to: `${ADS_ID}/${ADS_CONVERSION_LABEL}`,
    });
  }
}
