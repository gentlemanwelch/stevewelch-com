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

  leads: {
    title: "Leads",
    heading: "Leads",
    summary: "Every inquiry sent through the site is being saved.",
    pendingHeading: "The list is the next step.",
    pendingBody:
      "This is the door: the private area exists and only you can open it. The list of leads, and a page for each one, arrive next.",
  },
} as const;
