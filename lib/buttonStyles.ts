/*
 * The one definition of what a button looks like on this site.
 *
 * Buttons are coral. On the original every call to action is, and against a
 * site this navy-heavy that contrast is the whole reason they read as
 * clickable — a blue button on a blue site is decoration.
 *
 * `secondary` is white-on-navy for the cases where coral would compete with a
 * primary action beside it. `blue` is the Ads landing pages, where the design
 * is tighter and coral is already spent on the headline. `ghost` is an inline
 * text action.
 *
 * WHY THIS IS ITS OWN FILE. Two reasons, both learned the hard way:
 *
 * 1. `Button` in components/primitives.tsx renders an <a>, and a form's submit
 *    control has to be a real <button type="submit">. So each of the three
 *    forms wrote its own approximation, and an audit on 2026-09-01 found them
 *    disagreeing on radius, weight and padding — the booking form, the one
 *    that earns, being furthest off system (rounded-full instead of the pill
 *    token, weight 600 instead of 700, padding 14/40 instead of 12/28).
 *
 * 2. It lives in lib/ rather than in primitives.tsx because the forms are
 *    client components: importing this from primitives would pull LogoWall,
 *    Prose and JsonLd into the client bundle to fetch one string.
 *
 * Anything on this site that looks like a button gets its classes from here.
 */

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-7 py-3 text-ui font-bold transition-colors duration-200 disabled:opacity-60";

export const BUTTON_VARIANTS = {
  primary: "bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-dark)]",
  secondary:
    "border-2 border-white bg-white text-[var(--color-navy)] hover:bg-transparent hover:text-white",
  blue: "bg-[var(--color-blue)] text-white hover:bg-[var(--color-blue-deep)]",
  ghost: "text-[var(--color-coral)] hover:text-[var(--color-coral-dark)] px-0",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function buttonClasses(variant: ButtonVariant = "primary", className = "") {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`.trim();
}
