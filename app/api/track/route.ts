import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, getIp } from "../_lib/rate-limit";
import { getSupabaseAdmin } from "../_lib/supabase";
import { INITIATIVE_SLUGS } from "@/data/initiatives";

const VALID_SLUGS = INITIATIVE_SLUGS;
const VALID_EVENTS = ["view", "signup_click"];

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req), 60 * 1000, 30)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = (await req.json()) as { slug?: string; event_type?: string } | null;
  if (!body || !VALID_SLUGS.includes(body.slug ?? "") || !VALID_EVENTS.includes(body.event_type ?? "")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await getSupabaseAdmin().from("initiative_events").insert({ slug: body.slug, event_type: body.event_type });
  return NextResponse.json({ ok: true });
}
