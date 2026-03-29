import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Network, Repeat2, Wrench, Users, Mic } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BecomeAMemberButton from "@/components/BecomeAMemberButton";

const INITIATIVE_META: Record<string, {
  icon: React.ElementType;
  title: string;
  tagline: string;
  contentKey: string;
  defaultBody: string[];
  getInvolvedHref: string;
}> = {
  "members-network": {
    icon: Network,
    title: "Members Networking Database",
    tagline: "Find meaningful professional connections",
    contentKey: "initiative_members_network",
    defaultBody: [
      "The Members Networking Database is a curated, searchable directory of CWS members — making it easy to find others in your STEM field, at your career stage, or with shared interests.",
      "Whether you're looking for a collaborator on a project, someone who's navigated a similar career path, or simply want to expand your professional circle within the CWS community, the database connects you intentionally.",
      "This initiative is currently in development. Members who join will be invited to opt in to the directory and set their own visibility preferences.",
    ],
    getInvolvedHref: "/get-involved",
  },
  "skill-swap": {
    icon: Repeat2,
    title: "Skill Swap",
    tagline: "Teach what you know. Learn what you don't.",
    contentKey: "initiative_skill_swap",
    defaultBody: [
      "Skill Swap connects CWS members based on what they can teach and what they want to learn — creating a peer-to-peer knowledge exchange that benefits everyone.",
      "From technical skills like Python and data visualization to professional skills like grant writing and public speaking, the exchanges are member-driven and community-powered.",
      "Members fill out a simple form listing their offerings and wishes. We match you with someone who complements your profile, and you take it from there.",
    ],
    getInvolvedHref: "/get-involved#skill-swap",
  },
  "stem-in-action": {
    icon: Wrench,
    title: "STEM in Action (Design Team)",
    tagline: "Apply your skills to real community needs",
    contentKey: "initiative_stem_in_action",
    defaultBody: [
      "STEM in Action partners with Colorado community organizations to identify real needs and mobilize CWS members' technical expertise to address them.",
      "This isn't a top-down consulting model — organizations define the problems, and CWS members co-design solutions alongside them. The result is more meaningful work and more lasting impact.",
      "Projects have ranged from data analysis and visualization to environmental assessments and engineering design reviews. Every project is different.",
    ],
    getInvolvedHref: "/get-involved#stem-in-action",
  },
  mentorship: {
    icon: Users,
    title: "Mentorship",
    tagline: "Guidance for growth at every stage",
    contentKey: "initiative_mentorship",
    defaultBody: [
      "The CWS Mentorship Program pairs members across career stages for one-on-one guidance, support, and accountability.",
      "Mentors and mentees are matched based on field, goals, and background. Cohorts run each semester with a structured kickoff, check-ins, and a closing event.",
      "Whether you're navigating your first industry role, pivoting fields, or returning to STEM after a break — there's a mentor here who's walked a path close to yours.",
    ],
    getInvolvedHref: "/get-involved#mentorship",
  },
  "cws-voices": {
    icon: Mic,
    title: "CWS Voices",
    tagline: "Navigate workplace challenges with community",
    contentKey: "initiative_cws_voices",
    defaultBody: [
      "CWS Voices is a peer support initiative that empowers members to thoughtfully navigate the ethical challenges and societal tensions that arise in STEM workplaces.",
      "From microaggressions to algorithmic bias to navigating workplace conflict — these conversations happen in a confidential, community-held space where members support each other.",
      "Resources, frameworks, and guest speakers supplement the peer discussions. This is a space for honest dialogue, not just professional polish.",
    ],
    getInvolvedHref: "/get-involved",
  },
};

export function generateStaticParams() {
  return Object.keys(INITIATIVE_META).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const item = INITIATIVE_META[params.slug];
  if (!item) return {};
  return { title: `${item.title} | CWS`, description: item.tagline };
}

export default async function InitiativeDetailPage({ params }: { params: { slug: string } }) {
  const item = INITIATIVE_META[params.slug];
  if (!item) notFound();

  const supabase = createClient();
  const { data: contentRows } = await supabase.from("site_content").select("key, value")
    .in("key", [item.contentKey, `${item.contentKey}_tagline`, `${item.contentKey}_signup_url`]);

  const contentMap: Record<string, string> = {};
  contentRows?.forEach((row) => { contentMap[row.key] = row.value; });

  // If content exists in DB, use it as a single block; otherwise use default paragraphs
  const body: string[] = contentMap[item.contentKey] ? [contentMap[item.contentKey]] : item.defaultBody;
  const tagline = contentMap[`${item.contentKey}_tagline`] || item.tagline;
  const signupHref = contentMap[`${item.contentKey}_signup_url`] || null;
  const Icon = item.icon;

  return (
    <div className="min-h-screen bg-background pt-24">
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <Link href="/initiatives" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary font-body text-sm mb-10 transition-colors">
            <ArrowLeft size={14} /> All Initiatives
          </Link>

          <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mb-8">
            <Icon className="w-8 h-8 text-accent" />
          </div>

          <p className="font-body text-secondary text-sm uppercase tracking-[0.2em] mb-2 italic">{tagline}</p>
          <h1 className="font-body text-4xl md:text-5xl font-bold text-foreground mb-10">{item.title}</h1>

          <div className="space-y-6">
            {body.map((para, i) => (
              <p key={i} className="font-body text-foreground text-lg leading-relaxed">{para}</p>
            ))}
          </div>

          <div className="mt-14 p-8 bg-card rounded-2xl border border-border">
            <h2 className="font-body text-xl font-semibold text-foreground mb-3">Get Involved</h2>
            <p className="font-body text-foreground/80 mb-6">Interested in participating in or supporting this initiative?</p>
            {signupHref ? (
              <Link href={signupHref} target={signupHref.startsWith("http") ? "_blank" : undefined} rel={signupHref.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-7 py-3 rounded-lg hover:opacity-90 transition-opacity">
                Sign Up
              </Link>
            ) : (
              <BecomeAMemberButton />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
