# Cutting stevewelch.com over from IONOS WordPress to Vercel

Written 2026-09-01, from DNS read live that day. The point of this document is
that the website moves and **the email does not notice**.

---

## The one thing to understand before you start

**A records and MX records are independent.** An A record says where the
*website* lives. An MX record says where *email* is delivered. Changing the
first does not touch the second.

Steve's mail is delivered by `mx00.ionos.com` / `mx01.ionos.com`. Nothing in
this cutover goes near those two lines. If at any point a set of instructions —
from IONOS, from Vercel, from anywhere — asks you to remove or replace an MX
record on `stevewelch.com`, stop and re-read, because that is not part of
moving a website.

---

## The state before the change

Read live on 2026-09-01. This is the rollback target: putting these values back
restores the old site exactly.

```
NS    stevewelch.com                        ns1025.ui-dns.biz
                                            ns1029.ui-dns.com
                                            ns1095.ui-dns.org
                                            ns1104.ui-dns.de      (IONOS)

A     stevewelch.com                        74.208.236.131   TTL 3600
A     www.stevewelch.com                    74.208.236.131   TTL 3600
        ^ these two are what change. Note the IP — it is the undo button.

MX    stevewelch.com                        mx00.ionos.com   (10)   ← DO NOT TOUCH
MX    stevewelch.com                        mx01.ionos.com   (10)   ← DO NOT TOUCH

TXT   stevewelch.com                        v=spf1 include:46304657.spf07.hubspotemail.net -all
TXT   _dmarc.stevewelch.com                 v=DMARC1; p=none;
TXT   resend._domainkey.send.stevewelch.com p=MIGfMA0GCSqGSIb3DQEB…   ← the booking form
```

`www` is currently an **A record**, not a CNAME. That matters: you will be
replacing a record type, not just editing a value.

TTL is 3600, so a wrong turn takes up to an hour to unwind. That is the whole
risk budget of this operation.

---

## Order of operations

The order is the safety. Vercel has to be ready to answer for the domain
*before* DNS sends anyone there, or visitors get a certificate error in the gap.

### 1. Optional, the day before — shorten the leash

In IONOS DNS, change the TTL on the two A records from 3600 to 300. Wait an
hour. This makes every later step, including a rollback, take five minutes
instead of an hour. Skip it if you would rather not make two trips.

### 2. Confirm what is about to go live

Vercel → the `stevewelch-com` project → Deployments. The one marked
**Production** is what the world will get. Open its preview URL and click
through it once.

### 3. Add the domains in Vercel — before touching IONOS

Project → Settings → Domains.

- Add `www.stevewelch.com` first. Set it as the **primary** domain.
- Then add `stevewelch.com`, and choose the option to **redirect it to
  `www.stevewelch.com`**.

`www` is primary because `content/site.ts` sets `url: "https://www.stevewelch.com"`,
and every canonical tag, sitemap entry and JSON-LD `@id` is built from it. If
you make the apex primary instead, change that constant in the same breath or
the whole site will advertise a hostname it does not serve.

Vercel will show both as **Invalid Configuration**. That is correct and
expected — DNS has not moved yet.

### 4. Read the records Vercel asks for

Vercel prints the exact records for your project on that same screen. **Use
what it prints, not what any document says**, including this one — the values
differ between projects and Vercel has changed them over time.

For reference, `theeverlasting.ai` currently resolves to `216.198.79.1`, which
is what Vercel handed out for that domain. If the dashboard shows you something
different for this one, the dashboard is right.

Typically it is a CNAME for `www` and an A record for the apex.

### 5. Change exactly two records in IONOS

IONOS → Domains & SSL → stevewelch.com → DNS.

- **`www`** — delete the existing A record (74.208.236.131) and create the
  record Vercel asked for. If it is a CNAME, the host field is `www`.
- **`@` / the apex** — change the A record's value from `74.208.236.131` to the
  IP Vercel gave.

Then stop. Do not touch, in particular:

| Leave alone | Because |
|---|---|
| Both `MX` records | Steve's email |
| `TXT stevewelch.com` (SPF) | sender authorisation |
| `TXT _dmarc` | mail policy |
| Anything under `send.` | the booking form's sending domain |

### 6. Wait, and watch Vercel

Within a few minutes to an hour, Vercel's Domains tab flips to **Valid
Configuration** and issues the TLS certificate on its own. You do not buy,
upload or configure a certificate anywhere.

If it still says Invalid after an hour, the record went in wrong — compare it
character for character against what Vercel printed.

---

## Verification, in the order that matters

**Email first.** It is the thing that must not break, so check it before
admiring the website.

- [ ] Send a mail from your phone to `steve@stevewelch.com`. It arrives.
- [ ] Send one *from* `steve@stevewelch.com` to yourself elsewhere. It arrives.

**Then the site.**

- [ ] `https://www.stevewelch.com/` loads the new site with a valid padlock
- [ ] `https://stevewelch.com/` redirects to the `www` version
- [ ] `http://` (no s) upgrades to https

**Then every page**, which is the whole indexed surface:

```
/                                    /books/
/about/                              /books/restore/
/speaking/                           /books/we-are-all-born-entrepreneurs/
/speaking/purpose/                   /writings-media/
/speaking/people/                    /welch-family-foundation/
/speaking/process/                   /contact/
/speaking/hyper-wellness/            /press-kit/
/privacy-policy/                     /terms-and-conditions/
```

**Then the machine-readable files**, which decide what Google indexes:

- [ ] `/sitemap.xml` lists `www.stevewelch.com` URLs, not `.vercel.app`
- [ ] `/robots.txt` names `www.stevewelch.com` and disallows `/lp/`
- [ ] `/llms.txt` loads

**Then the money path:**

- [ ] Submit the contact form from the real domain. The confirmation appears
      and the mail lands in `steve@stevewelch.com`.

**Then a handful of legacy URLs** — these are configured in `next.config.ts`
and each should land somewhere real rather than 404:

`/press` `/foundation` `/media` `/articles` `/speaker` `/contact-us` `/book`

---

## If it goes wrong

Set both A records back to `74.208.236.131` and delete the `www` CNAME,
recreating the `www` A record at the same IP. The WordPress site is still
running at IONOS and will start answering again as the TTL expires.

That is why the IONOS hosting stays paid for. **Do not cancel it for at least
two weeks after cutover**, and not until Search Console shows the new pages
indexed and the booking form has taken at least one real inquiry.

---

## The week after

1. **Google Search Console** — add `https://www.stevewelch.com` as a property,
   verify by DNS TXT (IONOS, and again: an added TXT record does not disturb
   MX), and submit `/sitemap.xml`.
2. **Watch the Coverage report.** Every 404 that appears is a URL something
   still links to. Each one belongs in the `redirects()` list in
   `next.config.ts` — a redirect keeps whatever ranking that URL earned, a 404
   throws it away. That list is currently a considered guess; Search Console is
   what makes it authoritative.
3. **Google Ads** — the landing pages under `/lp/` are live and `noindex`ed on
   purpose. Point campaigns at `https://www.stevewelch.com/lp/…`.

---

## Two things found while reading the DNS, unrelated to the cutover

Neither blocks anything. Both concern email, so they are recorded here rather
than lost.

**The root SPF record authorises HubSpot and nothing else, with a hard fail:**

```
v=spf1 include:46304657.spf07.hubspotemail.net -all
```

`-all` instructs receivers to reject anything from another source. Mail sent
*from* `steve@stevewelch.com` through IONOS webmail is not covered by that
include, so it fails SPF. This predates the rebuild and is not affected by it —
the booking form sends from `send.stevewelch.com`, which has its own record —
but if outbound mail from that address has ever landed oddly, this is why. The
fix is adding IONOS's include; worth confirming with IONOS what it should be
rather than guessing.

**DMARC is `p=none`** — monitoring only, no enforcement. That is the safe
setting and the right place to start. Tightening it to `quarantine` is a later
conversation, and only after the SPF question above is settled.
