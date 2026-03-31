import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";

export default async function Home() {
  const supabase = createClient();
  const { data } = await supabase
    .from("news_items")
    .select("text, link")
    .eq("active", true)
    .order("sort_order");

  const newsItems = data?.map((d) => ({ text: d.text, link: d.link ?? null })) ?? [
    { text: "Applications open for the Spring 2025 Mentorship cohort — apply by April 30", link: "/get-involved" },
    { text: "Skill Swap launch event coming this May — stay tuned for details", link: "/initiatives/skill-swap" },
    { text: "Follow us on Instagram @coloradowomeninstem for updates", link: null },
  ];

  return <HomeClient newsItems={newsItems} />;
}
