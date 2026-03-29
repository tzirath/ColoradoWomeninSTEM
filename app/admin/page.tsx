import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const supabase = createClient();
  const [
    { data: { user } },
    { data: newsItems },
    { data: teamMembers },
    { data: siteContent },
    { data: coreValues },
    { data: openRoles },
    { data: committees },
    { data: members },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("news_items").select("*").order("sort_order"),
    supabase.from("team_members").select("*").order("sort_order"),
    supabase.from("site_content").select("key, value"),
    supabase.from("core_values").select("*").order("sort_order"),
    supabase.from("open_roles").select("*").order("sort_order"),
    supabase.from("committees").select("*").order("sort_order"),
    supabase.from("members").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <AdminDashboard
      user={user!}
      initialNewsItems={newsItems ?? []}
      initialTeamMembers={teamMembers ?? []}
      initialContent={siteContent ?? []}
      initialCoreValues={coreValues ?? []}
      initialOpenRoles={openRoles ?? []}
      initialCommittees={committees ?? []}
      initialMembers={members ?? []}
    />
  );
}
