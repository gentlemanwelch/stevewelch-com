/**
 * About page content and reusable bios — transcribed from the WordPress export.
 *
 * Two facts here contradict third-party sources (Crunchbase, press). The site
 * wins both times: Steve sold Mitos at 30, not 29, and the buyer was Parker
 * (NYSE: PH) — confirmed twice over, since Parker Hannifin also appears in the
 * "Selected Companies I have worked with" logo wall on this same page.
 */

export const aboutHero = {
  eyebrow: "About",
  heading:
    "A successful entrepreneur and investor who lives the hyper wellness lifestyle every day.",
  body: "Steve is passionate and committed to maximizing his health which is essential to his 3 buckets life strategy that has led to his professional and personal success.",
};

export type Stat = {
  /** Rendered value, already formatted. */
  value: string;
  label: string;
  /**
   * The same fact as one self-contained sentence, for screen readers and for
   * models extracting facts from the markup. Without it, "225+" and "studios
   * nationwide" reach a parser as two unrelated fragments.
   */
  sentence?: string;
};

/** The "By the numbers" counter block. */
export const byTheNumbers: Stat[] = [
  { value: "4", label: "Successful Companies founded", sentence: "Steve Welch has founded 4 successful companies." },
  { value: "400+", label: "Companies Invested In", sentence: "Steve Welch has invested in over 400 companies." },
  { value: "$10B+", label: "Invested Companies Market Cap", sentence: "The companies Steve Welch has invested in have a combined market capitalization exceeding $10 billion." },
  { value: "10M+", label: "Consumers Impacted", sentence: "Steve Welch's companies have impacted more than 10 million consumers." },
];

/** The Restore "Today" counter block. */
export const restoreToday: Stat[] = [
  { value: "225+", label: "studios nationwide", sentence: "Restore Hyper Wellness operates more than 225 studios nationwide." },
  { value: "57,000", label: "members", sentence: "Restore Hyper Wellness serves 57,000 members." },
  { value: "3M+", label: "therapies delivered in 2024", sentence: "Restore Hyper Wellness delivered more than 3 million therapies in 2024." },
];

export type LifeBox = { title: string; content: string };

/** The "3 buckets" — Family, Himself, Work. */
export const lifeBoxesHeading =
  "Achieving success in business starts with a happy, healthy lifestyle";

export const lifeBoxes: LifeBox[] = [
  {
    title: "Family",
    content:
      "Steve and his wife, Nicole, have 4 children and focus their efforts on education and community service",
  },
  {
    title: "Himself",
    content:
      "Steve enjoys spending any free time on the water, sailing, kiteboarding, wing foiling and surfing.",
  },
  {
    title: "Work",
    content:
      "Steve is a problem solver that uses data to drive decisions within an organization. As a leader, he works to bring energy, productivity, and success to all business departments",
  },
];

export const restoreOrigin = {
  heading: "The Origin",
  body: "While training for a triathlon, Jim and Steve began using cryotherapy for recovery. They loved how it felt but didn’t like the customer experience.",
};

export const dreamitOrigin = {
  heading: "The Origin",
  body: "I wanted to help young entrepreneurs turn their ideas into businesses.",
  wantedTo: [
    "Engage directly with passionate individuals to solve real problems",
    "Encourage rapid iteration cycles to achieve change quickly",
    "Focus investment dollars to create significant change in companies leading to substantial value creation",
    "Support the growth of individuals and organizations to find success and happiness",
  ],
};

export type Vehicle = {
  stage: string;
  name: string;
  body: string;
  href?: string;
  linkLabel?: string;
};

export const investmentVehicles = {
  heading: "Steve’s Investment Vehicles",
  vehicles: [
    {
      stage: "Early stage",
      name: "Dreamit Ventures",
      body: "Dreamit Ventures invests in transformative early-stage companies focused on scaling revenues.",
      href: "https://www.dreamit.com",
      linkLabel: "dreamit.com",
    },
    {
      stage: "Late stage",
      name: "Shark Skin Capital",
      body: "Shark Skin Capital invests capital to scale companies in the healthcare and consumer spaces. The model is designed as short sprints to achieve significant value creation. Shark Skin looks to invest when capital and expertise can drive value, leading to a larger institutional investment round.",
    },
  ] as Vehicle[],
};

/* ------------------------------------------------------------------ bios --- */

/** One line — run of show, and the search-result subtitle. */
export const bioOneLine =
  "Steve Welch is a successful entrepreneur and investor who has founded and exited businesses in the healthcare and consumer industries, and is currently CEO of Restore Hyper Wellness.";

/** ~60 words — printed programs and speaker introductions. */
export const bioShort = `Steve Welch is a successful entrepreneur and investor who has founded and exited businesses in the healthcare and consumer industries. He sold Mitos at the age of 30 to Parker (NYSE: PH), then co-founded Dreamit Ventures, which has invested in over 400 companies. He is currently CEO of Restore Hyper Wellness and the author of "We Are All Born Entrepreneurs."`;

/** Long form — the press kit, and the paragraph organizers paste elsewhere. */
export const bioLong: string[] = [
  "Steve Welch is a successful entrepreneur and investor who has founded and exited businesses in the healthcare and consumer industries. Over the last twenty-five years he has built from scratch, or been the first investor in, more than 350 companies.",
  "He founded Mitos in 2001 and built it into a global company in biotech manufacturing, developing innovations and patents that changed how biological drugs and vaccines are made. He sold it at the age of 30 to Parker (NYSE: PH).",
  "He then partnered with two mentors and started Dreamit Ventures, wanting to help young entrepreneurs turn their ideas into businesses. After fifteen years, Dreamit has invested in over 400 companies whose combined market capitalization exceeds $10 billion. He also invests through Shark Skin Capital, which scales later-stage healthcare and consumer companies in short sprints.",
  "Steve is currently CEO of Restore Hyper Wellness, which began with a problem he had himself: while training for a triathlon, he and Jim Donnelly started using cryotherapy for recovery, liked how it felt, and did not like the customer experience. Restore now runs 225+ studios nationwide, has 57,000 members, and delivered more than three million therapies in 2024.",
  'He is the author of "We Are All Born Entrepreneurs" and co-author of "Restore: The Life-Changing Power of Right-Away Wellness" with Jim Donnelly. He and his wife Nicole have four children and run the Welch Family Foundation. He has been a guest speaker on multiple continents.',
];

export type Credential = { label: string; detail: string };

/** The credibility strip. Every figure below is on the original site. */
export const credentials: Credential[] = [
  { label: "350+ companies", detail: "Built from scratch or first investor, over 25 years" },
  { label: "Sold Mitos at 30", detail: "Acquired by Parker (NYSE: PH)" },
  { label: "CEO, Restore Hyper Wellness", detail: "225+ studios, 57,000 members" },
  { label: "$10B+ market cap", detail: "Across 400+ Dreamit Ventures investments" },
];
