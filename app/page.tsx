import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";

export default async function Home() {
  const supabase = createClient();
  const { data } = await supabase
    .from("news_items")
    .select("text")
    .eq("active", true)
    .order("sort_order");

  const newsItems = data?.map((d) => d.text) ?? [
    "Applications open for the Spring 2025 Mentorship cohort — apply by April 30",
    "Skill Swap launch event coming this May — stay tuned for details",
    "Follow us on Instagram @coloradowomeninstem for updates",
  ];

  return <HomeClient newsItems={newsItems} />;
}
