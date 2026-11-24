"use client";

import { useState } from "react";
import { Linkedin } from "lucide-react";
import FlowerDecor from "@/components/FlowerDecor";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  hobbies: string;
  image_path: string;
  linkedin: string;
  flag?: string;
  committee_id?: string | null;
}

interface Committee {
  id: string;
  name: string;
  description: string;
  sort_order: number;
}

// Fallback static data used if Supabase fetch fails
const STATIC_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Arianne Lazaro",
    role: "Founder & Director",
    bio: "Materials Engineer with interests in Human Spaceflight and Space In-Situ Resource Utilization",
    hobbies: "",
    image_path: "/team/arianne.jpg",
    linkedin: "https://www.linkedin.com/in/arianne-lazaro/",
    flag: "🇵🇭",
  },
  {
    id: "2",
    name: "Dr. Tzirath Perez Oteiza",
    role: "Founder & Director",
    bio: "Data Science PhD exploring how cities influence human wellbeing.",
    hobbies: "Dance · Yoga · Tennis · Travel",
    image_path: "/team/tzirath.jpg",
    linkedin: "https://www.linkedin.com/in/tzirath-perez",
    flag: "🇲🇽",
  },
];

function isFounder(member: TeamMember) {
  return member.role.toLowerCase().includes("founder");
}

function TeamMemberCard({ member, large }: { member: TeamMember; large?: boolean }) {
  const [imgError, setImgError] = useState(false);

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const photoSize = large ? "w-40 h-40" : "w-32 h-32";
  const cardWidth = large ? "w-64" : "w-56";

  return (
    <div className={`group text-center ${cardWidth}`}>
      <div className={`${photoSize} mx-auto mb-5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors flex items-center justify-center`}>
        {imgError || !member.image_path ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-bloom-coral/20 flex items-center justify-center">
            <span className="font-display text-3xl font-bold text-primary">{initials}</span>
          </div>
        ) : (
          <img
            src={member.image_path}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <h3 className="font-body text-lg font-semibold text-foreground">{member.name}</h3>
      <p className="font-body text-secondary text-sm font-medium mb-2">{member.role}</p>
      <p className="font-body text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
      {member.hobbies && (
        <p className="font-body text-muted-foreground/70 text-xs mt-2 tracking-wide">{member.hobbies}</p>
      )}
      <div className="mt-3 flex items-center justify-center gap-2">
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-muted-foreground hover:text-primary transition-colors"
            aria-label={`${member.name}'s LinkedIn`}
          >
            <Linkedin size={18} />
          </a>
        )}
        {member.flag && (
          <span className="text-lg leading-none" aria-label="Country">{member.flag}</span>
        )}
      </div>
    </div>
  );
}

interface Props {
  members?: TeamMember[];
  committees?: Committee[];
}

const TeamSection = ({ members, committees = [] }: Props) => {
  const list = members && members.length > 0 ? members : STATIC_MEMBERS;

  const founders = list.filter(isFounder);
  const rest = list.filter((m) => !isFounder(m));

  const committeeGroups = committees
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((committee) => ({
      committee,
      members: rest.filter((m) => m.committee_id === committee.id),
    }));

  const unassigned = rest.filter(
    (m) => !committees.some((c) => c.id === m.committee_id)
  );

  return (
    <section id="team" className="py-24 bg-background relative overflow-hidden">
      <FlowerDecor flowers={[
        { src: 1, position: "-left-10 top-1/3",    size: 180, opacity: 0.6,  anim: "cw",    dur: 27, mx: 20, my: 10, td: 460 },
        { src: 3, position: "-left-4  -bottom-2",  size: 130, opacity: 0.5,  anim: "ccw",   dur: 34, mx: -14, my: -8, td: 530 },
        { src: 2, position: "-right-8 top-8",      size: 170, opacity: 0.55, anim: "drift", dur: 23, mx: 24, my: 12, td: 410 },
      ]} />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
            The People Behind CWS
          </p>
          <h2 className="font-body text-4xl md:text-5xl font-bold text-foreground">
            Meet Our <span className="font-display text-primary italic">Team</span>
          </h2>
        </div>

        {/* Founders — spotlighted side by side, not part of the committee grid */}
        {founders.length > 0 && (
          <div className="flex flex-wrap justify-center gap-12 mb-20 pb-16 border-b border-border/60">
            {founders.map((member) => (
              <TeamMemberCard key={member.id} member={member} large />
            ))}
          </div>
        )}

        {/* Committees — every member appears as an equal peer within their group */}
        <div className="flex flex-col gap-16">
          {committeeGroups.map(({ committee, members: committeeMembers }) => (
            committeeMembers.length > 0 && (
              <div key={committee.id}>
                <div className="text-center mb-10">
                  <h3 className="font-body text-2xl font-bold text-foreground">{committee.name}</h3>
                  {committee.description && (
                    <p className="font-body text-foreground/60 text-sm mt-2 max-w-xl mx-auto">{committee.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                  {committeeMembers.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )
          ))}

          {unassigned.length > 0 && (
            <div>
              {committeeGroups.some((g) => g.members.length > 0) && (
                <div className="text-center mb-10">
                  <h3 className="font-body text-2xl font-bold text-foreground">Operations</h3>
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-8">
                {unassigned.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
