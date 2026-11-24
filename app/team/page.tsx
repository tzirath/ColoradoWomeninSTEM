import TeamSection from "@/components/TeamSection";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Team | CWS",
  description: "Meet the founders and committee leads of Colorado Women in STEM.",
};

const DEFAULT_COMMITTEES = [
  { id: "1", name: "Social Media", description: "Share our story and grow our community across social media.", sort_order: 0 },
  { id: "2", name: "Outreach & Partnerships", description: "Find meaningful partnerships with external organizations and sponsors.", sort_order: 1 },
  { id: "3", name: "Community Service", description: "Seek out community-focused initiatives.", sort_order: 2 },
  { id: "4", name: "Professional Development", description: "Empower members with the tools and knowledge to thrive in their careers and beyond.", sort_order: 3 },
];

export default async function TeamPage() {
  const supabase = createClient();
  const [{ data: members }, { data: committeesData }, { data: contentRows }] = await Promise.all([
    supabase.from("team_members").select("*").eq("active", true).order("sort_order"),
    supabase.from("committees").select("*").order("sort_order"),
    supabase.from("site_content").select("key, value").in("key", ["committee_apply_url", "committee_apply_visible"]),
  ]);
  const committees = committeesData?.length ? committeesData : DEFAULT_COMMITTEES;
  const contentMap: Record<string, string> = {};
  contentRows?.forEach((r) => { contentMap[r.key] = r.value; });
  const applyUrl = contentMap["committee_apply_url"];
  const applyActive = applyUrl && contentMap["committee_apply_visible"] !== "false";

  return (
    <div className="min-h-screen bg-background pt-24">
      <TeamSection members={members ?? []} committees={committees} />

      {/* Apply to lead a committee */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-foreground/70 max-w-xl mx-auto">
            CWS runs through volunteer-led committees. Interested in leading one?{" "}
            {applyActive ? (
              <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">
                Apply here.
              </a>
            ) : (
              <a href="/contact" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">
                Get in touch.
              </a>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
