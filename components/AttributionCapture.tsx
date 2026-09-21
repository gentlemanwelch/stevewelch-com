"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records a paid click the moment it lands, on ANY page.
 *
 * Mounted in the root layout rather than beside the forms, because the page an
 * ad lands on is rarely the page the organiser converts on. See the note at the
 * top of lib/attribution.ts for the journey this exists to rescue.
 *
 * Renders nothing. Runs in an effect because it reads window.location, which
 * does not exist during prerendering.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
