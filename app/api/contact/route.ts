import { NextRequest, NextResponse } from "next/server";
import { createTransport } from "nodemailer";
import { isRateLimited, verifyRecaptcha, getIp } from "../_lib/rate-limit";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 submissions per IP per hour
  if (isRateLimited(getIp(req), 60 * 60 * 1000, 5)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a while before trying again." },
      { status: 429 }
    );
  }

  const body = (await req.json()) as {
    name?: string;
    email?: string;
    inquiryType?: string;
    message?: string;
    recaptchaToken?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, inquiryType, message, recaptchaToken } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim() || !recaptchaToken) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (name.length > 100 || email.length > 254 || message.length > 2000) {
    return NextResponse.json(
      { error: "Input exceeds maximum allowed length" },
      { status: 400 }
    );
  }

  // reCAPTCHA v3 — reject bots
  const score = await verifyRecaptcha(recaptchaToken);
  if (score < 0.5) {
    return NextResponse.json(
      { error: "Bot activity detected. Please refresh and try again." },
      { status: 403 }
    );
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error("Missing Gmail credentials");
    return NextResponse.json(
      { error: "Server misconfiguration. Please contact us directly." },
      { status: 500 }
    );
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

  return NextResponse.json({ success: true });
}
