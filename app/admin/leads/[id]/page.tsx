import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminCopy } from "@/content/admin";
import { requireAdmin } from "@/lib/crm/session";
import { getLead, leadNeedsYou, type InquiryRow } from "@/lib/crm/leads";
import {
  arrivalSentence,
  budgetLabel,
  centralDay,
  clockTime,
  dayAndTime,
  eventLabel,
  eventTitle,
  isRecordId,
  sourceDetail,
  stageLabel,
} from "@/lib/crm/format";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import { Chip, Panel, Row } from "@/components/admin/LeadBits";

/**
 * /admin/leads/<id>/ — one lead: the brief to read before calling them, and
 * the record of everything that has happened.
 *
 * Drawn to the lead mockup Steve signed off (11 November 2026). The parts of
 * that mockup that belong to later steps are not here yet: the call itself,
 * the stage menu and the after-the-call buttons, and the email sequence.
 *
 * THE ADDRESS IS THE RECORD'S ID, never a name or an email, so nothing about
 * the person is in a link, in browser history, or in a server log. The tab
 * title is the same for every lead for the same reason.
 *
 * AN ID THAT IS NOT SHAPED LIKE ONE NEVER REACHES THE DATABASE. It is checked
 * here and again in `getLead`, because that value becomes part of a query.
 */
export const metadata: Metadata = { title: adminCopy.lead.title };
export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isRecordId(id)) notFound();

  const { lead: copy, leads: listCopy } = adminCopy;
  const read = await getLead(id);

  if (!read.ok) {
    return (
      <AdminShell current="/admin/">
        <AdminHeading heading={copy.title} />
        <div role="alert" className="max-w-[620px] rounded-[var(--radius-base)] border border-warn bg-white px-6 py-7">
          <h2 className="text-[18px] font-bold leading-[1.3] tracking-normal text-navy">
            {listCopy.unreadableHeading}
          </h2>
          <p className="mt-2 text-[15px] leading-[1.6]">{listCopy.unreadableBody}</p>
          <p className="mt-2 break-words text-[13px] leading-[1.5] text-ink-faint">{read.reason}</p>
        </div>
      </AdminShell>
    );
  }

  const lead = read.value;
  if (!lead) notFound();

  const [latest, ...earlier] = lead.inquiries;
  const budget = latest ? budgetLabel(latest) : null;
  const inquiryById = new Map<string, InquiryRow>(lead.inquiries.map((inquiry) => [inquiry.id, inquiry]));

  // The date is shown on the first entry of each day and the time alone after
  // it, as the mockup draws it: a column of identical dates is noise.
  const days = lead.lead_events.map((event) => centralDay(new Date(event.at)));
  const timeline = lead.lead_events.map((event, index) => {
    const at = new Date(event.at);
    const when = index > 0 && days[index] === days[index - 1] ? clockTime(at) : dayAndTime(at);

    const { title, problem } = eventTitle(event.kind);
    const inquiry = event.inquiry_id ? inquiryById.get(event.inquiry_id) : undefined;
    const error = typeof event.detail?.error === "string" ? event.detail.error.slice(0, 200) : "";
    const note = event.kind === "inquiry_received" && inquiry ? arrivalSentence(inquiry) : error;
    return { key: event.id ?? event.at, when, title, problem, note };
  });

  return (
    <AdminShell current="/admin/">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em] text-navy md:text-[28px]">
            {lead.name || "No name given"}
          </h1>
          <p className="mt-1.5 break-words text-[15px] leading-[1.5] text-ink-faint">
            {[lead.organization, lead.email].filter(Boolean).join(" · ")}
          </p>
        </div>
        <p className="flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-navy">{copy.stage}</span>
          <Chip tone={leadNeedsYou(lead) ? "warn" : "neutral"}>{stageLabel(lead.stage)}</Chip>
          {lead.is_test ? <Chip tone="warn">{listCopy.testChip}</Chip> : null}
        </p>
      </div>

      <div className="flex max-w-[760px] flex-col gap-6">
        {lead.is_test ? (
          <p className="rounded-[var(--radius-base)] border border-warn bg-warn-bg px-[18px] py-3 text-[15px] leading-[1.5] text-warn-ink">
            {copy.testNote}
          </p>
        ) : null}

        <Panel heading={copy.briefHeading}>
          {latest && budget ? (
            <>
              <Row label={copy.organization}>{lead.organization || "Not given"}</Row>
              <Row label={copy.source}>{sourceDetail(latest)}</Row>
              <Row label={copy.budget}>
                <Chip tone={budget.tone}>{budget.label}</Chip> &nbsp;{budget.note}
              </Row>
              <Row label={copy.timing}>{eventLabel(latest.event_date, "long")}</Row>
              {latest.event_name ? <Row label={copy.event}>{latest.event_name}</Row> : null}
              {latest.location ? <Row label={copy.location}>{latest.location}</Row> : null}
              {latest.audience_size ? <Row label={copy.audience}>{latest.audience_size}</Row> : null}
              {latest.format ? <Row label={copy.format}>{latest.format}</Row> : null}
              <Row label={copy.wrote}>“{latest.message}”</Row>
            </>
          ) : (
            <p className="border-t border-line py-2.5">{copy.noInquiry}</p>
          )}
        </Panel>

        <Panel heading={copy.timelineHeading}>
          {timeline.map((entry) => (
            <Row key={entry.key} label={entry.when} faintLabel>
              <strong className={`font-semibold ${entry.problem ? "text-warn-ink" : "text-navy"}`}>{entry.title}</strong>
              {entry.note ? (
                <>
                  <br />
                  <span className="text-[13px] leading-[1.5] text-ink-faint">{entry.note}</span>
                </>
              ) : null}
            </Row>
          ))}
        </Panel>

        {earlier.length > 0 ? (
          <Panel heading={copy.earlierHeading}>
            {earlier.map((inquiry) => (
              <Row key={inquiry.id} label={dayAndTime(new Date(inquiry.created_at))} faintLabel>
                “{inquiry.message}”
                <br />
                <span className="text-[13px] leading-[1.5] text-ink-faint">{sourceDetail(inquiry)}</span>
              </Row>
            ))}
          </Panel>
        ) : null}
      </div>
    </AdminShell>
  );
}
