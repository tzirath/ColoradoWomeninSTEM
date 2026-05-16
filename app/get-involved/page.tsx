import { createClient } from "@/lib/supabase/server";
import GetInvolvedClient from "./GetInvolvedClient";

export const metadata = {
  title: "Get Involved | CWS",
  description: "Join CWS, sign up for programs, and explore open volunteer roles.",
};

const DEFAULT_ROLES = [
  { id: "1", title: "Committee Chair — Social", commitment: "~2–4 hrs/month", description: "Lead the Social Committee in planning member events and gatherings.", sort_order: 0, active: true },
  { id: "2", title: "Committee Chair — Outreach & Partnerships", commitment: "~3–5 hrs/month", description: "Build relationships with external organizations and potential sponsors.", sort_order: 1, active: true },
  { id: "3", title: "Committee Chair — Community Service", commitment: "~2–4 hrs/month", description: "Identify and coordinate community-focused initiatives for CWS.", sort_order: 2, active: true },
  { id: "4", title: "Committee Chair — Professional Development", commitment: "~3–5 hrs/month", description: "Design and deliver programming to support members' career growth.", sort_order: 3, active: true },
];

const INITIATIVE_KEYS = [
  "initiative_members_network",
  "initiative_skill_swap",
  "initiative_stem_in_action",
  "initiative_mentorship",
  "initiative_cws_voices",
];

const DEFAULT_CONTENT = {
  get_involved_hero: "Whether you're joining as a member, lending a skill, or stepping up to lead — there's a place for you here.",
  get_involved_member_desc: "Membership is free and open to all women in STEM and allies across Colorado. Join to connect, grow, and contribute.",
  get_involved_community_service: "CWS seeks out community-focused initiatives and volunteer opportunities for members to give back together. Keep an eye on our events page and social media for upcoming community service days.",
};

export default async function GetInvolvedPage() {
  const supabase = createClient();
  const [{ data: rolesRows }, { data: contentRows }] = await Promise.all([
    supabase.from("open_roles").select("*").eq("active", true).order("sort_order"),
    supabase.from("site_content").select("key, value").in("key", [...Object.keys(DEFAULT_CONTENT), ...INITIATIVE_KEYS]),
  ]);

  const content = { ...DEFAULT_CONTENT } as Record<string, string>;
  contentRows?.forEach((row) => { content[row.key] = row.value; });
  const roles = rolesRows?.length ? rolesRows : DEFAULT_ROLES;

  return <GetInvolvedClient roles={roles} content={content} />;
}
