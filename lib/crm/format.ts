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

/** Whether this inquiry followed a click on a Google ad. */
export const cameFromAnAd = (i: SourceFields) => Boolean(i.gclid || i.wbraid || i.gbraid);

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

export type BudgetTone = "yes" | "neutral" | "muted";

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
      return { label: "Below $20,000", tone: "muted", note: "Under the floor" };
  }
  const band = (i.budget_band ?? "").trim();
  if (band && band !== "Not yet determined") return { label: band, tone: "yes", note: "The range they chose" };
  if (band) return { label: "Not determined", tone: "neutral", note: "They have not set a budget" };
  return { label: "Not asked", tone: "neutral", note: "This form did not ask" };
}

/**
 * Whether the budget answer leaves room for the fee: a yes, a "possibly", or
 * (on today's forms) a range, since every range starts at the floor.
 */
export function budgetFits(i: { budget_answer?: string | null; budget_band?: string | null }): boolean {
  if (i.budget_answer) return i.budget_answer === "yes" || i.budget_answer === "possibly";
  const band = (i.budget_band ?? "").trim();
  return Boolean(band) && band !== "Not yet determined";
}

/*
 * STAGES. A lead is at one open stage, in this order, or it is closed for a
 * reason. The database refuses anything else (supabase/migrations/002).
 */
export const OPEN_STAGES = ["inquiry", "call_booked", "call_held", "proposal_sent", "contract_out", "booked"] as const;
export const CLOSED_REASONS = ["below_floor", "not_a_fit", "lost"] as const;

const STAGE_NAMES: Record<string, string> = {
  inquiry: "New inquiry",
  call_booked: "Call booked",
  call_held: "Call held",
  proposal_sent: "Proposal sent",
  contract_out: "Contract out",
  booked: "Booked",
};
const CLOSED_NAMES: Record<string, string> = {
  below_floor: "below floor",
  not_a_fit: "not a fit",
  lost: "lost",
};

const isClosedReason = (value: unknown): value is string =>
  typeof value === "string" && (CLOSED_REASONS as readonly string[]).includes(value);

/** How far along an open stage is: 0 for a new inquiry, 5 for booked, -1 for anything else. */
export function stageRank(stage: string | null | undefined): number {
  return (OPEN_STAGES as readonly string[]).indexOf(stage ?? "");
}

/** "Proposal sent", or for a closed lead "Closed · not a fit". */
export function stageLabel(stage: string, closedReason?: string | null): string {
  if (stage === "closed") {
    if (!closedReason) return "Closed";
    return `Closed · ${CLOSED_NAMES[closedReason] ?? closedReason.replace(/_/g, " ")}`;
  }
  return STAGE_NAMES[stage] ?? stage.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export type StageTone = "plain" | "action" | "yes" | "muted";

/** How firmly to draw a stage: a booked call stands out, a booking most of all. */
export function stageTone(stage: string): StageTone {
  if (stage === "call_booked") return "action";
  if (stage === "booked") return "yes";
  if (stage === "closed") return "muted";
  return "plain";
}

/** The stage as the Leads list shows it: a booking carries its fee. */
export function stageChipLabel(lead: { stage: string; closed_reason?: string | null; fee_cents?: number | null }): string {
  if (lead.stage === "booked" && typeof lead.fee_cents === "number") return `Booked · ${money(lead.fee_cents)}`;
  return stageLabel(lead.stage, lead.closed_reason);
}

/**
 * The stage menu on a lead's page: the six open stages and "Lost". A lead
 * closed for another reason gets that reason as one more choice, so the menu
 * always shows where the lead really is.
 */
export function stageChoices(
  stage: string,
  closedReason?: string | null,
): { current: string; choices: { value: string; label: string }[] } {
  const choices = [
    ...OPEN_STAGES.map((value) => ({ value: value as string, label: STAGE_NAMES[value] })),
    { value: "lost", label: "Lost" },
  ];
  if (stage !== "closed") return { current: stage, choices };
  const reason = isClosedReason(closedReason) ? closedReason : "lost";
  if (reason !== "lost") choices.push({ value: reason, label: stageLabel("closed", reason) });
  return { current: reason, choices };
}

/** Every value the stage menu may send. */
export function isStageChoice(value: string): boolean {
  return stageRank(value) >= 0 || isClosedReason(value);
}

/*
 * MONEY. Kept in cents, typed in dollars.
 */

/** 2500000 → "$25,000"; cents are shown only when there are some. */
export function money(cents: number): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
}

/**
 * What was typed as an amount, in cents: "25000", "$25,000", "1,250.50",
 * "25k". Null for anything that is not plainly an amount.
 */
export function parseMoney(text: string): number | null {
  const typed = text.trim().replace(/^\$/, "").replace(/,/g, "").trim();
  const match = /^(\d{1,9}(?:\.\d{1,2})?)\s*(k)?$/i.exec(typed);
  if (!match) return null;
  const cents = Math.round(Number(match[1]) * 100) * (match[2] ? 1000 : 1);
  return Number.isSafeInteger(cents) && cents <= 100_000_000_00 ? cents : null;
}

/** What was typed as a whole number: "96", "1,204". Null for anything else. */
export function parseCount(text: string): number | null {
  const typed = text.trim().replace(/,/g, "");
  if (!/^\d{1,9}$/.test(typed)) return null;
  return Number(typed);
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

/** Whether a value is a real calendar day written "2026-11-13". */
export function isDay(value: string): boolean {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!iso) return false;
  const [year, month, day] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Whole days from one calendar day to another; negative when the second is earlier. */
export function daysBetween(fromDay: string, toDay: string): number {
  const at = (day: string) => {
    const [year, month, date] = day.split("-").map(Number);
    return Date.UTC(year, month - 1, date);
  };
  return Math.round((at(toDay) - at(fromDay)) / 86_400_000);
}

/** "Fri 13 Nov", with the year when it is not this one. Anything that is not a day comes back as typed. */
export function dayLabel(day: string, now: Date): string {
  if (!isDay(day)) return day;
  const [year, month, date] = day.split("-").map(Number);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, date)),
  );
  const thisYear = Number(centralIsoDay(now).slice(0, 4));
  return `${weekday} ${date} ${MONTHS[month - 1]}${year === thisYear ? "" : ` ${year}`}`;
}

export type DueState = "none" | "later" | "today" | "overdue";

/** Where a due date stands against today in Central time. */
export function dueState(due: string | null | undefined, now: Date): DueState {
  if (!due || !isDay(due)) return "none";
  const days = daysBetween(centralIsoDay(now), due);
  return days > 0 ? "later" : days === 0 ? "today" : "overdue";
}

/** The next step in a line: "Send proposal by Fri 13 Nov". Empty when there is none. */
export function nextStepLine(nextStep: string | null | undefined, due: string | null | undefined, now: Date): string {
  const step = (nextStep ?? "").trim();
  const by = due && isDay(due) ? dayLabel(due, now) : "";
  if (step && by) return `${step} by ${by}`;
  return step || (by ? `Due ${by}` : "");
}

type Detail = Record<string, unknown> | null | undefined;

/** What a timeline entry is called, and whether it is a problem. */
export function eventTitle(kind: string, detail?: Detail): { title: string; problem: boolean } {
  switch (kind) {
    case "stage_changed": {
      const to = detail?.to;
      if (isClosedReason(to)) return { title: stageLabel("closed", to), problem: false };
      return { title: typeof to === "string" ? `Moved to ${stageLabel(to)}` : "Stage changed", problem: false };
    }
    case "call_held":
      return { title: "Call held", problem: false };
    case "no_show":
      return { title: "No-show", problem: false };
    case "qualified":
      return { title: "Marked as a qualified opportunity", problem: false };
    case "not_a_fit":
      return { title: stageLabel("closed", "not_a_fit"), problem: false };
    case "next_step_set":
      return { title: detail?.next_step || detail?.due ? "Next step set" : "Next step cleared", problem: false };
    case "fee_set":
      return { title: typeof detail?.fee_cents === "number" ? "Fee set" : "Fee removed", problem: false };
    case "notes_saved":
      return { title: "Notes saved", problem: false };
    case "reopened":
      return { title: "Reopened", problem: false };
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

/** The second line of a timeline entry, for the entries that have something to add. */
export function eventNote(kind: string, detail: Detail, now: Date): string {
  switch (kind) {
    case "stage_changed": {
      const from = detail?.from;
      if (typeof from !== "string") return "";
      return `From ${isClosedReason(from) ? stageLabel("closed", from) : stageLabel(from)}`;
    }
    case "next_step_set":
      return nextStepLine(
        typeof detail?.next_step === "string" ? detail.next_step : "",
        typeof detail?.due === "string" ? detail.due : "",
        now,
      );
    case "fee_set":
      return typeof detail?.fee_cents === "number" ? money(detail.fee_cents) : "";
    case "reopened":
      return "They inquired again";
  }
  return "";
}

/**
 * The same, shorter, for the "Last activity" column. A stage change is named
 * by where the lead now is: the list does not read each entry's detail, and
 * when the last thing that happened was a move, the lead is still there.
 */
export function activityLabel(
  kind: string,
  lead?: {
    stage: string;
    closed_reason?: string | null;
    next_step?: string | null;
    next_step_due?: string | null;
    fee_cents?: number | null;
  },
): string {
  switch (kind) {
    case "stage_changed":
      if (!lead) return "Stage changed";
      return lead.stage === "closed" ? stageLabel("closed", lead.closed_reason) : `Moved to ${stageLabel(lead.stage)}`;
    case "next_step_set":
      return !lead || lead.next_step || lead.next_step_due ? "Next step set" : "Next step cleared";
    case "fee_set":
      return !lead || typeof lead.fee_cents === "number" ? "Fee set" : "Fee removed";
    case "qualified":
      return "Marked qualified";
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

/** Today's date in Central time, as a calendar day: "2026-11-12". */
export function centralIsoDay(at: Date): string {
  const p = centralParts(at);
  const two = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${two(MONTHS.indexOf(p.month) + 1)}-${two(Number(p.day))}`;
}

/** A label for one Central day, for telling whether two moments share a day. */
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
