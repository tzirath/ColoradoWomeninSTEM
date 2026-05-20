import Link from "next/link";
import { ArrowRight, Network, Repeat2, Wrench, Users, Mic } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import FlowerDecor, { BURGUNDY } from "@/components/FlowerDecor";

export const metadata = {
  title: "Initiatives | CWS",
  description: "Programs and initiatives of Colorado Women in STEM.",
};

const INITIATIVE_META = [
  { slug: "members-network", icon: Network, title: "Members Networking Database", tagline: "Find meaningful professional connections", contentKey: "initiative_members_network", defaultDesc: "A curated directory that helps members discover and connect with each other based on STEM field, interests, and career stage." },
  { slug: "skill-swap", icon: Repeat2, title: "Skill Swap", tagline: "Teach what you know. Learn what you don't.", contentKey: "initiative_skill_swap", defaultDesc: "Connect with members based on what you can teach and what you want to learn — building a true knowledge-sharing community." },
  { slug: "stem-in-action", icon: Wrench, title: "STEM in Action (Design Team)", tagline: "Apply your skills to real community needs", contentKey: "initiative_stem_in_action", defaultDesc: "Partner with community organizations to identify needs and apply members' technical skills towards solutions they help define." },
  { slug: "mentorship", icon: Users, title: "Mentorship", tagline: "Guidance for growth at every stage", contentKey: "initiative_mentorship", defaultDesc: "Pair members and offer guidance and advice for navigating careers, academia, and life in STEM as a woman of color." },
  { slug: "cws-voices", icon: Mic, title: "CWS Voices", tagline: "Navigate workplace challenges with community", contentKey: "initiative_cws_voices", defaultDesc: "Empower members with the resources and peer support to thoughtfully navigate ethical challenges and societal impact in STEM workplaces." },
];

export default async function InitiativesPage() {
  const supabase = createClient();
  const allKeys = INITIATIVE_META.flatMap((i) => [i.contentKey, `${i.contentKey}_tagline`]);
  const { data } = await supabase.from("site_content").select("key, value").in("key", allKeys);

  const contentMap: Record<string, string> = {};
  data?.forEach((row) => { contentMap[row.key] = row.value; });

  return (
    <div className="min-h-screen bg-background pt-24">
      <section className="py-20 bg-card relative overflow-hidden">
        <FlowerDecor flowers={[
          { src: 1, position: "-left-10 -bottom-4", size: 190, opacity: 0.7, anim: "cw",   dur: 26, mx: 22, my: 12, td: 450 },
          { src: 3, position: "-left-4  top-6",     size: 130, opacity: 0.55, anim: "ccw", dur: 32, mx: -14, my: -8, td: 550 },
          { src: 2, position: "-right-8 top-4",     size: 170, opacity: 0.65, anim: "drift", dur: 22, mx: 25, my: 10, td: 400, filter: BURGUNDY },
        ]} />
        <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">What We Do</p>
          <h1 className="font-body text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="font-display italic text-primary">Initiatives</span>
          </h1>
          <p className="font-body text-foreground/80 text-lg leading-relaxed">
            CWS programs are built by and for our members — designed to create real connection, develop real skills, and drive real change.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {INITIATIVE_META.map((item) => (
              <Link key={item.slug} href={`/initiatives/${item.slug}`}
                className="group bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h2 className="font-body text-xl font-semibold text-foreground mb-1">{item.title}</h2>
                <p className="font-body text-secondary text-sm font-medium mb-3 italic">{contentMap[`${item.contentKey}_tagline`] || item.tagline}</p>
                <p className="font-body text-foreground/80 text-sm leading-relaxed mb-4">
                  {contentMap[item.contentKey] || item.defaultDesc}
                </p>
                <span className="inline-flex items-center gap-1 text-primary font-body text-sm font-semibold group-hover:gap-2 transition-all">
                  Learn more <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
