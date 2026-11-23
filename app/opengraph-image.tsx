import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { hero } from "@/content/home";
import { bfc } from "@/content/media-manifest";
import { repackPng } from "@/lib/png";

/**
 * THE LINK-PREVIEW CARD — the picture a chat, an email or a feed draws when
 * someone pastes a link to this site. Every page's `og:image` points here
 * (lib/seo.ts), so it is what an organizer's whole committee sees before any
 * of them has clicked: often the first impression the site makes.
 *
 * It is the homepage hero in miniature: STEVE WELCH, "BUILT FOR CHANGE.",
 * the platform line, and the stage photograph beside them. Steve chose it
 * from three (2026-11-23), over a light and a navy card with no photograph.
 * It replaced a card from before the Built for Change redesign: cream and
 * rust, in a default typeface, reading "Entrepreneurship, leadership, and
 * human performance".
 *
 * Drawn at build time, from the same words the homepage uses, so it cannot
 * drift from them. NOTHING HERE IS COPY: every word comes from content/.
 *
 * THE TYPEFACE. next/og cannot read WOFF2, which is the only form next/font
 * keeps Poppins in. So assets/card/ holds two TTF files, about 16 KB each:
 * the site's own latin Poppins 800 and 600, as next/font downloads them,
 * converted and otherwise untouched (fontTools: open the .woff2 from
 * .next/static/media, set `flavor = None`, save). No dependency, and no
 * request to anyone at build time. They cover the same characters the site's
 * own text can show. Poppins is under the Open Font License; OFL.txt sits
 * beside them, as that licence asks.
 *
 * THE PHOTOGRAPH. next/og cannot read WebP either, so the card has a JPEG
 * copy of the homepage photograph, made by scripts/make-card-photo.mjs and
 * named after the picture it came from. The card looks for the copy of
 * WHATEVER `bfc.hero` IS NOW. After a change of homepage photograph there is
 * no such copy until that script is run again, and until then the card is
 * drawn without a photograph: plainer, never out of date, and never broken.
 *
 * WHERE THE PHOTOGRAPH SITS, measured on the 2026-11-15 picture (1536×1024;
 * see the hero's note in app/(site)/page.tsx, which the same picture obeys).
 * Drawn 630 tall it is 945 wide, in a box from x=520 to the right edge, moved
 * 108 left: a point at picture x lands at card x = 412 + 0.615 × x. That puts
 * Steve's clicker hand (x=284) at 587, inside the fade's faint half, and the
 * end of the slide's headline (x=1224) at 1165, 35 short of the edge. The
 * headline on the slide must show whole or not at all. AFTER A NEW
 * PHOTOGRAPH, OR A CHANGE TO THE HERO'S WORDS, BUILD AND LOOK AT THE CARD:
 * open .next/server/app/opengraph-image.body as a PNG.
 *
 * TYPE NEVER SITS ON THE PHOTOGRAPH. The copy ends near x=522; the box's
 * first 33px are the card's own pale colour, solid, and the fade runs out
 * across the curtains before it reaches Steve. That is the homepage's rule
 * and the homepage's fade.
 *
 * 600 KB. WhatsApp shows no picture for a link whose image is heavier (see
 * lib/png.ts, which packs this one from 755 KB down to 500). If a future
 * photograph still comes out over, the card is drawn without it rather than
 * shipped where part of the audience gets a blank.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEAVIEST = 600_000;

/* The tokens at the top of app/globals.css, which a picture cannot read. */
const NAVY = "#06153d"; // --color-navy
const BLUE = "#0066fc"; // --color-blue: display type. "CHANGE."
const TINT = "#eef5fd"; // --color-tint
const TINT_WARM = "#f5f9fe"; // --color-tint-warm: the homepage hero's own background

const asset = (file: string) => join(process.cwd(), "assets", "card", file);

/* Read once, when the build loads this file. Without the fonts there is no
   card worth drawing, so a missing one stops the build; a missing photograph
   does not. */
const [extraBold, semiBold] = await Promise.all([
  readFile(asset("poppins-latin-800.ttf")),
  readFile(asset("poppins-latin-600.ttf")),
]);
const fonts = [
  { name: "Poppins", data: extraBold, weight: 800 as const, style: "normal" as const },
  { name: "Poppins", data: semiBold, weight: 600 as const, style: "normal" as const },
];

const photoFile = `${basename(bfc.hero, extname(bfc.hero))}.jpg`;
const photo = await readFile(asset(photoFile)).then(
  (bytes) => `data:image/jpeg;base64,${bytes.toString("base64")}`,
  () => null,
);

/* stevewelch.com, from the one place the address is written down. */
const domain = new URL(site.url).hostname.replace(/^www\./, "");

/*
 * The two settings. Beside the photograph the copy has the left 560px; with
 * no photograph it has the card to itself and is set larger to fill it.
 */
const BESIDE_PHOTO = { name: 34, headline: 98, subhead: 31, subheadWidth: 420, padding: "58px 0 50px 64px", width: 560 };
const ALONE = { name: 40, headline: 152, subhead: 38, subheadWidth: 1056, padding: "58px 72px 50px", width: 1200 };

/*
 * The copy: the wordmark, the H1 on its two lines with the second in blue,
 * the platform line, the address. Tracking and leading are the site's own,
 * as fractions of the type size, because next/og takes pixels: 0.18em for the
 * wordmark (components/Wordmark.tsx), -0.035em and 0.95 for the headline
 * (.display-xl in app/globals.css).
 *
 * Every box says `display: flex`: next/og refuses a box with more than one
 * child that does not.
 */
function copy(set: typeof ALONE) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: set.width,
        height: size.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: set.padding,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: set.name,
          fontWeight: 800,
          letterSpacing: set.name * 0.18,
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        {site.name}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: set.headline,
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: set.headline * -0.035,
          }}
        >
          <div style={{ display: "flex" }}>{hero.headingLines[0]}</div>
          <div style={{ display: "flex", color: BLUE }}>{hero.headingLines[1]}</div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            width: set.subheadWidth,
            fontSize: set.subhead,
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: set.subhead * -0.01,
          }}
        >
          {hero.subhead}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 24, fontWeight: 600 }}>{domain}</div>
    </div>
  );
}

const frame = {
  width: size.width,
  height: size.height,
  display: "flex",
  position: "relative",
  fontFamily: "Poppins",
  color: NAVY,
} as const;

function cardWithPhotograph(src: string) {
  return (
    <div style={{ ...frame, backgroundColor: TINT_WARM }}>
      <div
        style={{
          position: "absolute",
          left: 520,
          top: 0,
          width: size.width - 520,
          height: size.height,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Height only: next/og reads the picture's own shape for the width.
            The words are in the card already, so the picture says nothing to
            a screen reader that the card's `alt` does not. */}
        <img src={src} alt="" height={size.height} style={{ position: "absolute", left: -108, top: 0 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 150,
            height: size.height,
            display: "flex",
            backgroundImage: `linear-gradient(90deg, ${TINT_WARM} 0%, ${TINT_WARM} 22%, rgba(245, 249, 254, 0) 100%)`,
          }}
        />
      </div>
      {copy(BESIDE_PHOTO)}
    </div>
  );
}

/* White fading to the pale blue, as the homepage hero does. */
function cardWithoutPhotograph() {
  return (
    <div style={{ ...frame, backgroundImage: `linear-gradient(115deg, #ffffff 0%, #ffffff 35%, ${TINT} 100%)` }}>
      {copy(ALONE)}
    </div>
  );
}

async function draw(card: React.ReactElement): Promise<Buffer> {
  const drawn = new ImageResponse(card, { ...size, fonts });
  return repackPng(Buffer.from(await drawn.arrayBuffer()));
}

/* What ImageResponse would have sent, had its bytes not been repacked. */
function send(png: Buffer): Response {
  return new Response(new Uint8Array(png), {
    headers: { "content-type": contentType, "cache-control": "public, max-age=0, must-revalidate" },
  });
}

export default async function OpengraphImage() {
  if (photo) {
    const png = await draw(cardWithPhotograph(photo));
    if (png.length <= HEAVIEST) return send(png);
    console.warn(
      `Link-preview card: with the photograph it is ${Math.round(png.length / 1000)} KB, over the ${HEAVIEST / 1000} KB WhatsApp accepts. Drawn without the photograph. See app/opengraph-image.tsx.`,
    );
  } else {
    console.warn(
      `Link-preview card: no copy of the homepage photograph at assets/card/${photoFile}. Drawn without the photograph. Run: node scripts/make-card-photo.mjs`,
    );
  }
  return send(await draw(cardWithoutPhotograph()));
}
