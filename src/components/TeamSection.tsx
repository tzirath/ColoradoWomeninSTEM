"use client";

import { useState } from "react";
import { Linkedin } from "lucide-react";
import FlowerDecor, { BURGUNDY } from "@/components/FlowerDecor";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  hobbies: string;
  image_path: string;
  linkedin: string;
  flag?: string;
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

function TeamMemberCard({ member }: { member: TeamMember }) {
  const [imgError, setImgError] = useState(false);

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="group text-center w-56">
      <div className="w-32 h-32 mx-auto mb-5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors flex items-center justify-center">
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
}

const TeamSection = ({ members }: Props) => {
  const list = members && members.length > 0 ? members : STATIC_MEMBERS;

  return (
    <section id="team" className="py-24 bg-background relative overflow-hidden">
      <FlowerDecor flowers={[
        { src: 1, position: "-left-10 top-1/3",    size: 180, opacity: 0.6,  anim: "cw",    dur: 27, mx: 20, my: 10, td: 460 },
        { src: 3, position: "-left-4  -bottom-2",  size: 130, opacity: 0.5,  anim: "ccw",   dur: 34, mx: -14, my: -8, td: 530, tint: BURGUNDY },
        { src: 2, position: "-right-8 top-8",      size: 170, opacity: 0.55, anim: "drift", dur: 23, mx: 24, my: 12, td: 410, tint: BURGUNDY },
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
        <div className="flex flex-wrap justify-center gap-8">
          {list.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
