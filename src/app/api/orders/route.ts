import { randomInt } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, productVariants, products } from "@/db/schema";
import { SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/catalog";

type RequestedItem = {
  sku: string;
  quantity: number;
};

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
    );
}

function readText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "اطلاعات ارسالی قابل خواندن نیست." },
      { status: 400 },
    );
  }

  if (!isRecord(payload)) {
    return Response.json(
      { error: "اطلاعات سفارش کامل نیست." },
      { status: 400 },
    );
  }

  const customerName = readText(payload.customerName, 80);
  const province = readText(payload.province, 60);
  const city = readText(payload.city, 60);
  const address = readText(payload.address, 500);
  const customerNote = readText(payload.customerNote, 400);

  const phoneDigits = normalizeDigits(
    readText(payload.phone, 32),
  ).replace(/\D/g, "");

  const postalCode = normalizeDigits(
    readText(payload.postalCode, 20),
  ).replace(/\D/g, "");

  const normalizedPhone = phoneDigits.startsWith("98")
    ? phoneDigits.slice(2)
    : phoneDigits.startsWith("0")
      ? phoneDigits.slice(1)
      : phoneDigits;

  if (
    customerName.length < 2 ||
    province.length < 2 ||
    city.length < 2 ||
    address.length < 8
  ) {
    return Response.json(
      { error: "نام و نشانی کامل را وارد کنید." },
      { status: 400 },
    );
  }

  if (!/^9\d{9}$/.test(normalizedPhone)) {
    return Response.json(
      { error: "شمارهٔ موبایل معتبر وارد کنید." },
      { status: 400 },
    );
  }

  if (!/^\d{10}$/.test(postalCode)) {
    return Response.json(
      { error: "کدپستی باید ۱۰ رقم باشد." },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(payload.items) ||
    payload.items.length === 0 ||
    payload.items.length > 20
  ) {
    return Response.json(
      { error: "سبد خرید خالی یا نامعتبر است." },
      { status: 400 },
    );
  }

  const requestedItems = new Map<string, number>();

  for (const item of payload.items) {
    if (!isRecord(item)) {
      return Response.json(
        { error: "یکی از محصولات سبد خرید معتبر نیست." },
        { status: 400 },
      );
    }

    const sku =
      typeof item.sku === "string"
        ? item.sku.trim().toUpperCase()
        : "";

    const quantity = item.quantity;

    if (
      !/^[A-Z0-9-]{4,48}$/.test(sku) ||
      !Number.isInteger(quantity) ||
      Number(quantity) < 1 ||
      Number(quantity) > 10
    ) {
      return Response.json(
        { error: "تعداد یا مشخصات یکی از محصولات معتبر نیست." },
        { status: 400 },
      );
    }

    const nextQuantity =
      (requestedItems.get(sku) ?? 0) + Number(quantity);

    if (nextQuantity > 10) {
      return Response.json(
        { error: "حداکثر تعداد هر وزن از محصول ۱۰ عدد است." },
        { status: 400 },
      );
    }

    requestedItems.set(sku, nextQuantity);
  }

  try {
    const result = await db.transaction(async (tx) => {
      const skus = Array.from(requestedItems.keys());

      const databaseVariants = await tx
        .select({
          productId: products.id,
          productName: products.name,
          sku: productVariants.sku,
          variantLabel: productVariants.weight,
          price: productVariants.price,
          stock: productVariants.stock,
        })
        .from(productVariants)
        .innerJoin(
          products,
          eq(productVariants.productId, products.id),
        )
        .where(inArray(productVariants.sku, skus))
        .for("update");

      if (databaseVariants.length !== requestedItems.size) {
        throw new Error("UNKNOWN_PRODUCT");
      }

      const lineItems = databaseVariants.map((variant) => ({
        ...variant,
        quantity: requestedItems.get(variant.sku) ?? 0,
      }));

      for (const item of lineItems) {
        if (item.price === null || item.price === undefined) {
          throw new Error("NO_PRICE");
        }

        if (item.quantity > item.stock) {
          throw new Error("OUT_OF_STOCK");
        }
      }

      // پس از بررسی بالا، قیمت‌ها برای TypeScript قطعاً number هستند.
      const pricedLineItems = lineItems.map((item) => {
        if (item.price === null || item.price === undefined) {
          throw new Error("NO_PRICE");
        }

        return {
          ...item,
          price: item.price,
        };
      });

      const subtotal = pricedLineItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const shipping =
        subtotal >= SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;

      const total = subtotal + shipping;

      const orderNumber = `MH-${new Date()
        .toISOString()
        .slice(2, 10)
        .replaceAll("-", "")}-${randomInt(1000, 9999)}`;

      const [createdOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
          customerName,
          phone: `0${normalizedPhone}`,
          province,
          city,
          address,
          postalCode,
          customerNote,
          subtotal,
          shipping,
          total,
          status: "pending_payment",
          paymentStatus: "unpaid",
          paymentProvider: "not_configured",
        })
        .returning({
          id: orders.id,
          orderNumber: orders.orderNumber,
        });

      if (!createdOrder) {
        throw new Error("ORDER_NOT_CREATED");
      }

      await tx.insert(orderItems).values(
        pricedLineItems.map((item) => ({
          orderId: createdOrder.id,
          productId: item.productId,
          sku: item.sku,
          productName: item.productName,
          variantLabel: item.variantLabel,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
      );

      return {
        orderNumber: createdOrder.orderNumber,
        subtotal,
        shipping,
        total,
      };
    });

    return Response.json(
      {
        ...result,
        paymentStatus: "unpaid",
        message:
          "سفارش ثبت شد؛ برای تکمیل خرید باید درگاه پرداخت به سایت متصل شود.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "OUT_OF_STOCK"
    ) {
      return Response.json(
        { error: "موجودی یکی از وزن‌های انتخاب‌شده کافی نیست." },
        { status: 409 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "NO_PRICE"
    ) {
      return Response.json(
        {
          error:
            "قیمت یکی از وزن‌های انتخاب‌شده هنوز تعیین نشده است؛ امکان ثبت سفارش نیست.",
        },
        { status: 409 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "UNKNOWN_PRODUCT"
    ) {
      return Response.json(
        {
          error:
            "یکی از محصولات تغییر کرده است؛ صفحه را تازه‌سازی کنید.",
        },
        { status: 400 },
      );
    }

    console.error("Could not create honey shop order", error);

    return Response.json(
      {
        error:
          "ثبت سفارش در حال حاضر ممکن نیست. کمی بعد دوباره تلاش کنید.",
      },
      { status: 500 },
    );
  }
}
