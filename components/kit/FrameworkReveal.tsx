"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Plays the framework's reveal: Purpose → People → Process, then × AI last.
 *
 * THIS ONLY EVER ADDS MOTION. It never decides whether content exists. The
 * children arrive already server-rendered and fully visible; this component
 * "arms" the reveal (hiding the steps, via CSS keyed on data-reveal="armed")
 * only after JavaScript has run — so a crawler, a browser without JS, and a
 * failed hydration all see the whole framework. See the note in globals.css.
 *
 * It declines to arm at all when:
 *   - the reader has asked for reduced motion (the spec: "honor
 *     prefers-reduced-motion"), or
 *   - ANY part of the figure is on screen at the moment of the first
 *     intersection report. Hiding content someone can already see makes it
 *     blink out and back, which is worse than no animation.
 *
 * WHY THE FIRST INTERSECTION REPORT, AND NOT A POSITION CHECK AT MOUNT. The
 * first version measured getBoundingClientRect() when the effect ran. On a
 * reload halfway down the page that runs BEFORE the browser restores the
 * scroll position, so the figure always looked off-screen, got hidden, and
 * then faded back in — tested, and it blinked. The observer's first callback
 * arrives after layout, by which point restoration has happened, so it
 * reports where the reader actually is.
 *
 * No animation library: the three-dependency rule holds, and an
 * IntersectionObserver plus four timeouts is the whole job.
 */
const ORDER: { key: string; delay: number }[] = [
  { key: "purpose", delay: 0 },
  { key: "people", delay: 260 },
  { key: "process", delay: 520 },
  // A beat longer before AI: it is not the fourth block in a row, it is what
  // acts on the finished three.
  { key: "ai", delay: 1000 },
];

export function FrameworkReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const timers: number[] = [];
    let first = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          // Visible at all on the first report: leave it alone, permanently.
          if (entry.isIntersecting) {
            io.disconnect();
            return;
          }
          // Wholly off-screen: safe to hide, because nobody can see it go.
          el.dataset.reveal = "armed";
          return;
        }
        if (entry.intersectionRatio < 0.3) return;
        io.disconnect();
        for (const { key, delay } of ORDER) {
          timers.push(
            window.setTimeout(() => {
              el.querySelectorAll<HTMLElement>(`[data-step="${key}"]`).forEach((s) => {
                s.dataset.shown = "";
              });
            }, delay),
          );
        }
      },
      { threshold: [0, 0.3] },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
