/*
 * The words on the private CRM screens at /admin.
 *
 * Kept here with the rest of the site's copy, so the screens hold layout and
 * this file holds what they say. The wording is the wording Steve signed off
 * in the CRM mockups (11 November 2026). Change it here, not in a component.
 *
 * `sections` is the menu. A section is added to it when its screen is built,
 * so the menu never offers a page that does not exist yet.
 */
export const adminCopy = {
  product: "Speaking CRM",

  signIn: {
    title: "Sign in",
    heading: "Speaking CRM",
    body: "Private. Only Steve’s account can sign in.",
    action: "Sign in",
    /* Shown instead of the button until the four sign-in settings exist. */
    notSetUp: "Sign-in is not set up yet.",
    /* Shown above the button when a sign-in was started and did not finish. */
    problem: "That sign-in did not complete. Please try again.",
  },

  denied: {
    title: "Wrong account",
    heading: "That account can’t open this.",
    body: "The Speaking CRM is private to Steve. If you were looking for the site, it is at",
    action: "Try a different account",
  },

  shell: {
    sectionsLabel: "CRM sections",
    menu: "Menu",
    signedInAs: "Signed in as Steve",
    signOut: "Sign out",
  },

  sections: [{ href: "/admin/", label: "Leads" }],

  /* A CRM address with nothing behind it: a wrong or removed lead. */
  notFound: {
    heading: "That page isn’t here.",
    body: "The lead may have been removed, or the address is not quite right.",
    action: "Back to Leads",
  },

  leads: {
    title: "Leads",
    heading: "Leads",
    none: "No inquiries yet.",
    columns: ["Lead", "Budget answer", "Stage", "Source", "Event", "Last activity"],
    filterAll: "All",
    filterNeedsYou: "Need you",
    open: "Open",
    testChip: "Test",

    /* A card at the top for each inquiry the inbox never received. */
    needsYouLabel: "The email to you failed",
    needsYouBody: "This inquiry was saved here, but the email telling you about it did not send.",

    /* Before the first inquiry. */
    emptyHeading: "Nothing has come in yet.",
    emptyBody:
      "When someone sends the form on the site, they appear here within seconds, with their budget answer and where they came from.",
    sendTest: "Send a test inquiry to myself",
    testSent:
      "A test inquiry was sent. It is in the list below, marked as a test, and two emails are on their way to you.",
    testFailed: "The test inquiry could not be sent. The form answered with an error.",

    connectedHeading: "Is everything connected?",
    connected: "Connected",
    notConnected: "Not connected",
    off: "Off",
    connections: {
      form: "Inquiry form",
      formDown: "Inquiries still reach your inbox, but they are not being saved here",
      email: "Email sending",
      emailDown: "The form cannot send email, and shows visitors your address instead",
      calendar: "Google Calendar",
      calendarDown: "Booked calls will not appear here until it is",
      followUps: "Follow-up emails",
      followUpsOff: "Emails 2 and 3 are off until you turn them on",
    },

    /* Test inquiries are kept out of the list unless asked for. */
    testsHidden: "hidden.",
    showTests: "Show them",
    hideTests: "Hide test inquiries",

    unreadableHeading: "The lead records could not be read.",
    unreadableBody: "Inquiries are still reaching your inbox. Reload this page in a minute. The database said:",
    tooMany: "Only the 500 most recent leads are shown here.",
  },

  lead: {
    title: "Lead",
    stage: "Stage",
    briefHeading: "Brief for the call",
    organization: "Organization",
    source: "Source",
    budget: "Budget answer",
    timing: "Event timing",
    event: "Event",
    location: "Location",
    audience: "Audience size",
    format: "Format",
    wrote: "What they wrote",
    timelineHeading: "What has happened",
    earlierHeading: "Earlier inquiries",
    testNote: "This is a test, not a prospect. It is left out of every report.",
    noInquiry: "No inquiry is recorded for this lead.",
  },
} as const;
