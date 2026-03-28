"use client";

import { useState } from "react";
import { Linkedin } from "lucide-react";

const teamMembers = [
  {
    name: "Arianne Lazaro",
    role: "Founder & Director",
    bio: "Materials Engineer with interests in Human Spaceflight and Space In-Situ Resource Utilization",
    hobbies: "",
    image: "/team/arianne.jpg",
    linkedin: "https://www.linkedin.com/in/arianne-lazaro/",
  },
  {
    name: "Dr. Tzirath Perez Oteiza",
    role: "Founder & Director",
    bio: "Data Science PhD exploring how cities influence human wellbeing.",
    hobbies: "Dance · Yoga · Tennis · Travel",
    image: "/team/tzirath.jpg",
    linkedin: "https://www.linkedin.com/in/tzirath-perez",
  },
];

function TeamMemberCard({ member }: { member: typeof teamMembers[number] }) {
  const [imgError, setImgError] = useState(false);

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="group text-center w-56">
      <div className="w-32 h-32 mx-auto mb-5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors flex items-center justify-center">
        {imgError ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-bloom-coral/20 flex items-center justify-center">
            <span className="font-display text-3xl font-bold text-primary">
              {initials}
            </span>
          </div>
        ) : (
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <h3 className="font-body text-lg font-semibold text-foreground">
        {member.name}
      </h3>
      <p className="font-body text-secondary text-sm font-medium mb-2">
        {member.role}
      </p>
      <p className="font-body text-muted-foreground text-sm leading-relaxed">
        {member.bio}
      </p>
      {member.hobbies && (
        <p className="font-body text-muted-foreground/70 text-xs mt-2 tracking-wide">
          {member.hobbies}
        </p>
      )}
      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-muted-foreground hover:text-primary transition-colors"
          aria-label={`${member.name}'s LinkedIn`}
        >
          <Linkedin size={18} />
        </a>
      )}
    </div>
  );
}

const TeamSection = () => {
  return (
    <section id="team" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
            The People Behind CWS
          </p>
          <h2 className="font-body text-4xl md:text-5xl font-bold text-foreground">
            Meet Our <span className="font-display text-primary italic">Team</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
