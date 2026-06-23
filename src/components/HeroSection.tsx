"use client";

import Image from "next/image";

interface HeroSectionProps {
  onJoinClick: () => void;
}

const HeroSection = ({ onJoinClick }: HeroSectionProps) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bloom.png"
          alt="Women collaborating in STEM"
          fill
          priority
          className="object-cover object-[center_30%]" />

        <div className="absolute inset-0 bg-gradient-to-r from-bloom-green-dark/90 via-bloom-green-dark/70 to-transparent" />
      </div>

      <div className="relative container mx-auto px-6 py-32">
        <div className="max-w-2xl animate-fade-in-up">
          <p className="font-body text-white/70 text-sm uppercase tracking-[0.25em] mb-4">
            Denver, Colorado
          </p>
          <h1 className="font-body text-5xl md:text-6xl font-bold text-white leading-none mb-6">Colorado

            <br />
            <span className="font-display italic text-secondary text-6xl md:text-7xl block mt-4">Women in STEM</span>
          </h1>
          <p className="font-body text-lg text-white/85 max-w-lg mb-8 leading-relaxed">Colorado Women in STEM is a community rooted in belonging, built to amplify underrepresented women across every STEM discipline in Colorado
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onJoinClick}
              className="bg-secondary text-secondary-foreground font-body font-semibold text-lg px-9 py-3.5 rounded-lg hover:opacity-90 transition-opacity">
              Get Updates
            </button>
            <a
              href="/about"
              className="inline-block border-2 border-white/60 text-white font-body font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>);

};

export default HeroSection;
