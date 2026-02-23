import { Eye, Target, Heart } from "lucide-react";

const items = [
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "A world where BIPOC women and those from historically marginalized backgrounds are equally represented and celebrated in every STEM field — where belonging is the foundation of innovation.",
  },
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To cultivate belonging through intentional gatherings that encourage authenticity and collective growth for women in STEM across the Denver metro area.",
  },
  {
    icon: Heart,
    title: "Core Values",
    description:
      "Belonging • Authenticity • Collective Growth • Equity • Community. We believe in creating intentional spaces where women can show up as their full selves and become stronger together.",
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
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            About <span className="text-primary italic">Bloom</span>
          </h2>
           <p className="font-body text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
            Founded in Denver, Bloom is a community for women in STEM rooted in
            uplifting BIPOC women and those from historically marginalized
            backgrounds. This is a space where women can become stronger
            together.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="group bg-background rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-border"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed text-sm">
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
