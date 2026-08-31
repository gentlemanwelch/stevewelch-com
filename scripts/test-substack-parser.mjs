/**
 * Parser check for lib/substack.ts.
 *
 * Substack is unreachable from the environment this was written in, so the
 * fixture below is a real-shaped Substack RSS document rather than a live
 * fetch: CDATA titles, an item with no enclosure, an entity-heavy excerpt, a
 * malformed pubDate, and an item missing its link. Those are the shapes that
 * break naive parsers, and the network call is the only part these cannot
 * cover.
 *
 *   node scripts/test-substack-parser.mjs
 */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

// Load the parser out of the TS source. Everything above getSubstackPosts is
// plain JS once the annotations go; the fetch below it is what the network
// would cover and is deliberately left out.
const whole = readFileSync("lib/substack.ts", "utf8");
const src = whole
  .slice(0, whole.indexOf("export async function getSubstackPosts"))
  .replace(/^import[\s\S]*?;\n/m, "const site = { social: { substack: \"https://x.substack.com\" } };\n")
  .replace(/^export type SubstackPost = \{[\s\S]*?^\};$/m, "")
  .replace(/: SubstackPost\[\]|: SubstackPost|: string|: number/g, "")
  .replace(/^export /gm, "");
const parseFeed = new Function(`${src}\nreturn parseFeed;`)();

const FIXTURE = `<?xml version="1.0"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title><![CDATA[Steve Welch]]></title>
  <item>
    <title><![CDATA[Purpose &amp; the messy middle]]></title>
    <link>https://stevewelch3.substack.com/p/purpose-and-the-messy-middle</link>
    <pubDate>Tue, 12 Aug 2026 11:30:00 GMT</pubDate>
    <enclosure url="https://substackcdn.com/image/fetch/w_1456/cover-one.jpg" length="0" type="image/jpeg"/>
    <description><![CDATA[<p>Every company I&#8217;ve built hit a stretch where the plan stopped working&#8212;and the only thing that carried us through was knowing why we were doing it at all. Here is what that looked like in practice, and the part nobody writes down.</p>]]></description>
    <content:encoded><![CDATA[<p>Full body…</p>]]></content:encoded>
  </item>
  <item>
    <title>No cover image on this one</title>
    <link>https://stevewelch3.substack.com/p/no-cover</link>
    <pubDate>Wed, 02 Jul 2026 09:00:00 GMT</pubDate>
    <description><![CDATA[<p>Short one.</p>]]></description>
  </item>
  <item>
    <title><![CDATA[Bad date, still a post]]></title>
    <link>https://stevewelch3.substack.com/p/bad-date</link>
    <pubDate>not a date at all</pubDate>
    <description>Plain, unwrapped description.</description>
  </item>
  <item>
    <title>Missing its link, must be skipped</title>
    <pubDate>Mon, 01 Jun 2026 09:00:00 GMT</pubDate>
    <description>x</description>
  </item>
  <item>
    <title>Fifth</title><link>https://stevewelch3.substack.com/p/fifth</link>
    <pubDate>Sun, 01 Mar 2026 09:00:00 GMT</pubDate><description>y</description>
  </item>
</channel></rss>`;

const posts = parseFeed(FIXTURE, 3);

assert.equal(posts.length, 3, "limit respected");
assert.equal(posts[0].title, "Purpose & the messy middle", "entities decoded in the title");
assert.equal(posts[0].url, "https://stevewelch3.substack.com/p/purpose-and-the-messy-middle");
assert.equal(posts[0].date, "August 12, 2026", "pubDate formatted");
assert.equal(posts[0].isoDate, "2026-08-12T11:30:00.000Z");
assert.equal(posts[0].image, "https://substackcdn.com/image/fetch/w_1456/cover-one.jpg");
assert.ok(!posts[0].excerpt.includes("<p>"), "excerpt has no markup");
assert.ok(posts[0].excerpt.includes("’") && posts[0].excerpt.includes("—"), "entities decoded in the excerpt");
assert.ok(posts[0].excerpt.endsWith("…"), "long excerpt is clamped");
assert.ok(posts[0].excerpt.length <= 191, `excerpt clamped, got ${posts[0].excerpt.length}`);

assert.equal(posts[1].image, undefined, "missing enclosure is undefined, not a broken src");
assert.equal(posts[1].excerpt, "Short one.");

assert.equal(posts[2].date, "", "malformed pubDate yields no date rather than 'Invalid Date'");
assert.equal(posts[2].isoDate, "");
assert.equal(posts[2].excerpt, "Plain, unwrapped description.", "non-CDATA description read");

assert.ok(!posts.some((p) => p.title.startsWith("Missing its link")), "item without a link skipped");
assert.deepEqual(parseFeed("", 3), [], "empty input yields no posts");
assert.deepEqual(parseFeed("<rss><channel></channel></rss>", 3), [], "feed with no items yields no posts");

console.log(`ok — ${posts.length} posts parsed, all assertions passed`);
for (const p of posts) console.log(`   ${p.date || "(no date)"} · ${p.title}`);
