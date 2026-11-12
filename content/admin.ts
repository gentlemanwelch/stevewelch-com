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

  sections: [
    { href: "/admin/", label: "Leads" },
    { href: "/admin/pipeline/", label: "Pipeline" },
    { href: "/admin/reports/", label: "Reports" },
  ],

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
    columns: ["Lead", "Budget answer", "Stage", "Source", "Event", "Last activity", "Next step"],
    filterAll: "All",
    filterNeedsYou: "Need you",
    filterCallBooked: "Call booked",
    filterClosed: "Closed",
    noNextStep: "None",
    noneInFilter: "No leads here.",
    open: "Open",
    testChip: "Test",

    /* A card at the top for each inquiry the inbox never received. */
    needsYouLabel: "The email to you failed",
    needsYouBody: "This inquiry was saved here, but the email telling you about it did not send.",
    /* And one for each open lead whose next step has come due. */
    dueTodayLabel: "Next step due today",
    overdueLabel: "Next step overdue",
    dueNoStep: "A date was set with no step written.",

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

    changeStage: "Change",

    afterHeading: "After the call",
    afterNote: "One press each. Nothing here emails the lead.",
    callHeld: "Call held",
    noShow: "No-show",
    qualifiedQuestion: "Was it a qualified opportunity?",
    qualified: "Qualified",
    notAFit: "Not a fit",
    nextStep: "Next step",
    due: "Due",
    fee: "Fee",
    feeHint: "For example 25000",
    notes: "Notes",
    notesHint: "What you learned on the call",
    save: "Save",

    /* Shown at the top when a change did not go through, by what went wrong. */
    problems: {
      due: "The due date was not saved, because it was not a date. Everything else was.",
      fee: "The fee was not saved. Type an amount, like 25000 or $25,000. Everything else was.",
      save: "That change was not saved. The database did not answer. Please try again.",
      refused: "That change was not understood, so nothing was saved.",
    },
  },

  pipeline: {
    title: "Pipeline",
    heading: "Pipeline",
    summary: "Where every open inquiry stands. A booked call is not a booked engagement.",
    none: "None",
    needsYou: "Needs you",
    closed: "Closed:",
    closedReasons: { below_floor: "below $20,000", not_a_fit: "not a fit", lost: "lost" },
    showClosed: "Show",
  },

  reports: {
    title: "Reports",
    heading: "Reports",
    summary: "Counted by stage, so a form fill is never mistaken for a booking.",
    periods: [
      { value: "30", label: "Last 30 days" },
      { value: "90", label: "Last 90 days" },
      { value: "all", label: "All time" },
    ],

    funnelHeading: "From inquiry to booking",
    funnelRows: {
      inquiries: "Inquiries",
      budgetFit: "Budget fit or approval pending",
      callBooked: "Call booked",
      callHeld: "Call held",
      proposalSent: "Proposal sent",
      booked: "Booked",
    },

    sourceHeading: "By source",
    sourceColumns: ["Source", "Inquiries", "Calls booked", "Calls held", "Booked"],
    sourceNone: "No inquiries in this period.",

    gatesHeading: "Spend gates",
    gatesNote: "You apply these; the page only keeps count.",
    gatesNoStart: "The campaign has no first day yet. Add it below and the days are counted from there.",
    gatesNotBegun: "The campaign begins",
    gates: [
      {
        name: "Gate 1",
        when: "day 60 or 300 clicks",
        byDay: 60,
        byClicks: 300,
        needs: 1,
        counts: "inquiries",
        one: "inquiry from an ad click",
        many: "inquiries from ad clicks",
      },
      {
        name: "Gate 2",
        when: "day 90",
        byDay: 90,
        needs: 3,
        counts: "qualified",
        one: "qualified lead from an ad click",
        many: "qualified leads from ad clicks",
      },
      {
        name: "Gate 3",
        when: "day 180",
        byDay: 180,
        needs: 1,
        counts: "booked",
        one: "booking from an ad click",
        many: "bookings from ad clicks",
      },
    ],
    gateMet: "Met",
    gateNotYet: "Not yet",
    gateNotMet: "Not met",

    adsHeading: "This week, from Google Ads",
    adsNote: "Typed in once a week until the two are connected.",
    started: "First day of the campaign",
    spend: "Spend to date",
    clicks: "Clicks to date",
    save: "Save",
    lastSaved: "Last saved",
    costHeading: "Cost per qualified call held",
    costNone: "None so far from ads",
    costNoSpend: "Type in the spend to see this",
    costSoFar: "so far from ads",

    problems: {
      started: "The first day was not saved, because it was not a date. Everything else was.",
      spend: "The spend was not saved. Type an amount, like 690 or $690. Everything else was.",
      clicks: "The clicks were not saved. Type a whole number, like 96. Everything else was.",
      save: "Those numbers were not saved. The database did not answer. Please try again.",
    },

    testsNote: "Test inquiries are never counted here.",
    tooMany: "Only the 1,000 most recent leads are counted here, so these numbers are low.",
    unreadableHeading: "The report could not be read.",
  },
} as const;
