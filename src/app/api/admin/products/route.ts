import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { isAdminRequest } from "@/lib/admin-auth";
import { PRODUCT_CATEGORIES } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function readText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

type VariantInput = { weight: string; price: number; stock: number };

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const name = readText(body.name, 80);
  const subtitle = readText(body.subtitle, 120);
  const category = readText(body.category, 30);
  const description = readText(body.description, 600);
  const origin = readText(body.origin, 80);
  const harvestSeason = readText(body.harvestSeason, 60);
  const badge = readText(body.badge, 40);
  const image = readText(body.image, 300);
  const isFeatured = body.isFeatured === true;

  if (name.length < 2) {
    return Response.json({ error: "نام محصول را کامل بنویسید." }, { status: 400 });
  }
  if (!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])) {
    return Response.json({ error: "دسته‌بندی معتبر انتخاب کنید." }, { status: 400 });
  }
  if (image && !/^\/(uploads|images)\/[\w.-]+\.(jpg|jpeg|png|webp)$/i.test(image)) {
    return Response.json({ error: "تصویر باید از بخش بارگذاری همین پنل انتخاب شود." }, { status: 400 });
  }

  const rawVariants = Array.isArray(body.variants) ? body.variants.slice(0, 6) : [];
  const variants: VariantInput[] = [];
  for (const raw of rawVariants) {
    if (typeof raw !== "object" || raw === null) continue;
    const entry = raw as Record<string, unknown>;
    const weight = readText(entry.weight, 40);
    const price = Number(entry.price);
    const stock = Number(entry.stock);
    if (!weight) continue;
    if (!Number.isInteger(price) || price < 1000 || price > 1_000_000_000) {
      return Response.json({ error: `قیمت وزن «${weight}» معتبر نیست.` }, { status: 400 });
    }
    if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) {
      return Response.json({ error: `موجودی وزن «${weight}» معتبر نیست.` }, { status: 400 });
    }
    variants.push({ weight, price, stock });
  }

  if (variants.length === 0) {
    return Response.json({ error: "حداقل یک وزن با قیمت و موجودی لازم است." }, { status: 400 });
  }

  const uniqueId = randomBytes(3).toString("hex").toUpperCase();

  try {
    const created = await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          slug: `p-${Date.now()}-${uniqueId.toLowerCase()}`,
          name,
          subtitle,
          category,
          description,
          image: image || "",
          origin,
          harvestSeason,
          badge: badge || null,
          isFeatured,
        })
        .returning({ id: products.id, name: products.name });

      if (!product) throw new Error("PRODUCT_NOT_CREATED");

      await tx.insert(productVariants).values(
        variants.map((variant, index) => ({
          productId: product.id,
          sku: `MH-${uniqueId}-${index + 1}`,
          label: variant.weight,
          weight: variant.weight,
          price: variant.price,
          compareAtPrice: null,
          stock: variant.stock,
        })),
      );

      return product;
    });

    return Response.json({ ok: true, product: created }, { status: 201 });
  } catch (error) {
    console.error("Could not create product", error);
    return Response.json({ error: "ایجاد محصول انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) {
    return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const url = new URL(request.url);
  const productId = Number(url.searchParams.get("id"));
  if (!Number.isInteger(productId) || productId < 1) {
    return Response.json({ error: "شناسهٔ محصول معتبر نیست." }, { status: 400 });
  }

  const [removed] = await db
    .delete(products)
    .where(eq(products.id, productId))
    .returning({ id: products.id });

  if (!removed) {
    return Response.json({ error: "محصول پیدا نشد." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
