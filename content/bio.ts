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
  /**
   * The magnitude the counter animates to — the number actually shown, not the
   * raw figure. "$10B+" counts 0..10 and keeps its "$" and "B+"; the export
   * stores 10000000000 in the same field, which would count to a twelve-digit
   * number the page never displays. Omit it and the value simply does not move.
   */
  to?: number;
};

/** The "By the numbers" counter block. */
export const byTheNumbers: Stat[] = [
  { value: "4", to: 4, label: "Successful Companies Founded", sentence: "Steve Welch has founded 4 successful companies." },
  { value: "400+", to: 400, label: "Companies Invested In", sentence: "Steve Welch has invested in over 400 companies." },
  { value: "$10B+", to: 10, label: "Invested Companies Market Cap", sentence: "The companies Steve Welch has invested in have a combined market capitalization exceeding $10 billion." },
  { value: "10M+", to: 10, label: "Consumers Impacted", sentence: "Steve Welch's companies have impacted more than 10 million consumers." },
];

/** The Restore "Today" counter block. */
export const restoreToday: Stat[] = [
  { value: "225+", to: 225, label: "studios nationwide", sentence: "Restore Hyper Wellness operates more than 225 studios nationwide." },
  { value: "57,000", to: 57000, label: "members", sentence: "Restore Hyper Wellness serves 57,000 members." },
  { value: "3M+", to: 3, label: "therapies delivered in 2024", sentence: "Restore Hyper Wellness delivered more than 3 million therapies in 2024." },
];

export type TimelineEntry = {
  /** Key into `img` in content/media-manifest.ts. */
  image: string;
  /** Written in Steve's own first person, exactly as the block has it. */
  text: string;
  /** What the photograph shows, for alt text — the export stores none. */
  alt: string;
};

/*
  The About page's timeline, transcribed from its qi-blocks/timeline block. It
  sits directly after the three buckets, and the first build dropped it
  entirely — eleven entries and eleven photographs, which is the whole account
  of how Steve got here and by some distance the most persuasive thing on the
  page for someone deciding whether to book him.

  First person throughout, because that is how it is written. Do not rewrite it
  into third person to match the rest of the page; the shift in voice is the
  point of the section.

  The alt text is written here rather than taken from the export, which stores
  an empty alt on every one of them.
*/
export const timeline: TimelineEntry[] = [
  {
    image: "timelinePennState",
    alt: "Steve as a student with two friends in a college house",
    text: "My entrepreneurial journey began by paying most of my way through Penn State engineering by scalping tickets and selling carpets to freshman. Successful but not scalable.",
  },
  {
    image: "timelineMitosFounded",
    alt: "Two people in cleanroom suits holding a Mitos Technologies banner",
    text: "At 23, I founded Mitos because I saw a problem in the biotech industry and knew I could solve it. I got my customers to pay for my product before it was even built. Validation of true product market fit. What started out as one solution grew into many, and we created enormous value for our customers",
  },
  {
    image: "timelineSaratoga",
    alt: "Bedding laid out in the back of a car",
    text: "Once a week, I slept in my car in Saratoga, NY as I grew Mitos without a cent to my name. It gets cold in Saratoga in the winter. Sacrifice it part of success.",
  },
  {
    image: "timelineWedding",
    alt: "Steve carrying Nicole on their wedding day",
    text: "I married the woman who I had been in love with since I first kissed her at the age of 15. After breaking up with her when I was 16, it took a decade to win her back. Success takes patience.",
  },
  {
    image: "timelineMitosSold",
    alt: "A tray of stainless steel bioprocessing components made by Mitos",
    text: "I sold Mitos at the age of 30, to Parker (NYSE: PH). I was motivated, happy, and fulfilled when I was poor. I was now rich and still motivated, happy, and fulfilled. This is because in both scenarios I had purpose.",
  },
  {
    image: "timelineDreamitStart",
    alt: "Steve on stage in front of a Dreamit Ventures screen",
    text: "I partnered with two amazing mentors and started Dreamit Ventures to help take our lessons learned to aspiring entrepreneurs. This allowed me to work with amazing people building amazing companies. In the end, I learned more from them than they did from me.",
  },
  {
    image: "timelineDreamitTeam",
    alt: "The Dreamit Ventures team on stage",
    text: "After 15 years, Dreamit has invested in over 400 companies, and we developed a process to create value for companies through innovation. Today, the total market cap of Dreamit companies exceeds $10B.",
  },
  {
    image: "timelineHealth",
    alt: "Steve wakeboarding, mid-air off the water",
    text: "In my late 30\u2019s, I was starting to have less energy and more aches and pains. I was in shape and looked fine on the outside, but decades of fast food and sodas had turned my insides to mush. I was prediabetic, with extremely high cholesterol, and short of many key micronutrients. Nothing works if your health is not working.",
  },
  {
    image: "timelineRestoreStart",
    alt: "A ribbon-cutting outside an early Restore Hyper Wellness studio",
    text: "I partnered with another great entrepreneur to start Restore Hyper Wellness because there was a clear problem that needed to be solved. People need a way to understand and invest in their health while they are healthy as opposed to waiting until they are sick.",
  },
  {
    image: "timelineRestoreScaled",
    alt: "An on-stage session under an \u014cURA and Restore Hyper Wellness banner",
    text: "Scaled Restore by building an organization aligned around purpose with the right people who were process driven. Restore is the largest retail health wellness business in the world with over 225 locations.",
  },
  {
    image: "timelineFamilyToday",
    alt: "Steve, Nicole and their four children in a field of bluebonnets",
    text: "Continue to share the journey with my partner for life with 4 kids in tow.",
  },
];

export type LifeBox = { title: string; content: string };

/** The "3 buckets" — Family, Himself, Work. */
/*
  One heading in the original, set as an uppercase 21px line over a full-size
  one. Its live text reads "a happy, health lifestyle" — a typo on the source
  page, kept as "healthy" here rather than reproduced.
*/
export const lifeBoxesEyebrow = "Achieving success in business";
export const lifeBoxesHeading = "Starts with a happy, healthy lifestyle";

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
  /** The fund's mark, from the original's card. */
  logo?: string;
};

export const investmentVehicles = {
  heading: "Steve’s Investment Vehicles",
  vehicles: [
    {
      stage: "Early stage",
      name: "Dreamit Ventures",
      logo: "/media/dreamIT_logo.svg",
      body: "Dreamit Ventures invests in transformative early-stage companies focused on scaling revenues.",
      href: "https://www.dreamit.com",
      linkLabel: "dreamit.com",
    },
    {
      stage: "Late stage",
      name: "Shark Skin Capital",
      logo: "/media/shark-skin_logo.svg",
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

/*
  The credibility strip. PRESS KIT ONLY — it was on the homepage above the
  footer and Steve took it off; it is not on his homepage and it read as
  something that had wandered in. A press kit is where a journalist goes
  looking for exactly this, so it stays there.

  Every figure is his own, from his own site: "350+ companies over the last 25
  years" is the homepage's Investor card; "the total market cap of Dreamit
  companies exceeds $10B" and the 400+ investments are the About page timeline,
  which also carries a stat counter labelled "Invested Companies Market Cap";
  the Restore numbers are the Restore section. Nothing here was inferred.
*/
export const credentials: Credential[] = [
  { label: "350+ companies", detail: "Built from scratch or first investor, over 25 years" },
  { label: "Sold Mitos at 30", detail: "Acquired by Parker (NYSE: PH)" },
  { label: "CEO, Restore Hyper Wellness", detail: "225+ studios, 57,000 members" },
  { label: "$10B+ market cap", detail: "Across 400+ Dreamit Ventures investments" },
];
