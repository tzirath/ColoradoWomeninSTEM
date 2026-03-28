"use client";

import { useJoinModal } from "@/components/JoinModalContext";
import { Users, Repeat2, Wrench, UserCheck, Briefcase, HeartHandshake } from "lucide-react";

const programs = [
  {
    id: "skill-swap",
    icon: Repeat2,
    title: "Skill Swap",
    description: "Teach what you know, learn what you want. Fill out the form and we'll match you with a fellow member.",
    cta: "Sign up for Skill Swap",
    formUrl: "https://forms.gle/placeholder-skill-swap",
  },
  {
    id: "stem-in-action",
    icon: Wrench,
    title: "STEM in Action",
    description: "Join the design team and lend your technical expertise to community-driven projects.",
    cta: "Join the Design Team",
    formUrl: "https://forms.gle/placeholder-stem-action",
  },
  {
    id: "mentorship",
    icon: UserCheck,
    title: "Mentorship",
    description: "Apply as a mentor or mentee for the next CWS Mentorship cohort.",
    cta: "Apply for Mentorship",
    formUrl: "https://forms.gle/placeholder-mentorship",
  },
];

const openRoles = [
  { title: "Committee Chair — Social", commitment: "~2–4 hrs/month", description: "Lead the Social Committee in planning member events and gatherings." },
  { title: "Committee Chair — Outreach & Partnerships", commitment: "~3–5 hrs/month", description: "Build relationships with external organizations and potential sponsors." },
  { title: "Committee Chair — Community Service", commitment: "~2–4 hrs/month", description: "Identify and coordinate community-focused initiatives for CWS." },
  { title: "Committee Chair — Professional Development", commitment: "~3–5 hrs/month", description: "Design and deliver programming to support members' career growth." },
];

export default function GetInvolvedPage() {
  const { openModal } = useJoinModal();

  return (
    <div className="min-h-screen bg-background pt-24">

      {/* Hero strip */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
            Take Action
          </p>
          <h1 className="font-body text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get <span className="font-display italic text-primary">Involved</span>
          </h1>
          <p className="font-body text-foreground/80 text-lg leading-relaxed">
            Whether you're joining as a member, lending a skill, or stepping up to lead — there's
            a place for you here.
          </p>
        </div>
      </section>

      {/* Become a Member */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="font-body text-3xl font-bold text-primary-foreground mb-4">
            Become a Member
          </h2>
          <p className="font-body text-bloom-sage mb-8 max-w-xl mx-auto">
            Membership is free and open to all women of color in STEM and allies across Colorado.
            Join to connect, grow, and contribute.
          </p>
          <button
            onClick={openModal}
            className="bg-secondary text-white font-body font-semibold text-lg px-10 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Join CWS
          </button>
        </div>
      </section>

      {/* Programs to sign up for */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
              Programs
            </p>
            <h2 className="font-body text-4xl font-bold text-foreground">
              Sign Up for an <span className="font-display italic text-primary">Initiative</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {programs.map((p) => (
              <div key={p.id} id={p.id} className="bg-card rounded-2xl p-8 border border-border shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <p.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-body text-xl font-semibold text-foreground mb-3">{p.title}</h3>
                <p className="font-body text-foreground/80 text-sm leading-relaxed mb-6">
                  {p.description}
                </p>
                <a
                  href={p.formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-secondary text-white font-body font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
              Leadership Opportunities
            </p>
            <h2 className="font-body text-4xl font-bold text-foreground">
              Open <span className="font-display italic text-primary">Roles</span>
            </h2>
            <p className="font-body text-foreground/70 mt-4 max-w-xl mx-auto">
              CWS is volunteer-led. These committee chair roles are open and waiting for the right person.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {openRoles.map((role) => (
              <div key={role.title} className="bg-background rounded-2xl p-7 border border-border shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-body font-semibold text-foreground mb-1">{role.title}</h3>
                    <p className="font-body text-secondary text-xs font-medium mb-2">{role.commitment}</p>
                    <p className="font-body text-foreground/80 text-sm leading-relaxed">{role.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <HeartHandshake size={16} />
              Express Interest
            </a>
          </div>
        </div>
      </section>

      {/* Community Service */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 mx-auto">
            <HeartHandshake className="w-7 h-7 text-secondary" />
          </div>
          <h2 className="font-body text-3xl font-bold text-foreground mb-4">
            Community Service
          </h2>
          <p className="font-body text-foreground/80 text-lg leading-relaxed mb-6">
            CWS seeks out community-focused initiatives and volunteer opportunities for members to
            give back together. Keep an eye on our events page and social media for upcoming
            community service days.
          </p>
          <a
            href="/events"
            className="inline-block border-2 border-primary text-primary font-body font-semibold px-7 py-3 rounded-lg hover:bg-primary/5 transition-colors"
          >
            View Events
          </a>
        </div>
      </section>
    </div>
  );
}
