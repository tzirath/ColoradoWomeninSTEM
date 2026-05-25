const SUPABASE_URL = "https://ptocltxoxxrcjopbdleo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0b2NsdHhveHhyY2pvcGJkbGVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgyMTgxNSwiZXhwIjoyMDg3Mzk3ODE1fQ.HGuy1MLe29cCW8KaP9VQqRVIhEp5O4H8My36R_Tx0LQ";
const BREVO_KEY = "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";

async function fetchTable(table, optInCol) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=email,first_name&${optInCol}=eq.true`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}

async function pushToBrevo(email, firstName) {
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": BREVO_KEY },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: firstName ?? "" },
      listIds: [3],
      updateEnabled: true,
    }),
  });
  return res.status;
}

const [members, subscribers] = await Promise.all([
  fetchTable("members", "opted_in"),
  fetchTable("email_subscribers", "is_active"),
]);

// Deduplicate by email — members record takes priority
const byEmail = new Map();
for (const r of [...subscribers, ...members]) {
  byEmail.set(r.email.toLowerCase(), r);
}

const contacts = [...byEmail.values()];
console.log(`Pushing ${contacts.length} unique opted-in contacts to Brevo list 3…`);

for (const c of contacts) {
  const status = await pushToBrevo(c.email, c.first_name);
  console.log(`${status === 201 || status === 204 ? "✓" : "✗"} ${c.email} (${status})`);
}

console.log("Done.");
