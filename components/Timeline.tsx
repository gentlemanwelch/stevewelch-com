import Image from "next/image";
import { Container } from "@/components/primitives";
import { timeline } from "@/content/bio";
import { img } from "@/content/media-manifest";

/**
 * The About page's timeline — eleven moments, alternating either side of a
 * centre line with a diamond on it at each step.
 *
 * The whole section was missing from the first build. It is the account of how
 * Steve got from scalping tickets at Penn State to running Restore, in his own
 * first person, and for an organiser deciding whether to book him it is the
 * most persuasive thing on the page.
 *
 * The line is drawn once behind the rows rather than per row, so it is
 * continuous rather than eleven segments that never quite meet. It and the
 * diamonds are decoration and are hidden from assistive technology; the
 * reading order — photograph, then its text, eleven times — is the same whether
 * the columns alternate or not, because the alternation is column placement,
 * not source order.
 *
 * Below md it collapses to one column: image above text, no line. A centre rail
 * on a 390px screen leaves each side about 170px, which fits neither.
 */
export function Timeline() {
  return (
    <section className="bg-white">
      <Container className="py-16 sm:py-20">
        <h2 className="sr-only">Steve Welch&rsquo;s story, in order</h2>

        <div className="relative">
          {/* The rail. Inset top and bottom so it starts and ends on the first
              and last diamonds rather than floating past them. */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[7rem] bottom-[7rem] hidden w-px -translate-x-1/2 bg-[var(--color-line)] md:block"
          />

          <ol className="space-y-14 md:space-y-24">
            {timeline.map((entry, i) => {
              const imageLeft = i % 2 === 0;
              return (
                <li key={entry.text.slice(0, 40)} className="relative">
                  {/* The diamond, centred on the rail. */}
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 hidden h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[var(--color-line)] bg-white md:block"
                  />

                  <div className="md:grid md:grid-cols-2 md:items-center md:gap-16">
                    <div
                      className={
                        imageLeft ? "md:col-start-1 md:row-start-1" : "md:col-start-2 md:row-start-1"
                      }
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
                        <Image
                          src={img[entry.image as keyof typeof img]}
                          alt={entry.alt}
                          fill
                          sizes="(min-width: 768px) 42vw, 92vw"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <p
                      className={`mt-5 leading-relaxed text-[var(--color-ink-soft)] md:mt-0 md:row-start-1 ${
                        imageLeft
                          ? "md:col-start-2 md:text-left"
                          : "md:col-start-1 md:text-right"
                      }`}
                    >
                      {entry.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
