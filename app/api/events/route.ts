import { NextResponse } from "next/server";

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
  logo?: { url: string; original?: { url: string } };
  tags?: { tag: string; display_name?: string }[];
}

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
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatLocation(venue?: EventbriteVenue): string {
  if (!venue) return "TBD";
  const parts = [venue.name, venue.address?.city, venue.address?.region].filter(Boolean);
  if (parts.length === 0) return "TBD";
  return parts.join(", ");
}

function mapEvents(raw: EventbriteEvent[]) {
  return raw.map((e) => ({
    title: e.name.text,
    date: formatDate(e.start.local),
    time: formatTime(e.start.local, e.end.local),
    location: formatLocation(e.venue),
    description: e.summary ?? "",
    tag: e.tags?.[0]?.display_name ?? e.tags?.[0]?.tag ?? e.category?.name ?? "Event",
    signUpUrl: e.url,
    imageUrl: e.logo?.original?.url ?? e.logo?.url ?? null,
  }));
}

async function eb<T>(path: string, apiKey: string): Promise<{ ok: boolean; data: T }> {
  const res = await fetch(`https://www.eventbriteapi.com/v3${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  const data = (await res.json()) as T;
  return { ok: res.ok, data };
}

export async function GET() {
  const apiKey = process.env.EVENTBRITE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Eventbrite API key not configured" }, { status: 500 });
  }

  const upcomingParams = "?time_filter=current_future&expand=venue,category,logo,tags&order_by=start_asc";
  const pastParams     = "?time_filter=past&expand=venue,category,logo,tags&order_by=start_desc&page_size=3";

  try {
    const { ok: userOk, data: user } = await eb<{ id?: string; error_description?: string }>(
      "/users/me/",
      apiKey
    );

    if (!userOk || !user.id) {
      return NextResponse.json(
        { error: "Could not authenticate with Eventbrite" },
        { status: 502 }
      );
    }

    const { ok: orgsOk, data: orgsData } = await eb<{
      organizations?: { id: string }[];
    }>(`/users/${user.id}/organizations/`, apiKey);

    const orgId = orgsOk ? orgsData.organizations?.[0]?.id : undefined;
    const base = orgId ? `/organizations/${orgId}/events` : `/users/${user.id}/events`;

    const [{ ok: upOk, data: upData }, { data: pastData }] = await Promise.all([
      eb<{ events?: EventbriteEvent[]; error_description?: string }>(`${base}/${upcomingParams}`, apiKey),
      eb<{ events?: EventbriteEvent[] }>(`${base}/${pastParams}`, apiKey),
    ]);

    if (!upOk) {
      return NextResponse.json(
        { error: upData.error_description ?? "Failed to fetch events" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      events:     mapEvents(upData.events ?? []),
      pastEvents: mapEvents((pastData.events ?? []).slice(0, 3)),
    });
  } catch (err) {
    console.error("events route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch events from Eventbrite" },
      { status: 500 }
    );
  }
}
