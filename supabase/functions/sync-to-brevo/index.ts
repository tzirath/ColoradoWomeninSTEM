import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const payload = await req.json() as { record?: Record<string, unknown> };
  const record = payload.record;

  if (!record?.email) {
    return new Response("no email", { status: 200 });
  }

  const brevoKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoKey) {
    return new Response("BREVO_API_KEY not set", { status: 500 });
  }

  const optedIn = record.opted_in === true || record.is_active === true;

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": brevoKey,
    },
    body: JSON.stringify({
      email: record.email,
      attributes: {
        FIRSTNAME: record.first_name ?? "",
      },
      listIds: optedIn ? [3] : [],
      emailBlacklisted: !optedIn,
      updateEnabled: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Brevo error:", err);
    return new Response("brevo error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
