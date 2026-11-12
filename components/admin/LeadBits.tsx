import type { ReactNode } from "react";

/*
 * The small pieces the CRM's lead screens are built from: the chip, the
 * labelled row, the panel. Drawn to the mockups Steve signed off
 * (11 November 2026); every colour is a token from app/globals.css.
 */

export type ChipTone = "yes" | "neutral" | "action" | "warn" | "plain" | "muted";

const CHIP_TONES: Record<ChipTone, string> = {
  /* A firm yes: navy, the strongest thing on the row. */
  yes: "bg-navy text-white border border-navy",
  /* Neither good nor bad news: an answer that needs a conversation. */
  neutral: "bg-tint text-navy border border-line-strong",
  /* Something is booked or moving. */
  action: "bg-action text-white border border-action",
  /* It needs the owner, or it is switched off. */
  warn: "bg-warn-bg text-warn-ink border border-warn",
  /* An ordinary state: where most leads are, most of the time. */
  plain: "bg-white text-ink-soft border border-line",
  /* Over and done with: closed, or under the floor. */
  muted: "bg-muted text-ink-faint border border-muted",
};

/**
 * A short label in a box: a budget answer, a stage, a status.
 *
 * `wrap` is for a chip in a narrow table column, where a long label (a budget
 * range, say) would otherwise run over the column beside it.
 */
export function Chip({ tone, wrap = false, children }: { tone: ChipTone; wrap?: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-[var(--radius-base)] px-2.5 py-[3px] text-[12px] font-semibold leading-[1.5] ${
        wrap ? "max-w-full break-words" : "whitespace-nowrap"
      } ${CHIP_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** A white panel with a hairline and a small heading. */
export function Panel({
  heading,
  children,
  className = "",
}: {
  heading: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[var(--radius-base)] border border-line bg-white px-[22px] py-5 ${className}`}>
      <h2 className="text-[16px] font-bold leading-[1.3] tracking-normal text-navy">{heading}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * One line of a panel: a label on the left, the value on the right, a
 * hairline above. Stacks on a phone, where 150px of label would leave no
 * room for the value.
 */
export function Row({ label, children, faintLabel = false }: { label: ReactNode; children: ReactNode; faintLabel?: boolean }) {
  return (
    <div className="grid gap-x-4 gap-y-1 border-t border-line py-2.5 sm:grid-cols-[150px_minmax(0,1fr)]">
      <span className={faintLabel ? "text-[13px] leading-[1.5] text-ink-faint" : "font-semibold text-navy"}>
        {label}
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

/** A line with a status on the right: "Inquiry form … Connected". */
export function StatusRow({
  label,
  note,
  status,
  tone,
}: {
  label: string;
  note?: string;
  status: string;
  tone: ChipTone;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2.5">
      <span>
        <strong className="font-semibold text-navy">{label}</strong>
        {note ? (
          <>
            <br />
            <span className="text-[13px] leading-[1.5] text-ink-faint">{note}</span>
          </>
        ) : null}
      </span>
      <Chip tone={tone}>{status}</Chip>
    </div>
  );
}

/** The CRM's two buttons, as class names, for links and for form buttons. */
const BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-base)] px-[18px] py-2.5 text-[14px] font-bold leading-tight transition-colors duration-200";
export const adminButtonPrimary = `${BUTTON} bg-action text-white hover:bg-action-dark`;
export const adminButtonOutline = `${BUTTON} cursor-pointer border-[1.5px] border-action bg-white text-action hover:border-action-dark hover:text-action-dark`;
/* A button that records a fact, once that fact is recorded. */
export const adminButtonPressed = `${BUTTON} cursor-pointer border-[1.5px] border-navy bg-navy text-white`;
/* A button that does not apply to this lead as it stands. */
export const adminButtonOff = `${BUTTON} cursor-not-allowed border-[1.5px] border-line-strong bg-white text-ink-faint`;

/** A text field, a date field or a text area on a CRM screen. */
export const adminField =
  "block w-full rounded-[var(--radius-base)] border border-field bg-white px-3 py-2.5 text-[15px] text-navy";
export const adminFieldLabel = "mb-1.5 block font-semibold text-navy";

/** A filter above a list or a report: one of several, one of them on. */
export function filterTab(on: boolean): string {
  return `inline-flex min-h-10 items-center rounded-[var(--radius-base)] border-[1.5px] px-3.5 py-2 text-[14px] font-semibold ${
    on ? "border-navy bg-navy text-white" : "border-line-strong bg-white text-ink-soft"
  }`;
}
