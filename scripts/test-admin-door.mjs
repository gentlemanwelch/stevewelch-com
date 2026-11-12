/**
 * End-to-end check of the door on the private CRM at /admin.
 *
 * The claim being tested is one sentence: /admin shows its contents to the
 * owner's Google account and to nobody else. Everything that could make that
 * false — a forged cookie, an expired one, another person's Google account,
 * an unverified address, a return from Google that this browser never
 * started, a half-configured deployment — is tried here against the real,
 * built site, with a stand-in for Google (scripts/mock-fetch.mjs).
 *
 * It needs no key and nobody's Google account.
 *
 *   npm run build && node scripts/test-admin-door.mjs
 *
 * What it cannot cover is Google itself: that the sign-in client is set up,
 * and that its return address is registered. That is checked by the owner
 * signing in on a preview.
 */
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

if (!existsSync(".next/BUILD_ID")) {
  console.error("No build found. Run `npm run build` first.");
  process.exit(1);
}

const dir = mkdtempSync(path.join(tmpdir(), "admin-door-"));
const LOG = path.join(dir, "calls.ndjson");
const CONTROL = path.join(dir, "control.json");

const OWNER = "owner@example.test";
const SECRET = "test-session-secret-0123456789-abcdefghij";
const DOOR_ON = {
  ADMIN_GOOGLE_EMAIL: OWNER,
  ADMIN_SESSION_SECRET: SECRET,
  GOOGLE_OAUTH_CLIENT_ID: "test-client-id",
  GOOGLE_OAUTH_CLIENT_SECRET: "test-client-not-a-secret",
};
const ADMIN_NAMES = Object.keys(DOOR_ON);

let passed = 0;

/** The same sealing the site does (lib/crm/session.ts), so a test can mint or forge a cookie. */
function seal(purpose, data, secret = SECRET) {
  const body = Buffer.from(JSON.stringify(data)).toString("base64url");
  const mac = createHmac("sha256", secret).update(`${purpose}:${body}`).digest("base64url");
  return `${body}.${mac}`;
}
const inAWeek = () => Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
const sessionFor = (email, exp = inAWeek(), secret = SECRET) => seal("session", { email, exp }, secret);

/** The value of one cookie a response set, or undefined. `""` means it was cleared. */
function cookieSet(res, name) {
  for (const line of res.headers.getSetCookie()) {
    if (line.startsWith(`${name}=`)) return line.slice(name.length + 1).split(";")[0];
  }
  return undefined;
}
const cookieLine = (res, name) => res.headers.getSetCookie().find((line) => line.startsWith(`${name}=`)) ?? "";

async function withServer(label, settings, run) {
  const port = 4900 + Math.floor(Math.random() * 600);
  const env = { ...process.env };
  for (const name of [...ADMIN_NAMES, "VERCEL_ENV"]) delete env[name];
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    env: {
      ...env,
      ...settings,
      NODE_OPTIONS: `--import ${pathToFileURL(path.resolve("scripts/mock-fetch.mjs")).href}`,
      MOCK_LOG: LOG,
      MOCK_CONTROL: CONTROL,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (d) => (output += d));
  child.stderr.on("data", (d) => (output += d));

  const origin = `http://127.0.0.1:${port}`;
  const site = {
    origin,
    /** One request, redirects not followed, so each hop can be inspected. */
    get: (pathname, cookie) =>
      fetch(origin + pathname, { redirect: "manual", headers: cookie ? { cookie } : {} }),
    post: (pathname, headers = {}) =>
      fetch(origin + pathname, { method: "POST", redirect: "manual", headers }),
    google: (google) => {
      writeFileSync(CONTROL, JSON.stringify({ google }));
      writeFileSync(LOG, "");
    },
    googleCalls: () =>
      readFileSync(LOG, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line))
        .filter((call) => call.url.startsWith("https://oauth2.googleapis.com/")),
    /** Where a redirect points, as a path on this site. */
    where: (res) => (res.headers.get("location") ?? "").replace(origin, ""),
    /**
     * Presses "Sign in" and comes back from "Google" as whoever `claims`
     * says. Returns the response to the return leg.
     */
    async signIn(claims = {}, tamper = {}) {
      const start = await site.get("/api/admin/auth/start/");
      const toGoogle = new URL(start.headers.get("location"));
      const handshake = cookieSet(start, "swc_admin_signin");
      site.google({ nonce: toGoogle.searchParams.get("nonce"), claims, mode: tamper.mode });
      const back = new URLSearchParams({
        code: "the-code",
        state: tamper.state ?? toGoogle.searchParams.get("state"),
      });
      return site.get(
        `/api/admin/auth/callback/?${back}`,
        tamper.noHandshake ? undefined : `swc_admin_signin=${tamper.handshake ?? handshake}`,
      );
    },
  };

  try {
    for (let i = 0; ; i++) {
      try {
        if ((await fetch(`${origin}/robots.txt`)).ok) break;
      } catch {
        /* not listening yet */
      }
      if (i > 100) throw new Error(`The server did not start.\n${output}`);
      await new Promise((r) => setTimeout(r, 200));
    }
    writeFileSync(CONTROL, "{}");
    writeFileSync(LOG, "");
    console.log(`\n${label}`);
    await run(site);
  } finally {
    child.kill();
  }
}

async function check(name, fn) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

// ---------------------------------------------------------------------------
// The door, set up
// ---------------------------------------------------------------------------
await withServer("Sign-in set up", DOOR_ON, async (site) => {
  await check("signed out, /admin/ shows nothing and sends you to the sign-in page", async () => {
    const res = await site.get("/admin/");
    assert.equal(res.status, 307);
    assert.equal(site.where(res), "/admin/sign-in/");
    const body = await res.text();
    assert.ok(!body.includes("Signed in as"), "the frame leaked into the redirect");
    assert.ok(!/<h1[^>]*>Leads<\/h1>/.test(body), "the page leaked into the redirect");
  });

  await check("the sign-in page offers one button and tells search engines to stay out", async () => {
    const res = await site.get("/admin/sign-in/");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Only Steve’s account can sign in."));
    assert.ok(html.includes('href="/api/admin/auth/start/"'));
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
    assert.ok((res.headers.get("cache-control") ?? "").includes("no-store"));
    assert.ok(!html.includes("not set up"));
  });

  await check("no CRM page carries analytics or the public entity markup; public pages still do", async () => {
    /*
     * Looks for the ELEMENTS, not the words. Every page's data includes the
     * site's 404 page as an unused fallback, and that fallback mentions both;
     * what matters is that no CRM page has a markup <script> or an analytics
     * tag in its document. (Analytics is switched off in this build, so the
     * analytics half is proven separately, in a browser, with it switched on.)
     */
    const markup = /<script[^>]*type="application\/ld\+json"/;
    const analytics = /<(script|link)[^>]*googletagmanager/;
    for (const page of ["/admin/sign-in/", "/admin/denied/"]) {
      const html = await (await site.get(page)).text();
      assert.ok(!markup.test(html), `${page} has entity markup`);
      assert.ok(!analytics.test(html), `${page} has the analytics tag`);
    }
    const inside = await (await site.get("/admin/", `swc_admin=${sessionFor(OWNER)}`)).text();
    assert.ok(!markup.test(inside), "/admin/ has entity markup");
    assert.ok(!analytics.test(inside), "/admin/ has the analytics tag");
    for (const page of ["/", "/contact/", "/lp/ai-change-speaker/", "/no-such-page/"]) {
      const html = await (await site.get(page)).text();
      const scripts = html.match(/<script type="application\/ld\+json">.*?<\/script>/gs) ?? [];
      assert.ok(scripts.some((s) => s.includes('"@type":"Person"')), `${page} lost its Person markup`);
      assert.ok(scripts.some((s) => s.includes('"@type":"WebSite"')), `${page} lost its WebSite markup`);
    }
  });

  await check("robots.txt keeps crawlers away from /admin/", async () => {
    const txt = await (await site.get("/robots.txt")).text();
    assert.ok(txt.includes("Disallow: /admin/"));
    assert.ok(txt.includes("Disallow: /lp/"));
  });

  await check("Sign in sends you to Google asking only for who you are", async () => {
    const res = await site.get("/api/admin/auth/start/");
    assert.equal(res.status, 307);
    const to = new URL(res.headers.get("location"));
    assert.equal(to.origin + to.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
    assert.equal(to.searchParams.get("client_id"), "test-client-id");
    assert.equal(to.searchParams.get("redirect_uri"), `${site.origin}/api/admin/auth/callback/`);
    assert.equal(to.searchParams.get("response_type"), "code");
    assert.equal(to.searchParams.get("scope"), "openid email");
    assert.equal(to.searchParams.get("prompt"), "select_account");
    assert.ok(to.searchParams.get("state").length >= 24);
    assert.ok(to.searchParams.get("nonce").length >= 24);
    assert.ok(!to.search.includes("test-client-not-a-secret"), "the client secret went to the browser");
    const line = cookieLine(res, "swc_admin_signin").toLowerCase();
    assert.ok(line.includes("httponly") && line.includes("samesite=lax") && line.includes("path=/api/admin/auth/"));
    // Two presses never share a handshake.
    const again = new URL((await site.get("/api/admin/auth/start/")).headers.get("location"));
    assert.notEqual(again.searchParams.get("state"), to.searchParams.get("state"));
  });

  await check("behind a proxy, Google is told to return to the address the visitor used", async () => {
    const res = await fetch(`${site.origin}/api/admin/auth/start/`, {
      redirect: "manual",
      headers: { "x-forwarded-host": "www.example.test", "x-forwarded-proto": "https" },
    });
    const to = new URL(res.headers.get("location"));
    assert.equal(to.searchParams.get("redirect_uri"), "https://www.example.test/api/admin/auth/callback/");
  });

  let ownerCookie = "";

  await check("the owner's Google account gets in, and the page behind the door opens", async () => {
    const back = await site.signIn();
    assert.equal(back.status, 307);
    assert.equal(site.where(back), "/admin/");
    ownerCookie = cookieSet(back, "swc_admin");
    assert.ok(ownerCookie, "no session cookie was set");
    const line = cookieLine(back, "swc_admin").toLowerCase();
    assert.ok(line.includes("httponly") && line.includes("samesite=lax") && line.includes("path=/"));
    assert.ok(line.includes("max-age=604800"), "the session should last seven days");
    assert.equal(cookieSet(back, "swc_admin_signin"), "", "the handshake cookie was not cleared");

    const exchange = site.googleCalls();
    assert.equal(exchange.length, 1);
    assert.equal(exchange[0].body.code, "the-code");
    assert.equal(exchange[0].body.grant_type, "authorization_code");
    assert.equal(exchange[0].body.client_id, "test-client-id");
    assert.equal(exchange[0].body.client_secret, "test-client-not-a-secret");
    assert.equal(exchange[0].body.redirect_uri, `${site.origin}/api/admin/auth/callback/`);

    const page = await site.get("/admin/", `swc_admin=${ownerCookie}`);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.ok(html.includes("Signed in as Steve"));
    // The Leads page itself. What it lists is scripts/test-admin-leads.mjs's
    // business; here it only has to be the page, and not the sign-in card.
    assert.match(html, /<h1[^>]*>Leads<\/h1>/);
    assert.ok(!html.includes("Only Steve’s account can sign in."));
    assert.ok(html.includes('action="/api/admin/auth/sign-out/"'));
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    assert.ok((page.headers.get("cache-control") ?? "").includes("no-store"));
  });

  await check("the same address in capitals is still the owner", async () => {
    const back = await site.signIn({ email: "Owner@Example.TEST" });
    assert.equal(site.where(back), "/admin/");
    assert.ok(cookieSet(back, "swc_admin"));
  });

  await check("someone already signed in skips the sign-in page", async () => {
    const res = await site.get("/admin/sign-in/", `swc_admin=${ownerCookie}`);
    assert.equal(res.status, 307);
    assert.equal(site.where(res), "/admin/");
  });

  await check("any other Google account is turned away, with no cookie", async () => {
    const back = await site.signIn({ email: "stranger@example.test" });
    assert.equal(site.where(back), "/admin/denied/");
    assert.equal(cookieSet(back, "swc_admin"), undefined);
    const html = await (await site.get("/admin/denied/")).text();
    assert.ok(html.includes("That account can’t open this."));
    assert.ok(html.includes("Try a different account"));
    assert.ok(!html.includes("stranger@example.test") && !html.includes(OWNER), "the page names an account");
  });

  await check("the owner's address, unverified by Google, is turned away", async () => {
    const back = await site.signIn({ email_verified: false });
    assert.equal(site.where(back), "/admin/denied/");
    assert.equal(cookieSet(back, "swc_admin"), undefined);
  });

  await check("a look-alike address is not the owner", async () => {
    for (const email of ["owner@example.test.evil.example", "xowner@example.test", "owner+x@example.test", ""]) {
      const back = await site.signIn({ email });
      assert.equal(site.where(back), "/admin/denied/", email);
      assert.equal(cookieSet(back, "swc_admin"), undefined, email);
    }
  });

  await check("a return from Google that this browser never started is refused before Google is asked", async () => {
    const wrongState = await site.signIn({}, { state: "not-the-state-that-was-sent" });
    assert.equal(site.where(wrongState), "/admin/sign-in/?problem=1");
    assert.equal(cookieSet(wrongState, "swc_admin"), undefined);
    assert.equal(site.googleCalls().length, 0);

    const noHandshake = await site.signIn({}, { noHandshake: true });
    assert.equal(site.where(noHandshake), "/admin/sign-in/?problem=1");
    assert.equal(site.googleCalls().length, 0);

    const forged = await site.signIn({}, { handshake: seal("signin", { state: "x", nonce: "y", exp: inAWeek() }, "another-secret-entirely-0123456789") });
    assert.equal(site.where(forged), "/admin/sign-in/?problem=1");
    assert.equal(site.googleCalls().length, 0);

    const bare = await site.get("/api/admin/auth/callback/");
    assert.equal(site.where(bare), "/admin/sign-in/?problem=1");
  });

  await check("a session cookie cannot be passed off as a handshake, or the other way round", async () => {
    const asHandshake = await site.signIn({}, { handshake: sessionFor(OWNER) });
    assert.equal(site.where(asHandshake), "/admin/sign-in/?problem=1");
    const handshakeAsSession = seal("signin", { email: OWNER, exp: inAWeek() });
    const res = await site.get("/admin/", `swc_admin=${handshakeAsSession}`);
    assert.equal(site.where(res), "/admin/sign-in/");
  });

  await check("a statement from Google that does not answer this sign-in is refused", async () => {
    for (const claims of [
      { nonce: "a-different-sign-in" },
      { aud: "some-other-client" },
      { iss: "https://accounts.example.com" },
      { exp: Math.floor(Date.now() / 1000) - 60 },
    ]) {
      const back = await site.signIn(claims);
      assert.equal(site.where(back), "/admin/sign-in/?problem=1", JSON.stringify(claims));
      assert.equal(cookieSet(back, "swc_admin"), undefined);
    }
  });

  await check("Google refusing, failing or answering nonsense is a clean 'try again', never a way in", async () => {
    for (const mode of ["refuse", "throw", "garbage"]) {
      const back = await site.signIn({}, { mode });
      assert.equal(site.where(back), "/admin/sign-in/?problem=1", mode);
      assert.equal(cookieSet(back, "swc_admin"), undefined, mode);
    }
    const html = await (await site.get("/admin/sign-in/?problem=1")).text();
    assert.ok(html.includes("That sign-in did not complete."));
    assert.ok(html.includes('href="/api/admin/auth/start/"'));
  });

  await check("a forged, altered, expired or foreign session cookie opens nothing", async () => {
    const [body, mac] = ownerCookie.split(".");
    const strangerBody = Buffer.from(JSON.stringify({ email: "stranger@example.test", exp: inAWeek() })).toString("base64url");
    const bad = {
      "no signature": body,
      "wrong signature": `${body}.${"A".repeat(mac.length)}`,
      "body swapped under a real signature": `${strangerBody}.${mac}`,
      "signed with another secret": sessionFor(OWNER, inAWeek(), "another-secret-entirely-0123456789"),
      expired: sessionFor(OWNER, Math.floor(Date.now() / 1000) - 1),
      "validly signed, for someone else": sessionFor("stranger@example.test"),
      "no expiry": seal("session", { email: OWNER }),
      "three parts": `${ownerCookie}.extra`,
      nonsense: "hello",
      empty: "",
    };
    for (const [what, value] of Object.entries(bad)) {
      const res = await site.get("/admin/", `swc_admin=${value}`);
      assert.equal(res.status, 307, what);
      assert.equal(site.where(res), "/admin/sign-in/", what);
    }
  });

  await check("Sign out forgets the cookie, and only when this site asks", async () => {
    const out = await site.post("/api/admin/auth/sign-out/", { origin: site.origin, cookie: `swc_admin=${ownerCookie}` });
    assert.equal(out.status, 303);
    assert.equal(site.where(out), "/admin/sign-in/");
    assert.equal(cookieSet(out, "swc_admin"), "");
    assert.ok(cookieLine(out, "swc_admin").toLowerCase().includes("max-age=0"));

    const elsewhere = await site.post("/api/admin/auth/sign-out/", { origin: "https://evil.example", cookie: `swc_admin=${ownerCookie}` });
    assert.equal(elsewhere.status, 403);
    assert.equal(cookieSet(elsewhere, "swc_admin"), undefined);

    const noOrigin = await site.post("/api/admin/auth/sign-out/", { cookie: `swc_admin=${ownerCookie}` });
    assert.equal(noOrigin.status, 403);

    const byLink = await site.get("/api/admin/auth/sign-out/", `swc_admin=${ownerCookie}`);
    assert.equal(byLink.status, 405);
  });
});

// ---------------------------------------------------------------------------
// The owner's address changed: yesterday's cookie is no longer the owner's
// ---------------------------------------------------------------------------
await withServer("Owner address changed", { ...DOOR_ON, ADMIN_GOOGLE_EMAIL: "new-owner@example.test" }, async (site) => {
  await check("a session for the old address stops working the moment the setting changes", async () => {
    const old = await site.get("/admin/", `swc_admin=${sessionFor(OWNER)}`);
    assert.equal(site.where(old), "/admin/sign-in/");
    const current = await site.get("/admin/", `swc_admin=${sessionFor("new-owner@example.test")}`);
    assert.equal(current.status, 200);
  });
});

// ---------------------------------------------------------------------------
// Not set up: the door is shut, not open
// ---------------------------------------------------------------------------
for (const [label, settings] of [
  ["Nothing set", {}],
  ["Everything but the owner's address", { ...DOOR_ON, ADMIN_GOOGLE_EMAIL: "" }],
  ["A session secret too short to trust", { ...DOOR_ON, ADMIN_SESSION_SECRET: "short" }],
  ["No Google client", { ...DOOR_ON, GOOGLE_OAUTH_CLIENT_ID: "", GOOGLE_OAUTH_CLIENT_SECRET: "" }],
]) {
  await withServer(`Not set up: ${label.toLowerCase()}`, settings, async (site) => {
    await check("nothing opens, the sign-in page says so, and no cookie is ever made", async () => {
      // Signed with whatever secret this deployment has, if it has one.
      const cookie = `swc_admin=${sessionFor(OWNER, inAWeek(), settings.ADMIN_SESSION_SECRET || SECRET)}`;
      const page = await site.get("/admin/", cookie);
      assert.equal(page.status, 307);
      assert.equal(site.where(page), "/admin/sign-in/");

      const signIn = await site.get("/admin/sign-in/");
      assert.equal(signIn.status, 200);
      const html = await signIn.text();
      assert.ok(html.includes("Sign-in is not set up yet."));
      assert.ok(!html.includes("/api/admin/auth/start/"), "a sign-in button was offered");

      const start = await site.get("/api/admin/auth/start/");
      assert.equal(site.where(start), "/admin/sign-in/");
      assert.equal(cookieSet(start, "swc_admin_signin"), undefined);

      const back = await site.get("/api/admin/auth/callback/?code=x&state=y");
      assert.equal(site.where(back), "/admin/sign-in/");
      assert.equal(cookieSet(back, "swc_admin"), undefined);
    });
  });
}

console.log(`\n${passed} checks passed.`);
