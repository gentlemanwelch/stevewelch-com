import type { Metadata } from "next";
import Link from "next/link";
import { adminCopy } from "@/content/admin";
import { requireAdmin } from "@/lib/crm/session";
import { REPORT_LIMIT, adNumbers, needsYouCount, reportLeads } from "@/lib/crm/leads";
import { dayAndTime, dayLabel, money } from "@/lib/crm/format";
import { adCounts, bySource, campaignDay, costPer, funnel, gateStatus, inPeriod, periodFrom } from "@/lib/crm/reports";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Chip,
  type ChipTone,
  Panel,
  adminButtonOutline,
  adminField,
  adminFieldLabel,
  filterTab,
} from "@/components/admin/LeadBits";

/**
 * /admin/reports/ — the funnel, the sources, and the spend gates.
 *
 * Drawn to the Reports mockup Steve signed off (11 November 2026).
 *
 * EVERYTHING HERE IS COUNTED BY STAGE, by the rules in lib/crm/reports.ts: an
 * inquiry is never a booked call, and a booked call is never an engagement.
 * Tests are never counted; the read behind this page does not fetch them.
 *
 * THIS PAGE KNOWS NO NAMES. It asks the database for stages and sources and
 * nothing that identifies a person, because a count needs none of it.
 *
 * THE PERIOD APPLIES TO THE FUNNEL AND THE SOURCES. The spend gates and the
 * cost per call are counted from the campaign's first day, whatever period
 * is chosen: they are a running total against a deadline.
 *
 * THE GATES ARE KEPT COUNT OF, NOT APPLIED. Nothing here pauses or spends
 * anything. The owner reads the count and decides.
 */
export const metadata: Metadata = { title: adminCopy.reports.title };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: ChipTone }> = {
  met: { label: adminCopy.reports.gateMet, tone: "yes" },
  not_yet: { label: adminCopy.reports.gateNotYet, tone: "plain" },
  not_met: { label: adminCopy.reports.gateNotMet, tone: "warn" },
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; problem?: string }>;
}) {
  await requireAdmin();
  const { reports: copy } = adminCopy;
  const query = await searchParams;
  const period = periodFrom(query.period);
  const problems = (query.problem ?? "")
    .split(",")
    // Only the codes this page knows. `hasOwn`, so a made-up code such as
    // "constructor" finds nothing rather than something inherited.
    .filter((code) => Object.hasOwn(copy.problems, code))
    .map((code) => copy.problems[code as keyof typeof copy.problems]);

  const now = new Date();
  const [read, ads, needsYou] = await Promise.all([reportLeads(), adNumbers(), needsYouCount(now)]);

  const heading = (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h1 className="text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em] text-navy md:text-[28px]">
          {copy.heading}
        </h1>
        <p className="mt-1.5 text-[15px] leading-[1.5] text-ink-faint">{copy.summary}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {copy.periods.map((choice) => (
          <Link
            key={choice.value}
            href={choice.value === "90" ? "/admin/reports/" : `/admin/reports/?period=${choice.value}`}
            aria-current={choice.value === period ? "true" : undefined}
            className={filterTab(choice.value === period)}
          >
            {choice.label}
          </Link>
        ))}
      </div>
    </div>
  );

  if (!read.ok || !ads.ok) {
    return (
      <AdminShell current="/admin/reports/" needsYou={needsYou}>
        {heading}
        <div role="alert" className="max-w-[620px] rounded-[var(--radius-base)] border border-warn bg-white px-6 py-7">
          <h2 className="text-[18px] font-bold leading-[1.3] tracking-normal text-navy">{copy.unreadableHeading}</h2>
          <p className="mt-2 text-[15px] leading-[1.6]">{adminCopy.leads.unreadableBody}</p>
          <p className="mt-2 break-words text-[13px] leading-[1.5] text-ink-faint">
            {!read.ok ? read.reason : !ads.ok ? ads.reason : ""}
          </p>
        </div>
      </AdminShell>
    );
  }

  const leads = read.value;
  const typed = ads.value;
  const startedOn = typed?.campaign_started_on ?? null;

  const counted = inPeriod(leads, period, now);
  const steps = funnel(counted);
  const sources = bySource(counted);

  const fromAds = adCounts(leads, startedOn);
  const day = campaignDay(startedOn, now);
  const cost = costPer(typed?.spend_cents, fromAds.qualifiedCallsHeld);

  const dayLine =
    day === null
      ? copy.gatesNoStart
      : day < 1 && startedOn
        ? `${copy.gatesNotBegun} ${dayLabel(startedOn, now)}.`
        : `Day ${day} of the campaign.`;

  return (
    <AdminShell current="/admin/reports/" needsYou={needsYou}>
      {heading}

      {problems.length > 0 ? (
        <div
          role="alert"
          className="mb-6 max-w-[760px] rounded-[var(--radius-base)] border border-warn bg-warn-bg px-[18px] py-3 text-[15px] leading-[1.5] text-warn-ink"
        >
          {problems.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-6">
          <Panel heading={copy.funnelHeading}>
            {(Object.keys(copy.funnelRows) as (keyof typeof copy.funnelRows)[]).map((key) => (
              <div
                key={key}
                className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-x-3.5 gap-y-1 py-2 sm:grid-cols-[230px_minmax(0,1fr)_40px]"
              >
                <span className="col-span-2 font-semibold text-navy sm:col-span-1">{copy.funnelRows[key]}</span>
                <div aria-hidden="true" className="h-[22px] rounded-[2px] bg-tint">
                  <div
                    className="h-[22px] rounded-[2px] bg-action"
                    style={{ width: `${steps.inquiries > 0 ? Math.round((steps[key] / steps.inquiries) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-right text-[16px] font-extrabold text-navy">{steps[key]}</span>
              </div>
            ))}
          </Panel>

          <Panel heading={copy.sourceHeading} className="overflow-x-auto">
            {sources.length === 0 ? (
              <p className="border-t border-line py-2.5 text-ink-faint">{copy.sourceNone}</p>
            ) : (
              <div className="min-w-[520px]">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 pb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  {copy.sourceColumns.map((column) => (
                    <span key={column}>{column}</span>
                  ))}
                </div>
                {sources.map((row) => (
                  <div key={row.source} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 border-t border-line py-2.5">
                    <span className="font-semibold text-navy">{row.source}</span>
                    <span>{row.inquiries}</span>
                    <span>{row.callsBooked}</span>
                    <span>{row.callsHeld}</span>
                    <span>{row.booked}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          <Panel heading={copy.gatesHeading}>
            <p className="-mt-2 mb-2 text-[13px] leading-[1.5] text-ink-faint">
              {dayLine} {copy.gatesNote}
            </p>
            {copy.gates.map((gate) => {
              const soFar = fromAds[gate.counts];
              const status =
                STATUS[
                  gateStatus({
                    soFar,
                    needs: gate.needs,
                    byDay: gate.byDay,
                    day,
                    byClicks: "byClicks" in gate ? gate.byClicks : undefined,
                    clicks: typed?.clicks,
                  })
                ];
              return (
                <div
                  key={gate.name}
                  className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3"
                >
                  <span className="min-w-0 flex-[1_1_200px]">
                    <strong className="font-semibold text-navy">{gate.name}</strong> · {gate.when}
                    <br />
                    <span className="text-[13px] leading-[1.5] text-ink-faint">
                      {`Needs at least ${gate.needs} ${gate.needs === 1 ? gate.one : gate.many}. So far: ${soFar}.`}
                    </span>
                  </span>
                  <Chip tone={status.tone}>{status.label}</Chip>
                </div>
              );
            })}
          </Panel>

          <section
            id="ad-numbers"
            aria-labelledby="ad-numbers-heading"
            className="flex scroll-mt-4 flex-col gap-3 rounded-[var(--radius-base)] border border-line bg-white px-[22px] py-5"
          >
            <h2 id="ad-numbers-heading" className="text-[16px] font-bold leading-[1.3] tracking-normal text-navy">
              {copy.adsHeading}
            </h2>
            <p className="text-[13px] leading-[1.5] text-ink-faint">{copy.adsNote}</p>

            <form
              method="post"
              action="/api/admin/reports/ad-numbers/"
              autoComplete="off"
              className="flex flex-col gap-3"
            >
              <input type="hidden" name="period" value={period} />
              <div>
                <label htmlFor="ads-started" className={adminFieldLabel}>
                  {copy.started}
                </label>
                <input id="ads-started" name="started" type="date" defaultValue={startedOn ?? ""} className={adminField} />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex-[1_1_130px]">
                  <label htmlFor="ads-spend" className={adminFieldLabel}>
                    {copy.spend}
                  </label>
                  <input
                    id="ads-spend"
                    name="spend"
                    type="text"
                    inputMode="decimal"
                    maxLength={20}
                    defaultValue={typeof typed?.spend_cents === "number" ? money(typed.spend_cents) : ""}
                    className={adminField}
                  />
                </div>
                <div className="flex-[1_1_130px]">
                  <label htmlFor="ads-clicks" className={adminFieldLabel}>
                    {copy.clicks}
                  </label>
                  <input
                    id="ads-clicks"
                    name="clicks"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    defaultValue={typeof typed?.clicks === "number" ? String(typed.clicks) : ""}
                    className={adminField}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className={adminButtonOutline}>
                  {copy.save}
                </button>
                {typed ? (
                  <span className="text-[13px] leading-[1.5] text-ink-faint">
                    {copy.lastSaved} {dayAndTime(new Date(typed.entered_at))}
                  </span>
                ) : null}
              </div>
            </form>

            <div className="border-t border-line pt-3">
              <span className="font-semibold text-navy">{copy.costHeading}</span>
              <br />
              <span className="text-[22px] font-extrabold text-navy">{cost === null ? "—" : money(cost)}</span>{" "}
              <span className="text-[13px] leading-[1.5] text-ink-faint">
                {fromAds.qualifiedCallsHeld === 0
                  ? copy.costNone
                  : cost === null
                    ? copy.costNoSpend
                    : `${fromAds.qualifiedCallsHeld} ${copy.costSoFar}`}
              </span>
            </div>
          </section>
        </div>
      </div>

      <p className="mt-6 text-[13px] leading-[1.5] text-ink-faint">
        {copy.testsNote}
        {leads.length >= REPORT_LIMIT ? ` ${copy.tooMany}` : ""}
      </p>
    </AdminShell>
  );
}
