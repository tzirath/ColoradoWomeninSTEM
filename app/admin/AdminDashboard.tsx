"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Megaphone, Users, Plus, Trash2, GripVertical, Save, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface NewsItem {
  id: string;
  text: string;
  active: boolean;
  sort_order: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  hobbies: string;
  image_path: string;
  linkedin: string;
  sort_order: number;
  active: boolean;
}

interface Props {
  user: User;
  initialNewsItems: NewsItem[];
  initialTeamMembers: TeamMember[];
}

type Tab = "news" | "team";

export default function AdminDashboard({ user, initialNewsItems, initialTeamMembers }: Props) {
  const [tab, setTab] = useState<Tab>("news");
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNewsItems);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // ── News Items ──────────────────────────────────────────
  const addNewsItem = () => {
    const newItem: NewsItem = {
      id: `new-${Date.now()}`,
      text: "",
      active: true,
      sort_order: newsItems.length,
    };
    setNewsItems([...newsItems, newItem]);
  };

  const updateNewsItem = (id: string, field: keyof NewsItem, value: string | boolean | number) => {
    setNewsItems(newsItems.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
  };

  const removeNewsItem = (id: string) => {
    setNewsItems(newsItems.filter((n) => n.id !== id));
  };

  const saveNewsItems = async () => {
    setSaving(true);
    try {
      // Delete all existing, re-insert — simple approach
      await supabase.from("news_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const toInsert = newsItems
        .filter((n) => n.text.trim())
        .map((n, i) => ({
          ...(n.id.startsWith("new-") ? {} : { id: n.id }),
          text: n.text.trim(),
          active: n.active,
          sort_order: i,
        }));
      const { error } = await supabase.from("news_items").insert(toInsert);
      if (error) throw error;
      showToast("News items saved!");
      router.refresh();
    } catch (e) {
      showToast("Error saving. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Team Members ────────────────────────────────────────
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: `new-${Date.now()}`,
      name: "",
      role: "",
      bio: "",
      hobbies: "",
      image_path: "",
      linkedin: "",
      sort_order: teamMembers.length,
      active: true,
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string | boolean | number) => {
    setTeamMembers(teamMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const removeTeamMember = async (id: string) => {
    if (!id.startsWith("new-")) {
      await supabase.from("team_members").delete().eq("id", id);
    }
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
    showToast("Member removed.");
  };

  const saveTeamMember = async (member: TeamMember) => {
    setSaving(true);
    try {
      if (member.id.startsWith("new-")) {
        const { data, error } = await supabase
          .from("team_members")
          .insert({ name: member.name, role: member.role, bio: member.bio, hobbies: member.hobbies, image_path: member.image_path, linkedin: member.linkedin, sort_order: member.sort_order, active: member.active })
          .select()
          .single();
        if (error) throw error;
        setTeamMembers(teamMembers.map((m) => (m.id === member.id ? data : m)));
      } else {
        const { error } = await supabase
          .from("team_members")
          .update({ name: member.name, role: member.role, bio: member.bio, hobbies: member.hobbies, image_path: member.image_path, linkedin: member.linkedin, sort_order: member.sort_order, active: member.active })
          .eq("id", member.id);
        if (error) throw error;
      }
      showToast("Member saved!");
      router.refresh();
    } catch {
      showToast("Error saving. Try again.");
    } finally {
      setSaving(false);
    }
  };

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
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 font-body text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          <LogOut size={15} /> Sign out
        </button>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 flex gap-0">
          {([["news", Megaphone, "News Banner"], ["team", Users, "Team Members"]] as const).map(
            ([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-2 px-5 py-4 font-body text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/60 hover:text-foreground"
                }`}
              >
                <Icon size={15} />
                {label}
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
                <p className="font-body text-sm text-foreground/60 mt-1">
                  These items rotate in the banner at the top of the home page.
                </p>
              </div>
              <button
                onClick={addNewsItem}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {newsItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                  <GripVertical size={16} className="text-foreground/30 shrink-0" />
                  <input
                    value={item.text}
                    onChange={(e) => updateNewsItem(item.id, "text", e.target.value)}
                    placeholder="Enter announcement text..."
                    className="flex-1 font-body text-sm bg-transparent outline-none text-foreground placeholder:text-foreground/30"
                  />
                  <label className="flex items-center gap-1.5 font-body text-xs text-foreground/60 shrink-0">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(e) => updateNewsItem(item.id, "active", e.target.checked)}
                      className="accent-primary"
                    />
                    Active
                  </label>
                  <button onClick={() => removeNewsItem(item.id)} className="text-foreground/30 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {newsItems.length === 0 && (
              <p className="text-center font-body text-sm text-foreground/40 py-10">
                No news items. Add one above.
              </p>
            )}

            <button
              onClick={saveNewsItems}
              disabled={saving}
              className="mt-6 inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? "Saving…" : "Save All"}
            </button>
          </div>
        )}

        {/* ── Team Tab ── */}
        {tab === "team" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-body text-xl font-semibold text-foreground">Team Members</h2>
                <p className="font-body text-sm text-foreground/60 mt-1">
                  Add, edit, or remove team member profiles shown on the Team page.
                </p>
              </div>
              <button
                onClick={addTeamMember}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus size={14} /> Add Member
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-body font-semibold text-foreground">
                      {member.name || "New Member"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 font-body text-xs text-foreground/60">
                        <input
                          type="checkbox"
                          checked={member.active}
                          onChange={(e) => updateTeamMember(member.id, "active", e.target.checked)}
                          className="accent-primary"
                        />
                        Active
                      </label>
                      <button
                        onClick={() => removeTeamMember(member.id)}
                        className="text-foreground/30 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {(
                      [
                        ["Name", "name", "Dr. Jane Smith"],
                        ["Role", "role", "Founder & Director"],
                        ["LinkedIn URL", "linkedin", "https://linkedin.com/in/..."],
                        ["Photo path", "image_path", "/team/jane.jpg"],
                      ] as const
                    ).map(([label, field, placeholder]) => (
                      <div key={field}>
                        <label className="block font-body text-xs font-medium text-foreground/60 mb-1">
                          {label}
                        </label>
                        <input
                          value={(member[field as keyof TeamMember] as string) ?? ""}
                          onChange={(e) => updateTeamMember(member.id, field as keyof TeamMember, e.target.value)}
                          placeholder={placeholder}
                          className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block font-body text-xs font-medium text-foreground/60 mb-1">Bio</label>
                      <textarea
                        value={member.bio}
                        onChange={(e) => updateTeamMember(member.id, "bio", e.target.value)}
                        placeholder="Short bio..."
                        rows={2}
                        className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-body text-xs font-medium text-foreground/60 mb-1">
                        Hobbies / Interests
                      </label>
                      <input
                        value={member.hobbies}
                        onChange={(e) => updateTeamMember(member.id, "hobbies", e.target.value)}
                        placeholder="Dance · Yoga · Travel"
                        className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => saveTeamMember(member)}
                    disabled={saving}
                    className="mt-5 inline-flex items-center gap-2 bg-secondary text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Save size={13} />
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              ))}
            </div>

            {teamMembers.length === 0 && (
              <p className="text-center font-body text-sm text-foreground/40 py-10">
                No team members. Add one above.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
