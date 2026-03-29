import TeamSection from "@/components/TeamSection";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Team | CWS",
  description: "Meet the founders and committee leads of Colorado Women of Color in STEM.",
};

const committees = [
  {
    name: "Social",
    description: "Plan events that bring members together.",
    chair: "TBD",
  },
  {
    name: "Outreach & Partnerships",
    description: "Find meaningful partnerships with external organizations and sponsors.",
    chair: "TBD",
  },
  {
    name: "Community Service",
    description: "Seek out community-focused initiatives.",
    chair: "TBD",
  },
  {
    name: "Professional Development",
    description: "Empower members with the tools and knowledge to thrive in their careers and beyond.",
    chair: "TBD",
  },
];

export default async function TeamPage() {
  const supabase = createClient();
  const { data: members } = await supabase
    .from("team_members")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  return (
    <div className="min-h-screen bg-background pt-24">
      <TeamSection members={members ?? []} />

      {/* Committees */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
              How We Operate
            </p>
            <h2 className="font-body text-4xl font-bold text-foreground">
              Our <span className="font-display italic text-primary">Committees</span>
            </h2>
            <p className="font-body text-foreground/70 mt-4 max-w-xl mx-auto">
              CWS runs through volunteer-led committees. Interested in leading one?{" "}
              <a href="/contact" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">
                Get in touch.
              </a>
            </p>
          </div>

          <div className="overflow-x-auto max-w-4xl mx-auto">
            <table className="w-full font-body text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10 text-left">
                  <th className="px-6 py-4 font-semibold text-foreground rounded-tl-xl">Committee</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Description</th>
                  <th className="px-6 py-4 font-semibold text-foreground rounded-tr-xl">Chair</th>
                </tr>
              </thead>
              <tbody>
                {committees.map((c, i) => (
                  <tr
                    key={c.name}
                    className={`border-b border-border transition-colors hover:bg-primary/5 ${
                      i % 2 === 0 ? "bg-background" : "bg-card"
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-foreground">{c.name}</td>
                    <td className="px-6 py-4 text-foreground/80">{c.description}</td>
                    <td className="px-6 py-4 text-foreground/60 italic">{c.chair}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
