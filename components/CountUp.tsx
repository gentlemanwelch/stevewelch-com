"use client";

import { useEffect, useRef } from "react";

/**
 * A number that counts up the first time it is scrolled into view.
 *
 * The original animates every one of its counter blocks this way, and the
 * motion is most of why that band reads as an achievement rather than a table.
 *
 * THE FINAL VALUE IS WHAT THE SERVER RENDERS. `display` is the element's only
 * child, so the static HTML contains "400+", never "0+". That matters more here
 * than on most sites: GPTBot, ClaudeBot and PerplexityBot execute no
 * JavaScript, so a number that exists only after an animation is a number they
 * never see.
 *
 * NO STATE. The animation writes to the DOM node through the ref rather than
 * re-rendering sixty times a second — which is what an effect is actually for,
 * synchronising React with an outside system. The first version reset a state
 * value to zero in the effect body and the React Compiler rejected it as a
 * cascading render; it was also just a worse way to do it. React never
 * re-renders this node afterwards, because nothing it depends on changes.
 *
 * Honours prefers-reduced-motion by leaving the rendered value alone.
 */
export function CountUp({
  to,
  display,
  durationMs = 1400,
}: {
  /** The magnitude to count to — what is shown, not the raw figure. */
  to: number;
  /** The finished string, prefix and suffix included. Rendered on the server. */
  display: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Whatever sits around the number in `display` is kept throughout, so
    // "$10B+" counts 0..10 and never loses its "$" or its "B+".
    const at = display.indexOf(String(to));
    if (at < 0) return;
    const prefix = display.slice(0, at);
    const suffix = display.slice(at + String(to).length);
    const write = (n: number) => {
      el.textContent = `${prefix}${n.toLocaleString()}${suffix}`;
    };

    write(0);

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const startedAt = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - startedAt) / durationMs);
          // easeOutCubic — quick off the mark, settling onto the number.
          write(Math.round((1 - Math.pow(1 - t, 3)) * to));
          if (t < 1) raf = requestAnimationFrame(step);
          else el.textContent = display;
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = display;
    };
  }, [to, display, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
