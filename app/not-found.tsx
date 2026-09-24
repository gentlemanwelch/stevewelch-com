import { site } from "@/content/site";
import { talks } from "@/content/speaking";
import { notFoundPage } from "@/content/not-found";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Container, Section, Button } from "@/components/primitives";
import { PageHero } from "@/components/kit/PageHero";
import { LinkCard, LinkGrid } from "@/components/kit/LinkCard";

/**
 * A 404 that keeps a visitor on the site.
 *
 * WHY IT RENDERS ITS OWN HEADER AND FOOTER. The root not-found boundary sits
 * OUTSIDE app/(site)/layout.tsx — it wraps the root layout's children, not the
 * route group's — so a 404 used to arrive with no navigation at all: a dead
 * end on exactly the visit that most needs a way out. Rendering the chrome
 * here is the fix, and it cannot double up, because no segment inside (site)
 * has a not-found boundary of its own.
 *
 * THE TOPIC LINKS come from `talks`, the one list the /speaking/[pillar] route
 * builds its pages from. They used to come from content/talks.ts, a file left
 * over from the first rebuild whose slugs match no route — so every topic link
 * on the page meant to rescue a broken link was itself a broken link.
 *
 * Anything that shows up in Search Console's coverage report repeatedly should
 * get a redirect in next.config.ts instead; a redirect keeps its ranking.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <PageHero tone="light" eyebrow={notFoundPage.eyebrow} title={notFoundPage.heading} lede={notFoundPage.body}>
          <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
            <Button href={site.cta.href} glyph="arrow" track="build_your_keynote_click" trackLocation="404">
              {site.cta.label}
            </Button>
            <Button href="/" variant="outline">
              {notFoundPage.home}
            </Button>
          </div>
        </PageHero>

        <Section>
          <Container>
            <h2 className="!text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] font-extrabold">{notFoundPage.topicsHeading}</h2>
            <div className="mt-10">
              <LinkGrid columns={3}>
                {talks.map((talk) => (
                  <li key={talk.slug}>
                    <LinkCard
                      href={`/speaking/${talk.slug}/`}
                      title={talk.name}
                      body={talk.statement}
                      action={notFoundPage.topicAction}
                    />
                  </li>
                ))}
              </LinkGrid>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
