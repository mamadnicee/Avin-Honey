import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { giftInquiries } from "@/db/schema";
import { englishDigits, GIFT_OCCASIONS } from "@/lib/gifts";
import { isTrustedOrigin } from "@/lib/request-security";

export const dynamic = "force-dynamic";
const recent = new Map<string, { count: number; until: number }>();
const text = (value: unknown, length: number) => typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, length) : "";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) return Response.json({ error: "مبدأ درخواست معتبر نیست." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 8192) return Response.json({ error: "متن درخواست بیش از حد طولانی است." }, { status: 413 });
  let data: unknown;
  try { data = await request.json(); } catch { return Response.json({ error: "اطلاعات قابل خواندن نیست." }, { status: 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return Response.json({ error: "اطلاعات کامل نیست." }, { status: 400 });
  const body = data as Record<string, unknown>;
  if (text(body.website, 100)) return Response.json({ error: "درخواست قابل ثبت نیست." }, { status: 400 });
  const customerName = text(body.customerName, 80);
  const digits = englishDigits(text(body.phone, 30)).replace(/\D/g, "");
  const phone = digits.startsWith("98") ? `0${digits.slice(2)}` : digits;
  const occasion = text(body.occasion, 30);
  const quantity = Number(englishDigits(text(String(body.quantity ?? ""), 10)));
  const note = text(body.note, 800);
  if (customerName.length < 2 || !/^09\d{9}$/.test(phone)) return Response.json({ error: "نام و شمارهٔ موبایل معتبر وارد کنید." }, { status: 400 });
  if (!GIFT_OCCASIONS.some((item) => item.id === occasion) || !Number.isInteger(quantity) || quantity < 1 || quantity > 2000) return Response.json({ error: "نوع درخواست و تعداد (۱ تا ۲۰۰۰) را بررسی کنید." }, { status: 400 });
  if (body.consent !== true) return Response.json({ error: "اجازهٔ تماس برای پیگیری درخواست لازم است." }, { status: 400 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const entry = recent.get(ip);
  if (entry && entry.until > Date.now() && entry.count >= 4) return Response.json({ error: "چند درخواست ثبت شده است؛ کمی بعد دوباره تلاش کنید یا با ما تماس بگیرید." }, { status: 429 });
  try {
    const reference = `AV-${randomBytes(4).toString("hex").toUpperCase()}`;
    await db.insert(giftInquiries).values({ reference, customerName, phone, occasion, quantity, note });
    if (recent.size > 2000) for (const [key, value] of recent) if (value.until < Date.now()) recent.delete(key);
    recent.set(ip, { count: entry && entry.until > Date.now() ? entry.count + 1 : 1, until: entry && entry.until > Date.now() ? entry.until : Date.now() + 10 * 60_000 });
    return Response.json({ ok: true, reference }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "ثبت درخواست فعلاً ممکن نیست. دوباره تلاش کنید یا تماس بگیرید." }, { status: 500 }); }
}
