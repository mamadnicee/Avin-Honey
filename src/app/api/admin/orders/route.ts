import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = [
  "pending_payment",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "canceled",
] as const;

export async function GET() {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const orderRows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(100);

  const orderIds = orderRows.map((order) => order.id);
  const itemRows = orderIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
    : [];

  const result = orderRows.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    items: itemRows
      .filter((item) => item.orderId === order.id)
      .map((item) => ({
        sku: item.sku,
        productName: item.productName,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
  }));

  return Response.json({ orders: result }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) {
    return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const body = payload as { orderId?: unknown; status?: unknown };
  const orderId = body.orderId;
  const status = body.status;

  if (!Number.isInteger(orderId) || typeof status !== "string" || !ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
    return Response.json({ error: "شناسه یا وضعیت سفارش معتبر نیست." }, { status: 400 });
  }

  const [updated] = await db
    .update(orders)
    .set({
      status,
      // Keep payment status consistent for manual confirmation flows
      // until the real gateway verification is implemented.
      paymentStatus: status === "canceled" ? "unpaid" : status === "pending_payment" ? "unpaid" : "confirmed_manually",
    })
    .where(eq(orders.id, Number(orderId)))
    .returning({ id: orders.id, status: orders.status, paymentStatus: orders.paymentStatus });

  if (!updated) {
    return Response.json({ error: "سفارش پیدا نشد." }, { status: 404 });
  }

  return Response.json({ ok: true, order: updated });
}
