import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page here is content, not application state, so everything that can
  // be static should be. Fast first paint is a ranking input, and a booker
  // deciding between speakers does not wait on a spinner.
  reactStrictMode: true,

  /**
   * WordPress serves these pages with a trailing slash (/speaking/, /about/).
   * Next.js defaults to serving them without one, which would make every
   * indexed URL a 308 to a slightly different address — survivable, but it
   * splits link signals and burns a redirect hop on every crawl.
   *
   * Matching WordPress exactly means the existing URLs keep resolving as
   * themselves, and there is nothing to redirect at all.
   */
  trailingSlash: true,

  /**
   * Redirects for paths that do NOT survive the move.
   *
   * The eight real pages — /, /about/, /speaking/, /books/, /books/restore/,
   * /writings-media/, /welch-family-foundation/, /contact/ — are reproduced at
   * their existing URLs and need no redirect. What is listed here is only the
   * WordPress plumbing and plausible legacy paths.
   *
   * This list is a starting guess. The authoritative version comes from Search
   * Console's Coverage report after cutover: every 404 that shows up there is a
   * URL something still links to, and each one belongs in this list. A redirect
   * preserves whatever ranking that URL earned; a 404 discards it.
   */
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/speaker", destination: "/speaking/", permanent: true },
      { source: "/speaking-engagements", destination: "/speaking/", permanent: true },
      { source: "/book", destination: "/books/", permanent: true },
      { source: "/contact-us", destination: "/contact/", permanent: true },
      { source: "/media", destination: "/writings-media/", permanent: true },
      // /articles/ and /search/ are empty template pages on the original whose
      // only posts are theme demo placeholders. Nothing worth reproducing, but
      // the URLs are indexed, so they point somewhere real instead of 404ing.
      { source: "/articles", destination: "/writings-media/", permanent: true },
      { source: "/search", destination: "/", permanent: true },
      { source: "/writings", destination: "/writings-media/", permanent: true },
      { source: "/press", destination: "/press-kit/", permanent: true },
      { source: "/foundation", destination: "/welch-family-foundation/", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
