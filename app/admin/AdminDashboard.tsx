"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Megaphone, Users, Plus, Trash2, GripVertical, Save, FileText } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes

interface NewsItem { id: string; text: string; active: boolean; sort_order: number; }
interface TeamMember { id: string; name: string; role: string; bio: string; hobbies: string; image_path: string; linkedin: string; sort_order: number; active: boolean; }
interface ContentItem { key: string; value: string; }

interface Props {
  user: User;
  initialNewsItems: NewsItem[];
  initialTeamMembers: TeamMember[];
  initialContent: ContentItem[];
}

type Tab = "news" | "team" | "content";

const CONTENT_FIELDS: { key: string; label: string; section: string; multiline?: boolean }[] = [
  { key: "about_story_p1", label: "About — Story paragraph 1", section: "About", multiline: true },
  { key: "about_story_p2", label: "About — Story paragraph 2", section: "About", multiline: true },
  { key: "about_mission", label: "About — Mission statement", section: "About", multiline: true },
  { key: "about_vision", label: "About — Vision statement", section: "About", multiline: true },
  { key: "initiative_members_network", label: "Initiative — Members Network description", section: "Initiatives", multiline: true },
  { key: "initiative_skill_swap", label: "Initiative — Skill Swap description", section: "Initiatives", multiline: true },
  { key: "initiative_stem_in_action", label: "Initiative — STEM in Action description", section: "Initiatives", multiline: true },
  { key: "initiative_mentorship", label: "Initiative — Mentorship description", section: "Initiatives", multiline: true },
  { key: "initiative_cws_voices", label: "Initiative — CWS Voices description", section: "Initiatives", multiline: true },
];

export default function AdminDashboard({ user, initialNewsItems, initialTeamMembers, initialContent }: Props) {
  const [tab, setTab] = useState<Tab>("news");
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNewsItems);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [content, setContent] = useState<Record<string, string>>(
    Object.fromEntries(initialContent.map((c) => [c.key, c.value]))
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(INACTIVITY_MS);
  const router = useRouter();
  const supabase = createClient();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }, [supabase, router]);

  // ── Inactivity timer ──────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    const reset = () => {
      clearTimeout(timer);
      clearInterval(interval);
      setCountdown(INACTIVITY_MS);
      interval = setInterval(() => setCountdown((c) => Math.max(0, c - 1000)), 1000);
      timer = setTimeout(() => handleSignOut(), INACTIVITY_MS);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [handleSignOut]);

  const countdownMin = Math.floor(countdown / 60000);
  const countdownSec = Math.floor((countdown % 60000) / 1000);
  const countdownWarning = countdown < 2 * 60 * 1000; // warn when < 2 min

  // ── News Items ────────────────────────────────────────────
  const addNewsItem = () => setNewsItems([...newsItems, { id: `new-${Date.now()}`, text: "", active: true, sort_order: newsItems.length }]);
  const updateNewsItem = (id: string, field: keyof NewsItem, value: string | boolean | number) =>
    setNewsItems(newsItems.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
  const removeNewsItem = (id: string) => setNewsItems(newsItems.filter((n) => n.id !== id));

  const saveNewsItems = async () => {
    setSaving(true);
    try {
      await supabase.from("news_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const toInsert = newsItems.filter((n) => n.text.trim()).map((n, i) => ({
        ...(n.id.startsWith("new-") ? {} : { id: n.id }),
        text: n.text.trim(), active: n.active, sort_order: i,
      }));
      const { error } = await supabase.from("news_items").insert(toInsert);
      if (error) throw error;
      showToast("News items saved!");
      router.refresh();
    } catch { showToast("Error saving. Try again."); }
    finally { setSaving(false); }
  };

  // ── Team Members ──────────────────────────────────────────
  const addTeamMember = () => setTeamMembers([...teamMembers, { id: `new-${Date.now()}`, name: "", role: "", bio: "", hobbies: "", image_path: "", linkedin: "", sort_order: teamMembers.length, active: true }]);
  const updateTeamMember = (id: string, field: keyof TeamMember, value: string | boolean | number) =>
    setTeamMembers(teamMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  const removeTeamMember = async (id: string) => {
    if (!id.startsWith("new-")) await supabase.from("team_members").delete().eq("id", id);
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
    showToast("Member removed.");
  };
  const saveTeamMember = async (member: TeamMember) => {
    setSaving(true);
    try {
      if (member.id.startsWith("new-")) {
        const { data, error } = await supabase.from("team_members")
          .insert({ name: member.name, role: member.role, bio: member.bio, hobbies: member.hobbies, image_path: member.image_path, linkedin: member.linkedin, sort_order: member.sort_order, active: member.active })
          .select().single();
        if (error) throw error;
        setTeamMembers(teamMembers.map((m) => (m.id === member.id ? data : m)));
      } else {
        const { error } = await supabase.from("team_members")
          .update({ name: member.name, role: member.role, bio: member.bio, hobbies: member.hobbies, image_path: member.image_path, linkedin: member.linkedin, sort_order: member.sort_order, active: member.active })
          .eq("id", member.id);
        if (error) throw error;
      }
      showToast("Member saved!");
      router.refresh();
    } catch { showToast("Error saving. Try again."); }
    finally { setSaving(false); }
  };

  // ── Site Content ──────────────────────────────────────────
  const saveContentField = async (key: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("site_content")
        .upsert({ key, value: content[key] ?? "", updated_at: new Date().toISOString() });
      if (error) throw error;
      showToast("Saved!");
      router.refresh();
    } catch { showToast("Error saving. Try again."); }
    finally { setSaving(false); }
  };

  const sections = [...new Set(CONTENT_FIELDS.map((f) => f.section))];

  return (
    <div className="min-h-screen bg-background">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground font-body text-sm px-5 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/cws-logo.png" alt="CWS" width={36} height={36} />
          <div>
            <h1 className="font-body font-bold text-foreground text-lg leading-none">CWS Admin</h1>
            <p className="font-body text-xs text-foreground/50 mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-body text-xs ${countdownWarning ? "text-red-500 font-semibold" : "text-foreground/40"}`}>
            Auto sign-out in {countdownMin}:{countdownSec.toString().padStart(2, "0")}
          </span>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 font-body text-sm text-foreground/60 hover:text-foreground transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 flex gap-0">
          {([["news", Megaphone, "News Banner"], ["team", Users, "Team Members"], ["content", FileText, "Site Content"]] as const).map(
            ([key, Icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`inline-flex items-center gap-2 px-5 py-4 font-body text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-primary text-primary" : "border-transparent text-foreground/60 hover:text-foreground"}`}
              >
                <Icon size={15} />{label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-3xl">

        {/* ── News Tab ── */}
        {tab === "news" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-body text-xl font-semibold text-foreground">News Banner</h2>
                <p className="font-body text-sm text-foreground/60 mt-1">Rotating announcements at the top of the home page.</p>
              </div>
              <button onClick={addNewsItem} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {newsItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                  <GripVertical size={16} className="text-foreground/30 shrink-0" />
                  <input value={item.text} onChange={(e) => updateNewsItem(item.id, "text", e.target.value)}
                    placeholder="Enter announcement text..."
                    className="flex-1 font-body text-sm bg-transparent outline-none text-foreground placeholder:text-foreground/30" />
                  <label className="flex items-center gap-1.5 font-body text-xs text-foreground/60 shrink-0">
                    <input type="checkbox" checked={item.active} onChange={(e) => updateNewsItem(item.id, "active", e.target.checked)} className="accent-primary" />
                    Active
                  </label>
                  <button onClick={() => removeNewsItem(item.id)} className="text-foreground/30 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            {newsItems.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No news items. Add one above.</p>}
            <button onClick={saveNewsItems} disabled={saving}
              className="mt-6 inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              <Save size={15} />{saving ? "Saving…" : "Save All"}
            </button>
          </div>
        )}

        {/* ── Team Tab ── */}
        {tab === "team" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-body text-xl font-semibold text-foreground">Team Members</h2>
                <p className="font-body text-sm text-foreground/60 mt-1">Add, edit, or remove team member profiles.</p>
              </div>
              <button onClick={addTeamMember} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                <Plus size={14} /> Add Member
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-body font-semibold text-foreground">{member.name || "New Member"}</h3>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 font-body text-xs text-foreground/60">
                        <input type="checkbox" checked={member.active} onChange={(e) => updateTeamMember(member.id, "active", e.target.checked)} className="accent-primary" />
                        Active
                      </label>
                      <button onClick={() => removeTeamMember(member.id)} className="text-foreground/30 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {([["Name", "name", "Dr. Jane Smith"], ["Role", "role", "Founder & Director"], ["LinkedIn URL", "linkedin", "https://linkedin.com/in/..."], ["Photo path", "image_path", "/team/jane.jpg"]] as const).map(([label, field, placeholder]) => (
                      <div key={field}>
                        <label className="block font-body text-xs font-medium text-foreground/60 mb-1">{label}</label>
                        <input value={(member[field as keyof TeamMember] as string) ?? ""} onChange={(e) => updateTeamMember(member.id, field as keyof TeamMember, e.target.value)}
                          placeholder={placeholder}
                          className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors" />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Bio</label>
                      <textarea value={member.bio} onChange={(e) => updateTeamMember(member.id, "bio", e.target.value)}
                        placeholder="Short bio..." rows={2}
                        className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Hobbies / Interests</label>
                      <input value={member.hobbies} onChange={(e) => updateTeamMember(member.id, "hobbies", e.target.value)}
                        placeholder="Dance · Yoga · Travel"
                        className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <button onClick={() => saveTeamMember(member)} disabled={saving}
                    className="mt-5 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                    <Save size={13} />{saving ? "Saving…" : "Save"}
                  </button>
                </div>
              ))}
            </div>
            {teamMembers.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No team members. Add one above.</p>}
          </div>
        )}

        {/* ── Content Tab ── */}
        {tab === "content" && (
          <div>
            <div className="mb-8">
              <h2 className="font-body text-xl font-semibold text-foreground">Site Content</h2>
              <p className="font-body text-sm text-foreground/60 mt-1">Edit text content across About, Initiatives, and other pages. Save each field individually.</p>
            </div>
            {sections.map((section) => (
              <div key={section} className="mb-10">
                <h3 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40 mb-4">{section}</h3>
                <div className="flex flex-col gap-5">
                  {CONTENT_FIELDS.filter((f) => f.section === section).map((field) => (
                    <div key={field.key} className="bg-card border border-border rounded-2xl p-5">
                      <label className="block font-body text-sm font-medium text-foreground mb-3">{field.label}</label>
                      {field.multiline ? (
                        <textarea
                          value={content[field.key] ?? ""}
                          onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                          rows={4}
                          className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-y"
                        />
                      ) : (
                        <input
                          value={content[field.key] ?? ""}
                          onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                          className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                        />
                      )}
                      <button onClick={() => saveContentField(field.key)} disabled={saving}
                        className="mt-3 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                        <Save size={13} />{saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
