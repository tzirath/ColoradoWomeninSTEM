"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { useJoinModal } from "@/components/JoinModalContext";

const initiatives = [
  { label: "Members Network", href: "/initiatives/members-network" },
  { label: "Skill Swap", href: "/initiatives/skill-swap" },
  { label: "STEM in Action", href: "/initiatives/stem-in-action" },
  { label: "Mentorship", href: "/initiatives/mentorship" },
  { label: "CWS Voices", href: "/initiatives/cws-voices" },
];

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Initiatives", href: "/initiatives", dropdown: true },
  { label: "Team", href: "/team" },
  { label: "Events", href: "/events" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  onJoinClick: () => void;
}

const Navbar = ({ onJoinClick }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [initiativesOpen, setInitiativesOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close desktop dropdown on outside click (desktop only — on mobile this fires before
  // tap navigation completes, unmounting links before they can route)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node | null)) {
        setInitiativesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setInitiativesOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-card/95 backdrop-blur-md ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-5 px-6">
        <Link href="/" className="font-display text-5xl font-bold text-primary leading-none flex items-end pb-1">
          CWS<span className="text-secondary">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) =>
              link.dropdown ? (
                <li key={link.href} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setInitiativesOpen((v) => !v)}
                    className={`inline-flex items-center gap-1 font-body text-sm font-medium transition-colors ${
                      isActive(link.href) ? "text-primary" : "text-foreground/80 hover:text-primary"
                    }`}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${initiativesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {initiativesOpen && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-card rounded-xl shadow-lg border border-border py-2 z-50">
                      <Link
                        href="/initiatives"
                        className="block px-4 py-2 font-body text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
                        onClick={() => setInitiativesOpen(false)}
                      >
                        All Initiatives
                      </Link>
                      <div className="my-1 border-t border-border" />
                      {initiatives.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 font-body text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
                          onClick={() => setInitiativesOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ) : (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`font-body text-sm font-medium transition-colors ${
                      isActive(link.href) ? "text-primary" : "text-foreground/80 hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          <button
            onClick={onJoinClick}
            className="inline-flex items-center bg-secondary text-white font-body font-semibold text-base px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Become a Member
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md border-t border-border">
          <ul className="flex flex-col items-center gap-4 py-6">
            {navLinks.map((link) =>
              link.dropdown ? (
                <li key={link.href} className="w-full text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      href="/initiatives"
                      className="font-body text-lg text-foreground/80 hover:text-primary transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Initiatives
                    </Link>
                    <button
                      onClick={() => setInitiativesOpen((v) => !v)}
                      className="text-foreground/50 hover:text-primary transition-colors p-1"
                      aria-label="Toggle initiatives"
                    >
                      <ChevronDown size={16} className={`transition-transform ${initiativesOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {initiativesOpen && (
                    <div className="flex flex-col items-center gap-2 mt-1">
                      {initiatives.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="font-body text-sm text-foreground/60 hover:text-primary transition-colors py-1"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ) : (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`font-body text-lg transition-colors ${
                      isActive(link.href) ? "text-primary font-semibold" : "text-foreground/80 hover:text-primary"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
            <li>
              <button
                onClick={() => { setIsOpen(false); onJoinClick(); }}
                className="bg-secondary text-white font-body font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Become a Member
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
