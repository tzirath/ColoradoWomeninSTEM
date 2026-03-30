"use client";

import { useEffect } from "react";

export default function InitiativeTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, event_type: "view" }),
    }).catch(() => {});
  }, [slug]);

  return null;
}

export function trackSignupClick(slug: string) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, event_type: "signup_click" }),
  }).catch(() => {});
}
