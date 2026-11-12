import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminCopy } from "@/content/admin";
import { requireAdmin } from "@/lib/crm/session";
import { getLead, type InquiryRow, type LeadAction } from "@/lib/crm/leads";
import {
  arrivalSentence,
  budgetLabel,
  centralDay,
  clockTime,
  dayAndTime,
  eventLabel,
  eventNote,
  eventTitle,
  isRecordId,
  money,
  sourceDetail,
  stageChoices,
  stageRank,
} from "@/lib/crm/format";
import { AdminHeading, AdminShell } from "@/components/admin/AdminShell";
import {
  Chip,
  Panel,
  Row,
  adminButtonOff,
  adminButtonOutline,
  adminButtonPressed,
  adminButtonPrimary,
  adminField,
  adminFieldLabel,
} from "@/components/admin/LeadBits";

/**
 * /admin/leads/<id>/ — one lead: the brief to read before calling them, what
 * the call produced, and the record of everything that has happened.
 *
 * Drawn to the lead mockup Steve signed off (11 November 2026). The parts of
 * that mockup that belong to later steps are not here yet: the call itself
 * (the calendar) and the email sequence.
 *
 * THE ADDRESS IS THE RECORD'S ID, never a name or an email, so nothing about
 * the person is in a link, in browser history, or in a server log. The tab
 * title is the same for every lead for the same reason.
 *
 * AN ID THAT IS NOT SHAPED LIKE ONE NEVER REACHES THE DATABASE. It is checked
 * here and again in `getLead`, because that value becomes part of a query.
 *
 * EVERY CONTROL IS A FORM THAT POSTS, to /api/admin/leads/<id>/. No script:
 * a press either reaches the server and comes back with the page changed, or
 * it visibly does not. And each press records one fact. "Qualified" does not
 * quietly mark the call as held; a report built on implied facts is a report
 * nobody can check.
 *
 * NOTHING HERE EMAILS THE LEAD. The panel says so, and it is true: the route
 * these forms post to writes to the database and does nothing else.
 */
export const metadata: Metadata = { title: adminCopy.lead.title };
export const dynamic = "force-dynamic";

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ problem?: string }>;
}) {
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

  const now = new Date();
  const action = `/api/admin/leads/${lead.id}/`;
  const { problem } = await searchParams;
  const problems = (problem ?? "")
    .split(",")
    // Only the codes this page knows. `hasOwn`, so a made-up code such as
    // "constructor" finds nothing rather than something inherited.
    .filter((code) => Object.hasOwn(copy.problems, code))
    .map((code) => copy.problems[code as keyof typeof copy.problems]);

  const [latest, ...earlier] = lead.inquiries;
  const budget = latest ? budgetLabel(latest) : null;
  const inquiryById = new Map<string, InquiryRow>(lead.inquiries.map((inquiry) => [inquiry.id, inquiry]));
  const stage = stageChoices(lead.stage, lead.closed_reason);

  // The date is shown on the first entry of each day and the time alone after
  // it, as the mockup draws it: a column of identical dates is noise.
  const days = lead.lead_events.map((event) => centralDay(new Date(event.at)));
  const timeline = lead.lead_events.map((event, index) => {
    const at = new Date(event.at);
    const when = index > 0 && days[index] === days[index - 1] ? clockTime(at) : dayAndTime(at);

    const { title, problem: isProblem } = eventTitle(event.kind, event.detail);
    const inquiry = event.inquiry_id ? inquiryById.get(event.inquiry_id) : undefined;
    const error = typeof event.detail?.error === "string" ? event.detail.error.slice(0, 200) : "";
    const note =
      event.kind === "inquiry_received" && inquiry
        ? arrivalSentence(inquiry)
        : eventNote(event.kind, event.detail, now) || error;
    return { key: event.id ?? event.at, when, title, problem: isProblem, note };
  });

  /** One fact, one button: a form that posts the action and nothing else. */
  const press = (name: LeadAction, label: string, look: "primary" | "outline", state: "pressed" | "off" | "ready") => (
    <form method="post" action={action}>
      <input type="hidden" name="action" value={name} />
      <button
        type="submit"
        disabled={state === "off"}
        aria-pressed={state === "pressed"}
        className={
          state === "pressed"
            ? adminButtonPressed
            : state === "off"
              ? adminButtonOff
              : look === "primary"
                ? `${adminButtonPrimary} cursor-pointer`
                : adminButtonOutline
        }
      >
        {label}
      </button>
    </form>
  );

  const callWasHeld = stageRank(lead.reached) >= stageRank("call_held");
  const canBeNoShow = ["inquiry", "call_booked", "call_held"].includes(lead.stage);

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
        <form method="post" action={action} className="flex flex-wrap items-center gap-2.5">
          <input type="hidden" name="action" value="stage" />
          <label htmlFor="lead-stage" className="font-semibold text-navy">
            {copy.stage}
          </label>
          <select
            id="lead-stage"
            name="stage"
            defaultValue={stage.current}
            className="min-h-11 rounded-[var(--radius-base)] border border-field bg-white px-3 py-2 text-[15px] text-navy"
          >
            {stage.choices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
          {/* A button, not a menu that acts the moment it changes: a stage is
              too easy to change with a stray scroll or an arrow key. */}
          <button type="submit" className={adminButtonOutline}>
            {copy.changeStage}
          </button>
          {lead.is_test ? <Chip tone="warn">{listCopy.testChip}</Chip> : null}
        </form>
      </div>

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

      {lead.is_test ? (
        <p className="mb-6 max-w-[760px] rounded-[var(--radius-base)] border border-warn bg-warn-bg px-[18px] py-3 text-[15px] leading-[1.5] text-warn-ink">
          {copy.testNote}
        </p>
      ) : null}

      {/* A phone reads top to bottom: the brief, what to record, then the
          record. On a wide screen the middle one moves to a column of its
          own, as the mockup draws it. */}
      <div
        className={`flex max-w-[1180px] flex-col gap-6 min-[1120px]:grid min-[1120px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] min-[1120px]:grid-rows-[auto_auto_1fr] min-[1120px]:items-start`}
      >
        <Panel heading={copy.briefHeading} className="min-[1120px]:col-start-1">
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

        <section
          id="after-the-call"
          aria-labelledby="after-the-call-heading"
          className={`flex scroll-mt-4 flex-col gap-3.5 rounded-[var(--radius-base)] border border-line bg-white px-[22px] py-5 min-[1120px]:col-start-2 min-[1120px]:row-span-3 min-[1120px]:row-start-1`}
        >
          <h2 id="after-the-call-heading" className="text-[16px] font-bold leading-[1.3] tracking-normal text-navy">
            {copy.afterHeading}
          </h2>
          <p className="text-[13px] leading-[1.5] text-ink-faint">{copy.afterNote}</p>

          <div className="flex flex-wrap gap-2">
            {press("call_held", copy.callHeld, "primary", callWasHeld ? "pressed" : "ready")}
            {press("no_show", copy.noShow, "outline", canBeNoShow ? "ready" : "off")}
          </div>

          <div>
            <p className="mb-2 font-semibold text-navy">{copy.qualifiedQuestion}</p>
            <div className="flex flex-wrap gap-2">
              {press("qualified", copy.qualified, "outline", lead.qualified === true ? "pressed" : "ready")}
              {press("not_a_fit", copy.notAFit, "outline", lead.qualified === false ? "pressed" : "ready")}
            </div>
          </div>

          <form method="post" action={action} autoComplete="off" className="flex flex-col gap-3.5">
            <input type="hidden" name="action" value="details" />
            <div>
              <label htmlFor="lead-next" className={adminFieldLabel}>
                {copy.nextStep}
              </label>
              <input
                id="lead-next"
                name="next_step"
                type="text"
                maxLength={200}
                defaultValue={lead.next_step ?? ""}
                className={adminField}
              />
            </div>
            <div>
              <label htmlFor="lead-due" className={adminFieldLabel}>
                {copy.due}
              </label>
              <input
                id="lead-due"
                name="due"
                type="date"
                defaultValue={lead.next_step_due ?? ""}
                className={adminField}
              />
            </div>
            <div>
              <label htmlFor="lead-fee" className={adminFieldLabel}>
                {copy.fee}
              </label>
              <input
                id="lead-fee"
                name="fee"
                type="text"
                inputMode="decimal"
                maxLength={20}
                placeholder={copy.feeHint}
                defaultValue={typeof lead.fee_cents === "number" ? money(lead.fee_cents) : ""}
                className={adminField}
              />
            </div>
            <div>
              <label htmlFor="lead-notes" className={adminFieldLabel}>
                {copy.notes}
              </label>
              <textarea
                id="lead-notes"
                name="notes"
                rows={3}
                maxLength={5000}
                placeholder={copy.notesHint}
                defaultValue={lead.notes ?? ""}
                className={`${adminField} resize-y`}
              />
            </div>
            <button type="submit" className={`${adminButtonOutline} self-start`}>
              {copy.save}
            </button>
          </form>
        </section>

        <Panel heading={copy.timelineHeading} className="min-[1120px]:col-start-1">
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
          <Panel heading={copy.earlierHeading} className="min-[1120px]:col-start-1">
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
