/*
 * Make the two icon files that cannot be drawn by hand from the one that can.
 *
 * app/icon.svg is the tab icon and the only drawing. This script reads it and
 * writes the two files Next's icon conventions also look for in app/:
 *
 *   app/favicon.ico     16, 32 and 48 px. Browsers, feed readers and crawlers
 *                       ask for /favicon.ico whether or not a page links to
 *                       it; until 2026-11 that request was a 404 on every
 *                       first visit.
 *   app/apple-icon.png  180 px, for an iPhone home screen. Square and opaque,
 *                       because iOS cuts the corners itself and paints any
 *                       transparency black; and the letters sit smaller in the
 *                       square than in the tab icon, as home-screen icons do.
 *
 * Both are binary and committed, so a change to the icon is three files in one
 * commit: edit app/icon.svg, run this, commit all three.
 *
 * Run: node scripts/make-icons.mjs
 */

import { readFile, writeFile } from "node:fs/promises";

const SOURCE = "app/icon.svg";
/* The viewBox of app/icon.svg. */
const TILE = 32;
/* How much of the width the letters span: in the tab icon, and on the phone. */
const TAB_SPAN = 0.84;
const TOUCH_SPAN = 0.66;
const TOUCH_SIZE = 180;
const ICO_SIZES = [16, 32, 48];

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("sharp is not installed. It arrives with next: run `npm ci` first.");
  process.exit(1);
}

const source = await readFile(SOURCE, "utf8");
const background = source.match(/<rect[^>]*\bfill="(#[0-9a-f]{6})"/i)?.[1];
const letters = source.match(/<path[^>]*\bfill="(#[0-9a-f]{6})"[^>]*\bd="([^"]+)"/i);
if (!background || !letters) {
  console.error(`${SOURCE} is not the shape this script expects: one <rect fill> and one <path fill d>.`);
  process.exit(1);
}
const [, ink, outline] = letters;

/* Give the drawing a pixel size, so it is rasterised AT that size and not scaled up from 32. */
const tabIcon = (px) =>
  sharp(Buffer.from(source.replace("<svg ", `<svg width="${px}" height="${px}" `)))
    .png()
    .toBuffer();

/* The same letters, shrunk about the centre of the tile, on a full square. */
const scale = (TOUCH_SIZE / TILE) * (TOUCH_SPAN / TAB_SPAN);
const half = TOUCH_SIZE / 2;
const touchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${TOUCH_SIZE}" height="${TOUCH_SIZE}">
  <rect width="${TOUCH_SIZE}" height="${TOUCH_SIZE}" fill="${background}"/>
  <path fill="${ink}" transform="translate(${half} ${half}) scale(${scale}) translate(${-TILE / 2} ${-TILE / 2})" d="${outline}"/>
</svg>`;

/*
 * An .ico is a small directory followed by the images it lists. Every browser
 * that still reads one accepts PNG images inside it, so nothing here has to
 * write Windows bitmaps.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = header.length + 16 * images.length;
  const directory = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // width
    entry.writeUInt8(size, 1); // height
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...directory, ...images.map((image) => image.data)]);
}

const images = [];
for (const size of ICO_SIZES) images.push({ size, data: await tabIcon(size) });
await writeFile("app/favicon.ico", ico(images));

await sharp(Buffer.from(touchIcon)).flatten({ background }).png().toFile("app/apple-icon.png");

console.log(`app/favicon.ico      ${ICO_SIZES.join(", ")} px`);
console.log(`app/apple-icon.png   ${TOUCH_SIZE} px`);
