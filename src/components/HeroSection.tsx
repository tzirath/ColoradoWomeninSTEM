import heroImage from "@/assets/hero-bloom.jpg";

interface HeroSectionProps {
  onJoinClick: () => void;
}

const HeroSection = ({ onJoinClick }: HeroSectionProps) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Women collaborating in STEM"
          className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-r from-bloom-green-dark/90 via-bloom-green-dark/70 to-transparent" />
      </div>

      <div className="relative container mx-auto px-6 py-32">
        <div className="max-w-2xl animate-fade-in-up">
          <p className="font-body text-bloom-sage text-sm uppercase tracking-[0.25em] mb-4">
            Colorado
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-tight mb-6">Colorado

            <br />
            <span className="italic text-primary-foreground">Women in STEM</span>
          </h1>
          <p className="font-body text-lg text-bloom-sage max-w-lg mb-8 leading-relaxed">CWS is a community for women in STEM rooted in uplifting BIPOC women and those from historically marginalized backgrounds. We cultivate belonging through intentional gatherings that encourage authenticity and collective growth. This is a space where women can become stronger together.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onJoinClick}
              className="bg-secondary text-secondary-foreground font-body font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
              Join CWS
            </button>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-block border-2 border-bloom-sage text-bloom-sage font-body font-semibold px-8 py-3 rounded-lg hover:bg-bloom-sage/10 transition-colors">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>);

};

export default HeroSection;
