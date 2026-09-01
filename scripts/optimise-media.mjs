/*
 * Convert oversized photographs in public/media to WebP.
 *
 * WHY THIS EXISTS. An audit on 2026-09-01 measured /writings-media/ shipping
 * 2.6 MB of images to a phone, and /about/ 940 MB— sorry, 940 KB. The cause was
 * photographs saved as PNG: a 2410x1340 screenshot cost 1,165 KB and the same
 * picture as WebP q80 costs 120 KB. Mobile page speed is a Google ranking
 * input and half of Ads Quality Score's Landing Page Experience, so this is an
 * SEO fix as much as a courtesy to anyone on a train.
 *
 * WHY NOT next/image. The heroes already go through it and are fine. The files
 * this script targets are reached by plain <img> — the logo wall and the video
 * posters — and that is deliberate: those files may legitimately be absent
 * (scripts/download-media.sh populates them), and next/image throws at BUILD
 * time on a missing local file, which would turn a missing logo into a failed
 * deploy. See the note at the top of components/primitives.tsx.
 *
 * So instead the components render <picture> with a .webp <source> and the
 * original as the <img> fallback. If the WebP is missing the browser silently
 * uses the original; if both are missing it renders alt text. Nothing breaks.
 *
 * Run: node scripts/optimise-media.mjs [--check]
 *   --check  exits non-zero if any file is missing its WebP, for CI.
 */

import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DIR = "public/media";
/* Below this a WebP saves little and costs a file, so leave it alone. */
const MIN_BYTES = 120 * 1024;
const CONVERTIBLE = /\.(png|jpe?g)$/i;
const QUALITY = 80;

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error(
    "sharp is not available. It ships with Next for image optimisation, so\n" +
      "`npm install` in this repo should provide it.",
  );
  process.exit(1);
}

const check = process.argv.includes("--check");
const files = (await readdir(DIR)).filter((f) => CONVERTIBLE.test(f));

let converted = 0;
let saved = 0;
let missing = 0;

for (const file of files.sort()) {
  const src = path.join(DIR, file);
  const { size } = await stat(src);
  if (size < MIN_BYTES) continue;

  const out = src.replace(CONVERTIBLE, ".webp");
  if (existsSync(out)) continue;

  if (check) {
    console.error(`missing: ${out}`);
    missing++;
    continue;
  }

  const buf = await sharp(src).webp({ quality: QUALITY }).toBuffer();
  /* A WebP that is not meaningfully smaller is just another file to serve. */
  if (buf.length > size * 0.9) {
    console.log(`skip  ${file} — WebP is not smaller`);
    continue;
  }
  await sharp(src).webp({ quality: QUALITY }).toFile(out);
  converted++;
  saved += size - buf.length;
  const pct = Math.round(100 - (buf.length / size) * 100);
  console.log(
    `${file.padEnd(52).slice(0, 52)} ${String(Math.round(size / 1024)).padStart(6)} KB → ` +
      `${String(Math.round(buf.length / 1024)).padStart(5)} KB  (−${pct}%)`,
  );
}

if (check) {
  if (missing) {
    console.error(`\n${missing} file(s) have no WebP. Run: node scripts/optimise-media.mjs`);
    process.exit(1);
  }
  console.log("every oversized image has a WebP alongside it");
} else {
  console.log(`\n${converted} converted, ${Math.round(saved / 1024)} KB saved`);
}
