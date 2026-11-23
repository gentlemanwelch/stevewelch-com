import { deflateSync, inflateSync } from "node:zlib";

/**
 * Pack a PNG smaller without changing a pixel.
 *
 * WHY THIS EXISTS. The link-preview card (app/opengraph-image.tsx) is drawn by
 * next/og, which writes its PNG the quick way: four bytes a pixel, transparency
 * included, and every row stored as it stands. For flat colour and type that
 * costs nothing. For a photograph it roughly doubles the file: the card with
 * the stage photograph came out at 755 KB, and WhatsApp shows no picture at
 * all for a link whose image is over 600 KB (Meta's link-preview guide: "This
 * image should be under 600KB in size"). Packed here, the same pixels are
 * 500 KB.
 *
 * WHAT IT DOES. Two things a PNG allows and next/og does not do:
 *   - drops the transparency channel, which on a fully opaque picture is
 *     630 rows of "255";
 *   - stores each row as its DIFFERENCE from the pixels beside and above it
 *     (PNG's five row filters; the one that leaves the smallest numbers wins,
 *     row by row), which is what makes a photograph's smooth areas compress.
 *
 * IT NEVER GUESSES. Anything that is not exactly what next/og writes today
 * (8 bits a channel, with transparency, not interlaced, every row unfiltered,
 * every pixel opaque) comes back untouched. A different PNG is a bigger file,
 * not a broken one.
 *
 * Node's own zlib, so no dependency. It runs once, at build time.
 */
export function repackPng(png: Buffer): Buffer {
  let header: Buffer | undefined;
  const data: Buffer[] = [];
  for (let at = 8; at + 12 <= png.length; ) {
    const length = png.readUInt32BE(at);
    const type = png.toString("latin1", at + 4, at + 8);
    const body = png.subarray(at + 8, at + 8 + length);
    if (type === "IHDR") header = body;
    if (type === "IDAT") data.push(body);
    at += 12 + length;
  }

  /* Bytes 8, 9 and 12 of the header: bit depth, colour type (6 is RGBA), interlacing. */
  if (!header || header.length !== 13 || header[8] !== 8 || header[9] !== 6 || header[12] !== 0) return png;

  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  const pixels = inflateSync(Buffer.concat(data));
  const rowIn = 1 + width * 4; // a filter byte, then RGBA
  const row = width * 3; // RGB
  if (pixels.length !== rowIn * height) return png;

  const packed = Buffer.alloc((1 + row) * height);
  let above = Buffer.alloc(row);
  let here = Buffer.alloc(row);
  const attempts = [0, 1, 2, 3, 4].map(() => Buffer.alloc(row));

  for (let y = 0; y < height; y++) {
    if (pixels[y * rowIn] !== 0) return png;
    for (let x = 0; x < width; x++) {
      const from = y * rowIn + 1 + x * 4;
      if (pixels[from + 3] !== 255) return png;
      here[x * 3] = pixels[from];
      here[x * 3 + 1] = pixels[from + 1];
      here[x * 3 + 2] = pixels[from + 2];
    }

    /* The five filters, in PNG's own numbering: none, left, up, average, Paeth. */
    const cost = [0, 0, 0, 0, 0];
    for (let i = 0; i < row; i++) {
      const value = here[i];
      const left = i >= 3 ? here[i - 3] : 0;
      const up = above[i];
      const upLeft = i >= 3 ? above[i - 3] : 0;
      const guess = left + up - upLeft;
      const dLeft = Math.abs(guess - left);
      const dUp = Math.abs(guess - up);
      const dUpLeft = Math.abs(guess - upLeft);
      const paeth = dLeft <= dUp && dLeft <= dUpLeft ? left : dUp <= dUpLeft ? up : upLeft;
      const filtered = [value, value - left, value - up, value - ((left + up) >> 1), value - paeth];
      for (let f = 0; f < 5; f++) {
        const byte = filtered[f] & 0xff;
        attempts[f][i] = byte;
        cost[f] += byte < 128 ? byte : 256 - byte;
      }
    }

    const best = cost.indexOf(Math.min(...cost));
    packed[y * (1 + row)] = best;
    attempts[best].copy(packed, y * (1 + row) + 1);
    [above, here] = [here, above];
  }

  const rgb = Buffer.from(header);
  rgb[9] = 2; // colour type 2: RGB, no transparency
  return Buffer.concat([
    png.subarray(0, 8),
    chunk("IHDR", rgb),
    chunk("IDAT", deflateSync(packed, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* A PNG chunk: its length, its four-letter type, its bytes, and a checksum of the last two. */
function chunk(type: string, body: Buffer): Buffer {
  const out = Buffer.alloc(12 + body.length);
  out.writeUInt32BE(body.length, 0);
  out.write(type, 4, "latin1");
  body.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + body.length)), 8 + body.length);
  return out;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes: Buffer): number {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
