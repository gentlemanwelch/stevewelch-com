/**
 * Welch Family Foundation — transcribed from
 * stevewelch.com/welch-family-foundation/.
 *
 * The first rebuild paraphrased this page from search snippets and missed the
 * origin story entirely. This is the real copy.
 */

export const foundation = {
  heading: "Welch Family Foundation",

  storyBegins: {
    heading: "Their Story Begins",
    body: [
      "Steve & Nicole started investing their time and financial resources in early childhood education in 2009.",
      "Soon after their second child was born, Nicole became Board President of the Montessori Children’s House of Valley Forge (MCHVF). As head of the executive committee, she worked to establish broad policies and goals that advance MCHVF’s mission, vision, and strategic goals.",
    ],
  },

  pastDecade: [
    "Over the past decade, Steve and Nicole engaged in grassroots efforts to promote STEM education within their community through programs such as Math Pentathlon, Robotics, and Destination Imagination.",
    "By actively participating and leading these educational initiatives, they are playing a vital role in shaping the future of learning and empowerment.",
  ],

  whatWeDo: {
    heading: "What We Do",
    body: [
      "We want to inspire and empower children to pursue interests and careers in science, technology, engineering, and mathematics. This may mean providing funding for STEM programs in schools, offering scholarships for groups in STEM fields, or supporting extracurricular activities such as robotics, math, coding, and STEM clubs.",
      "Our foundation can facilitate partnerships with industry leaders to provide mentorship, internships, and real-world experiences. We invest our time and money in individuals, organizations, and platforms that we believe will create the future leaders of tomorrow.",
    ],
  },

  howToHelp: {
    heading: "How You Can Help?",
    body: [
      "There are various ways to contribute to our mission and make a positive impact.",
      "Whether through donating, volunteering, spreading awareness, or participating in fundraising events, every effort counts. Join us in making a difference today!",
      "Check sizes can be as small as $100 to as much as $100,000.",
    ],
  },

  /*
    The three organisations whose logos close the page. WordPress stores them
    under generated filenames, so each is named here by what it actually is —
    rendered and read, not inferred from the file.
  */
  partners: [
    { name: "Destination Imagination Texas", image: "foundationLogoDestinationImagination" },
    { name: "UATX", image: "foundationLogoUatx" },
    { name: "The International School of Texas", image: "foundationLogoIsTexas" },
  ],

  /*
    The partnership enquiry form.

    ORIGIN: the original page embeds `[gravityform id="4"]` — Gravity Forms,
    a WordPress plugin, not a Google Form. That distinction matters, because a
    Gravity Forms definition lives in the WordPress database and a WXR export
    carries pages, posts and media only. The fields below are transcribed from
    Steve's screenshot of the live form's FIRST step, which is all that screen
    showed; its steps two and three are not recoverable from anything in this
    repo. See the note where the form renders.
  */
  form: {
    heading: "Tell us about your organization",
    body: "The Foundation backs people and programs that get children into science, technology, engineering and mathematics. Tell us who you are and what you are building, and it goes straight to the Foundation.",
    fields: {
      organization: "Organization name",
      contact: "Contact person (name and title)",
      email: "Email",
      phone: "Phone number",
      url: "Organization website",
      street: "Street address",
      city: "City",
      region: "State / province / region",
      postalCode: "ZIP / postal code",
      country: "Country",
    },
    submit: "Send to the Foundation",
  },
} as const;
