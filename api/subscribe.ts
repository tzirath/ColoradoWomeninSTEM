import type { VercelRequest, VercelResponse } from "@vercel/node";

// ---------------------------------------------------------------------------
// In-memory rate limiter
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const prev = rateLimitMap.get(ip) ?? [];
  const recent = prev.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

// ---------------------------------------------------------------------------
// reCAPTCHA v3 verification
// ---------------------------------------------------------------------------
async function verifyRecaptcha(token: string): Promise<number> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return 1; // skip check if not configured (dev only)

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  });

  const data = (await res.json()) as { success: boolean; score: number };
  return data.success ? data.score : 0;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ---------- Rate limit ----------
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Too many requests. Please wait a while before trying again.",
    });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Newsletter service not configured" });
  }

  // ---------- Parse body ----------
  const body = req.body as {
    firstName?: string;
    email?: string;
    recaptchaToken?: string;
  } | null;

  if (!body) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { firstName, email, recaptchaToken } = body;

  if (!firstName?.trim() || !email?.trim() || !recaptchaToken) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // ---------- reCAPTCHA v3 check ----------
  const score = await verifyRecaptcha(recaptchaToken);
  if (score < 0.5) {
    return res.status(403).json({
      error: "Bot activity detected. Please refresh and try again.",
    });
  }

  // ---------- Add to Brevo ----------
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
    return res.status(200).json({ success: true });
  }

  const data = (await brevoRes.json()) as { message?: string; code?: string };

  // Contact already exists — treat as success
  if (
    data.code === "duplicate_parameter" ||
    data.message?.toLowerCase().includes("contact already exist")
  ) {
    return res.status(200).json({ success: true, alreadyMember: true });
  }

  console.error("Brevo error:", data);
  return res
    .status(500)
    .json({ error: "Could not add you to our list. Please try again." });
}
