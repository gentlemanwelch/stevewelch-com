import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A card that is a link: a heavy top rule, a title, a line, an action. No
 * shadow and no box — the spec asks for "structure, rules and whitespace" over
 * "generic SaaS card grids", and the homepage's customization row is ruled the
 * same way.
 *
 * The whole card is the link, so the target is the full card rather than a
 * small "Read →" at the bottom of it.
 */
export function LinkCard({
  href,
  eyebrow,
  title,
  body,
  action = "Read",
  tone = "light",
}: {
  href: string;
  eyebrow?: string;
  title: string;
  body?: ReactNode;
  action?: string;
  tone?: "light" | "dark";
}) {
  const external = href.startsWith("http");
  const dark = tone === "dark";
  const className = `group flex h-full flex-col border-t-2 pt-5 ${dark ? "border-white/60 text-white/80" : "border-navy"}`;
  const inner = (
    <>
      {eyebrow && <p className={`eyebrow ${dark ? "text-cyan" : "text-action"}`}>{eyebrow}</p>}
      <h3
        className={`mt-2 !text-[clamp(1.25rem,1rem+0.8vw,1.5rem)] font-bold leading-snug transition-colors ${
          dark ? "text-white group-hover:text-cyan" : "group-hover:text-action"
        }`}
      >
        {title}
      </h3>
      {body && <div className="mt-2 text-[0.9375rem] leading-relaxed">{body}</div>}
      <span className={`mt-auto pt-4 text-[0.9375rem] font-bold ${dark ? "text-cyan" : "text-action"}`}>
        {action} <span aria-hidden="true">→</span>
      </span>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

/**
 * A grid of LinkCards. Column classes are written out in full because Tailwind
 * finds class names by scanning source text and cannot see an interpolated one.
 */
export function LinkGrid({ columns = 3, children }: { columns?: 2 | 3 | 4; children: ReactNode }) {
  const cols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];
  return <ul className={`grid gap-x-8 gap-y-12 ${cols}`}>{children}</ul>;
}
