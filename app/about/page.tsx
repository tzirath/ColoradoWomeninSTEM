import { Eye, Target, Heart } from "lucide-react";

const values = [
  { label: "Belonging", description: "Creating spaces where every woman of color feels she truly belongs — not just included, but centered." },
  { label: "Authenticity", description: "Showing up fully as ourselves, bringing lived experience and identity as assets, not obstacles." },
  { label: "Collective Growth", description: "When one of us grows, we all benefit. We rise by lifting each other." },
  { label: "Equity", description: "Acknowledging that equal is not always equitable — and designing our community with that in mind." },
];

export const metadata = {
  title: "About | CWS",
  description: "The story, mission, vision, and values behind Colorado Women of Color in STEM.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24">

      {/* Story */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 max-w-3xl">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
            Who We Are
          </p>
          <h1 className="font-body text-4xl md:text-5xl font-bold text-foreground mb-8">
            Our <span className="font-display italic text-primary">Story</span>
          </h1>
          <p className="font-body text-foreground text-lg leading-relaxed">
            Colorado Women of Color in STEM (CWS) was created by two friends, Tzirath and Arianne,
            who recognized that existing systems weren't designed to fully support BIPOC women in
            these fields. They envisioned a space rooted in genuine connection outside of traditional
            networking.
          </p>
          <p className="font-body text-foreground text-lg leading-relaxed mt-6">
            Today, CWS brings together women across STEM disciplines, centering and uplifting those
            from historically marginalized communities. We strive to tackle the issues that often go
            unspoken, show up authentically, and use our collective experiences and expertise to
            create meaningful change. This is a space where belonging is the foundation of innovation
            and diverse perspectives drive discovery.
          </p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-accent" />
              </div>
              <h2 className="font-body text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
              <p className="font-body text-foreground leading-relaxed">
                To cultivate an intentional space where women of color in STEM engage authentically,
                develop confidence through community support, and access opportunities through
                meaningful collaboration.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-accent" />
              </div>
              <h2 className="font-body text-2xl font-semibold text-foreground mb-4">Our Vision</h2>
              <p className="font-body text-foreground leading-relaxed">
                A Colorado where women of color don't just enter STEM, but stay, lead, and shape
                its future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
              What We Stand For
            </p>
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
