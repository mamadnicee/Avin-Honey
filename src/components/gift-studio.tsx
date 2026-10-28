"use client";

import { useRef, useState, type FormEvent } from "react";
import { AvIcon } from "@/components/av-icon";
import { BotanicalBranch } from "@/components/botanical-branch";
import { GIFT_OCCASIONS } from "@/lib/gifts";

export function GiftStudio() {
  const [occasion, setOccasion] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: data.get("customerName"), phone: data.get("phone"), quantity: data.get("quantity"), note: data.get("note"), website: data.get("website"), consent: data.get("consent") === "on", occasion: GIFT_OCCASIONS[occasion].id }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "ثبت درخواست انجام نشد."); return; }
      setReference(result.reference); setOpen(false);
    } catch { setError("ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید."); } finally { setBusy(false); }
  }
  function showForm() {
    setOpen(true);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }));
  }
  return (
    <section className="gift-section section-padding" id="gifts" aria-labelledby="gift-title">
      <div className="page-width">
        <div className="gift-panel">
          <BotanicalBranch className="gift-branch" />
          <span className="gift-hex-pattern" aria-hidden="true" />
          <div className="gift-copy">
            <p className="eyebrow light"><AvIcon name="flower" size={16} /> یک هدیهٔ کوچک، یک فکر شیرین</p>
            <h2 className="display" id="gift-title">شیرینی، وقتی قسمت می‌شود<br /><em>قشنگ‌تر است.</em></h2>
            <div className="gift-occasions" role="group" aria-label="برای چه کسی هماهنگ کنیم؟">{GIFT_OCCASIONS.map((item, index) => <button type="button" key={item.id} className={occasion === index ? "gift-occasion-selected" : ""} aria-pressed={occasion === index} onClick={() => setOccasion(index)}><AvIcon name={item.icon} size={16} />{item.label}</button>)}</div>
            <p className="gift-description" aria-live="polite">{GIFT_OCCASIONS[occasion].description} امکان تهیه و بسته‌بندی را بر اساس شرایط واقعی هماهنگ می‌کنیم.</p>
            {!reference && !open && <button type="button" className="button button-honey gift-cta" onClick={showForm}>گفت‌وگو دربارهٔ یک هدیهٔ شیرین <AvIcon name="arrow" size={19} /></button>}
            {reference && <div className="gift-success" role="status"><AvIcon name="check" size={25} /><b>درخواست شما با موفقیت ثبت شد</b><span>کد پیگیری اختصاصی: <strong dir="ltr">{reference}</strong></span><small>درخواست شما مستقیماً در کارتابل مدیریت ثبت شد؛ همکاران ما جهت هماهنگی با شما تماس خواهند گرفت.</small></div>}
            <a className="gift-phone" href="https://www.instagram.com/avin__honey/" target="_blank" rel="noopener noreferrer"><AvIcon name="sparkle" size={14} /> یا در اینستاگرام پیام بده <span dir="ltr">@avin__honey</span></a>
          </div>
          {open && <form ref={formRef} className="gift-form" onSubmit={submit}>
            <div className="gift-form-heading"><h3 className="display">هماهنگی سفارش هدیه و سازمانی</h3><button type="button" onClick={() => setOpen(false)} aria-label="بستن فرم درخواست">×</button></div>
            <p>اطلاعات شما مستقیماً در کارتابل مدیریت آوین ثبت می‌شود و جهت هماهنگی نهایی با شما تماس می‌گیریم.</p>
            <div className="gift-form-fields"><label>نام شما<input name="customerName" autoComplete="name" required minLength={2} maxLength={80} /></label><label>شمارهٔ موبایل<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} placeholder="۰۹۱۲۱۲۳۴۵۶۷" /></label><label>تعداد تقریبی<input name="quantity" inputMode="numeric" required defaultValue="۱" maxLength={4} /></label></div>
            <label>دوست داری چه چیزی را هماهنگ کنیم؟<textarea name="note" rows={3} maxLength={800} placeholder="مناسبت، بودجهٔ مدنظر، زمان یا سؤال شما…" /></label>
            <label className="inquiry-honeypot" aria-hidden="true">وب‌سایت<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <label className="gift-consent"><input name="consent" type="checkbox" required />برای پیگیری این درخواست با من تماس بگیرید.</label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="gift-submit"><button type="submit" className="button button-green" disabled={busy}>{busy ? "در حال ارسال درخواست…" : "ثبت درخواست هماهنگی"}<AvIcon name="arrow" size={17} /></button></div>
          </form>}
        </div>
      </div>
    </section>
  );
}
