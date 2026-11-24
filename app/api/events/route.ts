import { NextResponse } from "next/server";
import { getPartifulEvents } from "@/lib/partiful";

export const revalidate = 3600;

export async function GET() {
  try {
    return NextResponse.json(await getPartifulEvents());
  } catch {
    return NextResponse.json({ error: "Failed to fetch events from Partiful" }, { status: 502 });
  }
}
