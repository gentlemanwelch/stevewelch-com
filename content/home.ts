/**
 * HOMEPAGE — "Built for Change".
 *
 * Every string here is from 01_HOMEPAGE_COPY.md in the Built for Change
 * handoff packet, as written. The packet's instruction is explicit: "Copy
 * should be implemented as written unless Steve explicitly approves a change.
 * Minor punctuation/line-wrap changes are fine; strategic rewriting is not."
 * Edit this file freely — but an edit here is a copy change, not a code change,
 * and belongs to Steve.
 *
 * The page renders these in the packet's section order (§2–§12); §1 and §13
 * are the header and footer.
 *
 * `headingLines` arrays are headings the packet sets on two lines. They render
 * as ONE heading element with a line break, so a screen reader and a crawler
 * read one sentence rather than two.
 */

/* §2 — Hero ------------------------------------------------------------- */

export const hero = {
  eyebrow: "STEVE WELCH",
  /** The H1. The spec: "H1 remains Built for Change." */
  heading: "BUILT FOR CHANGE.",
  /** Set as the first H2 — the copy marks it `##` under the H1. */
  subhead: "AI, Leadership, and the Organizations That Adapt",
  body: "Steve Welch has spent 25 years founding, scaling, leading and investing in companies. Built for Change brings those lessons to leaders confronting the most consequential technology shift of their careers.",
  thesis:
    "Before you can implement AI change, you need the fundamentals of change in place first: clear purpose, aligned people, and processes that drive consistent execution. Then AI amplifies everything.",
  primaryCta: "Build Your Keynote",
  secondaryCta: "Watch Steve Speak",
  /**
   * REVIEW: "400+ COMPANIES BACKED" sits directly under Steve's name, where it
   * reads as a personal figure. 400+ is Dreamit Ventures' portfolio (the fund
   * he co-founded); the figure the site has used for Steve personally is
   * "350+ built from scratch or first investor". Both are true; they are
   * different claims. Implemented as the packet wrote it — Steve to confirm
   * which belongs here.
   */
  credibility: ["FOUNDER", "CEO", "INVESTOR", "400+ COMPANIES BACKED"],
};

/* §3 — Career authority -------------------------------------------------- */

export type Chapter = {
  name: string;
  headline: string;
  body: string;
  image: "mitos" | "dreamit" | "restore" | "portrait";
};

export const career = {
  eyebrow: "A 25-YEAR JOURNEY",
  heading: "BUILT, NOT JUST STUDIED.",
  intro:
    "Steve has experienced change from nearly every seat at the table: entrepreneur, CEO, investor, buyer, seller and operator. Those experiences are the source material for the ideas he brings to the stage.",
  chapters: [
    {
      name: "Mitos",
      /*
       * REVIEW: "Founded at 23". The site's own record has Mitos founded in
       * 2001 and sold in 2007 when Steve was 30, which makes him 23 or 24 at
       * founding depending on his birthday. One word from Steve settles it.
       */
      headline: "Founded at 23. Built. Scaled. Sold.",
      body: "Founded Mitos Technologies and sold the company to Parker Hannifin.",
      image: "mitos",
    },
    {
      name: "Dreamit Ventures",
      headline: "400+ companies backed.",
      body: "Co-founded Dreamit Ventures and worked alongside hundreds of founders building companies across technology and healthcare.",
      image: "dreamit",
    },
    {
      name: "Restore Hyper Wellness",
      headline: "225+ locations.",
      /* Past tense is correct: Steve stepped down as CEO effective
         10 February 2025 and remains on the board. */
      body: "Helped build Restore Hyper Wellness into a national brand and later returned as CEO to lead through a period of intense change.",
      image: "restore",
    },
    {
      name: "25+ Years",
      headline: "Seeing change from every seat at the table.",
      body: "Founder. CEO. Investor. Buyer. Seller. Operator.",
      image: "portrait",
    },
  ] satisfies Chapter[],
};

/* §4 — Change thesis ----------------------------------------------------- */

export const thesis = {
  headingLines: ["Change isn’t new.", "The speed is."],
  body: "Markets change. Technologies change. People change. Business models change. AI accelerates all of it.",
  emphasis:
    "But AI does not create an adaptable organization. Before you can implement AI change, you need the principles of change in place first.",
  /** Rendered with "THEN AI." picked out — the packet's "selected words". */
  display: { lead: "PURPOSE. PEOPLE. PROCESS.", accent: "THEN AI." },
  statement: "CHANGE IS THE CONSTANT. ADAPTABILITY IS THE ADVANTAGE.",
};

/* §5 — Framework --------------------------------------------------------- */

export const framework = {
  eyebrow: "THE FRAMEWORK",
  headingLines: [
    "THE IDEAS DIDN’T COME FROM THE SPEAKING CIRCUIT.",
    "THEY CAME FROM BUILDING COMPANIES.",
  ],
  supporting: "AI can amplify change. It cannot create the foundation for it.",
  steps: [
    { key: "purpose", name: "Purpose", line: "Creates clarity." },
    { key: "people", name: "People", line: "Align behind the purpose." },
    { key: "process", name: "Process", line: "Drives consistent execution." },
  ],
  /**
   * The spec is specific: AI "must read Amplifies Everything. Do not write
   * 'Multiplies Process' or 'Multiplies the Process.'" It acts on the whole
   * system, not on the last block.
   */
  amplifier: { name: "AI", line: "AMPLIFIES EVERYTHING." },
  explanation:
    "AI is not the foundation. It is the amplifier. If purpose is unclear, people are misaligned or processes are inconsistent, AI accelerates the problem. Get the fundamentals right first, and AI can dramatically increase the speed and leverage of the entire organization.",
};

/* §6 — Customization ----------------------------------------------------- */

export const customization = {
  eyebrow: "BUILT AROUND YOUR ORGANIZATION",
  headingLines: [
    "No two organizations are facing the same change.",
    "Why should they hear the same keynote?",
  ],
  /* First person, in Steve's voice, as the packet writes it. */
  body: "I don’t give canned speeches. Every engagement starts with conversations about your organization, your audience and what you need them to leave with. The framework stays consistent. The stories, examples, data and emphasis are built for the room.",
  inputs: [
    { name: "YOUR ORGANIZATION", line: "Your industry, market and the change you’re facing." },
    { name: "YOUR AUDIENCE", line: "The roles, experience and perspectives in the room." },
    { name: "YOUR OUTCOME", line: "The insight, alignment or action you want next." },
  ],
};

/* §7 — Speaking reel ----------------------------------------------------- */

export const reel = {
  eyebrow: "SEE STEVE SPEAK",
  heading: "See the keynote, not just the résumé.",
  /** "Use the existing speaking reel until a new Built for Change reel is
      produced." No autoplay — the player loads only when pressed. */
  overlay: "Watch Steve’s Keynote Reel",
  youtubeId: "m5oykqwZjUU",
};

/* §8 — Customization case study ----------------------------------------- */

export const caseStudy = {
  eyebrow: "CASE STUDY",
  heading: "One framework. A different keynote every time.",
  subhead: "Built for the Insurance Industry.",
  /*
   * REVIEW: this reads as a real engagement ("For an insurance-industry
   * audience, Steve built the keynote…"). The packet says it derives from
   * Steve's actual keynote discussion of experienced "Tony" and AI-native
   * "Claire". Confirm it describes a real engagement before this goes live,
   * and whether the client may be named or implied.
   */
  body: [
    "For an insurance-industry audience, Steve built the keynote around a challenge already inside many firms: experienced professionals with deep institutional judgment working alongside AI-native talent with a fundamentally different approach to work.",
    "The session focused on how leaders, HR teams and managers can align both groups around a common purpose, manage their differences, preserve hard-earned judgment, reward new leverage and use process to create consistent execution.",
  ],
  conclusion:
    "The point was not to choose between experience and AI-native talent. It was to build the fundamentals that allow both to perform, and then use AI to amplify what works.",
  /** Typographic archetypes, never photographs of people — the packet forbids
      fake employee photography here. */
  panels: [
    { name: "EXPERIENCED JUDGMENT", traits: ["Deep expertise", "Context", "Institutional knowledge"] },
    { name: "AI-NATIVE LEVERAGE", traits: ["New workflows", "Faster iteration", "Multiplied output"] },
  ],
  connector: "Different strengths. One purpose.",
};

/* §9 — Ideas ------------------------------------------------------------- */

export const ideas = {
  eyebrow: "IDEAS ON CHANGE",
  heading: "The work continues offstage.",
  body: "Steve writes about AI, entrepreneurship, organizations and the forces changing how people work and lead.",
  cta: "Read Steve’s Writing",
  /* The three most recent essays come from Substack at build time, with real
     titles and dates — never hard-coded. See lib/substack.ts. */
};

/* §10 — Selected organizations ------------------------------------------ */

export const organizations = {
  eyebrow: "SELECTED AUDIENCES & ORGANIZATIONS",
  /* Logos: selectedOrganizationLogos in content/media-manifest.ts. */
};

/* §11 — Testimonial ------------------------------------------------------ */

/*
 * The packet: "Only use a genuine, attributable quote… If no strong organizer
 * testimonial is available at launch, use the existing legitimate
 * Philadelphia Inquirer quote, clearly attributed." That is what renders — the
 * quote lives in content/speaking.ts as `anvilQuote`. An organizer testimonial
 * validating the customization is the one to collect next.
 */
export const testimonial = {
  source: "The Philadelphia Inquirer",
};

/* §12 — Final CTA -------------------------------------------------------- */

export const finalCta = {
  eyebrow: "START WITH THE OUTCOME",
  heading: "What do you need your audience to leave with?",
  body: "Tell Steve what’s changing, who’s in the room and what you need the session to accomplish.",
  primary: "Build Your Keynote",
  secondary: "Check Availability",
  reassurance: "Inquiries go directly to Steve’s team. No agency in between.",
};
