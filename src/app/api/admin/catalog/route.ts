import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  const variants = await db.select({
    variantId: productVariants.id, productId: products.id, sku: productVariants.sku,
    weight: productVariants.weight, price: productVariants.price, compareAtPrice: productVariants.compareAtPrice,
    stock: productVariants.stock, productName: products.name, category: products.category, isFeatured: products.isFeatured,
  }).from(productVariants).innerJoin(products, eq(productVariants.productId, products.id)).orderBy(asc(products.id), asc(productVariants.id));
  return Response.json({ variants }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  let data: unknown;
  try { data = await request.json(); } catch { return Response.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return Response.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  const body = data as Record<string, unknown>;
  if ("productId" in body) {
    const id = Number(body.productId);
    if (!Number.isInteger(id) || id < 1 || typeof body.isFeatured !== "boolean") return Response.json({ error: "تنظیم محصول معتبر نیست." }, { status: 400 });
    const [product] = await db.update(products).set({ isFeatured: body.isFeatured }).where(eq(products.id, id)).returning({ id: products.id, isFeatured: products.isFeatured });
    if (!product) return Response.json({ error: "محصول پیدا نشد." }, { status: 404 });
    return Response.json({ ok: true, product });
  }
  const variantId = Number(body.variantId); const price = Number(body.price); const stock = Number(body.stock);
  if (!Number.isInteger(variantId) || variantId < 1 || !Number.isInteger(price) || price < 1000 || price > 1_000_000_000 || !Number.isInteger(stock) || stock < 0 || stock > 100_000) return Response.json({ error: "قیمت، موجودی یا شناسهٔ محصول معتبر نیست." }, { status: 400 });
  const [variant] = await db.update(productVariants).set({ price, stock }).where(eq(productVariants.id, variantId)).returning({ id: productVariants.id, price: productVariants.price, stock: productVariants.stock });
  if (!variant) return Response.json({ error: "وزن محصول پیدا نشد." }, { status: 404 });
  return Response.json({ ok: true, variant });
}
