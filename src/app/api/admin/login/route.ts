import { setTimeout as delay } from "node:timers/promises";
import { checkAdminCredentials, getAdminConfig, issueAdminCookies } from "@/lib/admin-auth";
import { isTrustedOrigin } from "@/lib/request-security";

export const dynamic = "force-dynamic";
const attempts = new Map<string, { failures: number; until: number }>();

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) return Response.json({ error: "مبدأ درخواست ورود معتبر نیست." }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const attempt = attempts.get(ip);
  if (attempt && attempt.until > Date.now() && attempt.failures >= 8) return Response.json({ error: "تلاش‌های ناموفق زیاد بود؛ چند دقیقه بعد دوباره امتحان کنید." }, { status: 429, headers: { "Retry-After": String(Math.ceil((attempt.until - Date.now()) / 1000)) } });
  if (!getAdminConfig().configured) return Response.json({ error: "نام کاربری و رمز مدیر در تنظیمات سرور کامل نیست. رمز باید حداقل ۱۲ کاراکتر باشد؛ پس از Save، دوباره Redeploy کنید." }, { status: 503 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return Response.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return Response.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  const body = payload as Record<string, unknown>;
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (username.length > 64 || password.length > 128) return Response.json({ error: "طول اطلاعات ورود نامعتبر است." }, { status: 400 });
  await delay(450);
  if (!username || !password || !checkAdminCredentials(username, password)) {
    if (attempts.size > 2000) for (const [key, entry] of attempts) if (entry.until < Date.now()) attempts.delete(key);
    const current = attempts.get(ip);
    attempts.set(ip, { failures: current && current.until > Date.now() ? current.failures + 1 : 1, until: current && current.until > Date.now() ? current.until : Date.now() + 15 * 60_000 });
    return Response.json({ error: "نام کاربری یا رمز عبور درست نیست." }, { status: 401 });
  }
  attempts.delete(ip);
  const sessionMode = await issueAdminCookies(request, body.embedded === true);
  return Response.json({ ok: true, sessionMode }, { headers: { "Cache-Control": "private, no-store" } });
}
