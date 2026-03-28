"use client";

import HeroSection from "@/components/HeroSection";
import { useJoinModal } from "@/components/JoinModalContext";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";

const NEWS_ITEMS = [
  "Applications open for the Spring 2025 Mentorship cohort — apply by April 30",
  "Skill Swap launch event coming this May — stay tuned for details",
  "Follow us on Instagram @coloradowomeninstem for updates",
];

export default function Home() {
  const { openModal } = useJoinModal();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <HeroSection onJoinClick={openModal} />

      {/* News / Updates Banner */}
      <div className="bg-secondary/10 border-y border-secondary/20 py-3">
        <div className="container mx-auto px-6 flex items-start gap-3">
          <Megaphone size={16} className="text-secondary mt-0.5 shrink-0" />
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1">
            {NEWS_ITEMS.map((item) => (
              <li key={item} className="font-body text-sm text-foreground/80">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mission blurb */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-4">
            Our Purpose
          </p>
          <h2 className="font-body text-3xl md:text-4xl font-bold text-foreground mb-6">
            A space where{" "}
            <span className="font-display italic text-primary">belonging</span>{" "}
            drives innovation
          </h2>
          <p className="font-body text-foreground/80 text-lg leading-relaxed mb-8">
            Colorado Women of Color in STEM cultivates an intentional space where women of color
            engage authentically, develop confidence through community support, and access
            opportunities through meaningful collaboration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-7 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Our Story <ArrowRight size={16} />
            </Link>
            <Link
              href="/initiatives"
              className="inline-flex items-center gap-2 border-2 border-primary text-primary font-body font-semibold px-7 py-3 rounded-lg hover:bg-primary/5 transition-colors"
            >
              Our Initiatives
            </Link>
          </div>
        </div>
      </section>

      {/* Core values strip */}
      <section className="py-14 bg-background border-y border-border">
        <div className="container mx-auto px-6">
          <ul className="flex flex-wrap justify-center gap-8">
            {["Belonging", "Authenticity", "Collective Growth", "Equity"].map((value) => (
              <li key={value} className="text-center">
                <span className="font-display italic text-primary text-2xl">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-body text-3xl font-bold text-primary-foreground mb-4">
            Ready to join the community?
          </h2>
          <p className="font-body text-bloom-sage mb-8 max-w-xl mx-auto">
            Connect with women of color in STEM across Colorado. Membership is free and open to all.
          </p>
          <button
            onClick={openModal}
            className="bg-secondary text-white font-body font-semibold text-lg px-10 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Become a Member
          </button>
        </div>
      </section>
    </div>
  );
}
