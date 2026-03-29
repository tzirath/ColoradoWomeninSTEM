"use client";

import HeroSection from "@/components/HeroSection";
import NewsBanner from "@/components/NewsBanner";
import { useJoinModal } from "@/components/JoinModalContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeClient({ newsItems }: { newsItems: string[] }) {
  const { openModal } = useJoinModal();

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onJoinClick={openModal} />
      <NewsBanner items={newsItems} />

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
