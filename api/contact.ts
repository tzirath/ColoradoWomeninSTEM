import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createTransport } from "nodemailer";

// ---------------------------------------------------------------------------
// In-memory rate limiter (per warm function instance)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;

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
// HTML-escape to prevent email injection
// ---------------------------------------------------------------------------
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  // ---------- Parse body ----------
  const body = req.body as {
    name?: string;
    email?: string;
    inquiryType?: string;
    message?: string;
    recaptchaToken?: string;
  } | null;

  if (!body) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { name, email, inquiryType, message, recaptchaToken } = body;

  // ---------- Input validation ----------
  if (!name?.trim() || !email?.trim() || !message?.trim() || !recaptchaToken) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  if (name.length > 100 || email.length > 254 || message.length > 2000) {
    return res.status(400).json({ error: "Input exceeds maximum allowed length" });
  }

  // ---------- reCAPTCHA v3 verification ----------
  const score = await verifyRecaptcha(recaptchaToken);
  if (score < 0.5) {
    return res.status(403).json({
      error: "Bot activity detected. Please refresh and try again.",
    });
  }

  // ---------- Send email ----------
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error("Missing Gmail credentials in environment variables");
    return res.status(500).json({
      error: "Server misconfiguration. Please contact us directly.",
    });
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

  return res.status(200).json({ success: true });
}
