import type { Handler, HandlerEvent } from "@netlify/functions";
import { createTransport } from "nodemailer";

// ---------------------------------------------------------------------------
// In-memory rate limiter (per warm function instance)
// Each IP is allowed RATE_LIMIT_MAX requests within RATE_LIMIT_WINDOW_MS.
// Because Netlify Functions are ephemeral, cold starts reset this map —
// but it still prevents rapid bursts within a single warm instance.
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // max 5 submissions per hour per IP

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
// reCAPTCHA v3 verification — returns the bot-likelihood score (0–1).
// A score >= 0.5 is considered human; we reject anything below that.
// ---------------------------------------------------------------------------
async function verifyRecaptcha(token: string): Promise<number> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return 0;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  });

  const data = (await res.json()) as { success: boolean; score: number };
  return data.success ? data.score : 0;
}

// ---------------------------------------------------------------------------
// Simple HTML-escape to prevent email injection via the message field
// ---------------------------------------------------------------------------
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Common response headers
// ---------------------------------------------------------------------------
const headers = {
  "Content-Type": "application/json",
  // Restrict CORS to same origin in production.
  // Netlify sets process.env.URL to the site's primary URL.
  "Access-Control-Allow-Origin": process.env.URL ?? "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
const handler: Handler = async (event: HandlerEvent) => {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Only POST allowed
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
      body: JSON.stringify({
        error: "Too many requests. Please wait a while before trying again.",
      }),
    };
  }

  // ---------- Parse body ----------
  let body: {
    name?: string;
    email?: string;
    inquiryType?: string;
    message?: string;
    recaptchaToken?: string;
  };
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  const { name, email, inquiryType, message, recaptchaToken } = body;

  // ---------- Input validation ----------
  if (
    !name?.trim() ||
    !email?.trim() ||
    !message?.trim() ||
    !recaptchaToken
  ) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "All fields are required" }),
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

  if (name.length > 100 || email.length > 254 || message.length > 2000) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Input exceeds maximum allowed length" }),
    };
  }

  // ---------- reCAPTCHA v3 verification ----------
  const score = await verifyRecaptcha(recaptchaToken);
  if (score < 0.5) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        error: "Bot activity detected. Please refresh and try again.",
      }),
    };
  }

  // ---------- Send email ----------
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error("Missing Gmail credentials in environment variables");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server misconfiguration. Please contact us directly." }),
    };
  }

  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
  });

  const inquiry = inquiryType?.trim() || "General";

  await transporter.sendMail({
    from: `"CWS Contact Form" <${gmailUser}>`,
    to: gmailUser,
    replyTo: email,
    subject: `[${inquiry}] New message from ${name} — CWS Website`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Inquiry type: ${inquiry}`,
      `reCAPTCHA score: ${score.toFixed(2)}`,
      "",
      "Message:",
      message,
    ].join("\n"),
    html: `
      <h2 style="color:#1a4731">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Inquiry type:</strong> ${escapeHtml(inquiry)}</p>
      <p><strong>reCAPTCHA score:</strong> ${score.toFixed(2)} / 1.00</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `,
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true }),
  };
};

export { handler };
