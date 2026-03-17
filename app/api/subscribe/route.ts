import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, verifyRecaptcha, getIp } from "../_lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 10 submissions per IP per hour
  if (isRateLimited(getIp(req), 60 * 60 * 1000, 10)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a while before trying again." },
      { status: 429 }
    );
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Newsletter service not configured" },
      { status: 500 }
    );
  }

  const body = (await req.json()) as {
    firstName?: string;
    email?: string;
    recaptchaToken?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { firstName, email, recaptchaToken } = body;

  if (!firstName?.trim() || !email?.trim() || !recaptchaToken) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // reCAPTCHA v3 — reject bots
  const score = await verifyRecaptcha(recaptchaToken);
  if (score < 0.5) {
    return NextResponse.json(
      { error: "Bot activity detected. Please refresh and try again." },
      { status: 403 }
    );
  }

  const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      attributes: { FIRSTNAME: firstName.trim() },
      updateEnabled: true,
    }),
  });

  if (brevoRes.ok) {
    return NextResponse.json({ success: true });
  }

  const data = (await brevoRes.json()) as { message?: string; code?: string };

  if (
    data.code === "duplicate_parameter" ||
    data.message?.toLowerCase().includes("contact already exist")
  ) {
    return NextResponse.json({ success: true, alreadyMember: true });
  }

  console.error("Brevo error:", data);
  return NextResponse.json(
    { error: "Could not add you to our list. Please try again." },
    { status: 500 }
  );
}
