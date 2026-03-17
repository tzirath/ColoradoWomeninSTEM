"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TeamSection from "@/components/TeamSection";
import EventsSection from "@/components/EventsSection";
import ContactSection from "@/components/ContactSection";
import JoinModal from "@/components/JoinModal";

export default function Home() {
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onJoinClick={() => setJoinOpen(true)} />
      <HeroSection onJoinClick={() => setJoinOpen(true)} />
      <AboutSection />
      <TeamSection />
      <EventsSection />
      <ContactSection />
      <JoinModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
