/*
 * Paid-click attribution that survives navigation.
 *
 * THE PROBLEM THIS SOLVES. Attribution used to be read from the current page's
 * query string, inside the landing-page form only. That works for exactly one
 * path: click the ad, land on /lp/, fill in the form on that page, never move.
 * Every other real journey lost it —
 *
 *   ad → /lp/ai-change-speaker/?gclid=X → /speaking/ → /contact/ → submit
 *
 * — because by the time the organiser reaches the booking form the parameter
 * is no longer in the URL, and /contact/'s form captured nothing anyway. Those
 * bookings arrived looking organic. You cannot compute cost per booking from
 * conversions you cannot trace, and Smart Bidding cannot learn from them.
 *
 * So the click identifiers are captured ONCE on arrival, anywhere on the site,
 * and read back by whichever form the organiser eventually reaches.
 *
 * NINETY DAYS mirrors Google Ads' own default click-attribution window; a
 * shorter one would drop conversions Google still credits, which is the same
 * blindness in a smaller form. Event bookings are slow: an organiser who clicks
 * in March and enquires in May is normal, not an edge case.
 *
 * ON PRIVACY: a gclid is a tracking identifier. Ads are planned for North
 * America only. If paid traffic is ever pointed at the EEA or UK, this needs to
 * sit behind consent — along with the analytics tag. Storage is wrapped because
 * private browsing makes the accessor itself throw, and the site must work
 * regardless.
 */

const KEY = "swc_attribution";
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

/** The identifiers worth keeping. Order is documentation, not logic. */
const PARAMS = [
  "gclid", // Google Ads click id — the one that matters
  "wbraid", // iOS web-to-app click id
  "gbraid", // iOS app-to-web click id
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term", // the actual keyword, when the campaign passes it through
  "utm_content",
] as const;

type Stored = { at: number; data: Record<string, string> };

/**
 * Called once per page load, from anywhere on the site.
 *
 * Only writes when the URL actually carries a click identifier, so ordinary
 * internal navigation never overwrites a real ad click with an empty record.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const data: Record<string, string> = {};
  for (const key of PARAMS) {
    const value = params.get(key);
    if (value) data[key] = value.slice(0, 300);
  }
  if (Object.keys(data).length === 0) return; // nothing to record

  // The page they arrived on is more useful than the page they converted on.
  data.landingPage = window.location.pathname.slice(0, 100);
  if (document.referrer) data.referrer = document.referrer.slice(0, 300);

  try {
    localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data } satisfies Stored));
  } catch {
    /* private browsing, blocked storage — the visit still works, untracked */
  }
}

/**
 * The attribution to attach to a submission.
 *
 * Prefers whatever is in the URL right now (an ad click straight onto the
 * booking page) and falls back to what was stored on arrival.
 */
export function readAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const live: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of PARAMS) {
    const value = params.get(key);
    if (value) live[key] = value.slice(0, 300);
  }
  if (live.gclid || live.wbraid || live.gbraid) {
    live.landingPage = window.location.pathname.slice(0, 100);
    return live;
  }

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return live;
    const stored = JSON.parse(raw) as Stored;
    if (!stored?.at || Date.now() - stored.at > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return live;
    }
    return { ...stored.data, ...live };
  } catch {
    return live;
  }
}
