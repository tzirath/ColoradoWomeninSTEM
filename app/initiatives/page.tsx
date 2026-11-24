import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import FlowerDecor from "@/components/FlowerDecor";
import { VISIBLE_INITIATIVES, INITIATIVES_INTRO } from "@/data/initiatives";

export const metadata = {
  title: "Initiatives | CWS",
  description: "Programs and initiatives of Colorado Women in STEM.",
};

export default async function InitiativesPage() {
  const supabase = createClient();
  const { data } = await supabase.from("site_content").select("key, value").in("key", VISIBLE_INITIATIVES.map((i) => i.imageKey));
  const images: Record<string, string> = {};
  data?.forEach((row) => { if (row.value) images[row.key] = row.value; });

  return (
    <div className="min-h-screen bg-background pt-24">
      <section className="py-20 bg-card relative overflow-hidden">
        <FlowerDecor flowers={[
          { src: 1, position: "-left-10 -bottom-4", size: 190, opacity: 0.7, anim: "cw",   dur: 26, mx: 22, my: 12, td: 450 },
          { src: 3, position: "-left-4  top-6",     mobileHide: true, size: 130, opacity: 0.55, anim: "ccw", dur: 32, mx: -14, my: -8, td: 550 },
          { src: 2, position: "-right-8 top-4",     mobileHide: true, size: 170, opacity: 0.65, anim: "drift", dur: 22, mx: 25, my: 10, td: 400 },
          { src: 1, position: "right-6 top-6 md:hidden", size: 68,  opacity: 0.75, anim: "cw",  dur: 20, mx: 14, my: 7, td: 360 },
        ]} />
        <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">What We Do</p>
          <h1 className="font-body text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="font-display italic text-primary">Initiatives</span>
          </h1>
          <p className="font-body text-foreground/80 text-lg leading-relaxed">
            {INITIATIVES_INTRO}
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {VISIBLE_INITIATIVES.map((item) => (
              <Link key={item.slug} href={`/initiatives/${item.slug}`}
                className="group bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
                {images[item.imageKey] && (
                  <div className="-mx-8 -mt-8 mb-6 aspect-[16/9] overflow-hidden rounded-t-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={images[item.imageKey]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h2 className="font-body text-xl font-semibold text-foreground mb-1">{item.name}</h2>
                <p className="font-body text-secondary text-sm font-medium mb-3 italic">{item.tagline}</p>
                <p className="font-body text-foreground/80 text-sm leading-relaxed mb-4">
                  {item.shortDescription}
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
