"use client";

import { useEffect } from "react";
import { track, type EngagementEvent } from "@/lib/analytics";

/**
 * Every tracked interaction on the site, through two delegated listeners.
 *
 * WHY DELEGATION. The alternative — an onClick on each tracked button — needs
 * each of those buttons, and therefore each SECTION they sit in, to be a
 * client component. That would move the homepage's content out of the static
 * HTML and into hydration, where GPTBot, ClaudeBot and PerplexityBot cannot
 * see it (they execute no JavaScript). So the buttons stay server-rendered and
 * carry plain data attributes, and this one component reads them:
 *
 *   data-track="build_your_keynote_click"   on any link or button — fires on click
 *   data-track-open="watch_speaking_reel"   on a <details> — fires when opened
 *   data-track-location="hero"              where on the page, sent as a param
 *
 * `toggle` does not bubble, so that listener is registered in the capture
 * phase, which does reach the document.
 */
export function TrackEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const params: Record<string, string> = {};
      if (el.dataset.trackLocation) params.location = el.dataset.trackLocation;
      if (el.dataset.trackLabel) params.label = el.dataset.trackLabel;
      track(el.dataset.track as EngagementEvent, params);
    };

    const onToggle = (e: Event) => {
      const el = e.target as HTMLDetailsElement;
      if (!el.open || !el.dataset?.trackOpen) return;
      const params: Record<string, string> = { action: "play" };
      if (el.dataset.trackLocation) params.location = el.dataset.trackLocation;
      track(el.dataset.trackOpen as EngagementEvent, params);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("toggle", onToggle, true);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, []);

  return null;
}
