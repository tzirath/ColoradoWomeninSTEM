import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BecomeAMemberButton from "@/components/BecomeAMemberButton";
import InitiativeTracker from "@/components/InitiativeTracker";
import FlowerDecor from "@/components/FlowerDecor";
import { getInitiative } from "@/data/initiatives";

// Render on each request so photos and Sign Up links saved in admin show up right away
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const item = getInitiative(params.slug);
  if (!item) return {};
  return { title: `${item.name} | CWS`, description: item.tagline };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-body text-sm uppercase tracking-[0.2em] text-secondary font-semibold mb-3">{title}</h2>
      <p className="font-body text-foreground/80 text-base leading-relaxed">{children}</p>
    </div>
  );
}

export default async function InitiativeDetailPage({ params }: { params: { slug: string } }) {
  const item = getInitiative(params.slug);
  if (!item) notFound();

  const contentKeys = [item.signupKey, item.imageKey, ...(item.legacySignupKey ? [item.legacySignupKey] : [])];
  const supabase = createClient();
  const { data: contentRows } = await supabase.from("site_content").select("key, value").in("key", contentKeys);

  const contentMap: Record<string, string> = {};
  contentRows?.forEach((row) => { contentMap[row.key] = row.value; });

  const signupHref =
    contentMap[item.signupKey] || (item.legacySignupKey ? contentMap[item.legacySignupKey] : "") || null;
  const imageUrl = contentMap[item.imageKey] || null;
  const Icon = item.icon;

  return (
    <div className="min-h-screen bg-background pt-24">
      <InitiativeTracker slug={item.slug} />
      <section className="py-20 relative overflow-hidden">
        <FlowerDecor flowers={[
          { src: 3, position: "-left-8  top-8",      size: 145, opacity: 0.55, anim: "ccw",  dur: 30, mx: -16, my: -8, td: 500 },
          { src: 2, position: "-right-6 bottom-8",   size: 160, opacity: 0.6,  anim: "drift", dur: 24, mx: 20,  my: 12, td: 420 },
        ]} />
        <div className="container mx-auto px-6 max-w-3xl relative z-10">
          <Link href="/initiatives" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary font-body text-sm mb-10 transition-colors">
            <ArrowLeft size={14} /> All Initiatives
          </Link>

          <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mb-8">
            <Icon className="w-8 h-8 text-accent" />
          </div>

          <h1 className="font-body text-4xl md:text-5xl font-bold text-foreground mb-2">{item.name}</h1>
          {item.subtitle && (
            <p className="font-body text-foreground/60 text-sm font-medium mb-3">{item.subtitle}</p>
          )}
          <p className="font-body text-secondary text-lg italic mb-10">{item.tagline}</p>

          {imageUrl && (
            <div className="mb-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>
          )}

          {item.steps && (
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {item.steps.map((step, i) => (
                <li key={step} className="flex items-center gap-3 bg-card rounded-2xl border border-border p-4">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-primary text-primary-foreground font-body font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-body font-semibold text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          )}

          {(item.feelings || item.focusTags) && (
            <div className="space-y-3 mb-10">
              {item.feelings && (
                <div className="flex flex-wrap gap-2">
                  {item.feelings.map((f) => (
                    <span key={f} className="font-body text-xs font-medium px-3 py-1 rounded-full bg-secondary/10 text-secondary">
                      {f}
                    </span>
                  ))}
                </div>
              )}
              {item.focusTags && (
                <div className="flex flex-wrap gap-2">
                  {item.focusTags.map((t) => (
                    <span key={t} className="font-body text-xs font-medium px-3 py-1 rounded-full border border-accent/40 text-accent">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description is hidden for now; the copy is kept in src/data/initiatives.ts so it can be restored. */}

          <div className="space-y-8">
            <Section title="About">{item.about}</Section>
            <Section title="Goal">{item.goal}</Section>
            <Section title="What to expect">{item.whatToExpect}</Section>
            {item.access && <Section title="Access">{item.access}</Section>}
          </div>

          {item.comingSoon && (
            <div className="mt-10 p-6 rounded-2xl border border-primary/30 bg-primary/5">
              <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-primary text-primary-foreground mb-3">
                Coming soon
              </span>
              <p className="font-body text-foreground/80 leading-relaxed">{item.comingSoon}</p>
            </div>
          )}

          <div className="mt-14 p-8 bg-card rounded-2xl border border-border">
            <h2 className="font-body text-xl font-semibold text-foreground mb-3">Get Involved</h2>
            <p className="font-body text-foreground/80 mb-6">Interested in participating in or supporting this initiative?</p>
            {signupHref ? (
              <Link href={signupHref} target={signupHref.startsWith("http") ? "_blank" : undefined} rel={signupHref.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-7 py-3 rounded-lg hover:opacity-90 transition-opacity">
                Sign Up
              </Link>
            ) : (
              <BecomeAMemberButton slug={item.slug} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
