"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import { useJoinModal } from "@/components/JoinModalContext";
import Link from "next/link";
import { ArrowRight, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";

const NEWS_ITEMS = [
  "Applications open for the Spring 2025 Mentorship cohort — apply by April 30",
  "Skill Swap launch event coming this May — stay tuned for details",
  "Follow us on Instagram @coloradowomeninstem for updates",
];

function NewsBanner() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");

  const goTo = (index: number, dir: "left" | "right") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  };

  const prev = () => goTo((current - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length, "right");
  const next = () => goTo((current + 1) % NEWS_ITEMS.length, "left");

  // Auto-rotate every 4s
  useEffect(() => {
    const id = setInterval(() => goTo((current + 1) % NEWS_ITEMS.length, "left"), 4000);
    return () => clearInterval(id);
  }, [current]);

  return (
    <div className="bg-secondary/10 border-y border-secondary/20 py-4">
      <div className="container mx-auto px-6 flex items-center justify-center gap-4">
        {/* Arrows */}
        <button onClick={prev} className="text-foreground/40 hover:text-secondary transition-colors shrink-0" aria-label="Previous">
          <ChevronLeft size={18} />
        </button>

        {/* Slider */}
        <div className="flex-1 max-w-2xl overflow-hidden relative h-7 flex items-center justify-center">
          <p
            key={current}
            className="font-body text-base font-semibold text-foreground absolute w-full text-center flex items-center justify-center gap-2"
            style={{
              animation: animating
                ? direction === "left"
                  ? "slideOutLeft 0.3s ease forwards"
                  : "slideOutRight 0.3s ease forwards"
                : direction === "left"
                  ? "slideInLeft 0.3s ease forwards"
                  : "slideInRight 0.3s ease forwards",
            }}
          >
            <Megaphone size={16} className="text-secondary shrink-0" />
            {NEWS_ITEMS[current]}
          </p>
        </div>

        <button onClick={next} className="text-foreground/40 hover:text-secondary transition-colors shrink-0" aria-label="Next">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-1.5 mt-2">
        {NEWS_ITEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "left" : "right")}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === current ? "bg-secondary" : "bg-secondary/30"
            }`}
            aria-label={`Go to item ${i + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-40px); opacity: 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(-40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const { openModal } = useJoinModal();

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onJoinClick={openModal} />

      <NewsBanner />

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
