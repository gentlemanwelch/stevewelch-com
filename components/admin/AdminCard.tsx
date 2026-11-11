import type { ReactNode } from "react";
import { site } from "@/content/site";

/**
 * The one card on a navy field: the sign-in page and the wrong-account page.
 *
 * Drawn to the CRM mockups Steve signed off (11 November 2026): a 400px white
 * card, the wordmark, one heading, one line, one button. Nothing else on the
 * page, because nothing else is safe to show somebody who has not signed in.
 *
 * The name is written in its normal case and uppercased in CSS, as the
 * site's Wordmark does, so a screen reader says "Steve Welch".
 */
export function AdminCard({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <main
      id="main"
      className="flex min-h-screen items-center justify-center bg-navy px-5 py-14 sm:px-10"
    >
      <div className="flex w-full max-w-[400px] flex-col gap-3.5 rounded-[var(--radius-base)] bg-white px-8 py-9">
        <p className="text-[16px] font-extrabold uppercase leading-normal tracking-[0.08em] text-navy">
          {site.name}
        </p>
        <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-navy">
          {heading}
        </h1>
        {children}
      </div>
    </main>
  );
}

const CARD_BUTTON =
  "inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-base)] px-[18px] py-2.5 text-[14px] font-bold leading-tight transition-colors duration-200";

/** The card's filled button: the primary action. */
export const cardButtonPrimary = `${CARD_BUTTON} bg-action text-white hover:bg-action-dark`;

/** The card's outlined button: a second attempt, not the first. */
export const cardButtonOutline = `${CARD_BUTTON} border-[1.5px] border-action bg-white text-action hover:border-action-dark hover:text-action-dark`;

/** The card's body text. */
export const cardText = "text-[15px] leading-[1.6] text-ink-soft";
