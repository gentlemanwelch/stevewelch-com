import type { Metadata } from "next";
import Link from "next/link";
import { adminCopy } from "@/content/admin";
import { requireAdmin } from "@/lib/crm/session";
import { type LeadRow, countNeedsYou, leadNeedsYou, listLeads } from "@/lib/crm/leads";
import {
  CLOSED_REASONS,
  OPEN_STAGES,
  activityLabel,
  countOf,
  eventLabel,
  money,
  nextStepLine,
  stageLabel,
  timeAgo,
} from "@/lib/crm/format";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import { Chip } from "@/components/admin/LeadBits";

/**
 * /admin/pipeline/ — where every open lead stands, one column per stage.
 *
 * Drawn to the Pipeline mockup Steve signed off (11 November 2026).
 *
 * A LEAD IS IN THE COLUMN OF THE STAGE IT IS AT NOW, and it gets there only
 * when the owner (or, later, the calendar) says so. Nothing moves a lead
 * along because time passed or an email went out. That is what keeps "Call
 * booked" from meaning "filled in a form" and "Booked" from meaning "had a
 * call".
 *
 * CLOSED LEADS ARE COUNTED AT THE FOOT, not drawn: this is the board of what
 * is still in play. The count links to the Leads list, filtered to them.
 *
 * Tests are kept out unless asked for (?tests=1), as on the Leads list. No
 * email address is on this page, and a lead is linked by its record id.
 */
export const metadata: Metadata = { title: adminCopy.pipeline.title };
export const dynamic = "force-dynamic";

/** The one line under a lead's name: what it is worth and what is next. */
function cardLine(lead: LeadRow, now: Date): string {
  const fee = typeof lead.fee_cents === "number" ? money(lead.fee_cents) : "";
  const step = nextStepLine(lead.next_step, lead.next_step_due, now);
  const last = lead.lead_events[0];
  const activity = last ? `${activityLabel(last.kind, lead)} ${timeAgo(new Date(last.at), now)}` : "";

  if (lead.stage === "booked") {
    const eventDate = lead.inquiries[0]?.event_date;
    return [fee, eventDate ? eventLabel(eventDate) : ""].filter(Boolean).join(" · ") || step || activity;
  }
  if (lead.stage === "proposal_sent" || lead.stage === "contract_out") {
    return [fee, step].filter(Boolean).join(" · ") || activity;
  }
  return step || activity;
}

export default async function PipelinePage({ searchParams }: { searchParams: Promise<{ tests?: string }> }) {
  await requireAdmin();
  const { pipeline: copy, leads: listCopy } = adminCopy;
  const showTests = (await searchParams).tests === "1";

  const read = await listLeads();
  const now = new Date();

  const all = read.ok ? read.value : [];
  const testCount = all.filter((lead) => lead.is_test).length;
  const leads = showTests ? all : all.filter((lead) => !lead.is_test);

  const columns = OPEN_STAGES.map((stage) => ({
    stage,
    label: stageLabel(stage),
    leads: leads.filter((lead) => lead.stage === stage),
  }));
  const closed = CLOSED_REASONS.map((reason) => ({
    reason,
    count: leads.filter((lead) => lead.stage === "closed" && lead.closed_reason === reason).length,
  }));

  return (
    <AdminShell current="/admin/pipeline/" needsYou={read.ok ? countNeedsYou(all, now) : null}>
      <AdminHeading heading={copy.heading} summary={copy.summary} />

      {!read.ok ? (
        <div role="alert" className="max-w-[620px] rounded-[var(--radius-base)] border border-warn bg-white px-6 py-7">
          <h2 className="text-[18px] font-bold leading-[1.3] tracking-normal text-navy">
            {listCopy.unreadableHeading}
          </h2>
          <p className="mt-2 text-[15px] leading-[1.6]">{listCopy.unreadableBody}</p>
          <p className="mt-2 break-words text-[13px] leading-[1.5] text-ink-faint">{read.reason}</p>
        </div>
      ) : (
        <>
          {/* A grid, so the columns stay even at every width: six across on
              a desk, three on a tablet, two on a phone. */}
          <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-3 xl:grid-cols-6">
            {columns.map((column) => (
              <section
                key={column.stage}
                aria-labelledby={`stage-${column.stage}`}
                className="flex min-w-0 flex-col gap-2.5"
              >
                <div className="flex items-baseline justify-between border-b-2 border-navy pb-2">
                  <h2 id={`stage-${column.stage}`} className="text-[14px] font-bold leading-[1.3] tracking-normal text-navy">
                    {column.label}
                  </h2>
                  <span className="text-[13px] font-bold text-ink-faint">{column.leads.length}</span>
                </div>
                {column.leads.length === 0 ? (
                  <p className="px-0.5 py-3 text-[13px] leading-[1.5] text-ink-faint">{copy.none}</p>
                ) : (
                  column.leads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads/${lead.id}/`}
                      prefetch={false}
                      className="block rounded-[var(--radius-base)] border border-line bg-white px-3.5 py-3 hover:border-line-strong"
                    >
                      <strong className="block break-words text-[14px] text-navy">{lead.name || "No name given"}</strong>
                      <span className="block break-words text-[13px] leading-[1.5] text-ink-faint">
                        {lead.organization}
                      </span>
                      <span className="mt-1.5 block break-words text-[13px] text-ink-soft">{cardLine(lead, now)}</span>
                      {leadNeedsYou(lead, now) || lead.is_test ? (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {leadNeedsYou(lead, now) ? <Chip tone="warn">{copy.needsYou}</Chip> : null}
                          {lead.is_test ? <Chip tone="warn">{listCopy.testChip}</Chip> : null}
                        </span>
                      ) : null}
                    </Link>
                  ))
                )}
              </section>
            ))}
          </div>

          <p className="mt-6 border-t border-line pt-3.5 text-[13px] leading-[1.5] text-ink-faint">
            {`${copy.closed} ${closed.map((entry) => `${entry.count} ${copy.closedReasons[entry.reason]}`).join(" · ")}.`}{" "}
            <Link
              href={`/admin/?${showTests ? "tests=1&" : ""}show=closed`}
              className="font-semibold text-action underline underline-offset-2"
            >
              {copy.showClosed}
            </Link>
          </p>

          {testCount > 0 ? (
            <p className="mt-3 text-[13px] leading-[1.5] text-ink-faint">
              {showTests ? (
                <Link href="/admin/pipeline/" className="font-semibold text-action underline underline-offset-2">
                  {listCopy.hideTests}
                </Link>
              ) : (
                <>
                  {countOf(testCount, "test inquiry is", "test inquiries are")} {listCopy.testsHidden}{" "}
                  <Link
                    href="/admin/pipeline/?tests=1"
                    className="font-semibold text-action underline underline-offset-2"
                  >
                    {listCopy.showTests}
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
