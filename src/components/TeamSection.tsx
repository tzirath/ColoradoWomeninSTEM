import { Linkedin } from "lucide-react";

const teamMembers = [
  {
    name: "Arianne Lazaro",
    role: "Founder & Director",
    bio: "Material Engineer",
    image: "/team/arianne.jpg",
  },
  {
    name: "Dr. Tzirath Perez Oteiza",
    role: "Founder & Director",
    bio: "Data Science PhD researching Smart Cities and Urban wellbeing.",
    image: "/team/tzirath.jpg",
  },
  {
    name: "Maria Jose",
    role: "Vice President",
    bio: "Data scientist dedicated to connecting women across Denver's tech ecosystem.",
    image: "/team/mariajose.jpg",
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-3">
            The People Behind CWS
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Meet Our <span className="text-primary italic">Team</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group text-center w-56"
            >
              <div className="w-32 h-32 mx-auto mb-5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image is missing
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".initials-fallback")) {
                      parent.classList.add(
                        "bg-gradient-to-br",
                        "from-primary/20",
                        "to-bloom-coral/20",
                        "flex",
                        "items-center",
                        "justify-center"
                      );
                      const span = document.createElement("span");
                      span.className =
                        "initials-fallback font-display text-3xl font-bold text-primary";
                      span.textContent = member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("");
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {member.name}
              </h3>
              <p className="font-body text-secondary text-sm font-medium mb-2">
                {member.role}
              </p>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {member.bio}
              </p>
              <button
                className="mt-3 text-muted-foreground hover:text-primary transition-colors"
                aria-label={`${member.name}'s LinkedIn`}
              >
                <Linkedin size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
