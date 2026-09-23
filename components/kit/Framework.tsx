import { FrameworkReveal } from "@/components/kit/FrameworkReveal";

/**
 * The framework graphic: [ PURPOSE → PEOPLE → PROCESS ] × AI.
 *
 * The spec's rules, each of which shapes something below:
 *
 *   - "Purpose/People/Process should visually read as the foundation/system."
 *     → the three sit together inside one bordered frame.
 *   - "AI arrives last and is differentiated as an amplifier… not a fourth
 *     equal foundation block." → it sits OUTSIDE the frame, after a ×, in
 *     navy, larger, and it animates in differently.
 *   - "AI copy must read Amplifies Everything."
 *   - Mobile: "vertical flow is preferred: Purpose ↓ People ↓ Process,
 *     followed by × AI. Do not shrink the horizontal desktop graphic until
 *     labels become unreadable." → it is a column below lg, not a scaled row.
 *
 * READ AS TEXT, it is an ordered list of three named steps and their lines,
 * then AI and its line — the arrows and numbers are aria-hidden, so a screen
 * reader and a crawler get the framework as sentences, not as decoration.
 */
type Step = { key: string; name: string; line: string };

export function Framework({
  steps,
  amplifier,
}: {
  steps: readonly Step[];
  amplifier: { name: string; line: string };
}) {
  return (
    <FrameworkReveal>
      {/*
        THREE LAYOUTS, not two. Below lg: one column. lg–xl (1024–1279): the
        foundation row across the top, × AI beneath it. xl up: all five in one
        row. The middle stage exists because at exactly 1024 the single row
        measured 12px wider than the page — and the spec says not to shrink the
        graphic until its labels become unreadable, so it re-flows instead.
      */}
      <figure className="flex flex-col items-stretch gap-4 xl:flex-row xl:gap-5">
        {/* The foundation: the three, framed as one system. */}
        <ol className="flex flex-1 flex-col gap-2 rounded-[var(--radius-base)] border-[1.5px] border-navy/25 bg-white p-3 sm:p-4 lg:flex-row lg:items-stretch lg:gap-3 lg:p-5">
          {steps.map((step, i) => (
            /* Each item is a real flex box, never `display: contents` — that
               strips list semantics in some Safari versions, and then a screen
               reader no longer announces the three as steps. */
            <li key={step.key} className="flex flex-col items-stretch gap-2 lg:flex-1 lg:flex-row lg:gap-3">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  data-step={step.key}
                  className="flex items-center justify-center py-0.5 text-2xl font-bold text-blue lg:py-0"
                >
                  <span className="lg:hidden">↓</span>
                  <span className="hidden lg:inline">→</span>
                </span>
              )}
              <div
                data-step={step.key}
                className="flex flex-1 flex-col rounded-[var(--radius-base)] bg-tint px-5 py-5 lg:min-h-[13rem] lg:px-6 lg:py-7"
              >
                <span aria-hidden="true" className="eyebrow text-action">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Top-aligned at a fixed offset, not pushed to the bottom:
                    the lines under each name wrap to different lengths, and
                    bottom-aligning let that shove the names out of line. */}
                <div className="mt-3 lg:mt-12">
                  <h3 className="!text-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)] font-extrabold uppercase tracking-tight">
                    {step.name}
                  </h3>
                  <p className="mt-1.5 text-lg font-semibold leading-snug text-navy">{step.line}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <span
          aria-hidden="true"
          data-step="ai"
          className="flex items-center justify-center text-5xl font-medium leading-none text-blue xl:text-7xl"
        >
          ×
        </span>

        {/* The amplifier. Outside the frame, on purpose. */}
        <div
          data-step="ai"
          className="flex flex-col justify-center rounded-[var(--radius-base)] bg-navy px-6 py-7 text-white lg:px-8 lg:py-8 xl:w-[28%]"
        >
          <div>
            <h3 className="!text-[clamp(3rem,2rem+3vw,5rem)] font-extrabold leading-none tracking-tight text-white">
              {amplifier.name}
            </h3>
            <p className="eyebrow mt-3 !text-[0.9375rem] !tracking-[0.14em] text-cyan">{amplifier.line}</p>
          </div>
        </div>
      </figure>
    </FrameworkReveal>
  );
}
