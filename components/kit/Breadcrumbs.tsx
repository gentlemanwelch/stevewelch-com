import Link from "next/link";
import { JsonLd } from "@/components/primitives";
import { breadcrumbSchema } from "@/lib/jsonld";

export type Crumb = { name: string; path: string };

/**
 * The breadcrumb trail — the visible one AND its BreadcrumbList markup, from
 * one list, so the two cannot disagree. Before this, every page wrote its
 * schema trail by hand and the pages that also showed a trail wrote it a
 * second time; nothing kept the pair in step.
 *
 * `visible` defaults to showing the trail only when it says something: on a
 * top-level page "Home / Contact" is two words of noise above the headline,
 * while on /speaking/purpose/ the middle crumb is the way back to the hub. The
 * markup is emitted either way — it is what tells a crawler where the page
 * sits.
 */
export function Breadcrumbs({
  trail,
  tone = "light",
  visible = trail.length > 2,
}: {
  trail: readonly Crumb[];
  tone?: "light" | "dark";
  visible?: boolean;
}) {
  const link = tone === "dark" ? "text-white/80 hover:text-white" : "text-ink-faint hover:text-navy";
  const current = tone === "dark" ? "text-white" : "text-navy";
  return (
    <>
      <JsonLd data={breadcrumbSchema([...trail])} />
      {visible && (
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-x-2 text-[0.9375rem]">
            {trail.map((crumb, i) => {
              const last = i === trail.length - 1;
              return (
                <li key={crumb.path} className="flex items-center gap-x-2">
                  {last ? (
                    <span aria-current="page" className={`font-semibold ${current}`}>
                      {crumb.name}
                    </span>
                  ) : (
                    <>
                      {/* min-h-6: a 24px target, WCAG 2.2's floor, without
                          making the trail look like a row of buttons. */}
                      <Link href={crumb.path} className={`inline-flex min-h-6 items-center underline-offset-4 hover:underline ${link}`}>
                        {crumb.name}
                      </Link>
                      <span aria-hidden="true" className={link}>/</span>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
}
