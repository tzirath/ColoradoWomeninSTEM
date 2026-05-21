"use client";

import { useJoinModal } from "@/components/JoinModalContext";
import { Users, Briefcase, HeartHandshake, Network, Repeat2, Wrench, Mic } from "lucide-react";
import Link from "next/link";
import FlowerDecor from "@/components/FlowerDecor";

const programs = [
  { slug: "members-network", contentKey: "initiative_members_network", icon: Network, title: "Members Networking Database", defaultDesc: "A curated directory that helps members discover and connect with each other based on STEM field, interests, and career stage." },
  { slug: "skill-swap", contentKey: "initiative_skill_swap", icon: Repeat2, title: "Skill Swap", defaultDesc: "Connect with members based on what you can teach and what you want to learn — building a true knowledge-sharing community." },
  { slug: "stem-in-action", contentKey: "initiative_stem_in_action", icon: Wrench, title: "STEM in Action (Design Team)", defaultDesc: "Partner with community organizations to apply your technical skills towards solutions they help define." },
  { slug: "mentorship", contentKey: "initiative_mentorship", icon: Users, title: "Mentorship", defaultDesc: "Pair with members for guidance and advice on navigating careers, academia, and life in STEM as a woman of color." },
  { slug: "cws-voices", contentKey: "initiative_cws_voices", icon: Mic, title: "CWS Voices", defaultDesc: "Empower members with the resources and peer support to navigate ethical challenges and societal impact in STEM workplaces." },
];

interface Role { id: string; title: string; commitment: string; description: string; }

interface Props {
  roles: Role[];
  content: Record<string, string>;
}

export default function GetInvolvedClient({ roles, content }: Props) {
  const { openModal } = useJoinModal();

  return (
    <div className="min-h-screen bg-background pt-24">

      {/* Hero strip */}
      <section className="py-20 bg-card relative overflow-hidden">
        <FlowerDecor flowers={[
          { src: 2, position: "-left-8  -bottom-2", size: 185, opacity: 0.68, anim: "cw",    dur: 27, mx: 22, my: 11, td: 440 },
          { src: 1, position: "-right-6 top-6",     mobileHide: true, size: 150, opacity: 0.6,  anim: "ccw",   dur: 33, mx: -18, my: -9, td: 520 },
          { src: 2, position: "right-6 top-6 md:hidden", size: 68,  opacity: 0.75, anim: "drift", dur: 19, mx: 16, my: 8, td: 380 },
        ]} />
        <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">Take Action</p>
          <h1 className="font-body text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get <span className="font-display italic text-primary">Involved</span>
          </h1>
          <p className="font-body text-foreground/80 text-lg leading-relaxed">{content.get_involved_hero}</p>
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
          <h2 className="font-body text-3xl font-bold text-primary-foreground mb-4">Become a Member</h2>
          <p className="font-body text-bloom-sage mb-8 max-w-xl mx-auto">{content.get_involved_member_desc}</p>
          <button onClick={openModal} className="bg-secondary text-white font-body font-semibold text-lg px-10 py-3.5 rounded-lg hover:opacity-90 transition-opacity">
            Join CWS
          </button>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">Programs</p>
            <h2 className="font-body text-4xl font-bold text-foreground">
              Sign Up for an <span className="font-display italic text-primary">Initiative</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {programs.slice(0, 3).map((p) => (
              <div key={p.slug} className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <p.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-body text-xl font-semibold text-foreground mb-3">{p.title}</h3>
                <p className="font-body text-foreground/80 text-sm leading-relaxed mb-6 flex-1">{content[p.contentKey] || p.defaultDesc}</p>
                <Link href={`/initiatives/${p.slug}`}
                  className="inline-block bg-secondary text-white font-body font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-center">
                  Sign Up
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/initiatives"
              className="inline-flex items-center gap-2 border-2 border-primary text-primary font-body font-semibold px-7 py-3 rounded-lg hover:bg-primary/5 transition-colors">
              View All Initiatives
            </Link>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="py-20 bg-card relative overflow-hidden">
        <FlowerDecor flowers={[
          { src: 3, position: "-left-8 top-8",      size: 160, opacity: 0.6,  anim: "ccw",   dur: 31, mx: -16, my: -9, td: 510 },
          { src: 2, position: "-right-6 -bottom-4", size: 175, opacity: 0.65, anim: "drift", dur: 24, mx: 22,  my: 11, td: 430 },
        ]} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">Leadership Opportunities</p>
            <h2 className="font-body text-4xl font-bold text-foreground">
              Open <span className="font-display italic text-primary">Roles</span>
            </h2>
            <p className="font-body text-foreground/70 mt-4 max-w-xl mx-auto">
              CWS is volunteer-led. These committee chair roles are open and waiting for the right person.
            </p>
          </div>
          {roles.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {roles.map((role) => (
                  <div key={role.id} className="bg-background rounded-2xl p-7 border border-border shadow-sm">
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
                <Link href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
                  <HeartHandshake size={16} /> Express Interest
                </Link>
              </div>
            </>
          ) : (
            <div className="max-w-xl mx-auto text-center bg-background rounded-2xl p-10 border border-border shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 mx-auto">
                <HeartHandshake className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-body text-xl font-semibold text-foreground mb-3">No open roles right now</h3>
              <p className="font-body text-foreground/70 text-sm leading-relaxed mb-8">
                We don't have any listed positions at the moment, but we're always looking for passionate people.
                Reach out to express your interest or sign up to stay in the loop.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                  <HeartHandshake size={15} /> Contact Us
                </Link>
                <button onClick={openModal} className="inline-flex items-center gap-2 border-2 border-secondary text-secondary font-body font-semibold px-6 py-2.5 rounded-lg hover:bg-secondary/5 transition-colors">
                  Become a Member
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Community Service */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 mx-auto">
            <HeartHandshake className="w-7 h-7 text-secondary" />
          </div>
          <h2 className="font-body text-3xl font-bold text-foreground mb-4">Community Service</h2>
          <p className="font-body text-foreground/80 text-lg leading-relaxed mb-6">{content.get_involved_community_service}</p>
          <Link href="/events" className="inline-block border-2 border-primary text-primary font-body font-semibold px-7 py-3 rounded-lg hover:bg-primary/5 transition-colors">
            View Events
          </Link>
        </div>
      </section>
    </div>
  );
}
