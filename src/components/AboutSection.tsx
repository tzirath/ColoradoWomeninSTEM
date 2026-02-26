import { Eye, Target, Heart } from "lucide-react";

const items = [
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "Equal representation and celebration of BIPOC women across every STEM discipline in Colorado. Where belonging is the foundation of innovation and diverse perspectives drive discovery.",
  },
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To cultivate intentional spaces where women in STEM across Colorado build authentic professional relationships, develop confidence through community support, and access opportunities through meaningful collaboration. We are rooted in uplifting BIPOC women and historically marginalized communities through dedicated programming and intentional inclusion.",
  },
  {
    icon: Heart,
    title: "Core Values",
    description:
      "Belonging • Authenticity • Collective Growth • Equity • Collaboration We believe in bringing your full self to every interaction, where individual achievement strengthens the collective. When one of us grows, we all benefit.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
            Who We Are
          </p>
          <h2 className="font-body text-4xl md:text-5xl font-bold text-foreground">
            About <span className="font-display text-primary italic">CWS</span>
          </h2>
           <p className="font-body text-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
Colorado Women in STEM was founded by two friends, Tzirath and Arianne, 
who recognized a need for deeper connection within the STEM community. 
Beyond traditional networking, they envisioned a space where women could 
engage authentically, support one another's growth, and build meaningful 
professional relationships.

Today, CWS cultivates belonging through intentional gatherings that 
encourage authenticity and collective advancement. Our community serves 
all women in STEM fields with a focus on uplifting BIPOC women and those 
from historically marginalized backgrounds.

This is a space where women can become stronger together.

          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="group bg-background rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-border"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <item.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-body text-xl font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="font-body text-foreground leading-relaxed text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
