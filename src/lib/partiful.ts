// ============================================================
// PARTIFUL EVENTS
// ============================================================
// Partiful has no public API. This reads the CWS public profile page
// (which lists our events) and then each event's public page (which has
// the description and location). Both pages embed their data as JSON in
// a <script id="__NEXT_DATA__"> tag.
//
// Every event published from the CWS Partiful account shows up on the site
// automatically. Results are cached for an hour.
//
// This is unofficial: if Partiful changes its site, parsing may fail. In
// that case we serve the last events we loaded successfully.

export const PARTIFUL_PROFILE_URL =
  process.env.PARTIFUL_PROFILE_URL ?? "https://partiful.com/u/pZUMCHo0w9UrZUrrbTqR";

const REVALIDATE_SECONDS = 60 * 60;
const MAX_EVENT_PAGES = 12;
const PAST_EVENTS_SHOWN = 3;

export interface SiteEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tag: string;
  signUpUrl: string;
  imageUrl: string | null;
}

export interface SiteEvents {
  events: SiteEvent[];
  pastEvents: SiteEvent[];
}

interface PartifulEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  timezone?: string;
  status?: string;
  description?: string;
  location?: string;
  locationInfo?: {
    neighborhood?: string;
    mapsInfo?: { name?: string; approximateLocation?: string; addressLines?: string[] };
  };
  image?: { url?: string };
}

let lastGood: SiteEvents | null = null;

async function fetchNextData(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; CWS-website/1.0)" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Partiful ${url} returned ${res.status}`);
  const html = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`No __NEXT_DATA__ on ${url}`);
  const data = JSON.parse(match[1]);
  return data?.props?.pageProps ?? {};
}

function formatDate(iso: string, tz: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: tz,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(start: string, end: string | null | undefined, tz: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function formatLocation(e: PartifulEvent): string {
  if (e.location) return e.location;
  const maps = e.locationInfo?.mapsInfo;
  const parts = [maps?.name ?? e.locationInfo?.neighborhood, maps?.approximateLocation].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location TBA";
}

// Partiful has no categories, so guess a badge from the title.
function guessTag(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("volunteer")) return "Volunteer";
  if (t.includes("workshop")) return "Workshop";
  if (/panel|talk|speaker|lecture/.test(t)) return "Talk";
  if (/summit|conference/.test(t)) return "Conference";
  if (/social|mixer|connect|potluck|night out|happy hour|friendsgiving|party/.test(t)) return "Social";
  return "Event";
}

function toSiteEvent(e: PartifulEvent): SiteEvent {
  const tz = e.timezone || "America/Denver";
  return {
    title: e.title,
    date: formatDate(e.startDate, tz),
    time: formatTime(e.startDate, e.endDate, tz),
    location: formatLocation(e),
    description: (e.description ?? "").trim(),
    tag: guessTag(e.title),
    signUpUrl: `https://partiful.com/e/${e.id}`,
    imageUrl: e.image?.url ?? null,
  };
}

async function loadEvents(): Promise<SiteEvents> {
  const profile = await fetchNextData(PARTIFUL_PROFILE_URL);
  const listed = profile.initialPublishedEvents;
  if (!Array.isArray(listed)) throw new Error("Partiful profile has no event list");

  const summaries = (listed as PartifulEvent[])
    .filter((e) => e?.id && e.title && e.startDate && (e.status ?? "PUBLISHED") === "PUBLISHED")
    .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
    .slice(0, MAX_EVENT_PAGES);

  // Event pages add description + location; fall back to the summary if one fails.
  const detailed = await Promise.all(
    summaries.map(async (summary) => {
      try {
        const page = await fetchNextData(`https://partiful.com/e/${summary.id}`);
        const event = page.event as PartifulEvent | undefined;
        return event?.id ? { ...summary, ...event } : summary;
      } catch {
        return summary;
      }
    })
  );

  const now = Date.now();
  const endOf = (e: PartifulEvent) => Date.parse(e.endDate ?? e.startDate);

  const upcoming = detailed
    .filter((e) => endOf(e) >= now)
    .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
  const past = detailed
    .filter((e) => endOf(e) < now)
    .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
    .slice(0, PAST_EVENTS_SHOWN);

  return {
    events: upcoming.map(toSiteEvent),
    // Past cards only show title/date/location; don't ship descriptions (they can contain contact details).
    pastEvents: past.map((e) => ({ ...toSiteEvent(e), description: "" })),
  };
}

/** Upcoming and recent past events from the CWS Partiful profile. Throws only if nothing has ever loaded. */
export async function getPartifulEvents(): Promise<SiteEvents> {
  try {
    lastGood = await loadEvents();
    return lastGood;
  } catch (err) {
    console.error("Partiful events error:", err);
    if (lastGood) return lastGood;
    throw err;
  }
}
