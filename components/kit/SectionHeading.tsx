import type { ReactNode } from "react";
import { Eyebrow } from "@/components/primitives";

/**
 * Eyebrow + heading, the way every Built for Change section opens.
 *
 * `lines`: the packet sets several headings on two lines ("Change isn't new. /
 * The speed is."). They render as ONE heading element with each line a block
 * span, and a plain space between them — invisible on screen, but it means the
 * heading's text reads "Change isn't new. The speed is." to a screen reader
 * and to a crawler, rather than "Change isn't new.The speed is."
 *
 * `accentLast` picks out the final line in the brand's emphasis colour — the
 * packet's "bright brand blue: … emphasis, selected words". Use it sparingly;
 * it is emphasis only because it is rare.
 */
export function SectionHeading({
  eyebrow,
  lines,
  tone = "light",
  accentLast = false,
  as: Tag = "h2",
  className = "",
  children,
}: {
  eyebrow?: string;
  lines: string | readonly string[];
  /** `photo`: on a dark photograph — as `dark`, but the eyebrow goes white. */
  tone?: "light" | "dark" | "photo";
  accentLast?: boolean;
  as?: "h1" | "h2";
  className?: string;
  /** Anything that belongs directly under the heading — a lede, a subhead. */
  children?: ReactNode;
}) {
  const list = typeof lines === "string" ? [lines] : lines;
  const onDark = tone !== "light";
  const accent = onDark ? "text-cyan" : "text-action";
  return (
    <div className={className}>
      {eyebrow && (
        <Eyebrow tone={tone === "photo" ? "onPhoto" : tone === "dark" ? "onDark" : "default"}>{eyebrow}</Eyebrow>
      )}
      <Tag className={`font-extrabold ${onDark ? "text-white" : ""}`}>
        {list.map((line, i) => (
          <span key={line}>
            {i > 0 && " "}
            <span className={`block ${accentLast && i === list.length - 1 && list.length > 1 ? accent : ""}`}>
              {line}
            </span>
          </span>
        ))}
      </Tag>
      {children}
    </div>
  );
}
