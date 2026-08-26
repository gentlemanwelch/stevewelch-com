import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/**
 * The social card, generated at build time rather than designed in Figma and
 * forgotten. It is what appears when an organizer pastes a link into Slack or
 * an email to their committee — which is often the first impression a whole
 * decision-making group gets of this site.
 *
 * Deliberately typographic: no photograph is required, so it cannot break when
 * one is swapped out, and it renders identically for every page.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#fbfaf8",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#9a3412",
              fontWeight: 600,
            }}
          >
            Keynote Speaker
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 92,
              lineHeight: 1.05,
              color: "#16181d",
              letterSpacing: -2,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 34,
              lineHeight: 1.35,
              color: "#4a4f57",
              maxWidth: 880,
            }}
          >
            Entrepreneurship, leadership, and human performance
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 56,
            borderTop: "2px solid #e4e0da",
            paddingTop: 28,
            fontSize: 26,
            color: "#767c86",
          }}
        >
          stevewelch.com
        </div>
      </div>
    ),
    size,
  );
}
