import type { Metadata } from "next";
import Link from "next/link";
import { adminCopy } from "@/content/admin";
import { requireAdmin } from "@/lib/crm/session";
import { crmConfigured } from "@/lib/crm/db";
import { LIST_LIMIT, type LeadRow, leadNeedsYou, listLeads } from "@/lib/crm/leads";
import {
  activityLabel,
  budgetLabel,
  countOf,
  eventLabel,
  sourceLabel,
  stageLabel,
  timeAgo,
} from "@/lib/crm/format";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import { Chip, Panel, StatusRow, adminButtonOutline, adminButtonPrimary } from "@/components/admin/LeadBits";

/**
 * /admin/ — Leads: everyone who has inquired, newest activity first.
 *
 * Drawn to the Leads mockup Steve signed off (11 November 2026), with the
 * columns this step has data for. "Next step", and the tabs for booked calls
 * and closed leads, arrive with the steps that create those things; a column
 * of dashes would only teach the eye to skip it.
 *
 * WHAT NEEDS THE OWNER COMES FIRST. Today that is one thing: an inquiry that
 * was saved here while the email about it failed. It is the one case where
 * this screen knows something the inbox does not, so it is not left to be
 * noticed in a table.
 *
 * TESTS ARE KEPT OUT unless asked for (?tests=1). A list that mixes the
 * owner's own form tests in with prospects stops being a list of prospects.
 *
 * NO EMAIL ADDRESS IS ON THIS PAGE, and none is in any link: a lead's page is
 * addressed by its record id.
 */

// `absolute`, because a layout's title template applies to the segments BELOW
// it and not to the page beside it: without this the tab would read
// "Leads | Steve Welch", the public site's template.
export const metadata: Metadata = {
  title: { absolute: `${adminCopy.leads.title} | ${adminCopy.product}` },
};
export const dynamic = "force-dynamic";

const COLUMNS =
  "grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1.9fr)] gap-3.5";

/** What one row shows, worked out once for both the table and the phone cards. */
function summarize(lead: LeadRow, now: Date) {
  const latest = lead.inquiries[0];
  const last = lead.lead_events[0];
  return {
    id: lead.id,
    name: lead.name || "No name given",
    organization: lead.organization,
    isTest: lead.is_test,
    needsYou: leadNeedsYou(lead),
    budget: budgetLabel(latest ?? {}),
    stage: stageLabel(lead.stage),
    source: latest ? sourceLabel(latest) : "",
    event: eventLabel(latest?.event_date),
    activity: last ? `${activityLabel(last.kind)} · ${timeAgo(new Date(last.at), now)}` : "",
  };
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ tests?: string; show?: string; sent?: string }>;
}) {
  await requireAdmin();
  const { leads: copy } = adminCopy;
  const { tests, show, sent } = await searchParams;
  const showTests = tests === "1";
  const onlyNeedsYou = show === "needs";

  const read = await listLeads();
  const now = new Date();

  const all = read.ok ? read.value : [];
  const real = all.filter((lead) => !lead.is_test);
  const testCount = all.length - real.length;
  const inScope = (showTests ? all : real).map((lead) => summarize(lead, now));
  const needsYou = inScope.filter((row) => row.needsYou);
  const rows = onlyNeedsYou ? needsYou : inScope;

  const summary = !read.ok
    ? undefined
    : real.length === 0
      ? copy.none
      : `${countOf(real.length, "inquiry", "inquiries")}.${
          needsYou.length > 0 ? ` ${needsYou.length} ${needsYou.length === 1 ? "needs" : "need"} you.` : ""
        }`;

  const withTests = (query: string) => `/admin/${showTests ? `?tests=1${query ? `&${query}` : ""}` : query ? `?${query}` : ""}`;

  return (
    <AdminShell current="/admin/">
      <AdminHeading heading={copy.heading} summary={summary} />

      {sent ? (
        <p
          role="status"
          className={`mb-6 max-w-[620px] rounded-[var(--radius-base)] border px-[18px] py-3 text-[15px] leading-[1.5] ${
            sent === "ok" ? "border-line bg-white text-navy" : "border-warn bg-warn-bg text-warn-ink"
          }`}
        >
          {sent === "ok" ? copy.testSent : copy.testFailed}
        </p>
      ) : null}

      {!read.ok ? (
        <div role="alert" className="max-w-[620px] rounded-[var(--radius-base)] border border-warn bg-white px-6 py-7">
          <h2 className="text-[18px] font-bold leading-[1.3] tracking-normal text-navy">{copy.unreadableHeading}</h2>
          <p className="mt-2 text-[15px] leading-[1.6]">{copy.unreadableBody}</p>
          <p className="mt-2 break-words text-[13px] leading-[1.5] text-ink-faint">{read.reason}</p>
        </div>
      ) : (
        <>
          {needsYou.length > 0 ? (
            <div className="mb-6 flex flex-wrap gap-4">
              {needsYou.map((row) => (
                <div
                  key={row.id}
                  className="flex min-w-0 flex-[1_1_380px] flex-wrap items-center justify-between gap-3 rounded-[var(--radius-base)] border border-line border-t-[3px] border-t-warn bg-white px-[18px] py-4"
                >
                  <div className="min-w-0 flex-[1_1_240px]">
                    <p className="text-[12px] font-semibold uppercase leading-normal tracking-[0.08em] text-warn-ink">
                      {copy.needsYouLabel}
                    </p>
                    <p className="mt-1 text-[15px] font-bold text-navy">
                      {[row.name, row.organization].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[1.5] text-ink-faint">{copy.needsYouBody}</p>
                  </div>
                  <Link href={`/admin/leads/${row.id}/`} prefetch={false} className={adminButtonPrimary}>
                    {copy.open}
                  </Link>
                </div>
              ))}
            </div>
          ) : null}

          {inScope.length > 0 && needsYou.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { label: `${copy.filterAll} ${inScope.length}`, href: withTests(""), on: !onlyNeedsYou },
                { label: `${copy.filterNeedsYou} ${needsYou.length}`, href: withTests("show=needs"), on: onlyNeedsYou },
              ].map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  aria-current={tab.on ? "true" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-[var(--radius-base)] border-[1.5px] px-3.5 py-2 text-[14px] font-semibold ${
                    tab.on ? "border-navy bg-navy text-white" : "border-line-strong bg-white text-ink-soft"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          ) : null}

          {rows.length > 0 ? (
            <>
              {/* Wide screens: the table. */}
              <div className="hidden overflow-x-auto rounded-[var(--radius-base)] border border-line bg-white md:block">
                <div className="min-w-[900px]">
                  <div
                    className={`${COLUMNS} px-[18px] py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint`}
                  >
                    {copy.columns.map((column) => (
                      <span key={column}>{column}</span>
                    ))}
                  </div>
                  {rows.map((row) => (
                    <Link
                      key={row.id}
                      href={`/admin/leads/${row.id}/`}
                      prefetch={false}
                      className={`${COLUMNS} items-center border-t border-line px-[18px] py-3.5 hover:bg-tint-warm`}
                    >
                      <span className="min-w-0">
                        <strong className="block text-[15px] text-navy">{row.name}</strong>
                        <span className="text-[13px] leading-[1.5] text-ink-faint">{row.organization}</span>
                      </span>
                      <span>
                        <Chip tone={row.budget.tone}>{row.budget.label}</Chip>
                      </span>
                      <span className="flex flex-wrap gap-1.5">
                        <Chip tone={row.needsYou ? "warn" : "neutral"}>{row.stage}</Chip>
                        {row.isTest ? <Chip tone="warn">{copy.testChip}</Chip> : null}
                      </span>
                      <span>{row.source}</span>
                      <span>{row.event}</span>
                      <span>{row.activity}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* A phone: one card per lead. */}
              <div className="flex flex-col gap-3 md:hidden">
                {rows.map((row) => (
                  <Link
                    key={row.id}
                    href={`/admin/leads/${row.id}/`}
                    prefetch={false}
                    className="block rounded-[var(--radius-base)] border border-line bg-white px-4 py-3.5"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <span className="min-w-0">
                        <strong className="block text-[15px] text-navy">{row.name}</strong>
                        <span className="text-[13px] leading-[1.5] text-ink-faint">{row.organization}</span>
                      </span>
                      <Chip tone={row.needsYou || row.isTest ? "warn" : "neutral"}>
                        {row.isTest ? copy.testChip : row.stage}
                      </Chip>
                    </div>
                    <p className="mt-2 text-[13px]">
                      <Chip tone={row.budget.tone}>{row.budget.label}</Chip> &nbsp;{row.event}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-[1.5] text-ink-faint">{row.activity}</p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="flex max-w-[620px] flex-col gap-6">
              <div className="rounded-[var(--radius-base)] border border-line bg-white px-6 py-7">
                <h2 className="text-[18px] font-bold leading-[1.3] tracking-normal text-navy">{copy.emptyHeading}</h2>
                <p className="mt-2 text-[15px] leading-[1.6]">{copy.emptyBody}</p>
                {/* A form, so it works with no script: it posts, the server
                    sends a real inquiry through the real form, and the page
                    comes back showing it. */}
                <form method="post" action="/api/admin/test-inquiry/" className="mt-4">
                  <button type="submit" className={adminButtonOutline}>
                    {copy.sendTest}
                  </button>
                </form>
              </div>

              <Panel heading={copy.connectedHeading}>
                <StatusRow
                  label={copy.connections.form}
                  note={crmConfigured() ? undefined : copy.connections.formDown}
                  status={crmConfigured() ? copy.connected : copy.notConnected}
                  tone={crmConfigured() ? "yes" : "warn"}
                />
                {process.env.RESEND_API_KEY && process.env.INQUIRY_FROM_EMAIL ? (
                  <StatusRow label={copy.connections.email} status={copy.connected} tone="yes" />
                ) : (
                  <StatusRow
                    label={copy.connections.email}
                    note={copy.connections.emailDown}
                    status={copy.notConnected}
                    tone="warn"
                  />
                )}
                {/* These two are fixed until the steps that build them. */}
                <StatusRow
                  label={copy.connections.calendar}
                  note={copy.connections.calendarDown}
                  status={copy.notConnected}
                  tone="warn"
                />
                <StatusRow
                  label={copy.connections.followUps}
                  note={copy.connections.followUpsOff}
                  status={copy.off}
                  tone="warn"
                />
              </Panel>
            </div>
          )}

          {all.length >= LIST_LIMIT ? (
            <p className="mt-4 text-[13px] leading-[1.5] text-ink-faint">{copy.tooMany}</p>
          ) : null}

          {testCount > 0 ? (
            <p className="mt-6 text-[13px] leading-[1.5] text-ink-faint">
              {showTests ? (
                <Link href="/admin/" className="font-semibold text-action underline underline-offset-2">
                  {copy.hideTests}
                </Link>
              ) : (
                <>
                  {countOf(testCount, "test inquiry is", "test inquiries are")} {copy.testsHidden}{" "}
                  <Link href="/admin/?tests=1" className="font-semibold text-action underline underline-offset-2">
                    {copy.showTests}
                  </Link>
                </>
              )}
            </p>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}
