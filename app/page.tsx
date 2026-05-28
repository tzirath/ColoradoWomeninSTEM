import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";

interface NextEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  signUpUrl: string;
}

function fmtDate(local: string): string {
  const [y, m, d] = local.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function fmtTime(start: string, end: string): string {
  const fmt = (s: string) => {
    const [h, min] = (s.split("T")[1] ?? "00:00").split(":").map(Number);
    return `${h % 12 || 12}:${String(min).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function fmtLocation(venue?: { name: string; address?: { city?: string; region?: string } }): string {
  if (!venue) return "Online";
  return [venue.name, venue.address?.city, venue.address?.region].filter(Boolean).join(", ");
}

async function fetchNextEvent(): Promise<NextEvent | null> {
  const apiKey = process.env.EVENTBRITE_API_KEY;
  if (!apiKey) return null;
  try {
    const headers = { Authorization: `Bearer ${apiKey}` };
    const opts = { headers, next: { revalidate: 300 } } as RequestInit;

    const userRes = await fetch("https://www.eventbriteapi.com/v3/users/me/", opts);
    if (!userRes.ok) return null;
    const user = await userRes.json();
    if (!user.id) return null;

    const orgsRes = await fetch(`https://www.eventbriteapi.com/v3/users/${user.id}/organizations/`, opts);
    const orgsData = orgsRes.ok ? await orgsRes.json() : {};
    const orgId = orgsData.organizations?.[0]?.id;

    const base = orgId
      ? `/organizations/${orgId}/events/`
      : `/users/${user.id}/events/`;
    const eventsRes = await fetch(
      `https://www.eventbriteapi.com/v3${base}?status=live&time_filter=current_future&expand=venue&order_by=start_asc`,
      opts
    );
    if (!eventsRes.ok) return null;
    const eventsData = await eventsRes.json();
    const e = eventsData.events?.[0];
    if (!e) return null;

    return {
      title: e.name.text,
      date: fmtDate(e.start.local),
      time: fmtTime(e.start.local, e.end.local),
      location: fmtLocation(e.venue),
      description: e.summary ?? "",
      signUpUrl: e.url,
    };
  } catch {
    return null;
  }
}

export default async function Home() {
  const supabase = createClient();
  const [{ data }, nextEvent, { data: galleryData }] = await Promise.all([
    supabase.from("news_items").select("text, link").eq("active", true).order("sort_order"),
    fetchNextEvent(),
    supabase.from("gallery_photos").select("id, url").order("sort_order").limit(6),
  ]);

  const newsItems = data?.map((d) => ({ text: d.text, link: d.link ?? null })) ?? [
    { text: "Applications open for the Spring 2025 Mentorship cohort — apply by April 30", link: "/get-involved" },
    { text: "Skill Swap launch event coming this May — stay tuned for details", link: "/initiatives/skill-swap" },
    { text: "Follow us on Instagram @coloradowomeninstem for updates", link: null },
  ];

  return (
    <HomeClient
      newsItems={newsItems}
      nextEvent={nextEvent}
      galleryPhotos={galleryData ?? []}
    />
  );
}
