import type { Handler, HandlerEvent } from "@netlify/functions";

// ---------------------------------------------------------------------------
// In-memory rate limiter (same pattern as contact.ts)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // slightly more generous than contact form

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
// reCAPTCHA v3 verification (same as contact.ts)
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

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": process.env.URL ?? "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // ---------- Rate limit ----------
  const ip =
    event.headers["x-forwarded-for"]?.split(",")[0].trim() ??
    event.headers["client-ip"] ??
    "unknown";

  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: "Too many requests. Please wait a while before trying again." }),
    };
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Newsletter service not configured" }),
    };
  }

  let body: { firstName?: string; email?: string; recaptchaToken?: string };
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  const { firstName, email, recaptchaToken } = body;

  if (!firstName?.trim() || !email?.trim() || !recaptchaToken) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Name and email are required" }),
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid email address" }),
    };
  }

  // ---------- reCAPTCHA v3 check ----------
  const score = await verifyRecaptcha(recaptchaToken);
  if (score < 0.5) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: "Bot activity detected. Please refresh and try again." }),
    };
  }

  // ---------- Add to Brevo ----------
  const res = await fetch("https://api.brevo.com/v3/contacts", {
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

  if (res.ok) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  }

  const data = (await res.json()) as { message?: string; code?: string };

  // Contact already exists — treat as success
  if (data.code === "duplicate_parameter" || data.message?.toLowerCase().includes("contact already exist")) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, alreadyMember: true }),
    };
  }

  console.error("Brevo error:", data);
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ error: "Could not add you to our list. Please try again." }),
  };
};

export { handler };
