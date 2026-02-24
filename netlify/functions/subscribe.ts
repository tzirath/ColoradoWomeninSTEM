import type { Handler, HandlerEvent } from "@netlify/functions";

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

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Newsletter service not configured" }),
    };
  }

  let body: { firstName?: string; email?: string };
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  const { firstName, email } = body;

  if (!firstName?.trim() || !email?.trim()) {
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
