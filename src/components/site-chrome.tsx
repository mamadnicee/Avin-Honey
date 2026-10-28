"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AvIcon } from "@/components/av-icon";
import { AvinWordmark } from "@/components/avin-wordmark";
import { BrandMark } from "@/components/brand-mark";

export function StoreHeader({ home = false, count = 0, onCart }: { home?: boolean; count?: number; onCart?: () => void }) {
  const [open, setOpen] = useState(false);
  const anchor = (id: string) => home ? `#${id}` : `/#${id}`;
  const bag = <><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg><span>سبد خرید</span><b className="cart-count">{new Intl.NumberFormat("fa-IR").format(count)}</b></>;
  return <header className="site-header" onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>
    <div className="header-inner">
      <Link className="brand" href="/" aria-label="آوین هانی، صفحهٔ اصلی"><BrandMark /><span className="brand-copy"><strong>آوین هانی<span className="brand-dot">.</span></strong><AvinWordmark /></span></Link>
      <nav id="main-menu" className={`main-nav${open ? " nav-open" : ""}`} aria-label="ناوبری اصلی">
        <a href={anchor("products")} onClick={() => setOpen(false)}>فروشگاه عسل</a>
        <Link href="/discover" onClick={() => setOpen(false)}>کشف طعم <span className="nav-new">تازه</span></Link>
        <Link href="/about" onClick={() => setOpen(false)}>دربارهٔ ما</Link>
        <a href={anchor("story")} onClick={() => setOpen(false)}>قصهٔ آوین</a>
        <Link href="/journal" onClick={() => setOpen(false)}>مجلهٔ کندو</Link>
        <a href={anchor("contact")} onClick={() => setOpen(false)}>ارتباط با ما</a>
      </nav>
      <div className="header-actions">
        {onCart ? <button className="cart-trigger" type="button" onClick={onCart} aria-label={`سبد خرید، ${count} محصول`}>{bag}</button> : <Link className="cart-trigger" href="/#products" aria-label="رفتن به فروشگاه">{bag}</Link>}
        <button className="icon-button menu-trigger" type="button" onClick={() => setOpen(!open)} aria-label={open ? "بستن منو" : "بازکردن منو"} aria-expanded={open} aria-controls="main-menu"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">{open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg></button>
      </div>
    </div>
  </header>;
}

export function StoreFooter({ trustLogos = [], compact = false }: { trustLogos?: string[]; compact?: boolean }) {
  return <footer className="site-footer" id="contact"><div className="footer-drip" aria-hidden="true" /><div className="page-width">
    <div className="footer-brand-center"><BrandMark size={54} /><b className="display">آوین هانی</b><AvinWordmark large tone="light" /><p>یک شیشهٔ کوچک، برای لحظه‌های بزرگِ روزمره</p></div>
    <nav className="footer-nav" aria-label="لینک‌های پایانی"><Link href="/#products">فروشگاه</Link><Link href="/discover">کشف طعم</Link><Link href="/about">دربارهٔ ما</Link><Link href="/journal">مجلهٔ کندو</Link><Link href="/#story">قصهٔ ما</Link><Link href="/#faq">پرسش‌ها</Link></nav>
        <div className="footer-contact" aria-label="راه‌های ارتباطی">
          <a className="footer-contact-item" href="tel:+989913805102"><AvIcon name="phone" size={16} /><b dir="ltr">+98 991 380 5102</b></a>
          <span className="footer-contact-item"><AvIcon name="compass" size={16} /> اصفهان - خیابان فلاطوری</span>
          <a className="footer-contact-item" href="https://instagram.com/avin__honey" target="_blank" rel="noopener noreferrer"><span dir="ltr">@avin__honey</span></a>
        </div>
        {!compact && <><div className="trust-row" aria-label="جایگاه نمادهای اعتماد و مجوزها">
          {trustLogos.length ? trustLogos.map((logo) => <span className="trust-badge" key={logo}><Image src={logo} alt="مجوز کسب‌وکار آوین هانی" loading="lazy" width={70} height={70} unoptimized /></span>) : [
            { label: "پروانه زنبورداری", hint: "مراتع زاگرس" },
            { label: "اینماد", hint: "کسب‌وکار الکترونیکی" },
            { label: "ساماندهی", hint: "ثبت پایگاه" },
          ].map((item) => <span className="trust-badge trust-empty" key={item.label}><AvIcon name="shield" size={24} /><small><b>{item.label}</b><span>{item.hint}</span></small></span>)}
          </div><p className="trust-note">جایگاه پروانه زنبورداری، اینماد و مجوزهای رسمی؛ همراه با کد اختصاصی پس از استقرار.</p><Link className="footer-about-card" href="/about"><span className="footer-about-mark"><Image src="/brand/avin-a-mark.png" alt="نشان آوین" width={24} height={24} unoptimized /></span><span><b>آوین را از نزدیک بشناس</b><small>زنبورستان زاگرس، کارگاه اصفهان و شناسنامهٔ زنبورداری</small></span><AvIcon name="arrow" size={16} /></Link></>}
    <div className="footer-bottom"><span>© آوین هانی · همهٔ حقوق محفوظ است</span><span>از طبیعت، با حوصله</span><Link href="/admin" className="footer-admin">ورود مدیریت</Link></div>
  </div></footer>;
}
