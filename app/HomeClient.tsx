"use client";

import HeroSection from "@/components/HeroSection";
import NewsBanner from "@/components/NewsBanner";
import { useJoinModal } from "@/components/JoinModalContext";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BURGUNDY } from "@/components/FlowerDecor";

interface NextEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  signUpUrl: string;
}

export default function HomeClient({
  newsItems,
  nextEvent,
}: {
  newsItems: { text: string; link: string | null }[];
  nextEvent: NextEvent | null;
}) {
  const { openModal } = useJoinModal();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onJoinClick={openModal} />
      <NewsBanner items={newsItems} />

      {/* ── Featured Next Event ── */}
      {nextEvent && (
        <section className="py-14 bg-secondary/10 border-b border-secondary/20">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center gap-8 justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-body text-secondary text-xs uppercase tracking-[0.25em] font-semibold mb-2">
                  You&apos;re Invited
                </p>
                <h2 className="font-body text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                  {nextEvent.title}
                </h2>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-foreground/65 font-body mb-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-secondary shrink-0" /> {nextEvent.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-secondary shrink-0" /> {nextEvent.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-secondary shrink-0" /> {nextEvent.location}
                  </span>
                </div>
                {nextEvent.description && (
                  <p className="font-body text-foreground/65 text-sm leading-relaxed line-clamp-2">
                    {nextEvent.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <a
                  href={nextEvent.signUpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-secondary text-white font-body font-semibold px-7 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Save My Spot <ArrowRight size={15} />
                </a>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center font-body text-sm text-secondary hover:underline underline-offset-2 transition-colors"
                >
                  View all events
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission blurb */}
      <section className="py-20 bg-card relative overflow-hidden">
        <style>{`
          @keyframes spin-slow { to { transform: rotate(360deg); } }
          @keyframes spin-slow-reverse { to { transform: rotate(-360deg); } }
          @keyframes spin-drift {
            0%   { transform: rotate(0deg) translateY(0px); }
            33%  { transform: rotate(120deg) translateY(-10px); }
            66%  { transform: rotate(240deg) translateY(4px); }
            100% { transform: rotate(360deg) translateY(0px); }
          }
        `}</style>

        {/* flower1 — bottom-left, peeks in */}
        <div
          className="absolute -left-10 -bottom-6 pointer-events-none"
          style={{
            transform: `rotate(${mousePos.x * 22}deg) translateY(${mousePos.y * 12}px)`,
            transition: "transform 0.45s ease-out",
          }}
        >
          <div style={{ animation: "spin-slow 28s linear infinite" }}>
            <Image src="/flower1.webp" alt="" width={200} height={200} className="opacity-75 drop-shadow-md" style={{ filter: BURGUNDY }} />
          </div>
        </div>

        {/* flower3 — top-left, peeks in */}
        <div
          className="absolute -left-6 top-4 pointer-events-none"
          style={{
            transform: `rotate(${mousePos.x * -16}deg) translateY(${mousePos.y * -10}px)`,
            transition: "transform 0.6s ease-out",
          }}
        >
          <div style={{ animation: "spin-slow-reverse 35s linear infinite" }}>
            <Image src="/flower3.webp" alt="" width={145} height={145} className="opacity-60 drop-shadow-sm" />
          </div>
        </div>

        {/* flower2 — right side, peeks in */}
        <div
          className="absolute -right-8 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            transform: `translateY(calc(-50% + ${mousePos.y * 14}px)) rotate(${mousePos.x * 28}deg)`,
            transition: "transform 0.5s ease-out",
          }}
        >
          <div style={{ animation: "spin-drift 22s ease-in-out infinite" }}>
            <Image src="/flower2.webp" alt="" width={175} height={175} className="opacity-70 drop-shadow-md" />
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-4">
            Our Purpose
          </p>
          <h2 className="font-body text-3xl md:text-4xl font-bold text-foreground mb-6">
            A space where{" "}
            <span className="font-display italic text-primary">belonging</span>{" "}
            drives innovation
          </h2>
          <p className="font-body text-foreground/80 text-lg leading-relaxed mb-8">
            Colorado Women in STEM cultivates an intentional space where women
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
            Connect with Women in STEM across Colorado. Membership is free and open to all.
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
