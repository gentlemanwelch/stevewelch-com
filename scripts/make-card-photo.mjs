/*
 * Make the link-preview card's copy of the homepage photograph.
 *
 * The card (app/opengraph-image.tsx) is the picture a chat or a feed shows
 * when someone pastes a link to the site. It carries the homepage's stage
 * photograph. The homepage's file is a WebP, and next/og, which draws the
 * card, cannot read WebP; so the card has a JPEG copy of its own, in
 * assets/card/, and this script makes it.
 *
 * THE COPY'S NAME IS THE LINK. It is the homepage picture's own file name
 * (`bfc.hero` in content/media-manifest.ts) with .jpg on the end, and the
 * card looks for exactly that. So when the homepage photograph changes, the
 * old copy stops matching, and the card is drawn without a photograph, never
 * with the old one, until this has been run again.
 *
 * A new homepage photograph is therefore: change `bfc.hero`, run this, build,
 * LOOK at the card (the note in app/opengraph-image.tsx says what to look
 * for), and commit the new copy with the rest. Copies of earlier photographs
 * are removed here, so the folder only ever holds the current one.
 *
 * Run: node scripts/make-card-photo.mjs
 */

import { mkdir, readFile, readdir, unlink } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const MANIFEST = "content/media-manifest.ts";
const PUBLIC = "public";
const OUT_DIR = "assets/card";
/* The card is 630 px tall and draws the photograph at its full height. */
const HEIGHT = 630;

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("sharp is not installed. It arrives with next: run `npm ci` first.");
  process.exit(1);
}

/* `bfc.hero`, read as text: the manifest is TypeScript, and this is not. */
const manifest = await readFile(MANIFEST, "utf8");
const folder = manifest.match(/^const base = "([^"]+)";/m)?.[1];
const file = manifest
  .slice(manifest.indexOf("export const bfc"))
  .match(/^\s*hero:\s*`\$\{base\}\/([^`]+)`/m)?.[1];
if (!folder || !file) {
  console.error(`${MANIFEST} is not the shape this script expects: \`const base = "…"\` and, in bfc, \`hero: \`\${base}/…\`\`.`);
  process.exit(1);
}

const source = join(PUBLIC, folder, file);
const name = `${basename(file, extname(file))}.jpg`;

await mkdir(OUT_DIR, { recursive: true });
const made = await sharp(source)
  .resize({ height: HEIGHT })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(join(OUT_DIR, name));

for (const other of await readdir(OUT_DIR)) {
  if (other.endsWith(".jpg") && other !== name) {
    await unlink(join(OUT_DIR, other));
    console.log(`removed  ${join(OUT_DIR, other)}  (an earlier photograph)`);
  }
}

console.log(`from     ${source}`);
console.log(`made     ${join(OUT_DIR, name)}  ${made.width}×${made.height}, ${Math.round(made.size / 1024)} KB`);
