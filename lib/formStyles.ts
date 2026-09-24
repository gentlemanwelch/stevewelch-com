/*
 * The one definition of what a form field looks like on this site, shared by
 * all three forms — the booking inquiry, the landing-page inquiry and the
 * foundation form.
 *
 * Its own file for the same reason lib/buttonStyles.ts is: the forms are client
 * components, and importing these strings from a server module would drag that
 * module into the client bundle.
 *
 *   - text-base (16px) is a floor, not a style. Below 16px, iOS Safari zooms
 *     the page when a field takes focus, and the organizer filling in the
 *     booking form finds the layout lurched sideways under their thumb.
 *   - border-field is 3.35:1 on white. A field's edge is how someone finds
 *     where to type, so it is held to WCAG's 3:1 for boundaries; the hairline
 *     colour used for rules elsewhere is 1.27:1 and would hide it.
 *   - Focus keeps the site-wide outline (app/globals.css); the border darkens
 *     as well, so the active field is marked twice.
 */

export const FIELD =
  "block w-full rounded-[var(--radius-base)] border border-field bg-white px-4 py-3 text-base text-navy transition-colors placeholder:text-ink-faint hover:border-navy focus:border-action";

export const LABEL = "mb-1.5 block text-[0.9375rem] font-semibold text-navy";

/** The asterisk after a required field's label. */
export const REQUIRED = "text-action";
