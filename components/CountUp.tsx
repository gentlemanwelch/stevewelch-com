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
 * IT RUNS EVERY TIME, not once. Scroll past the band and back and the figures
 * climb again. Two thresholds make that work without a flicker: the count
 * starts when the element is 40% visible, and it only re-arms once the element
 * is COMPLETELY out of view. Re-arming at the same 40% mark would restart the
 * number while it was still on screen, which reads as a glitch rather than an
 * animation.
 *
 * The DOM never holds a zero except mid-animation. Nothing writes 0 up front,
 * and leaving the viewport restores the finished value rather than clearing it,
 * so the number an inspector — or Gemini, the one AI crawler that does execute
 * JavaScript — reads off an off-screen counter is the real one. The count
 * starts at zero because the animation's own first frame is zero, not because
 * anything blanks it beforehand.
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
    //
    // The number is found as the first run of digits, commas allowed — NOT by
    // looking up String(to). "57,000" does not contain "57000", so that lookup
    // failed and the only counter with a thousands separator silently never
    // animated while every other one did.
    const found = /[\d,]+/.exec(display);
    if (!found) return;
    const prefix = display.slice(0, found.index);
    const suffix = display.slice(found.index + found[0].length);
    const write = (n: number) => {
      el.textContent = `${prefix}${n.toLocaleString()}${suffix}`;
    };

    let raf = 0;
    // Cleared while a run is in flight or finished, set again once the element
    // has left the viewport entirely. Without it the observer would restart the
    // count on every threshold crossing, including its own scroll jitter.
    let armed = true;

    const run = () => {
      const startedAt = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - startedAt) / durationMs);
        // easeOutCubic — quick off the mark, settling onto the number.
        write(Math.round((1 - Math.pow(1 - t, 3)) * to));
        if (t < 1) raf = requestAnimationFrame(step);
        else el.textContent = display;
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (e.isIntersecting && e.intersectionRatio >= 0.4) {
          if (!armed) return;
          armed = false;
          run();
        } else if (e.intersectionRatio === 0) {
          // Fully gone. Put the finished value back — a run cancelled halfway
          // would otherwise leave a partial number sitting in the DOM — and
          // allow the next arrival to count again.
          cancelAnimationFrame(raf);
          el.textContent = display;
          armed = true;
        }
      },
      { threshold: [0, 0.4] },
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
