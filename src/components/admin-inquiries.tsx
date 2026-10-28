"use client";

import { useCallback, useEffect, useState } from "react";
import { AvIcon } from "@/components/av-icon";
import { giftOccasionLabel } from "@/lib/gifts";

type Inquiry = { id: number; reference: string; customerName: string; phone: string; occasion: string; quantity: number; note: string; status: string; createdAt: string };

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/inquiries", { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 401 ? "نشست تمام شده است؛ دوباره وارد شوید." : "خواندن درخواست‌ها ممکن نشد.");
      setInquiries((await response.json()).inquiries);
    } catch (error) { setMessage(error instanceof Error ? error.message : "خطا در ارتباط"); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function update(inquiry: Inquiry) {
    setBusy(inquiry.id); setMessage("");
    try {
      const response = await fetch("/api/admin/inquiries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: inquiry.id, status: inquiry.status === "new" ? "contacted" : "new" }) });
      if (!response.ok) throw new Error("تغییر وضعیت انجام نشد.");
      const result = await response.json();
      setInquiries((current) => current.map((item) => item.id === inquiry.id ? result.inquiry : item));
    } catch (error) { setMessage(error instanceof Error ? error.message : "خطا در ارتباط"); } finally { setBusy(null); }
  }
  async function remove(inquiry: Inquiry) {
    if (!window.confirm(`درخواست ${inquiry.reference} حذف شود؟`)) return;
    setBusy(inquiry.id);
    try {
      const response = await fetch(`/api/admin/inquiries?id=${inquiry.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("حذف انجام نشد.");
      setInquiries((current) => current.filter((item) => item.id !== inquiry.id));
    } catch (error) { setMessage(error instanceof Error ? error.message : "خطا در ارتباط"); } finally { setBusy(null); }
  }
  return <section className="admin-inquiries"><div className="admin-inquiry-heading"><p>درخواست‌های هدیه و همکاری؛ جدا از سفارش‌ها و پرداخت‌ها.</p><button type="button" className="admin-ghost" onClick={() => void load()}>تازه‌سازی درخواست‌ها</button></div>{message && <p className="admin-error" role="alert">{message}</p>}{loading ? <p className="admin-loading">در حال خواندن درخواست‌ها…</p> : inquiries.length ? inquiries.map((item) => <article className="admin-inquiry-card" key={item.id}>
    <header><span className={`inquiry-status status-${item.status}`}>{item.status === "new" ? "تازه" : "پیگیری‌شده"}</span><span dir="ltr">{item.reference}</span><time>{new Date(item.createdAt).toLocaleDateString("fa-IR")}</time></header>
    <h2>{item.customerName}</h2><p>{giftOccasionLabel(item.occasion)} · حدود {new Intl.NumberFormat("fa-IR").format(item.quantity)} عدد</p>{item.note && <blockquote>{item.note}</blockquote>}
    <footer><a href={`tel:${item.phone}`}><AvIcon name="phone" size={17} /><span dir="ltr">{item.phone}</span></a><button type="button" className="admin-ghost" disabled={busy === item.id} onClick={() => void update(item)}>{item.status === "new" ? "پیگیری انجام شد" : "بازگشت به تازه‌ها"}</button><button type="button" className="admin-delete" disabled={busy === item.id} onClick={() => void remove(item)}>حذف درخواست</button></footer>
  </article>) : <p className="admin-empty">هنوز درخواستی ثبت نشده است.</p>}</section>;
}
