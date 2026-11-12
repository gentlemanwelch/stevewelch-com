import type { Metadata } from "next";
import Link from "next/link";
import { adminCopy } from "@/content/admin";
import { requireAdmin } from "@/lib/crm/session";
import { crmConfigured } from "@/lib/crm/db";
import { LIST_LIMIT, type LeadRow, leadEmailFailed, leadStepDue, listLeads } from "@/lib/crm/leads";
import {
  activityLabel,
  budgetLabel,
  countOf,
  dayLabel,
  eventLabel,
  nextStepLine,
  sourceLabel,
  stageChipLabel,
  stageTone,
  timeAgo,
} from "@/lib/crm/format";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import {
  Chip,
  Panel,
  StatusRow,
  adminButtonOutline,
  adminButtonPrimary,
  filterTab,
} from "@/components/admin/LeadBits";

/**
 * /admin/ — Leads: everyone who has inquired, newest activity first.
 *
 * Drawn to the Leads mockup Steve signed off (11 November 2026), with the
 * columns and filters there is data for. "Waiting", and the stages that only
 * the follow-up emails create, arrive with those emails.
 *
 * WHAT NEEDS THE OWNER COMES FIRST. Two things do today: an inquiry that was
 * saved here while the email about it failed (the one case where this screen
 * knows something the inbox does not), and an open lead whose next step has
 * come due. Neither is left to be noticed in a table.
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
  "grid grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1.75fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.8fr)_minmax(0,1.7fr)] gap-3.5";

/** What one row shows, worked out once for both the table and the phone cards. */
function summarize(lead: LeadRow, now: Date) {
  const { leads: copy } = adminCopy;
  const latest = lead.inquiries[0];
  const last = lead.lead_events[0];
  const due = leadStepDue(lead, now);
  const step = nextStepLine(lead.next_step, lead.next_step_due, now);

  // Why this lead needs the owner, most pressing first.
  const reasons: { label: string; body: string }[] = [];
  if (leadEmailFailed(lead)) reasons.push({ label: copy.needsYouLabel, body: copy.needsYouBody });
  if (due) {
    reasons.push({
      label: due === "today" ? copy.dueTodayLabel : copy.overdueLabel,
      body: lead.next_step
        ? `${lead.next_step}${due === "overdue" && lead.next_step_due ? ` · was due ${dayLabel(lead.next_step_due, now)}` : ""}`
        : copy.dueNoStep,
    });
  }

  return {
    id: lead.id,
    name: lead.name || "No name given",
    organization: lead.organization,
    isTest: lead.is_test,
    reasons,
    needsYou: reasons.length > 0,
    callBooked: lead.stage === "call_booked",
    closed: lead.stage === "closed",
    budget: budgetLabel(latest ?? {}),
    stage: stageChipLabel(lead),
    stageTone: stageTone(lead.stage),
    source: latest ? sourceLabel(latest) : "",
    event: eventLabel(latest?.event_date),
    activity: last ? `${activityLabel(last.kind, lead)} · ${timeAgo(new Date(last.at), now)}` : "",
    nextStep: step,
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

  const read = await listLeads();
  const now = new Date();

  const all = read.ok ? read.value : [];
  const real = all.filter((lead) => !lead.is_test);
  const testCount = all.length - real.length;
  const inScope = (showTests ? all : real).map((lead) => summarize(lead, now));
  const needsYou = inScope.filter((row) => row.needsYou);

  const withTests = (query: string) => `/admin/${showTests ? `?tests=1${query ? `&${query}` : ""}` : query ? `?${query}` : ""}`;

  // The filters. "All" is always there; another is offered once it would
  // show something, or while it is the one being looked at.
  const filters = [
    { key: "", label: copy.filterAll, rows: inScope },
    { key: "needs", label: copy.filterNeedsYou, rows: needsYou },
    { key: "booked", label: copy.filterCallBooked, rows: inScope.filter((row) => row.callBooked) },
    { key: "closed", label: copy.filterClosed, rows: inScope.filter((row) => row.closed) },
  ];
  const active = filters.find((filter) => filter.key !== "" && filter.key === show) ?? filters[0];
  const offered = filters.filter((filter) => filter.key === "" || filter.rows.length > 0 || filter === active);
  const rows = active.rows;

  const summary = !read.ok
    ? undefined
    : real.length === 0
      ? copy.none
      : `${countOf(real.length, "inquiry", "inquiries")}.${
          needsYou.length > 0 ? ` ${needsYou.length} ${needsYou.length === 1 ? "needs" : "need"} you.` : ""
        }`;

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
              {needsYou.flatMap((row) =>
                row.reasons.map((reason) => (
                  <div
                    key={`${row.id}-${reason.label}`}
                    className="flex min-w-0 flex-[1_1_380px] flex-wrap items-center justify-between gap-3 rounded-[var(--radius-base)] border border-line border-t-[3px] border-t-warn bg-white px-[18px] py-4"
                  >
                    <div className="min-w-0 flex-[1_1_240px]">
                      <p className="text-[12px] font-semibold uppercase leading-normal tracking-[0.08em] text-warn-ink">
                        {reason.label}
                      </p>
                      <p className="mt-1 text-[15px] font-bold text-navy">
                        {[row.name, row.organization].filter(Boolean).join(", ")}
                      </p>
                      <p className="mt-0.5 break-words text-[13px] leading-[1.5] text-ink-faint">{reason.body}</p>
                    </div>
                    <Link href={`/admin/leads/${row.id}/`} prefetch={false} className={adminButtonPrimary}>
                      {copy.open}
                    </Link>
                  </div>
                )),
              )}
            </div>
          ) : null}

          {inScope.length > 0 && offered.length > 1 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {offered.map((filter) => (
                <Link
                  key={filter.key}
                  href={withTests(filter.key ? `show=${filter.key}` : "")}
                  aria-current={filter === active ? "true" : undefined}
                  className={filterTab(filter === active)}
                >
                  {filter.label} {filter.rows.length}
                </Link>
              ))}
            </div>
          ) : null}

          {rows.length > 0 ? (
            <>
              {/* Wide screens: the table. */}
              <div className="hidden overflow-x-auto rounded-[var(--radius-base)] border border-line bg-white md:block">
                <div className="min-w-[980px]">
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
                      <span className="min-w-0">
                        <Chip tone={row.budget.tone} wrap>
                          {row.budget.label}
                        </Chip>
                      </span>
                      <span className="flex min-w-0 flex-wrap gap-1.5">
                        <Chip tone={row.needsYou ? "warn" : row.stageTone} wrap>
                          {row.stage}
                        </Chip>
                        {row.isTest ? <Chip tone="warn">{copy.testChip}</Chip> : null}
                      </span>
                      <span>{row.source}</span>
                      <span>{row.event}</span>
                      <span>{row.activity}</span>
                      {row.nextStep ? (
                        <span className="min-w-0 break-words font-semibold text-navy">{row.nextStep}</span>
                      ) : (
                        <span className="text-ink-faint">{copy.noNextStep}</span>
                      )}
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
                      <Chip tone={row.needsYou || row.isTest ? "warn" : row.stageTone}>
                        {row.isTest ? copy.testChip : row.stage}
                      </Chip>
                    </div>
                    <p className="mt-2 text-[13px]">
                      <Chip tone={row.budget.tone}>{row.budget.label}</Chip> &nbsp;{row.event}
                    </p>
                    {row.nextStep ? (
                      <p className="mt-1.5 break-words text-[13px] font-semibold leading-[1.5] text-navy">{row.nextStep}</p>
                    ) : (
                      <p className="mt-1.5 text-[13px] leading-[1.5] text-ink-faint">{row.activity}</p>
                    )}
                  </Link>
                ))}
              </div>
            </>
          ) : inScope.length > 0 ? (
            <p className="text-[15px] leading-[1.6] text-ink-faint">{copy.noneInFilter}</p>
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
