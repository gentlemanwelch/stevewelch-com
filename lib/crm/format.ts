/*
 * How the CRM says things: sources, budgets, dates, what happened.
 *
 * Every function here is pure: values in, words out, no database and no
 * request. That is deliberate. These are the words Steve reads to decide who
 * to call, so each one is checked directly (scripts/test-crm-format.mjs),
 * and for that this file must import nothing — no "@/..." alias, no
 * "server-only". Keep it that way.
 *
 * TIMES ARE SHOWN IN CENTRAL TIME, whatever time zone the server or the
 * reader's laptop is in. A lead's timeline that reads differently in a hotel
 * is a timeline nobody trusts.
 */

export const DISPLAY_TIME_ZONE = "America/Chicago";

/** The fields of an inquiry that say where it came from. */
export type SourceFields = {
  form?: string | null;
  source?: string | null;
  landing_page?: string | null;
  gclid?: string | null;
  wbraid?: string | null;
  gbraid?: string | null;
  utm_source?: string | null;
  utm_term?: string | null;
};

const cameFromAnAd = (i: SourceFields) => Boolean(i.gclid || i.wbraid || i.gbraid);

/** "ai-change-speaker" → "AI", for naming an ad page in a few words. */
function campaignName(slug: string): string {
  const known: Record<string, string> = {
    "ai-change-speaker": "AI",
    "organizational-change-speaker": "change",
    "keynote-speaker": "keynote",
    "wellness-speaker": "wellness",
  };
  return known[slug] ?? slug.replace(/-speaker$/, "").replace(/-/g, " ");
}

/** The page the form was on: "AI page", "contact page". */
function pageName(i: SourceFields, word: "page" | "ad page"): string {
  const form = i.form ?? "";
  if (form.startsWith("landing:")) return `${campaignName(form.slice("landing:".length))} ${word}`;
  if (form === "landing") return word === "ad page" ? "an ad page" : "ad page";
  return "contact page";
}

/** Who sent them: "Google Ads", "Organic", or the name a link was tagged with. */
function channel(i: SourceFields): string {
  if (cameFromAnAd(i)) return "Google Ads";
  const tagged = (i.utm_source ?? "").trim();
  if (tagged) return tagged.charAt(0).toUpperCase() + tagged.slice(1);
  return "Organic";
}

/** For the Leads list: "Google Ads · AI page". */
export function sourceLabel(i: SourceFields): string {
  return `${channel(i)} · ${pageName(i, "page")}`;
}

/** For a lead's brief: "Google Ads · searched “ai keynote speaker” · AI ad page". */
export function sourceDetail(i: SourceFields): string {
  const searched = (i.utm_term ?? "").trim();
  return [channel(i), searched ? `searched “${searched}”` : "", pageName(i, "ad page")]
    .filter(Boolean)
    .join(" · ");
}

/** For the timeline: "From the AI ad page, after a Google ad click". */
export function arrivalSentence(i: SourceFields): string {
  const page = pageName(i, "ad page");
  const from = page === "an ad page" ? "From an ad page" : `From the ${page}`;
  return cameFromAnAd(i) ? `${from}, after a Google ad click` : from;
}

export type BudgetTone = "yes" | "neutral" | "warn";

/**
 * The budget answer, and how firmly to draw it.
 *
 * The new form asks one question with four answers. Today's forms offer a
 * range, or nothing; a range is itself a yes, since every range starts at
 * the floor.
 */
export function budgetLabel(i: { budget_answer?: string | null; budget_band?: string | null }): {
  label: string;
  tone: BudgetTone;
  note: string;
} {
  switch (i.budget_answer) {
    case "yes":
      return { label: "Yes", tone: "yes", note: "$20,000 is within range" };
    case "possibly":
      return { label: "Possibly", tone: "neutral", note: "Needs approval" };
    case "not_sure":
      return { label: "Not sure", tone: "neutral", note: "Needs pricing first" };
    case "below":
      return { label: "Below $20,000", tone: "warn", note: "Under the floor" };
  }
  const band = (i.budget_band ?? "").trim();
  if (band && band !== "Not yet determined") return { label: band, tone: "yes", note: "The range they chose" };
  if (band) return { label: "Not determined", tone: "neutral", note: "They have not set a budget" };
  return { label: "Not asked", tone: "neutral", note: "This form did not ask" };
}

export function stageLabel(stage: string): string {
  const known: Record<string, string> = { inquiry: "New inquiry" };
  return known[stage] ?? stage.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * When the event is. The date field gives "2027-03-12"; anything else is
 * what the organizer typed and is shown as they typed it.
 */
export function eventLabel(eventDate: string | null | undefined, style: "short" | "long" = "short"): string {
  const value = (eventDate ?? "").trim();
  if (!value) return "Not decided";
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!iso) return value;
  const month = Number(iso[2]);
  const day = Number(iso[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return value;
  if (style === "short") return `${day} ${MONTHS[month - 1]} ${iso[1]}`;
  const long = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2000, month - 1, 1)),
  );
  return `${day} ${long} ${iso[1]}`;
}

/** What a timeline entry is called, and whether it is a problem. */
export function eventTitle(kind: string): { title: string; problem: boolean } {
  switch (kind) {
    case "inquiry_received":
      return { title: "Inquiry received", problem: false };
    case "notify_sent":
      return { title: "Inquiry emailed to you", problem: false };
    case "notify_failed":
      return { title: "The email to you failed", problem: true };
    case "ack_sent":
      return { title: "Instant reply sent to them", problem: false };
    case "ack_failed":
      return { title: "The instant reply failed", problem: true };
  }
  const words = kind.replace(/_/g, " ");
  return { title: words.charAt(0).toUpperCase() + words.slice(1), problem: /failed|error/.test(kind) };
}

/** The same, shorter, for the "Last activity" column. */
export function activityLabel(kind: string): string {
  switch (kind) {
    case "inquiry_received":
      return "Inquiry received";
    case "notify_sent":
      return "Emailed to you";
    case "notify_failed":
      return "Email to you failed";
    case "ack_sent":
      return "Instant reply sent";
    case "ack_failed":
      return "Instant reply failed";
  }
  return eventTitle(kind).title;
}

type Parts = { weekday: string; day: string; month: string; year: string; hour: string; minute: string; dayPeriod: string };

function centralParts(at: Date): Parts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    weekday: get("weekday"),
    day: get("day"),
    month: get("month"),
    year: get("year"),
    hour: get("hour"),
    minute: get("minute"),
    dayPeriod: get("dayPeriod"),
  };
}

/** "2026-11-10" in Central time, for telling whether two moments share a day. */
export function centralDay(at: Date): string {
  const p = centralParts(at);
  return `${p.year}-${p.month}-${p.day}`;
}

/** "9:41 AM". */
export function clockTime(at: Date): string {
  const p = centralParts(at);
  return `${p.hour}:${p.minute} ${p.dayPeriod}`;
}

/** "Tue 10 Nov, 9:41 AM". */
export function dayAndTime(at: Date): string {
  const p = centralParts(at);
  return `${p.weekday} ${p.day} ${p.month}, ${clockTime(at)}`;
}

/**
 * How long ago, the way a person would say it: "just now", "3 hours ago",
 * "yesterday", "2 days ago", and after a week the date itself.
 */
export function timeAgo(at: Date, now: Date): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - at.getTime()) / 1000));
  if (seconds < 90) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24 && centralDay(at) === centralDay(now)) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  // Days are counted on the Central calendar, so "yesterday" means yesterday
  // there and not "more than 24 hours ago".
  const midnight = (d: Date) => {
    const p = centralParts(d);
    return Date.UTC(Number(p.year), MONTHS.indexOf(p.month), Number(p.day));
  };
  const days = Math.round((midnight(now) - midnight(at)) / 86_400_000);
  if (days <= 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const p = centralParts(at);
  return p.year === centralParts(now).year ? `${p.day} ${p.month}` : `${p.day} ${p.month} ${p.year}`;
}

/** "1 inquiry", "7 inquiries". */
export function countOf(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Whether a value from an address is shaped like a record id. */
export function isRecordId(value: string): boolean {
  return UUID.test(value);
}
