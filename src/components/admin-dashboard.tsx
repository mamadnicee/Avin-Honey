"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/catalog";
import { AdminInquiries } from "@/components/admin-inquiries";

type AdminOrderItem = {
  sku: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type AdminOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  customerNote: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: AdminOrderItem[];
};

type AdminVariant = {
  variantId: number;
  productId: number;
  sku: string;
  weight: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  productName: string;
  category: string;
  isFeatured: boolean;
};

type NewVariantDraft = { weight: string; price: string; stock: string };

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  preparing: "در حال آماده‌سازی",
  shipped: "ارسال شد",
  delivered: "تحویل شد",
  canceled: "لغو شد",
};

const money = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const emptyVariant = (): NewVariantDraft => ({ weight: "", price: "", stock: "" });
function parseNumber(input: string) {
  const normalized = input.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[,٬\s]/g, "");
  return normalized ? Number(normalized) : Number.NaN;
}

export default function AdminDashboard({ isDemoLogin }: { isDemoLogin: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "catalog" | "create" | "inquiries">("orders");
  const [ordersList, setOrdersList] = useState<AdminOrder[]>([]);
  const [variants, setVariants] = useState<AdminVariant[]>([]);
  const [drafts, setDrafts] = useState<Record<number, { price: string; stock: string }>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openOrder, setOpenOrder] = useState<number | null>(null);
  const [newVariants, setNewVariants] = useState<NewVariantDraft[]>([emptyVariant()]);
  const [uploadedImage, setUploadedImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [featuredBusy, setFeaturedBusy] = useState<number | null>(null);

  const notify = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2800);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersResponse, catalogResponse] = await Promise.all([
        fetch("/api/admin/orders", { cache: "no-store" }),
        fetch("/api/admin/catalog", { cache: "no-store" }),
      ]);
      if (ordersResponse.status === 401 || catalogResponse.status === 401) {
        router.refresh();
        return;
      }
      const ordersJson = await ordersResponse.json();
      const catalogJson = await catalogResponse.json();
      setOrdersList(Array.isArray(ordersJson.orders) ? ordersJson.orders : []);
      const nextVariants: AdminVariant[] = Array.isArray(catalogJson.variants) ? catalogJson.variants : [];
      setVariants(nextVariants);
      setDrafts(Object.fromEntries(nextVariants.map((variant) => [
        variant.variantId,
        { price: String(variant.price), stock: String(variant.stock) },
      ])));
    } catch {
      notify("خواندن اطلاعات از سرور ممکن نشد.");
    } finally {
      setLoading(false);
    }
  }, [notify, router]);

  useEffect(() => { void loadData(); }, [loadData]);

  async function updateStatus(orderId: number, status: string) {
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    const result = await response.json();
    if (!response.ok) {
      notify(typeof result.error === "string" ? result.error : "به‌روزرسانی انجام نشد.");
      return;
    }
    setOrdersList((current) => current.map((order) => order.id === orderId
      ? { ...order, status: result.order.status, paymentStatus: result.order.paymentStatus }
      : order));
    notify("وضعیت سفارش ذخیره شد.");
  }

  async function saveVariant(variantId: number) {
    const draft = drafts[variantId];
    if (!draft) return;
    const price = parseNumber(draft.price);
    const stock = parseNumber(draft.stock);
    const response = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, price, stock }),
    });
    const result = await response.json();
    if (!response.ok) {
      notify(typeof result.error === "string" ? result.error : "ذخیره انجام نشد.");
      return;
    }
    setVariants((current) => current.map((variant) => variant.variantId === variantId
      ? { ...variant, price: result.variant.price, stock: result.variant.stock }
      : variant));
    notify("قیمت و موجودی ذخیره شد.");
  }

  async function updateFeatured(productId: number, isFeatured: boolean) {
    const previous = variants.find((variant) => variant.productId === productId)?.isFeatured ?? !isFeatured;
    setFeaturedBusy(productId);
    setVariants((current) => current.map((variant) => variant.productId === productId ? { ...variant, isFeatured } : variant));
    try {
      const response = await fetch("/api/admin/catalog", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, isFeatured }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تنظیم ویترین ذخیره نشد.");
      setVariants((current) => current.map((variant) => variant.productId === productId ? { ...variant, isFeatured: result.product.isFeatured } : variant));
      notify(isFeatured ? "محصول به ویترین ویژه‌ها اضافه شد." : "محصول از ویژه‌ها برداشته شد؛ در فروشگاه باقی می‌ماند.");
    } catch (error) {
      setVariants((current) => current.map((variant) => variant.productId === productId ? { ...variant, isFeatured: previous } : variant));
      notify(error instanceof Error ? error.message : "ارتباط با سرور برقرار نشد.");
    } finally { setFeaturedBusy(null); }
  }

  async function deleteProduct(productId: number, productName: string) {
    if (!window.confirm(`محصول «${productName}» با همهٔ وزن‌هایش حذف شود؟`)) return;
    const response = await fetch(`/api/admin/products?id=${productId}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      notify(typeof result.error === "string" ? result.error : "حذف انجام نشد.");
      return;
    }
    setVariants((current) => current.filter((variant) => variant.productId !== productId));
    notify("محصول حذف شد.");
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        notify(typeof result.error === "string" ? result.error : "بارگذاری تصویر انجام نشد.");
        return;
      }
      setUploadedImage(result.path);
      notify("تصویر بارگذاری شد.");
    } catch {
      notify("بارگذاری تصویر انجام نشد.");
    } finally {
      setUploading(false);
    }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          subtitle: formData.get("subtitle"),
          category: formData.get("category"),
          description: formData.get("description"),
          origin: formData.get("origin"),
          harvestSeason: formData.get("harvestSeason"),
          badge: formData.get("badge"),
          image: uploadedImage,
          isFeatured: formData.get("isFeatured") === "on",
          variants: newVariants
            .filter((variant) => variant.weight.trim())
            .map((variant) => ({
              weight: variant.weight,
              price: parseNumber(variant.price),
              stock: parseNumber(variant.stock || "0"),
            })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        notify(typeof result.error === "string" ? result.error : "ایجاد محصول انجام نشد.");
        return;
      }
      notify("محصول با موفقیت ثبت شد و در سایت نمایش داده می‌شود.");
      form.reset();
      setNewVariants([emptyVariant()]);
      setUploadedImage("");
      await loadData();
      setTab("catalog");
    } catch {
      notify("ارتباط با سرور برقرار نشد.");
    } finally {
      setCreating(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const productGroups = variants.reduce<Map<number, AdminVariant[]>>((groups, variant) => {
    const group = groups.get(variant.productId) ?? [];
    group.push(variant);
    groups.set(variant.productId, group);
    return groups;
  }, new Map());

  return (
    <div className="admin-shell" dir="rtl">
      <header className="admin-header">
        <div>
          <span className="admin-kicker">پنل مدیریت آوین هانی</span>
          <h1>{tab === "orders" ? "سفارش‌ها" : tab === "catalog" ? "محصولات" : tab === "inquiries" ? "هدیه و همکاری" : "افزودن محصول"}</h1>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-ghost" onClick={() => void loadData()}>تازه‌سازی</button>
          <button type="button" className="admin-ghost admin-logout" onClick={() => void logout()}>خروج</button>
        </div>
      </header>
      {isDemoLogin && <p className="admin-banner">اطلاعات مدیر را پیش از انتشار در محیط سرور کامل کنید.</p>}
      <nav className="admin-tabs" aria-label="بخش‌های پنل">
        <button type="button" className={tab === "orders" ? "is-active" : ""} onClick={() => setTab("orders")}>سفارش‌ها ({money(ordersList.length)})</button>
        <button type="button" className={tab === "catalog" ? "is-active" : ""} onClick={() => setTab("catalog")}>محصولات ({money(productGroups.size)})</button>
        <button type="button" className={tab === "create" ? "is-active" : ""} onClick={() => setTab("create")}>+ افزودن محصول</button>
        <button type="button" className={tab === "inquiries" ? "is-active" : ""} onClick={() => setTab("inquiries")}>هدیه و همکاری</button>
      </nav>
      {tab === "inquiries" ? <AdminInquiries /> : loading && tab !== "create" ? <p className="admin-loading">در حال بارگذاری…</p> : tab === "orders" ? (
        <section className="admin-orders">
          {ordersList.length === 0 ? <p className="admin-empty">هنوز سفارشی ثبت نشده است.</p> : ordersList.map((order) => (
            <article className="admin-order-card" key={order.id}>
              <button type="button" className="admin-order-summary" onClick={() => setOpenOrder(openOrder === order.id ? null : order.id)}>
                <div>
                  <b className="admin-order-number">{order.orderNumber}</b>
                  <span>{order.customerName} · {order.city}</span>
                </div>
                <div className="admin-order-meta">
                  <b>{money(order.total)} تومان</b>
                  <span className={`admin-status admin-status-${order.status}`}>{STATUS_LABELS[order.status] ?? order.status}</span>
                </div>
              </button>
              {openOrder === order.id ? (
                <div className="admin-order-detail">
                  <div className="admin-detail-grid">
                    <span><b>موبایل:</b> {order.phone}</span>
                    <span><b>استان/شهر:</b> {order.province} – {order.city}</span>
                    <span><b>کدپستی:</b> {order.postalCode}</span>
                    <span><b>تاریخ:</b> {new Date(order.createdAt).toLocaleString("fa-IR")}</span>
                  </div>
                  <p className="admin-address"><b>نشانی:</b> {order.address}</p>
                  {order.customerNote ? <p className="admin-address"><b>یادداشت:</b> {order.customerNote}</p> : null}
                  <ul className="admin-items">
                    {order.items.map((item) => (
                      <li key={item.sku}>
                        <span>{item.productName} · {item.variantLabel} × {money(item.quantity)}</span>
                        <b>{money(item.totalPrice)} تومان</b>
                      </li>
                    ))}
                    <li className="admin-items-total"><span>ارسال: {order.shipping === 0 ? "رایگان" : `${money(order.shipping)} تومان`}</span><b>جمع: {money(order.total)} تومان</b></li>
                  </ul>
                  <label className="admin-status-picker">
                    <span>وضعیت سفارش</span>
                    <select value={order.status} onChange={(event) => void updateStatus(order.id, event.target.value)}>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option value={value} key={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : tab === "catalog" ? (
        <section className="admin-catalog">
          {productGroups.size === 0 ? (
            <p className="admin-empty">هنوز محصولی ثبت نشده است؛ از تب «افزودن محصول» شروع کنید.</p>
          ) : Array.from(productGroups.entries()).map(([productId, group]) => (
            <article className="admin-product-group" key={productId}>
              <div className="admin-product-head">
                <span><b>{group[0]?.productName}</b><small>{group[0]?.category}</small></span>
                <label className="admin-featured-toggle"><input type="checkbox" checked={group[0]?.isFeatured ?? false} disabled={featuredBusy === productId} onChange={(event) => void updateFeatured(productId, event.target.checked)} aria-label={`نمایش ${group[0]?.productName ?? "محصول"} در ویژه‌ها`} />نمایش در ویژه‌ها</label>
                <button type="button" className="admin-delete" onClick={() => void deleteProduct(productId, group[0]?.productName ?? "")}>حذف محصول</button>
              </div>
              {group.map((variant) => {
                const draft = drafts[variant.variantId] ?? { price: String(variant.price), stock: String(variant.stock) };
                const changed = Number(draft.price) !== variant.price || Number(draft.stock) !== variant.stock;
                return (
                  <div className="admin-variant-row" key={variant.variantId}>
                    <div className="admin-variant-name">
                      <b>{variant.weight}</b>
                      <span>{variant.sku}</span>
                    </div>
                    <label><span>قیمت (تومان)</span>
                      <input inputMode="numeric" value={draft.price} onChange={(event) => setDrafts((current) => ({ ...current, [variant.variantId]: { ...draft, price: event.target.value } }))} />
                    </label>
                    <label><span>موجودی</span>
                      <input inputMode="numeric" value={draft.stock} onChange={(event) => setDrafts((current) => ({ ...current, [variant.variantId]: { ...draft, stock: event.target.value } }))} />
                    </label>
                    <button type="button" className="admin-save" disabled={!changed} onClick={() => void saveVariant(variant.variantId)}>ذخیره</button>
                  </div>
                );
              })}
            </article>
          ))}
        </section>
      ) : (
        <form className="admin-form" onSubmit={createProduct}>
          <h3>مشخصات محصول جدید</h3>
          <p className="admin-form-hint">محصول بلافاصله بعد از ثبت، در ویترین سایت نمایش داده می‌شود.</p>
          <div className="admin-form-row">
            <label><span>نام محصول *</span><input name="name" required maxLength={80} placeholder="مثلاً عسل آویشن کوهی" /></label>
            <label><span>دسته‌بندی *</span>
              <select name="category" required defaultValue={PRODUCT_CATEGORIES[0]}>
                {PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
          </div>
          <div className="admin-form-row">
            <label><span>زیرعنوان کوتاه</span><input name="subtitle" maxLength={120} placeholder="پرعطر، گرم و خاطره‌انگیز" /></label>
            <label><span>نشان روی کارت</span><input name="badge" maxLength={40} placeholder="مثلاً برداشت محدود" /></label>
          </div>
          <div className="admin-form-row">
            <label><span>خاستگاه</span><input name="origin" maxLength={80} placeholder="مثلاً دامنه‌های زاگرس" /></label>
            <label><span>فصل برداشت</span><input name="harvestSeason" maxLength={60} placeholder="مثلاً برداشت بهاره" /></label>
          </div>
          <label><span>توضیحات</span><textarea name="description" rows={3} maxLength={600} placeholder="توضیح کوتاه و واقعی دربارهٔ طعم و ویژگی‌ها…" /></label>
          <label className="admin-featured-check"><input type="checkbox" name="isFeatured" /><span>نمایش در ویترین «تازه‌ها و ویژه‌ها» (نوار اسکرولی صفحهٔ اصلی)</span></label>
          <label><span>تصویر محصول (JPG/PNG/WebP تا ۳MB)</span>
            <div className="admin-upload-row">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImage(event.target.files?.[0])} disabled={uploading} />
              <span className="admin-upload-preview">
                {uploadedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={uploadedImage} alt="پیش‌نمایش تصویر محصول" />
                ) : "—"}
              </span>
            </div>
          </label>
          <h3>وزن‌ها و قیمت‌ها *</h3>
          {newVariants.map((variant, index) => (
            <div className="admin-variant-inputs" key={index}>
              <label><span>وزن</span><input value={variant.weight} maxLength={40} placeholder="مثلاً ۵۰۰ گرم" onChange={(event) => setNewVariants((current) => current.map((item, i) => i === index ? { ...item, weight: event.target.value } : item))} /></label>
              <label><span>قیمت (تومان)</span><input inputMode="numeric" value={variant.price} placeholder="450000" onChange={(event) => setNewVariants((current) => current.map((item, i) => i === index ? { ...item, price: event.target.value } : item))} /></label>
              <label><span>موجودی</span><input inputMode="numeric" value={variant.stock} placeholder="20" onChange={(event) => setNewVariants((current) => current.map((item, i) => i === index ? { ...item, stock: event.target.value } : item))} /></label>
            </div>
          ))}
          {newVariants.length < 6 ? (
            <button type="button" className="admin-add-variant" onClick={() => setNewVariants((current) => [...current, emptyVariant()])}>+ وزن دیگر</button>
          ) : null}
          <button type="submit" className="admin-save" disabled={creating || uploading}>{creating ? "در حال ثبت…" : "ثبت محصول در سایت"}</button>
        </form>
      )}

      <div className={`admin-toast${message ? " is-visible" : ""}`} role="status" aria-live="polite">{message}</div>
    </div>
  );
}
