import { Eye, Target, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import FlowerDecor from "@/components/FlowerDecor";

const DEFAULT_VALUES = [
  { id: "1", label: "Belonging", description: "Creating spaces where every woman feels she truly belongs — not just included, but centered.", sort_order: 0 },
  { id: "2", label: "Authenticity", description: "Showing up fully as ourselves, bringing lived experience and identity as assets, not obstacles.", sort_order: 1 },
  { id: "3", label: "Collective Growth", description: "When one of us grows, we all benefit. We rise by lifting each other.", sort_order: 2 },
  { id: "4", label: "Equity", description: "Acknowledging that equal is not always equitable — and designing our community with that in mind.", sort_order: 3 },
];

export const metadata = {
  title: "About | CWS",
  description: "The story, mission, vision, and values behind Colorado Women in STEM.",
};

const DEFAULTS: Record<string, string> = {
  about_story_p1: "Colorado Women in STEM (CWS) was created by two friends, Tzirath and Arianne, who recognized that existing systems weren't designed to fully support women in these fields. They envisioned a space rooted in genuine connection outside of traditional networking.",
  about_story_p2: "Today, CWS brings together women across STEM disciplines, uplifting those from historically marginalized communities. We strive to tackle the issues that often go unspoken, show up authentically, and use our collective experiences and expertise to create meaningful change. This is a space where belonging is the foundation of innovation and diverse perspectives drive discovery.",
  about_mission: "To cultivate an intentional space where women in STEM engage authentically, develop confidence through community support, and access opportunities through meaningful collaboration.",
  about_vision: "A Colorado where women don't just enter STEM, but stay, lead, and shape its future.",
};

export default async function AboutPage() {
  const supabase = createClient();
  const [{ data: contentRows }, { data: valuesRows }] = await Promise.all([
    supabase.from("site_content").select("key, value").in("key", ["about_story_p1", "about_story_p2", "about_mission", "about_vision", "about_story_image"]),
    supabase.from("core_values").select("*").order("sort_order"),
  ]);

  const c: Record<string, string> = { ...DEFAULTS };
  contentRows?.forEach((row) => { c[row.key] = row.value; });
  const values = valuesRows?.length ? valuesRows : DEFAULT_VALUES;

  return (
    <div className="min-h-screen bg-background pt-24">

      {/* Story */}
      <section className="py-20 bg-card relative overflow-hidden">
        <FlowerDecor flowers={[
          { src: 1, position: "-left-10 -bottom-4", size: 190, opacity: 0.65, anim: "cw",    dur: 27, mx: 20,  my: 11, td: 450 },
          { src: 2, position: "-right-8 top-6",     size: 160, opacity: 0.6,  anim: "drift", dur: 22, mx: 24,  my: 10, td: 410 },
        ]} />
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">Who We Are</p>
              <h1 className="font-body text-4xl md:text-5xl font-bold text-foreground mb-8">
                Our <span className="font-display italic text-primary">Story</span>
              </h1>
              <p className="font-body text-foreground text-lg leading-relaxed">{c.about_story_p1}</p>
              <p className="font-body text-foreground text-lg leading-relaxed mt-6">{c.about_story_p2}</p>
            </div>
            <div className="flex justify-center">
              <img
                src={c.about_story_image || "/cws-logo-sqr.png"}
                alt="Our Story"
                className="rounded-2xl w-full max-w-sm object-cover shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-20 bg-background relative overflow-hidden">
        <FlowerDecor flowers={[
          { src: 3, position: "-right-6 top-1/3", size: 145, opacity: 0.55, anim: "ccw", dur: 33, mx: -18, my: -9, td: 520 },
        ]} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-accent" />
              </div>
              <h2 className="font-body text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
              <p className="font-body text-foreground leading-relaxed">{c.about_mission}</p>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-accent" />
              </div>
              <h2 className="font-body text-2xl font-semibold text-foreground mb-4">Our Vision</h2>
              <p className="font-body text-foreground leading-relaxed">{c.about_vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-card relative overflow-hidden">
        <FlowerDecor flowers={[
          { src: 2, position: "-left-8  top-8",     size: 155, opacity: 0.6,  anim: "cw",    dur: 26, mx: 20,  my: 10, td: 460 },
          { src: 1, position: "-right-6 -bottom-4", size: 170, opacity: 0.55, anim: "drift", dur: 29, mx: 22,  my: 12, td: 420 },
        ]} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">What We Stand For</p>
            <h2 className="font-body text-4xl font-bold text-foreground">
              Core <span className="font-display italic text-primary">Values</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((v) => (
              <div key={v.label} className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-body text-lg font-semibold text-foreground mb-2">{v.label}</h3>
                <p className="font-body text-foreground/80 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
