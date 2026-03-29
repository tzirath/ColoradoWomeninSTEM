"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LogOut, Megaphone, Users, Plus, Trash2, GripVertical,
  Save, FileText, Heart, Briefcase, Upload, X
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const INACTIVITY_MS = 15 * 60 * 1000;

interface NewsItem { id: string; text: string; active: boolean; sort_order: number; }
interface TeamMember { id: string; name: string; role: string; bio: string; hobbies: string; image_path: string; linkedin: string; sort_order: number; active: boolean; }
interface ContentItem { key: string; value: string; }
interface CoreValue { id: string; label: string; description: string; sort_order: number; }
interface OpenRole { id: string; title: string; commitment: string; description: string; sort_order: number; active: boolean; }

interface Props {
  user: User;
  initialNewsItems: NewsItem[];
  initialTeamMembers: TeamMember[];
  initialContent: ContentItem[];
  initialCoreValues: CoreValue[];
  initialOpenRoles: OpenRole[];
}

type Tab = "news" | "team" | "content" | "values" | "roles";

const CONTENT_FIELDS: { key: string; label: string; section: string; multiline?: boolean }[] = [
  { key: "about_story_p1", label: "Story — paragraph 1", section: "About", multiline: true },
  { key: "about_story_p2", label: "Story — paragraph 2", section: "About", multiline: true },
  { key: "about_mission", label: "Mission statement", section: "About", multiline: true },
  { key: "about_vision", label: "Vision statement", section: "About", multiline: true },
  { key: "get_involved_hero", label: "Hero subtitle", section: "Get Involved", multiline: true },
  { key: "get_involved_member_desc", label: "Become a Member description", section: "Get Involved", multiline: true },
  { key: "get_involved_community_service", label: "Community Service description", section: "Get Involved", multiline: true },
  { key: "initiative_members_network", label: "Members Network — card description", section: "Initiatives", multiline: true },
  { key: "initiative_skill_swap", label: "Skill Swap — card description", section: "Initiatives", multiline: true },
  { key: "initiative_stem_in_action", label: "STEM in Action — card description", section: "Initiatives", multiline: true },
  { key: "initiative_mentorship", label: "Mentorship — card description", section: "Initiatives", multiline: true },
  { key: "initiative_cws_voices", label: "CWS Voices — card description", section: "Initiatives", multiline: true },
  { key: "initiative_members_network_body", label: "Members Network — full page body", section: "Initiative Detail Pages", multiline: true },
  { key: "initiative_skill_swap_body", label: "Skill Swap — full page body", section: "Initiative Detail Pages", multiline: true },
  { key: "initiative_stem_in_action_body", label: "STEM in Action — full page body", section: "Initiative Detail Pages", multiline: true },
  { key: "initiative_mentorship_body", label: "Mentorship — full page body", section: "Initiative Detail Pages", multiline: true },
  { key: "initiative_cws_voices_body", label: "CWS Voices — full page body", section: "Initiative Detail Pages", multiline: true },
];

export default function AdminDashboard({ user, initialNewsItems, initialTeamMembers, initialContent, initialCoreValues, initialOpenRoles }: Props) {
  const [tab, setTab] = useState<Tab>("news");
  const [newsItems, setNewsItems] = useState(initialNewsItems);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [content, setContent] = useState<Record<string, string>>(Object.fromEntries(initialContent.map((c) => [c.key, c.value])));
  const [coreValues, setCoreValues] = useState(initialCoreValues);
  const [openRoles, setOpenRoles] = useState(initialOpenRoles);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(INACTIVITY_MS);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
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
    setSaving(true);
    try {
      await supabase.from("news_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows = newsItems.filter((n) => n.text.trim()).map((n, i) => ({
        ...(n.id.startsWith("new-") ? {} : { id: n.id }),
        text: n.text.trim(), active: n.active, sort_order: i,
      }));
      if (rows.length) { const { error } = await supabase.from("news_items").insert(rows); if (error) throw error; }
      showToast("News saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(false); }
  };

  // ── Team ─────────────────────────────────────────────────
  const saveTeamMember = async (member: TeamMember) => {
    setSaving(true);
    try {
      const payload = { name: member.name, role: member.role, bio: member.bio, hobbies: member.hobbies, image_path: member.image_path, linkedin: member.linkedin, sort_order: member.sort_order, active: member.active };
      if (member.id.startsWith("new-")) {
        const { data, error } = await supabase.from("team_members").insert(payload).select().single();
        if (error) throw error;
        setTeamMembers(teamMembers.map((m) => (m.id === member.id ? data : m)));
      } else {
        const { error } = await supabase.from("team_members").update(payload).eq("id", member.id);
        if (error) throw error;
      }
      showToast("Member saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(false); }
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
    } catch { showToast("Upload failed. Try again."); } finally { setUploadingFor(null); }
  };

  // ── Site Content ─────────────────────────────────────────
  const saveContentField = async (key: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("site_content").upsert({ key, value: content[key] ?? "", updated_at: new Date().toISOString() });
      if (error) throw error;
      showToast("Saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(false); }
  };

  // ── Core Values ──────────────────────────────────────────
  const saveCoreValue = async (v: CoreValue) => {
    setSaving(true);
    try {
      if (v.id.startsWith("new-")) {
        const { data, error } = await supabase.from("core_values").insert({ label: v.label, description: v.description, sort_order: v.sort_order }).select().single();
        if (error) throw error;
        setCoreValues(coreValues.map((c) => c.id === v.id ? data : c));
      } else {
        const { error } = await supabase.from("core_values").update({ label: v.label, description: v.description, sort_order: v.sort_order }).eq("id", v.id);
        if (error) throw error;
      }
      showToast("Value saved!"); router.refresh();
    } catch { showToast("Error saving."); } finally { setSaving(false); }
  };

  const removeCoreValue = async (id: string) => {
    if (!id.startsWith("new-")) await supabase.from("core_values").delete().eq("id", id);
    setCoreValues(coreValues.filter((v) => v.id !== id));
    showToast("Value removed.");
  };

  // ── Open Roles ───────────────────────────────────────────
  const saveOpenRole = async (r: OpenRole) => {
    setSaving(true);
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
    } catch { showToast("Error saving."); } finally { setSaving(false); }
  };

  const removeOpenRole = async (id: string) => {
    if (!id.startsWith("new-")) await supabase.from("open_roles").delete().eq("id", id);
    setOpenRoles(openRoles.filter((r) => r.id !== id));
    showToast("Role removed.");
  };

  const sections = [...new Set(CONTENT_FIELDS.map((f) => f.section))];

  const TABS = [
    ["news", Megaphone, "News"],
    ["team", Users, "Team"],
    ["content", FileText, "Content"],
    ["values", Heart, "Core Values"],
    ["roles", Briefcase, "Open Roles"],
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground font-body text-sm px-5 py-3 rounded-lg shadow-lg">{toast}</div>
      )}

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

      <div className="border-b border-border bg-card overflow-x-auto">
        <div className="container mx-auto px-6 flex gap-0 min-w-max">
          {TABS.map(([key, Icon, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 px-5 py-4 font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === key ? "border-primary text-primary" : "border-transparent text-foreground/60 hover:text-foreground"}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-3xl">

        {/* ── News ── */}
        {tab === "news" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="font-body text-xl font-semibold text-foreground">News Banner</h2>
                <p className="font-body text-sm text-foreground/60 mt-1">Rotating announcements at the top of the home page.</p></div>
              <button onClick={() => setNewsItems([...newsItems, { id: `new-${Date.now()}`, text: "", active: true, sort_order: newsItems.length }])}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {newsItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                  <GripVertical size={16} className="text-foreground/30 shrink-0" />
                  <input value={item.text} onChange={(e) => setNewsItems(newsItems.map((n) => n.id === item.id ? { ...n, text: e.target.value } : n))}
                    placeholder="Enter announcement text..."
                    className="flex-1 font-body text-sm bg-transparent outline-none text-foreground placeholder:text-foreground/30" />
                  <label className="flex items-center gap-1.5 font-body text-xs text-foreground/60 shrink-0">
                    <input type="checkbox" checked={item.active} onChange={(e) => setNewsItems(newsItems.map((n) => n.id === item.id ? { ...n, active: e.target.checked } : n))} className="accent-primary" /> Active
                  </label>
                  <button onClick={() => setNewsItems(newsItems.filter((n) => n.id !== item.id))} className="text-foreground/30 hover:text-red-500 transition-colors shrink-0"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            {newsItems.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No items. Add one above.</p>}
            <button onClick={saveNewsItems} disabled={saving}
              className="mt-6 inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50">
              <Save size={15} />{saving ? "Saving…" : "Save All"}
            </button>
          </div>
        )}

        {/* ── Team ── */}
        {tab === "team" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="font-body text-xl font-semibold text-foreground">Team Members</h2>
                <p className="font-body text-sm text-foreground/60 mt-1">Add, edit, or remove team member profiles.</p></div>
              <button onClick={() => setTeamMembers([...teamMembers, { id: `new-${Date.now()}`, name: "", role: "", bio: "", hobbies: "", image_path: "", linkedin: "", sort_order: teamMembers.length, active: true }])}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
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
                        <input type="checkbox" checked={member.active} onChange={(e) => setTeamMembers(teamMembers.map((m) => m.id === member.id ? { ...m, active: e.target.checked } : m))} className="accent-primary" /> Active
                      </label>
                      <button onClick={() => removeTeamMember(member.id)} className="text-foreground/30 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </div>

                  {/* Photo upload */}
                  <div className="mb-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shrink-0">
                      {member.image_path ? (
                        <img src={member.image_path} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display text-xl font-bold text-primary">{member.name?.[0] ?? "?"}</span>
                      )}
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
                          className="ml-2 font-body text-xs text-foreground/40 hover:text-red-500 transition-colors">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {([["Name", "name", "Dr. Jane Smith"], ["Role", "role", "Founder & Director"], ["LinkedIn URL", "linkedin", "https://linkedin.com/in/..."]] as const).map(([label, field, ph]) => (
                      <div key={field}>
                        <label className="block font-body text-xs font-medium text-foreground/60 mb-1">{label}</label>
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
                  </div>
                  <button onClick={() => saveTeamMember(member)} disabled={saving || uploadingFor === member.id}
                    className="mt-5 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                    <Save size={13} />{saving ? "Saving…" : "Save"}
                  </button>
                </div>
              ))}
            </div>
            {teamMembers.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No team members. Add one above.</p>}
          </div>
        )}

        {/* ── Site Content ── */}
        {tab === "content" && (
          <div>
            <div className="mb-8">
              <h2 className="font-body text-xl font-semibold text-foreground">Site Content</h2>
              <p className="font-body text-sm text-foreground/60 mt-1">Edit text across all pages. Save each field individually.</p>
            </div>
            {sections.map((section) => (
              <div key={section} className="mb-10">
                <h3 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40 mb-4">{section}</h3>
                <div className="flex flex-col gap-5">
                  {CONTENT_FIELDS.filter((f) => f.section === section).map((field) => (
                    <div key={field.key} className="bg-card border border-border rounded-2xl p-5">
                      <label className="block font-body text-sm font-medium text-foreground mb-3">{field.label}</label>
                      <textarea value={content[field.key] ?? ""} onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                        rows={field.multiline ? 4 : 1}
                        className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-y" />
                      <button onClick={() => saveContentField(field.key)} disabled={saving}
                        className="mt-3 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                        <Save size={13} />{saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Core Values ── */}
        {tab === "values" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="font-body text-xl font-semibold text-foreground">Core Values</h2>
                <p className="font-body text-sm text-foreground/60 mt-1">Edit labels and descriptions shown on the About page.</p></div>
              <button onClick={() => setCoreValues([...coreValues, { id: `new-${Date.now()}`, label: "", description: "", sort_order: coreValues.length }])}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
                <Plus size={14} /> Add Value
              </button>
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
                  <button onClick={() => saveCoreValue(v)} disabled={saving}
                    className="mt-4 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                    <Save size={13} />{saving ? "Saving…" : "Save"}
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
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="font-body text-xl font-semibold text-foreground">Open Roles</h2>
                <p className="font-body text-sm text-foreground/60 mt-1">Manage volunteer and leadership opportunities on the Get Involved page.</p></div>
              <button onClick={() => setOpenRoles([...openRoles, { id: `new-${Date.now()}`, title: "", commitment: "", description: "", sort_order: openRoles.length, active: true }])}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90">
                <Plus size={14} /> Add Role
              </button>
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
                  <button onClick={() => saveOpenRole(r)} disabled={saving}
                    className="mt-4 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                    <Save size={13} />{saving ? "Saving…" : "Save"}
                  </button>
                </div>
              ))}
            </div>
            {openRoles.length === 0 && <p className="text-center font-body text-sm text-foreground/40 py-10">No roles. Add one above.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
