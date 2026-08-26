/**
 * Homepage content — transcribed from the WordPress export's ACF blocks, in
 * the order the original renders them.
 *
 * Section order on stevewelch.com/:
 *   hero → newsletter bar → intro → Investor/Executive/Speaker → speaking
 *   overlay → "Speaking Engagements" logo wall → Purpose/People/Process →
 *   book CTA → free-chapter opt-in → Restore Hyper Wellness
 *
 * Kept in that order deliberately. It is a good page — the three roles
 * establish range before asking for anything, the logo wall proves the claim,
 * and Purpose/People/Process is the actual intellectual framework rather than
 * a list of topics.
 */

export const heroHeading = "Driving Change Through Purpose, People, Process";

export const newsletterBar = {
  heading: "Get thoughts and Insights",
  cta: "Get The Newsletter",
};

export const intro = [
  "Steve Welch is a successful entrepreneur and investor, who has founded and exited businesses in the healthcare and consumer industries.",
  "Currently as the CEO of Restore Hyper Wellness, Steve is expanding the accessibility of wellness therapies that provide lasting health benefits to consumers.",
];

export type RoleBox = {
  title: string;
  content: string;
  image: string;
  /** Where this role is expanded on elsewhere in the site. */
  href: string;
};

/** The three roles. On the original these are hover-reveal image tiles. */
export const roles: Omit<RoleBox, "image">[] = [
  {
    title: "Investor",
    content:
      "Steve has built from scratch or been the first investor in 350+ companies over the last 25 years",
    href: "/about/",
  },
  {
    title: "Executive",
    content:
      "Steve has led multiple companies as CEO or Executive Chairman, while working with the most respected hospitals in the country to unlock hidden value",
    href: "/about/",
  },
  {
    title: "Speaker",
    content:
      "Steve has engaged many audiences on the tools and mindset needed to drive change within an organization",
    href: "/speaking/",
  },
];

export const rolesFooter = {
  cta: "More About Steve",
  note: "Follow Steve on Linkedin to see what he's currently up to",
};

export const speakingPanel = {
  eyebrow: "Speaking",
  heading:
    "Steve helps organizations drive value creation that leads to exceptional outcomes.",
  points: [
    "Institute Change",
    "Identify New Opportunities",
    "Take Organization to the Next Level",
  ],
  cta: "Book Steve to Speak",
};

export type Pillar = {
  slug: string;
  name: string;
  /** The homepage's longer statement of the pillar. */
  home: string;
};

/**
 * Purpose, People, Process — the framework the whole site is organised around.
 * These are the homepage versions; /speaking/ states them differently and both
 * are kept, because the original does.
 */
export const pillars: Pillar[] = [
  {
    slug: "purpose",
    name: "Purpose",
    home: "A company or product needs to generate a profit, but first it needs to create value. This value creation is the organization’s north star that all stakeholders can rally behind and employees can find purpose in",
  },
  {
    slug: "people",
    name: "People",
    home: "People are the most valuable asset in almost every organization. Having the right people, with the right experience, driven by a common purpose is how you power change",
  },
  {
    slug: "process",
    name: "Process",
    home: "No, it is not sexy. The reality is that a process that provides structure with quick iteration cycles will empower an organization to drive change and achieve results",
  },
];

export const optIn = {
  heading:
    "Sign up and get a free chapter of Restore: The Life Changing Power of Right-Away Wellness",
  cta: "Get the free chapter",
};

export const restorePanel = {
  heading: "Restore Hyper Wellness",
  body: "Restore Hyper Wellness is expanding the limits of personal health and performance, to help people do more of what they love through personalized science-backed therapies. With 225+ locations across the U.S., Restore is leading the wellness revolution to help Americans live happier and healthier lives.",
  linkLabel: "Learn more at restore.com",
  href: "https://www.restore.com",
};
