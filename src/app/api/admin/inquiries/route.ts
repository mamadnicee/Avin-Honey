import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { giftInquiries } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  const inquiries = await db.select().from(giftInquiries).orderBy(desc(giftInquiries.createdAt)).limit(100);
  return Response.json({ inquiries }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  let data: unknown;
  try { data = await request.json(); } catch { return Response.json({ error: "اطلاعات نامعتبر" }, { status: 400 }); }
  if (!data || typeof data !== "object") return Response.json({ error: "اطلاعات نامعتبر" }, { status: 400 });
  const body = data as Record<string, unknown>;
  const id = Number(body.id); const status = String(body.status || "");
  if (!Number.isInteger(id) || id < 1 || !["new", "contacted"].includes(status)) return Response.json({ error: "وضعیت نامعتبر" }, { status: 400 });
  const [inquiry] = await db.update(giftInquiries).set({ status }).where(eq(giftInquiries.id, id)).returning();
  if (!inquiry) return Response.json({ error: "درخواست پیدا نشد." }, { status: 404 });
  return Response.json({ ok: true, inquiry });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "شناسه نامعتبر" }, { status: 400 });
  const [removed] = await db.delete(giftInquiries).where(eq(giftInquiries.id, id)).returning({ id: giftInquiries.id });
  return Response.json({ ok: !!removed }, { status: removed ? 200 : 404 });
}
