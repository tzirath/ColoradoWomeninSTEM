import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin | CWS" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: allowed } = await supabase
    .from("admin_emails")
    .select("email")
    .eq("email", user.email)
    .single();

  if (!allowed) redirect("/admin/login?error=unauthorized");

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
