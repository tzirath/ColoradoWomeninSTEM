const rateLimitMap = new Map<string, number[]>();

export function isRateLimited(ip: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const prev = rateLimitMap.get(ip) ?? [];
  const recent = prev.filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export async function verifyRecaptcha(token: string): Promise<number> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return 1;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  });

  const data = (await res.json()) as { success: boolean; score: number };
  return data.success ? data.score : 0;
}

export function getIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
