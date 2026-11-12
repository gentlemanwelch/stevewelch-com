/*
 * What the CRM's end-to-end checks share: a signed-in owner, the real built
 * site running against stand-ins (scripts/mock-fetch.mjs), and a way to set
 * what the stand-in database holds between cases.
 *
 * Used by scripts/test-admin-leads.mjs and scripts/test-admin-outcome.mjs.
 * Every person in those checks is made up.
 */
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

if (!existsSync(".next/BUILD_ID")) {
  console.error("No build found. Run `npm run build` first.");
  process.exit(1);
}

const dir = mkdtempSync(path.join(tmpdir(), "admin-check-"));
const LOG = path.join(dir, "calls.ndjson");
const CONTROL = path.join(dir, "control.json");

export const OWNER = "owner@example.test";
const SECRET = "test-session-secret-0123456789-abcdefghij";
export const SETTINGS = {
  ADMIN_GOOGLE_EMAIL: OWNER,
  ADMIN_SESSION_SECRET: SECRET,
  GOOGLE_OAUTH_CLIENT_ID: "test-client-id",
  GOOGLE_OAUTH_CLIENT_SECRET: "test-client-not-a-secret",
  SUPABASE_URL: "http://crm.mock",
  SUPABASE_SECRET_KEY: "test-secret-not-a-key",
  RESEND_API_KEY: "re_test_key",
  INQUIRY_FROM_EMAIL: "website@send.example.test",
  INQUIRY_TO_EMAIL: OWNER,
  VERCEL_ENV: "production",
};

/** The cookie of a signed-in session, for the owner unless told otherwise. */
export function session(email = OWNER) {
  const body = Buffer.from(
    JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString("base64url");
  return `swc_admin=${body}.${createHmac("sha256", SECRET).update(`session:${body}`).digest("base64url")}`;
}

let passed = 0;
export async function check(name, fn) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}
export const passedCount = () => passed;

export async function withServer(label, settings, run) {
  const port = 5500 + Math.floor(Math.random() * 400);
  const env = { ...process.env };
  for (const name of Object.keys(SETTINGS)) delete env[name];
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
    /** Sets what the database holds and how it behaves, and clears the log. */
    database: (state) => {
      writeFileSync(CONTROL, JSON.stringify({ case: String(Math.random()), ...state }));
      writeFileSync(LOG, "");
    },
    calls: () =>
      readFileSync(LOG, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line)),
    reads: () => site.calls().filter((c) => c.url.includes("/rest/v1/leads?")),
    /** The calls made to one database function. */
    writes: (fn) => site.calls().filter((c) => c.url.endsWith(`/rpc/${fn}`)),
    emails: () => site.calls().filter((c) => c.url.startsWith("https://api.resend.com/")),
    get: (pathname, cookie) => fetch(origin + pathname, { redirect: "manual", headers: cookie ? { cookie } : {} }),
    /** A POST. `fields`, when given, are sent the way a form sends them. */
    post: (pathname, headers = {}, fields) =>
      fetch(origin + pathname, {
        method: "POST",
        redirect: "manual",
        headers: fields ? { ...headers, "content-type": "application/x-www-form-urlencoded" } : headers,
        body: fields ? new URLSearchParams(fields).toString() : undefined,
      }),
    /** A form sent by the signed-in owner from this site's own page. */
    submit: (pathname, fields) => site.post(pathname, { origin, cookie: session() }, fields),
    where: (res) => (res.headers.get("location") ?? "").replace(origin, ""),
    /** A page as the signed-in owner sees it. */
    async page(pathname) {
      const res = await site.get(pathname, session());
      return { status: res.status, html: await res.text(), res };
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
    console.log(`\n${label}`);
    await run(site);
  } finally {
    child.kill();
  }
}

/** The visible words of a page, with tags and the page's own data stripped. */
export const words = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ");
