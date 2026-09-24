import Image from "next/image";

type Item = { outlet: string; title: string; url: string; action: string; image?: string };

/**
 * A list of appearances — podcasts, publications, talks — as ruled rows:
 * artwork, outlet, title, action.
 *
 * The artwork does work no amount of copy can: "The Washington Post" set in
 * Poppins is a claim, the masthead is evidence. It is optional, and a row
 * without it keeps its text aligned with the rows that have one.
 *
 * The title is the link; the artwork and the action repeat it for a larger
 * target, and are taken out of the tab order and the accessibility tree so a
 * keyboard or a screen reader meets each appearance once.
 */
export function MediaList({ items }: { items: readonly Item[] }) {
  return (
    <ul className="divide-y divide-line-strong border-y border-line-strong">
      {items.map((item) => (
        <li key={item.url + item.title} className="flex items-start gap-5 py-6 sm:gap-6">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[var(--radius-base)] border border-line bg-white p-2 sm:flex"
          >
            {item.image && (
              <Image src={item.image} alt="" width={160} height={160} className="max-h-full w-auto object-contain" />
            )}
          </a>
          <div className="min-w-0">
            <p className="eyebrow text-action">{item.outlet}</p>
            <h3 className="mt-2 !text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] font-bold leading-snug">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-action hover:underline"
              >
                {item.title}
              </a>
            </h3>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              aria-hidden="true"
              className="mt-2 inline-flex min-h-6 items-center text-[0.9375rem] font-bold text-action hover:text-action-dark"
            >
              {item.action} <span className="ml-1.5">→</span>
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
