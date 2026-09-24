/*
 * The one definition of what a button looks like on this site.
 *
 * REBUILT 2026-09-23 for "Built for Change". Square-cornered (4px, the spec's
 * "0–6px"), blue rather than coral — see --color-action in app/globals.css for
 * why that is a reading of the packet rather than a preference.
 *
 * TARGET SIZE: every variant but `ghost` is at least 48px tall (min-h-12).
 * WCAG 2.2's floor is 24px and 44px is what reads as comfortable under a
 * thumb; the primary CTA is the most-pressed thing on the site, so it gets
 * room to spare.
 *
 * VARIANTS, and where each belongs:
 *   primary       the booking CTA — "Build Your Keynote". Blue fill.
 *   secondary     solid white, for a primary action sitting on a dark band.
 *   outline       the secondary action on a LIGHT background.
 *   outlineLight  the secondary action on a DARK background.
 *   ghost         an inline text action.
 *
 * WHY THIS IS ITS OWN FILE: the forms are client components and need these
 * classes for their <button type="submit">. Importing them from
 * components/primitives.tsx would drag every server primitive into the client
 * bundle to fetch one string.
 */

const BUTTON_BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-base)] px-6 py-3 text-base font-bold leading-tight transition-colors duration-200 disabled:opacity-60";

export const BUTTON_VARIANTS = {
  primary: "bg-action text-white hover:bg-action-dark",
  secondary: "bg-white text-navy hover:bg-tint",
  outline:
    "border-[1.5px] border-navy text-navy hover:bg-navy hover:text-white",
  outlineLight:
    "border-[1.5px] border-white/80 text-white hover:bg-white hover:text-navy",
  ghost:
    "!min-h-0 !px-0 text-action underline-offset-4 hover:text-action-dark hover:underline",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function buttonClasses(variant: ButtonVariant = "primary", className = "") {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`.trim();
}
