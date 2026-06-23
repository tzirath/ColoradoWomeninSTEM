"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LogOut, Megaphone, Users, Plus, Trash2, GripVertical,
  Save, FileText, Heart, Briefcase, Upload, ChevronRight, LayoutDashboard, Search, Mail, MailX, Images
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import type { User } from "@supabase/supabase-js";

const INACTIVITY_MS = 15 * 60 * 1000;

interface NewsItem { id: string; text: string; link: string | null; active: boolean; sort_order: number; }
interface TeamMember { id: string; name: string; role: string; bio: string; hobbies: string; image_path: string; linkedin: string; flag: string; sort_order: number; active: boolean; }
interface ContentItem { key: string; value: string; }
interface CoreValue { id: string; label: string; description: string; sort_order: number; }
interface OpenRole { id: string; title: string; commitment: string; description: string; sort_order: number; active: boolean; }
interface Committee { id: string; name: string; description: string; sort_order: number; }
interface Member { id: string; email: string; first_name: string; stem_area: string | null; interests: string[]; opted_in: boolean; created_at: string; }
interface InitiativeEvent { slug: string; event_type: string; created_at: string; }
interface GalleryPhoto { id: string; url: string; sort_order: number; }

const DEFAULT_COMMITTEES: Committee[] = [
  { id: "default-1", name: "Social", description: "Plan events that bring members together.", sort_order: 0 },
  { id: "default-2", name: "Outreach & Partnerships", description: "Find meaningful partnerships with external organizations and sponsors.", sort_order: 1 },
  { id: "default-3", name: "Community Service", description: "Seek out community-focused initiatives.", sort_order: 2 },
  { id: "default-4", name: "Professional Development", description: "Empower members with the tools and knowledge to thrive in their careers and beyond.", sort_order: 3 },
];

interface Props {
  user: User;
  initialNewsItems: NewsItem[];
  initialTeamMembers: TeamMember[];
  initialContent: ContentItem[];
  initialCoreValues: CoreValue[];
  initialOpenRoles: OpenRole[];
  initialCommittees: Committee[];
  initialMembers: Member[];
  initialInitiativeEvents: InitiativeEvent[];
  initialGalleryPhotos: GalleryPhoto[];
}

type Tab = "dashboard" | "news" | "team" | "content" | "roles" | "gallery";

// ── Content sections + fields ────────────────────────────────────────────────
const CONTENT_SECTIONS = [
  {
    id: "about",
    label: "About",
    fields: [
      { key: "about_story_image", label: "Story — photo", type: "image" as const },
      { key: "about_story_p1", label: "Story — paragraph 1" },
      { key: "about_story_p2", label: "Story — paragraph 2" },
      { key: "about_mission", label: "Mission statement" },
      { key: "about_vision", label: "Vision statement" },
    ],
  },
  {
    id: "core-values",
    label: "Core Values",
    fields: [],
  },
  {
    id: "get-involved",
    label: "Get Involved",
    fields: [
      { key: "get_involved_hero", label: "Page subtitle" },
      { key: "get_involved_member_desc", label: "Become a Member description" },
      { key: "get_involved_community_service", label: "Community Service description" },
    ],
  },
  {
    id: "initiative-cards",
    label: "Initiative Cards",
    parent: "Initiatives",
    fields: [
      { key: "initiative_members_network_tagline", label: "Members Network — tagline" },
      { key: "initiative_members_network", label: "Members Network — description" },
      { key: "initiative_skill_swap_tagline", label: "Skill Swap — tagline" },
      { key: "initiative_skill_swap", label: "Skill Swap — description" },
      { key: "initiative_stem_in_action_tagline", label: "STEM in Action — tagline" },
      { key: "initiative_stem_in_action", label: "STEM in Action — description" },
      { key: "initiative_mentorship_tagline", label: "Mentorship — tagline" },
      { key: "initiative_mentorship", label: "Mentorship — description" },
      { key: "initiative_cws_voices_tagline", label: "CWS Voices — tagline" },
      { key: "initiative_cws_voices", label: "CWS Voices — description" },
    ],
  },
  {
    id: "initiative-pages",
    label: "Initiative Detail Pages",
    parent: "Initiatives",
    fields: [
      { key: "initiative_members_network_body", label: "Members Network — page body" },
      { key: "initiative_members_network_signup_url", label: "Members Network — Sign Up link" },
      { key: "initiative_skill_swap_body", label: "Skill Swap — page body" },
      { key: "initiative_skill_swap_signup_url", label: "Skill Swap — Sign Up link" },
      { key: "initiative_stem_in_action_body", label: "STEM in Action — page body" },
      { key: "initiative_stem_in_action_signup_url", label: "STEM in Action — Sign Up link" },
      { key: "initiative_mentorship_body", label: "Mentorship — page body" },
      { key: "initiative_mentorship_signup_url", label: "Mentorship — Sign Up link" },
      { key: "initiative_cws_voices_body", label: "CWS Voices — page body" },
      { key: "initiative_cws_voices_signup_url", label: "CWS Voices — Sign Up link" },
    ],
  },
];

const MAIN_TABS = [
  { key: "dashboard" as Tab, icon: LayoutDashboard, label: "Dashboard" },
  { key: "news" as Tab, icon: Megaphone, label: "News" },
  { key: "team" as Tab, icon: Users, label: "Team" },
  { key: "content" as Tab, icon: FileText, label: "Site Content" },
  { key: "roles" as Tab, icon: Briefcase, label: "Open Roles" },
  { key: "gallery" as Tab, icon: Images, label: "Gallery" },
];

export default function AdminDashboard({ user, initialNewsItems, initialTeamMembers, initialContent, initialCoreValues, initialOpenRoles, initialCommittees, initialMembers, initialInitiativeEvents, initialGalleryPhotos }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [memberSearch, setMemberSearch] = useState("");
  const [contentSection, setContentSection] = useState("about");
  const [teamSection, setTeamSection] = useState<"members" | "committees">("members");
  const [newsItems, setNewsItems] = useState(initialNewsItems);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [committees, setCommittees] = useState(initialCommittees.length ? initialCommittees : DEFAULT_COMMITTEES);
  const [content, setContent] = useState<Record<string, string>>(Object.fromEntries(initialContent.map((c) => [c.key, c.value])));
  const [coreValues, setCoreValues] = useState(initialCoreValues);
  const [openRoles, setOpenRoles] = useState(initialOpenRoles);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(initialGalleryPhotos);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState<string | null>(null); // key being saved
  const [toast, setToast] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(INACTIVITY_MS);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadingContent, setUploadingContent] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }, [supabase, router]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    const reset = () => {
      clearTimeout(timer); clearInterval(interval);
      setCountdown(INACTIVITY_MS);
      interval = setInterval(() => setCountdown((c) => Math.max(0, c - 1000)), 1000);
      timer = setTimeout(() => handleSignOut(), INACTIVITY_MS);
    };
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => { clearTimeout(timer); clearInterval(interval); events.forEach((e) => window.removeEventListener(e, reset)); };
  }, [handleSignOut]);

  const countdownMin = Math.floor(countdown / 60000);
  const countdownSec = Math.floor((countdown % 60000) / 1000);
  const countdownWarning = countdown < 2 * 60 * 1000;

  // ── News ─────────────────────────────────────────────────
  const saveNewsItems = async () => {
    setSaving("news");
    try {
      await supabase.from("news_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows = newsItems.filter((n) => n.text.trim()).map((n, i) => ({
        ...(n.id.startsWith("new-") ? {} : { id: n.id }),
        text: n.text.trim(), link: n.link || null, active: n.active, sort_order: i,
      }));
      if (rows.length) { const { error } = await supabase.from("news_items").insert(rows); if (error) throw error; }
      showToast("News saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(null); }
  };

  // ── Team ─────────────────────────────────────────────────
  const saveTeamMember = async (member: TeamMember) => {
    setSaving(member.id);
    try {
      const payload = { name: member.name, role: member.role, bio: member.bio, hobbies: member.hobbies, image_path: member.image_path, linkedin: member.linkedin, flag: member.flag, sort_order: member.sort_order, active: member.active };
      if (member.id.startsWith("new-")) {
        const { data, error } = await supabase.from("team_members").insert(payload).select().single();
        if (error) throw error;
        setTeamMembers(teamMembers.map((m) => (m.id === member.id ? data : m)));
      } else {
        const { error } = await supabase.from("team_members").update(payload).eq("id", member.id);
        if (error) throw error;
      }
      showToast("Member saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(null); }
  };

  const removeTeamMember = async (id: string) => {
    if (!id.startsWith("new-")) await supabase.from("team_members").delete().eq("id", id);
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
    showToast("Member removed.");
  };

  const handlePhotoUpload = async (memberId: string, file: File) => {
    setUploadingFor(memberId);
    try {
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("team-photos").upload(filename, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("team-photos").getPublicUrl(filename);
      setTeamMembers(teamMembers.map((m) => m.id === memberId ? { ...m, image_path: publicUrl } : m));
      showToast("Photo uploaded!");
    } catch { showToast("Upload failed."); } finally { setUploadingFor(null); }
  };

  // ── Content ───────────────────────────────────────────────
  const saveContentField = async (key: string) => {
    setSaving(key);
    try {
      const { error } = await supabase.from("site_content").upsert({ key, value: content[key] ?? "", updated_at: new Date().toISOString() });
      if (error) throw error;
      showToast("Saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(null); }
  };

  const handleContentImageUpload = async (key: string, file: File) => {
    setUploadingContent(key);
    try {
      const ext = file.name.split(".").pop();
      const filename = `content/${key}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("team-photos").upload(filename, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("team-photos").getPublicUrl(filename);
      setContent({ ...content, [key]: publicUrl });
      await supabase.from("site_content").upsert({ key, value: publicUrl, updated_at: new Date().toISOString() });
      showToast("Image uploaded!"); router.refresh();
    } catch { showToast("Upload failed."); } finally { setUploadingContent(null); }
  };

  // ── Core Values ───────────────────────────────────────────
  const saveCoreValue = async (v: CoreValue) => {
    setSaving(v.id);
    try {
      if (v.id.startsWith("new-")) {
        const { data, error } = await supabase.from("core_values").insert({ label: v.label, description: v.description, sort_order: v.sort_order }).select().single();
        if (error) throw error;
        setCoreValues(coreValues.map((c) => c.id === v.id ? data : c));
      } else {
        const { error } = await supabase.from("core_values").update({ label: v.label, description: v.description }).eq("id", v.id);
        if (error) throw error;
      }
      showToast("Value saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(null); }
  };

  const removeCoreValue = async (id: string) => {
    if (!id.startsWith("new-")) await supabase.from("core_values").delete().eq("id", id);
    setCoreValues(coreValues.filter((v) => v.id !== id));
    showToast("Value removed.");
  };

  // ── Application Link ──────────────────────────────────────────
  const saveApplicationLink = async () => {
    setSaving("committee_apply");
    try {
      const now = new Date().toISOString();
      await Promise.all([
        supabase.from("site_content").upsert({ key: "committee_apply_url", value: content["committee_apply_url"] ?? "", updated_at: now }),
        supabase.from("site_content").upsert({ key: "committee_apply_visible", value: content["committee_apply_visible"] ?? "true", updated_at: now }),
      ]);
      showToast("Saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(null); }
  };

  // ── Open Roles ────────────────────────────────────────────
  const saveOpenRole = async (r: OpenRole) => {
    setSaving(r.id);
    try {
      const payload = { title: r.title, commitment: r.commitment, description: r.description, sort_order: r.sort_order, active: r.active };
      if (r.id.startsWith("new-")) {
        const { data, error } = await supabase.from("open_roles").insert(payload).select().single();
        if (error) throw error;
        setOpenRoles(openRoles.map((o) => o.id === r.id ? data : o));
      } else {
        const { error } = await supabase.from("open_roles").update(payload).eq("id", r.id);
        if (error) throw error;
      }
      showToast("Role saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(null); }
  };

  const removeOpenRole = async (id: string) => {
    if (!id.startsWith("new-")) await supabase.from("open_roles").delete().eq("id", id);
    setOpenRoles(openRoles.filter((r) => r.id !== id));
    showToast("Role removed.");
  };

  // ── Committees ────────────────────────────────────────────
  const saveCommittee = async (c: Committee) => {
    setSaving(c.id);
    try {
      const payload = { name: c.name, description: c.description, sort_order: c.sort_order };
      if (c.id.startsWith("new-") || c.id.startsWith("default-")) {
        const { data, error } = await supabase.from("committees").insert(payload).select().single();
        if (error) throw error;
        setCommittees(committees.map((x) => x.id === c.id ? data : x));
      } else {
        const { error } = await supabase.from("committees").update(payload).eq("id", c.id);
        if (error) throw error;
      }
      showToast("Committee saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(null); }
  };

  const removeCommittee = async (id: string) => {
    if (!id.startsWith("new-") && !id.startsWith("default-")) await supabase.from("committees").delete().eq("id", id);
    setCommittees(committees.filter((c) => c.id !== id));
    showToast("Committee removed.");
  };

  // ── Gallery ───────────────────────────────────────────────
  const handleGalleryUpload = async (file: File) => {
    if (galleryPhotos.length >= 6) { showToast("Maximum 6 photos."); return; }
    setUploadingGallery(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `gallery/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("team-photos").upload(filename, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("team-photos").getPublicUrl(filename);
      const sort_order = galleryPhotos.length;
      const { data, error } = await supabase.from("gallery_photos").insert({ url: publicUrl, sort_order }).select().single();
      if (error) throw error;
      setGalleryPhotos([...galleryPhotos, data]);
      showToast("Photo added!");
    } catch (err) { console.error("Gallery upload error:", err); showToast("Upload failed."); } finally { setUploadingGallery(false); }
  };

  const removeGalleryPhoto = async (id: string) => {
    await supabase.from("gallery_photos").delete().eq("id", id);
    setGalleryPhotos(galleryPhotos.filter((p) => p.id !== id));
    showToast("Photo removed.");
  };

  const activeSection = CONTENT_SECTIONS.find((s) => s.id === contentSection) ?? CONTENT_SECTIONS[0];

  // Group content sections by parent for sidebar
  const sidebarGroups: { group?: string; items: typeof CONTENT_SECTIONS }[] = [
    { items: CONTENT_SECTIONS.filter((s) => !s.parent) },
    { group: "Initiatives", items: CONTENT_SECTIONS.filter((s) => s.parent === "Initiatives") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground font-body text-sm px-5 py-3 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Image src="/cws-logo.png" alt="CWS" width={36} height={36} />
          <div>
            <h1 className="font-body font-bold text-foreground text-lg leading-none">CWS Admin</h1>
            <p className="font-body text-xs text-foreground/50 mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-body text-xs tabular-nums ${countdownWarning ? "text-red-500 font-semibold" : "text-foreground/40"}`}>
            Auto sign-out {countdownMin}:{countdownSec.toString().padStart(2, "0")}
          </span>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 font-body text-sm text-foreground/60 hover:text-foreground transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      {/* ── Main Tab Bar ── */}
      <div className="border-b border-border bg-card overflow-x-auto sticky top-[73px] z-30">
        <div className="container mx-auto px-6 flex min-w-max">
          {MAIN_TABS.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => { setTab(key); setSidebarOpen(false); }}
              className={`inline-flex items-center gap-2 px-5 py-3.5 font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === key ? "border-primary text-primary" : "border-transparent text-foreground/60 hover:text-foreground"}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className={tab === "content" || tab === "team" ? "flex flex-col md:flex-row" : ""}>

        {/* Team sidebar */}
        {tab === "team" && (() => {
          const teamLabels: Record<string, string> = { members: "Team Members", committees: "Committees" };
          return (
            <aside className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-border bg-card md:min-h-[calc(100vh-120px)] md:sticky md:top-[121px] md:self-start">
              {/* Mobile toggle */}
              <button onClick={() => setSidebarOpen((v) => !v)}
                className="md:hidden w-full flex items-center justify-between px-5 py-3 font-body text-sm font-medium text-foreground">
                <span>{teamLabels[teamSection]}</span>
                <ChevronRight size={15} className={`transition-transform ${sidebarOpen ? "rotate-90" : ""}`} />
              </button>
              <nav className={`${sidebarOpen ? "block" : "hidden"} md:block py-4 px-3 flex flex-col gap-1`}>
                {(["members", "committees"] as const).map((s) => (
                  <button key={s} onClick={() => { setTeamSection(s); setSidebarOpen(false); }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg font-body text-sm transition-colors ${teamSection === s ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}>
                    {teamLabels[s]}
                    {teamSection === s && <ChevronRight size={13} className="hidden md:block" />}
                  </button>
                ))}
              </nav>
            </aside>
          );
        })()}

        {/* Content sidebar */}
        {tab === "content" && (() => {
          const allSections = CONTENT_SECTIONS;
          const activeLabel = allSections.find((s) => s.id === contentSection)?.label ?? "Select section";
          return (
            <aside className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-border bg-card md:min-h-[calc(100vh-120px)] md:sticky md:top-[121px] md:self-start">
              {/* Mobile toggle */}
              <button onClick={() => setSidebarOpen((v) => !v)}
                className="md:hidden w-full flex items-center justify-between px-5 py-3 font-body text-sm font-medium text-foreground">
                <span>{activeLabel}</span>
                <ChevronRight size={15} className={`transition-transform ${sidebarOpen ? "rotate-90" : ""}`} />
              </button>
              <nav className={`${sidebarOpen ? "block" : "hidden"} md:block py-4 px-3 flex flex-col gap-1`}>
                {sidebarGroups.map((group, gi) => (
                  <div key={gi}>
                    {group.group && (
                      <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40 px-3 pt-4 pb-2">
                        {group.group}
                      </p>
                    )}
                    {group.items.map((section) => (
                      <button key={section.id} onClick={() => { setContentSection(section.id); setSidebarOpen(false); }}
                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg font-body text-sm transition-colors ${contentSection === section.id ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}>
                        {section.label}
                        {contentSection === section.id && <ChevronRight size={13} className="hidden md:block" />}
                      </button>
                    ))}
                  </div>
                ))}
              </nav>
            </aside>
          );
        })()}

        {/* Main content area */}
        <div className={tab === "content" || tab === "team" ? "flex-1 min-w-0" : ""}>
          <div className="container mx-auto px-6 py-10 max-w-3xl">

            {/* ── Dashboard ── */}
            {tab === "dashboard" && (() => {
              const now = new Date();
              const thisMonth = initialMembers.filter((m) => {
                const d = new Date(m.created_at);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              });
              const optedIn = initialMembers.filter((m) => m.opted_in);

              // Signups by month (last 6 months)
              const monthData = Array.from({ length: 6 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
                const label = d.toLocaleString("default", { month: "short" });
                const count = initialMembers.filter((m) => {
                  const md = new Date(m.created_at);
                  return md.getMonth() === d.getMonth() && md.getFullYear() === d.getFullYear();
                }).length;
                return { month: label, count };
              });

              // STEM area breakdown
              const stemCounts: Record<string, number> = {};
              initialMembers.forEach((m) => {
                const k = m.stem_area || "Not specified";
                stemCounts[k] = (stemCounts[k] || 0) + 1;
              });
              const stemData = Object.entries(stemCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

              // Interests breakdown
              const interestCounts: Record<string, number> = {};
              initialMembers.forEach((m) => {
                (m.interests ?? []).forEach((interest) => {
                  interestCounts[interest] = (interestCounts[interest] || 0) + 1;
                });
              });
              const interestData = Object.entries(interestCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

              const filtered = initialMembers.filter((m) => {
                const q = memberSearch.toLowerCase();
                return !q || m.email.toLowerCase().includes(q) || m.first_name.toLowerCase().includes(q) || (m.stem_area ?? "").toLowerCase().includes(q);
              });

              const COLORS = ["#7C5CBF", "#C06C8A", "#9B7ED9", "#D4909F", "#A78BDB", "#E0A0B0", "#B39FD6", "#F0B8C0"];

              return (
                <div className="space-y-10">
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Members", value: initialMembers.length, sub: "all time" },
                      { label: "This Month", value: thisMonth.length, sub: "new sign-ups" },
                      { label: "Newsletter", value: optedIn.length, sub: `${initialMembers.length ? Math.round(optedIn.length / initialMembers.length * 100) : 0}% opted in` },
                      { label: "STEM Fields", value: Object.keys(stemCounts).filter((k) => k !== "Not specified").length, sub: "represented" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
                        <p className="font-body text-xs text-foreground/50 uppercase tracking-wide mb-1">{stat.label}</p>
                        <p className="font-display text-4xl font-bold text-primary">{stat.value}</p>
                        <p className="font-body text-xs text-foreground/50 mt-1">{stat.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sign-ups over time */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-body font-semibold text-foreground mb-4">Sign-ups — last 6 months</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={monthData} barSize={32}>
                        <XAxis dataKey="month" tick={{ fontFamily: "inherit", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontFamily: "inherit", fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
                        <Tooltip contentStyle={{ fontFamily: "inherit", fontSize: 12, borderRadius: 8 }} />
                        <Bar dataKey="count" fill="#7C5CBF" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* STEM Areas */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-body font-semibold text-foreground mb-4">STEM Areas</h3>
                      {stemData.length === 0 ? <p className="font-body text-sm text-foreground/40">No data yet.</p> : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={stemData} layout="vertical" barSize={14}>
                            <XAxis type="number" allowDecimals={false} tick={{ fontFamily: "inherit", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" width={130} tick={{ fontFamily: "inherit", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ fontFamily: "inherit", fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                              {stemData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Interests */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-body font-semibold text-foreground mb-4">Interests</h3>
                      {interestData.length === 0 ? <p className="font-body text-sm text-foreground/40">No data yet.</p> : (
                        <div className="flex flex-col gap-2">
                          {interestData.map(({ name, count }, i) => (
                            <div key={name}>
                              <div className="flex justify-between font-body text-sm mb-1">
                                <span className="text-foreground/80">{name}</span>
                                <span className="text-foreground/50">{count}</span>
                              </div>
                              <div className="h-2 rounded-full bg-border overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.round(count / initialMembers.length * 100)}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Initiative interest */}
                  {(() => {
                    const SLUGS = ["members-network", "skill-swap", "stem-in-action", "mentorship", "cws-voices"];
                    const LABELS: Record<string, string> = {
                      "members-network": "Members Network",
                      "skill-swap": "Skill Swap",
                      "stem-in-action": "STEM in Action",
                      "mentorship": "Mentorship",
                      "cws-voices": "CWS Voices",
                    };
                    const initiativeData = SLUGS.map((slug) => ({
                      name: LABELS[slug],
                      views: initialInitiativeEvents.filter((e) => e.slug === slug && e.event_type === "view").length,
                      clicks: initialInitiativeEvents.filter((e) => e.slug === slug && e.event_type === "signup_click").length,
                    })).sort((a, b) => b.views - a.views);
                    return (
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-body font-semibold text-foreground mb-1">Initiative Interest</h3>
                        <p className="font-body text-xs text-foreground/40 mb-5">Page views and sign-up button clicks per initiative</p>
                        {initialInitiativeEvents.length === 0 ? (
                          <p className="font-body text-sm text-foreground/40 py-4">No data yet — visits will appear here once members browse the initiatives.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={initiativeData} barSize={18} barGap={4}>
                              <XAxis dataKey="name" tick={{ fontFamily: "inherit", fontSize: 11 }} axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} tick={{ fontFamily: "inherit", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                              <Tooltip contentStyle={{ fontFamily: "inherit", fontSize: 12, borderRadius: 8 }} />
                              <Bar dataKey="views" name="Page views" fill="#7C5CBF" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="clicks" name="Sign-up clicks" fill="#C06C8A" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    );
                  })()}

                  {/* Member table */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <h3 className="font-body font-semibold text-foreground">Member Directory</h3>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                        <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                          placeholder="Search name, email, field…"
                          className="pl-8 pr-4 py-2 font-body text-sm bg-background border border-border rounded-lg outline-none focus:border-primary transition-colors w-full sm:w-64" />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full font-body text-sm">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="pb-3 pr-4 font-medium text-foreground/50 whitespace-nowrap">Name</th>
                            <th className="pb-3 pr-4 font-medium text-foreground/50 whitespace-nowrap">Email</th>
                            <th className="pb-3 pr-4 font-medium text-foreground/50 whitespace-nowrap hidden md:table-cell">STEM Area</th>
                            <th className="pb-3 pr-4 font-medium text-foreground/50 whitespace-nowrap hidden lg:table-cell">Interests</th>
                            <th className="pb-3 font-medium text-foreground/50 whitespace-nowrap">Newsletter</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((m) => (
                            <tr key={m.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                              <td className="py-3 pr-4 font-medium text-foreground whitespace-nowrap">{m.first_name}</td>
                              <td className="py-3 pr-4 text-foreground/70">{m.email}</td>
                              <td className="py-3 pr-4 text-foreground/60 hidden md:table-cell">{m.stem_area || <span className="text-foreground/30">—</span>}</td>
                              <td className="py-3 pr-4 text-foreground/60 hidden lg:table-cell max-w-[200px] truncate">{m.interests?.join(", ") || <span className="text-foreground/30">—</span>}</td>
                              <td className="py-3">
                                {m.opted_in
                                  ? <Mail size={14} className="text-primary" />
                                  : <MailX size={14} className="text-foreground/30" />}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filtered.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-8">No members found.</p>}
                    </div>
                    <p className="font-body text-xs text-foreground/40 mt-4">{filtered.length} of {initialMembers.length} members</p>
                  </div>
                </div>
              );
            })()}

            {/* ── News ── */}
            {tab === "news" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-body text-xl font-semibold text-foreground">News Banner</h2>
                    <p className="font-body text-sm text-foreground/60 mt-1">Rotating announcements at the top of the home page.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-body text-xs font-medium tabular-nums ${newsItems.length >= 5 ? "text-red-500" : "text-foreground/40"}`}>{newsItems.length}/5</span>
                    <button onClick={() => setNewsItems([...newsItems, { id: `new-${Date.now()}`, text: "", link: null, active: true, sort_order: newsItems.length }])}
                      disabled={newsItems.length >= 5}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {newsItems.map((item) => (
                    <div key={item.id} className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <GripVertical size={16} className="text-foreground/30 shrink-0" />
                        <input value={item.text} onChange={(e) => setNewsItems(newsItems.map((n) => n.id === item.id ? { ...n, text: e.target.value } : n))}
                          placeholder="Announcement text…"
                          className="flex-1 font-body text-sm bg-transparent outline-none text-foreground placeholder:text-foreground/30" />
                        <label className="flex items-center gap-1.5 font-body text-xs text-foreground/60 shrink-0">
                          <input type="checkbox" checked={item.active} onChange={(e) => setNewsItems(newsItems.map((n) => n.id === item.id ? { ...n, active: e.target.checked } : n))} className="accent-primary" /> Active
                        </label>
                        <button onClick={() => setNewsItems(newsItems.filter((n) => n.id !== item.id))} className="text-foreground/30 hover:text-red-500 transition-colors shrink-0"><Trash2 size={15} /></button>
                      </div>
                      <input value={item.link ?? ""} onChange={(e) => setNewsItems(newsItems.map((n) => n.id === item.id ? { ...n, link: e.target.value || null } : n))}
                        placeholder="Link (optional) — e.g. /get-involved or https://..."
                        className="ml-6 font-body text-xs bg-transparent outline-none text-foreground/60 placeholder:text-foreground/20 border-b border-dashed border-border focus:border-primary transition-colors pb-0.5" />
                    </div>
                  ))}
                </div>
                {newsItems.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No items. Add one above.</p>}
                <button onClick={saveNewsItems} disabled={saving === "news"}
                  className="mt-6 inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50">
                  <Save size={15} />{saving === "news" ? "Saving…" : "Save All"}
                </button>
              </div>
            )}

            {/* ── Team ── */}
            {tab === "team" && teamSection === "members" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-body text-xl font-semibold text-foreground">Team Members</h2>
                    <p className="font-body text-sm text-foreground/60 mt-1">Add, edit, or remove team member profiles.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-body text-xs font-medium tabular-nums ${teamMembers.length >= 7 ? "text-red-500" : "text-foreground/40"}`}>{teamMembers.length}/7</span>
                    <button onClick={() => setTeamMembers([...teamMembers, { id: `new-${Date.now()}`, name: "", role: "", bio: "", hobbies: "", image_path: "", linkedin: "", flag: "", sort_order: teamMembers.length, active: true }])}
                      disabled={teamMembers.length >= 7}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Plus size={14} /> Add Member
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-body font-semibold text-foreground">{member.name || "New Member"}</h3>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 font-body text-xs text-foreground/60">
                            <input type="checkbox" checked={member.active} onChange={(e) => setTeamMembers(teamMembers.map((m) => m.id === member.id ? { ...m, active: e.target.checked } : m))} className="accent-primary" /> Active
                          </label>
                          <button onClick={() => removeTeamMember(member.id)} className="text-foreground/30 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      {/* Photo */}
                      <div className="mb-5 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shrink-0">
                          {member.image_path
                            ? <img src={member.image_path} alt={member.name} className="w-full h-full object-cover" />
                            : <span className="font-display text-xl font-bold text-primary">{member.name?.[0] ?? "?"}</span>}
                        </div>
                        <div>
                          <label className="inline-flex items-center gap-2 cursor-pointer bg-background border border-border rounded-lg px-4 py-2 font-body text-sm hover:border-primary transition-colors">
                            <Upload size={14} className="text-foreground/60" />
                            {uploadingFor === member.id ? "Uploading…" : "Upload Photo"}
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(member.id, f); }} />
                          </label>
                          {member.image_path && (
                            <button onClick={() => setTeamMembers(teamMembers.map((m) => m.id === member.id ? { ...m, image_path: "" } : m))}
                              className="ml-2 font-body text-xs text-foreground/40 hover:text-red-500 transition-colors">Remove</button>
                          )}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {([["Name", "name", "Dr. Jane Smith"], ["Role", "role", "Founder & Director"], ["LinkedIn URL", "linkedin", "https://linkedin.com/in/..."]] as const).map(([lbl, field, ph]) => (
                          <div key={field}>
                            <label className="block font-body text-xs font-medium text-foreground/60 mb-1">{lbl}</label>
                            <input value={(member[field] as string) ?? ""} onChange={(e) => setTeamMembers(teamMembers.map((m) => m.id === member.id ? { ...m, [field]: e.target.value } : m))}
                              placeholder={ph} className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors" />
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Bio</label>
                          <textarea value={member.bio} onChange={(e) => setTeamMembers(teamMembers.map((m) => m.id === member.id ? { ...m, bio: e.target.value } : m))}
                            rows={2} className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-none" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Hobbies / Interests</label>
                          <input value={member.hobbies} onChange={(e) => setTeamMembers(teamMembers.map((m) => m.id === member.id ? { ...m, hobbies: e.target.value } : m))}
                            placeholder="Dance · Yoga · Travel" className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Flag emoji</label>
                          <input value={member.flag ?? ""} onChange={(e) => setTeamMembers(teamMembers.map((m) => m.id === member.id ? { ...m, flag: e.target.value } : m))}
                            placeholder="🇲🇽" className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors" />
                        </div>
                      </div>
                      <button onClick={() => saveTeamMember(member)} disabled={saving === member.id || uploadingFor === member.id}
                        className="mt-5 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                        <Save size={13} />{saving === member.id ? "Saving…" : "Save"}
                      </button>
                    </div>
                  ))}
                </div>
                {teamMembers.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No members. Add one above.</p>}
              </div>
            )}

            {/* ── Committees ── */}
            {tab === "team" && teamSection === "committees" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-body text-xl font-semibold text-foreground">Committees</h2>
                    <p className="font-body text-sm text-foreground/60 mt-1">Shown in the table on the Team page.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-body text-xs font-medium tabular-nums ${committees.length >= 6 ? "text-red-500" : "text-foreground/40"}`}>{committees.length}/6</span>
                    <button onClick={() => setCommittees([...committees, { id: `new-${Date.now()}`, name: "", description: "", sort_order: committees.length }])}
                      disabled={committees.length >= 6}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Plus size={14} /> Add Committee
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  {committees.map((c) => (
                    <div key={c.id} className="bg-card border border-border rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-body font-semibold text-foreground">{c.name || "New Committee"}</span>
                        <button onClick={() => removeCommittee(c.id)} className="text-foreground/30 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                      </div>
                      <div className="grid gap-3">
                        <div>
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Name</label>
                          <input value={c.name} onChange={(e) => setCommittees(committees.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))}
                            placeholder="e.g. Social" className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Description</label>
                          <textarea value={c.description} onChange={(e) => setCommittees(committees.map((x) => x.id === c.id ? { ...x, description: e.target.value } : x))}
                            rows={2} className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-none" />
                        </div>
                      </div>
                      <button onClick={() => saveCommittee(c)} disabled={saving === c.id}
                        className="mt-4 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                        <Save size={13} />{saving === c.id ? "Saving…" : "Save"}
                      </button>
                    </div>
                  ))}
                </div>
                {committees.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No committees. Add one above.</p>}
              </div>
            )}

            {/* ── Site Content ── */}
            {tab === "content" && contentSection !== "core-values" && (
              <div>
                <div className="mb-8">
                  <h2 className="font-body text-xl font-semibold text-foreground">{activeSection.label}</h2>
                  <p className="font-body text-sm text-foreground/60 mt-1">Save each field individually — changes go live immediately.</p>
                </div>
                <div className="flex flex-col gap-5">
                  {activeSection.fields.map((field) => (
                    <div key={field.key} className="bg-card border border-border rounded-2xl p-5">
                      <label className="block font-body text-sm font-medium text-foreground mb-3">{field.label}</label>
                      {field.type === "image" ? (
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                            {content[field.key]
                              ? <img src={content[field.key]} alt="" className="w-full h-full object-cover" />
                              : <img src="/cws-logo-sqr.png" alt="default" className="w-full h-full object-cover opacity-40" />}
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="inline-flex items-center gap-2 cursor-pointer bg-background border border-border rounded-lg px-4 py-2 font-body text-sm hover:border-primary transition-colors">
                              <Upload size={14} className="text-foreground/60" />
                              {uploadingContent === field.key ? "Uploading…" : "Upload Image"}
                              <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleContentImageUpload(field.key, f); }} />
                            </label>
                            {content[field.key] && (
                              <button onClick={() => { setContent({ ...content, [field.key]: "" }); saveContentField(field.key); }}
                                className="font-body text-xs text-foreground/40 hover:text-red-500 transition-colors text-left">Remove</button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <textarea
                            value={content[field.key] ?? ""}
                            onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                            rows={field.key.endsWith("_body") ? 6 : field.key.endsWith("_tagline") || field.key.endsWith("_url") ? 1 : 3}
                            className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-y"
                          />
                          <button onClick={() => saveContentField(field.key)} disabled={saving === field.key}
                            className="mt-3 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                            <Save size={13} />{saving === field.key ? "Saving…" : "Save"}
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Core Values (under Site Content sidebar) ── */}
            {tab === "content" && contentSection === "core-values" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-body text-xl font-semibold text-foreground">Core Values</h2>
                    <p className="font-body text-sm text-foreground/60 mt-1">Shown on the About page.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-body text-xs font-medium tabular-nums ${coreValues.length >= 6 ? "text-red-500" : "text-foreground/40"}`}>{coreValues.length}/6</span>
                    <button onClick={() => setCoreValues([...coreValues, { id: `new-${Date.now()}`, label: "", description: "", sort_order: coreValues.length }])}
                      disabled={coreValues.length >= 6}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Plus size={14} /> Add Value
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  {coreValues.map((v) => (
                    <div key={v.id} className="bg-card border border-border rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-body font-semibold text-foreground">{v.label || "New Value"}</span>
                        <button onClick={() => removeCoreValue(v.id)} className="text-foreground/30 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                      </div>
                      <div className="grid gap-3">
                        <div>
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Label</label>
                          <input value={v.label} onChange={(e) => setCoreValues(coreValues.map((c) => c.id === v.id ? { ...c, label: e.target.value } : c))}
                            placeholder="e.g. Belonging" className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Description</label>
                          <textarea value={v.description} onChange={(e) => setCoreValues(coreValues.map((c) => c.id === v.id ? { ...c, description: e.target.value } : c))}
                            rows={2} className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-none" />
                        </div>
                      </div>
                      <button onClick={() => saveCoreValue(v)} disabled={saving === v.id}
                        className="mt-4 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                        <Save size={13} />{saving === v.id ? "Saving…" : "Save"}
                      </button>
                    </div>
                  ))}
                </div>
                {coreValues.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No values. Add one above.</p>}
              </div>
            )}

            {/* ── Open Roles ── */}
            {tab === "roles" && (
              <div>
                {/* Application link card */}
                <div className="bg-card border border-border rounded-2xl p-5 mb-8">
                  <h3 className="font-body font-semibold text-foreground mb-1">Committee Application Link</h3>
                  <p className="font-body text-xs text-foreground/50 mb-4">Controls the "Apply" button shown below the roles on the Get Involved page.</p>
                  <div className="grid gap-3">
                    <div>
                      <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Application form URL</label>
                      <input
                        value={content["committee_apply_url"] ?? ""}
                        onChange={(e) => setContent({ ...content, committee_apply_url: e.target.value })}
                        placeholder="https://forms.gle/..."
                        className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <label className="flex items-center gap-2 font-body text-sm text-foreground/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={content["committee_apply_visible"] !== "false"}
                        onChange={(e) => setContent({ ...content, committee_apply_visible: e.target.checked ? "true" : "false" })}
                        className="accent-primary"
                      />
                      Show "Apply for a Committee Position" button on the public page
                    </label>
                  </div>
                  <button
                    onClick={saveApplicationLink}
                    disabled={saving === "committee_apply"}
                    className="mt-4 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    <Save size={13} />{saving === "committee_apply" ? "Saving…" : "Save"}
                  </button>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-body text-xl font-semibold text-foreground">Open Roles</h2>
                    <p className="font-body text-sm text-foreground/60 mt-1">Volunteer and leadership opportunities on Get Involved.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-body text-xs font-medium tabular-nums ${openRoles.length >= 6 ? "text-red-500" : "text-foreground/40"}`}>{openRoles.length}/6</span>
                    <button onClick={() => setOpenRoles([...openRoles, { id: `new-${Date.now()}`, title: "", commitment: "", description: "", sort_order: openRoles.length, active: true }])}
                      disabled={openRoles.length >= 6}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Plus size={14} /> Add Role
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  {openRoles.map((r) => (
                    <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-body font-semibold text-foreground">{r.title || "New Role"}</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 font-body text-xs text-foreground/60">
                            <input type="checkbox" checked={r.active} onChange={(e) => setOpenRoles(openRoles.map((o) => o.id === r.id ? { ...o, active: e.target.checked } : o))} className="accent-primary" /> Active
                          </label>
                          <button onClick={() => removeOpenRole(r.id)} className="text-foreground/30 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Title</label>
                          <input value={r.title} onChange={(e) => setOpenRoles(openRoles.map((o) => o.id === r.id ? { ...o, title: e.target.value } : o))}
                            placeholder="Committee Chair — Social" className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Time commitment</label>
                          <input value={r.commitment} onChange={(e) => setOpenRoles(openRoles.map((o) => o.id === r.id ? { ...o, commitment: e.target.value } : o))}
                            placeholder="~2–4 hrs/month" className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Description</label>
                          <textarea value={r.description} onChange={(e) => setOpenRoles(openRoles.map((o) => o.id === r.id ? { ...o, description: e.target.value } : o))}
                            rows={2} className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-none" />
                        </div>
                      </div>
                      <button onClick={() => saveOpenRole(r)} disabled={saving === r.id}
                        className="mt-4 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                        <Save size={13} />{saving === r.id ? "Saving…" : "Save"}
                      </button>
                    </div>
                  ))}
                </div>
                {openRoles.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No roles. Add one above.</p>}
              </div>
            )}

            {/* ── Gallery ── */}
            {tab === "gallery" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-body text-xl font-bold text-foreground">Gallery</h2>
                    <p className="font-body text-sm text-foreground/50 mt-0.5">Up to 6 photos shown in the home page carousel.</p>
                  </div>
                  {galleryPhotos.length < 6 && (
                    <label className={`inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 cursor-pointer ${uploadingGallery ? "opacity-50 pointer-events-none" : ""}`}>
                      <Upload size={14} />{uploadingGallery ? "Uploading…" : "Add Photo"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGalleryUpload(f); e.target.value = ""; }} />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryPhotos.map((p) => (
                    <div key={p.id} className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-muted">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <button
                          onClick={() => removeGalleryPhoto(p.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 6 - galleryPhotos.length) }).map((_, i) => (
                    <label key={`empty-${i}`} className="relative rounded-xl aspect-[4/3] bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Upload size={20} className="text-muted-foreground mb-1" />
                      <span className="font-body text-xs text-muted-foreground">Add photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGalleryUpload(f); e.target.value = ""; }} />
                    </label>
                  ))}
                </div>
                <p className="font-body text-xs text-foreground/40">{galleryPhotos.length}/6 photos · Hover a photo and click the trash icon to remove it.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
