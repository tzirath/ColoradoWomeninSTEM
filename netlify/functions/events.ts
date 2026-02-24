import type { Handler } from "@netlify/functions";

// ---------------------------------------------------------------------------
// Types for Eventbrite API response
// ---------------------------------------------------------------------------
interface EventbriteAddress {
  address_1?: string;
  city?: string;
  region?: string;
  localized_address_display?: string;
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

interface EventbriteResponse {
  events?: EventbriteEvent[];
  error?: string;
  error_description?: string;
}

// ---------------------------------------------------------------------------
// Date / time helpers (no external deps needed in Node)
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

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
const handler: Handler = async () => {
  const headers = { "Content-Type": "application/json" };
  const apiKey = process.env.EVENTBRITE_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Eventbrite API key not configured" }),
    };
  }

  try {
    const url =
      "https://www.eventbriteapi.com/v3/me/events/" +
      "?status=live" +
      "&time_filter=current_future" +
      "&expand=venue,category" +
      "&order_by=start_asc";

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = (await res.json()) as EventbriteResponse;

    if (!res.ok) {
      console.error("Eventbrite error:", data);
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: data.error_description ?? "Eventbrite API error" }),
      };
    }

    const events = (data.events ?? []).map((e) => ({
      title: e.name.text,
      date: formatDate(e.start.local),
      time: formatTime(e.start.local, e.end.local),
      location: formatLocation(e.venue),
      description: e.summary ?? "",
      tag: e.category?.name ?? "Event",
      signUpUrl: e.url,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ events }),
    };
  } catch (err) {
    console.error("events function error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch events from Eventbrite" }),
    };
  }
};

export { handler };
