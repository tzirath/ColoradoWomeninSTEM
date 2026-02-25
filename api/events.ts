import type { VercelRequest, VercelResponse } from "@vercel/node";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface EventbriteAddress {
  city?: string;
  region?: string;
}

interface EventbriteVenue {
  name: string;
  address?: EventbriteAddress;
}

interface EventbriteEvent {
  id: string;
  name: { text: string };
  summary?: string;
  start: { local: string };
  end: { local: string };
  url: string;
  venue?: EventbriteVenue;
  category?: { name: string };
}

// ---------------------------------------------------------------------------
// Date / time helpers
// ---------------------------------------------------------------------------
function formatDate(local: string): string {
  const [datePart] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(start: string, end: string): string {
  const fmt = (local: string) => {
    const timePart = local.split("T")[1] ?? "00:00";
    const [h, min] = timePart.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${min.toString().padStart(2, "0")} ${ampm}`;
  };
  return `${fmt(start)} \u2013 ${fmt(end)}`;
}

function formatLocation(venue?: EventbriteVenue): string {
  if (!venue) return "Online";
  const parts = [venue.name, venue.address?.city, venue.address?.region].filter(Boolean);
  return parts.join(", ");
}

function mapEvents(raw: EventbriteEvent[]) {
  return raw.map((e) => ({
    title: e.name.text,
    date: formatDate(e.start.local),
    time: formatTime(e.start.local, e.end.local),
    location: formatLocation(e.venue),
    description: e.summary ?? "",
    tag: e.category?.name ?? "Event",
    signUpUrl: e.url,
  }));
}

// ---------------------------------------------------------------------------
// Shared fetch helper
// ---------------------------------------------------------------------------
async function eb<T>(
  path: string,
  apiKey: string
): Promise<{ ok: boolean; status: number; data: T }> {
  const base = "https://www.eventbriteapi.com/v3";
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = (await res.json()) as T;
  return { ok: res.ok, status: res.status, data };
}

// ---------------------------------------------------------------------------
// Handler — tries org events first, falls back to user events
// ---------------------------------------------------------------------------
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  const apiKey = process.env.EVENTBRITE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Eventbrite API key not configured" });
  }

  const eventParams =
    "?status=live&time_filter=current_future&expand=venue,category&order_by=start_asc";

  try {
    // Step 1 — get current user
    const { ok: userOk, data: user } = await eb<{
      id?: string;
      error_description?: string;
    }>("/users/me/", apiKey);

    if (!userOk || !user.id) {
      console.error("Could not resolve Eventbrite user:", user);
      return res
        .status(502)
        .json({ error: "Could not authenticate with Eventbrite" });
    }

    const userId = user.id;

    // Step 2 — try to get the first organization this user belongs to
    const { ok: orgsOk, data: orgsData } = await eb<{
      organizations?: { id: string }[];
    }>(`/users/${userId}/organizations/`, apiKey);

    const orgId = orgsOk
      ? (orgsData as { organizations?: { id: string }[] }).organizations?.[0]?.id
      : undefined;

    // Step 3 — fetch events: prefer org events, fall back to user events
    const eventsPath = orgId
      ? `/organizations/${orgId}/events/${eventParams}`
      : `/users/${userId}/events/${eventParams}`;

    const { ok: eventsOk, data: eventsData } = await eb<{
      events?: EventbriteEvent[];
      error_description?: string;
    }>(eventsPath, apiKey);

    if (!eventsOk) {
      console.error("Eventbrite events error:", eventsData);
      return res.status(502).json({
        error: eventsData.error_description ?? "Failed to fetch events",
      });
    }

    const events = mapEvents(eventsData.events ?? []);
    return res.status(200).json({ events });
  } catch (err) {
    console.error("events function error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch events from Eventbrite" });
  }
}
