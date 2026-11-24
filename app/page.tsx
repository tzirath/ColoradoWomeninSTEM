import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";
import { getPartifulEvents } from "@/lib/partiful";

async function fetchNextEvent() {
  try {
    const { events } = await getPartifulEvents();
    const e = events[0];
    if (!e) return null;
    return {
      title: e.title,
      date: e.date,
      time: e.time,
      location: e.location,
      description: e.description,
      signUpUrl: e.signUpUrl,
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
