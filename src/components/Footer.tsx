import Link from "next/link";
import { Instagram, Linkedin, MapPin, Mail } from "lucide-react";

const sections = [
  {
    heading: "Organization",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Get Involved", href: "/get-involved" },
      { label: "Open Roles", href: "/get-involved#open-roles" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Initiatives",
    links: [
      { label: "Overview", href: "/initiatives" },
      { label: "Members Network", href: "/initiatives/members-network" },
      { label: "Skill Swap", href: "/initiatives/skill-swap" },
      { label: "STEM in Action", href: "/initiatives/stem-in-action" },
      { label: "Mentorship", href: "/initiatives/mentorship" },
      { label: "CWS Voices", href: "/initiatives/cws-voices" },
    ],
  },
  {
    heading: "Get In Touch",
    links: [],
    custom: (
      <div className="flex flex-col gap-3 mt-1">
        <div className="flex items-center gap-2 text-bloom-sage/70 text-sm font-body">
          <MapPin size={14} className="shrink-0" />
          Denver, Colorado
        </div>
        <a
          href="mailto:coloradowomeninstem@gmail.com"
          className="flex items-center gap-2 text-bloom-sage/70 text-sm font-body hover:text-secondary transition-colors"
        >
          <Mail size={14} className="shrink-0" />
          coloradowomeninstem@gmail.com
        </a>
        <Link
          href="/contact"
          className="text-sm font-body text-bloom-sage/70 hover:text-secondary transition-colors"
        >
          Contact Form
        </Link>
      </div>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-bloom-sage">
      <div className="container mx-auto px-6 py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="font-display text-3xl font-bold text-white">
              CWS<span className="text-secondary">.</span>
            </Link>
            <p className="font-body text-bloom-sage/70 text-sm leading-relaxed mt-4 max-w-xs">
              Colorado Women of Color in STEM is a community organization cultivating belonging,
              confidence, and opportunity for BIPOC women in STEM across Colorado.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.instagram.com/coloradowomeninstem/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bloom-sage/60 hover:text-secondary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/groups/18686021/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bloom-sage/60 hover:text-secondary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {sections.map((section) => (
            <div key={section.heading}>
              <h3 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-bloom-sage/50 mb-4">
                {section.heading}
              </h3>
              {section.custom ?? (
                <ul className="flex flex-col gap-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-body text-sm text-bloom-sage/70 hover:text-secondary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-bloom-sage/20 pt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p className="font-body text-bloom-sage/50 text-xs">
              © {new Date().getFullYear()} Colorado Women of Color in STEM (CWS). All Rights Reserved.
            </p>
            <Link href="/admin" className="font-body text-bloom-sage/20 text-xs hover:text-bloom-sage/50 transition-colors">
              Admin
            </Link>
          </div>
          <Link href="/about" className="font-body text-bloom-sage/50 text-xs hover:text-bloom-sage/80 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
