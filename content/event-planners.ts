/**
 * Event Planners — served at /press-kit/.
 *
 * THE URL STAYS /press-kit/. The Built for Change nav calls this page "Event
 * Planners", and the page now says so, but the address is indexed and linked
 * from past engagements; renaming it would throw that away for a word. See the
 * note on `nav` in content/site.ts.
 *
 * What it is for: the four emails that precede every engagement — send us a
 * bio, send us a headshot, how should we introduce you, what do you need on
 * stage. Publishing the answers removes the round trips, and a speaker with a
 * proper kit has visibly done this before.
 */
export const eventPlanners = {
  navName: "Event Planners",
  eyebrow: "Event Planners",
  heading: "Everything you need to promote the event.",
  body: "Bios at three lengths, the stage introduction, topics, and technical requirements. Copy anything on this page and use it as is — no permission needed.",

  biosHeading: "Biographies",
  bioLabels: {
    oneLine: "One line",
    short: "Short — for programs",
    long: "Full — for websites",
  },

  introHeading: "Stage introduction",
  introNote: "Roughly 40 seconds, written to be read aloud.",
  /**
   * The introduction the host reads from the lectern. Written to be spoken
   * aloud — short sentences, no semicolons, and a last line that hands over
   * cleanly.
   */
  stageIntroduction: `Our next speaker has built from scratch, or been the first investor in, more than 350 companies over the last twenty-five years. He founded Mitos and sold it at the age of 30 to Parker. He co-founded Dreamit Ventures, which has backed over 400 companies now worth more than ten billion dollars combined. He helped build Restore Hyper Wellness into a national brand of 225 studios, and later returned as its CEO. He is the author of "We Are All Born Entrepreneurs." He speaks about driving change through purpose, people, and process. Please welcome Steve Welch.`,

  topicsHeading: "Topics",
  avHeading: "Technical requirements",
  avRequirements: [
    "Wireless lavalier or over-ear microphone (preferred over handheld)",
    "Confidence monitor or a laptop on the lectern showing current slide",
    "HDMI connection with 16:9 projection",
    "Ability to move — no lectern-bound setups where it can be avoided",
    "A clicker, or a stage manager cueing slides",
  ],

  photoHeading: "Photography",
  /*
    REVIEW: replace with direct download links once high-resolution headshots
    and stage photography are in /public. Organizers need these and will email
    for them otherwise.
  */
  photoBefore: "High-resolution headshots and stage photography are available on request — email",
  photoAfter: "and they will come back the same day.",
  somethingElse: "Need something else? Ask and it will be sent the same day.",

  factSheetHeading: "Fact sheet",
};
