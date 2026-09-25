import { CountUp } from "@/components/CountUp";

export type StatItem = { value: string; label: string; sentence?: string; to?: number };

/**
 * A row of figures, set large under a rule — the Built for Change form of the
 * old StatGrid.
 *
 * It keeps the two things StatGrid got right:
 *
 *   EXTRACTABILITY. A number in one element and its label in another reach a
 *   parser as two unrelated fragments — "225+" and "studios nationwide". Each
 *   figure also emits one complete sentence, visually hidden, and the split
 *   halves are aria-hidden, so a screen reader and a crawler both get "Steve
 *   helped build Restore to 225+ studios", once.
 *
 *   NO JAVASCRIPT TO SEE IT. CountUp server-renders the final value; the count
 *   is an animation over a number that is already in the HTML.
 */
export function StatRow({ stats, tone = "light" }: { stats: readonly StatItem[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  /* Columns follow the count — a fixed four split a three-stat row into four
     narrow columns once already. Four go two-up even on a phone: stacked one
     per row they ran to most of a screen. Literal classes, for Tailwind's
     scanner. */
  const columns =
    stats.length <= 2 ? "sm:grid-cols-2" : stats.length === 3 ? "sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4";
  return (
    <dl className={`grid gap-x-6 gap-y-10 sm:gap-x-8 ${columns}`}>
      {stats.map((s) => (
        <div key={s.label} className={`border-t-2 pt-5 ${dark ? "border-white/60" : "border-navy"}`}>
          <dt
            aria-hidden="true"
            className={`text-[clamp(2.25rem,1.6rem+2.6vw,4rem)] font-extrabold leading-none tracking-tight tabular-nums ${
              dark ? "text-white" : "text-navy"
            }`}
          >
            {s.to ? <CountUp to={s.to} display={s.value} /> : s.value}
          </dt>
          <dd aria-hidden="true" className={`mt-3 text-[0.9375rem] leading-snug ${dark ? "text-white/80" : ""}`}>
            {s.label}
          </dd>
          <dd className="sr-only">{s.sentence ?? `${s.value} ${s.label}`}</dd>
        </div>
      ))}
    </dl>
  );
}
