import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin | CWS" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page is inside this layout but must be publicly accessible
  // Auth check is handled by middleware + the login page itself
  // Just render children — middleware already redirects unauthenticated requests
  return <>{children}</>;
}
