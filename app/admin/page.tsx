import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: newsItems } = await supabase.from("news_items").select("*").order("sort_order");
  const { data: teamMembers } = await supabase.from("team_members").select("*").order("sort_order");
  const { data: siteContent } = await supabase.from("site_content").select("key, value");

  return (
    <AdminDashboard
      user={user!}
      initialNewsItems={newsItems ?? []}
      initialTeamMembers={teamMembers ?? []}
      initialContent={siteContent ?? []}
    />
  );
}
