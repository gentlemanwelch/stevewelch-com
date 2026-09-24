import type { ReactNode } from "react";

/**
 * A bulleted list with square marks — the Built for Change replacement for the
 * round coral-era bullets. Square because every other shape on the site is:
 * 4px corners, hairline rules, square play and CTA controls.
 *
 * The mark is aria-hidden; it is a real <ul>, so assistive tech announces the
 * list and its length.
 */
export function SquareList({
  items,
  tone = "light",
  className = "",
}: {
  items: readonly ReactNode[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const mark = tone === "dark" ? "bg-cyan" : "bg-action";
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3.5">
          <span aria-hidden="true" className={`mt-[0.62em] h-2 w-2 shrink-0 ${mark}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
