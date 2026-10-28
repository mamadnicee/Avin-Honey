"use client";

import Image from "next/image";
import { useState } from "react";
import { AvIcon } from "@/components/av-icon";
import { useSoftMarquee } from "@/hooks/use-soft-marquee";
import type { StoreProduct } from "@/lib/catalog";

const EMPTY_SLOTS = ["برداشت تازه", "انتخاب ویژه", "عطر کوهستان", "گل‌های دشت", "هدیه‌ای شیرین", "فصل تازه"];

export function FeaturedShowcase({ products }: { products: StoreProduct[] }) {
  const [paused, setPaused] = useState(false);
  const featured = products.filter((p) => p.isFeatured);
  const { track, suppressDragClick } = useSoftMarquee(featured.length || EMPTY_SLOTS.length, paused);
  return (
    <section className="featured-section" id="featured" aria-labelledby="featured-title">
      <div className="featured-glow" aria-hidden="true" />
      <div className="page-width featured-top"><p className="eyebrow"><AvIcon name="sparkle" size={15} /> انتخاب‌های مخصوص آوین</p><h2 className="display" id="featured-title">تازه از کندو، <em>ویژه برای تو</em></h2><p className="featured-description">یک ویترین کوچک برای برداشت‌های تازه و انتخاب‌های ویژه.</p>{featured.length > 0 && <span className="featured-total">{new Intl.NumberFormat("fa-IR").format(featured.length)} انتخاب ویژه</span>}</div>
      <button type="button" className="accessible-motion-control" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? "ادامهٔ حرکت خودکار ویترین" : "توقف حرکت خودکار ویترین"}</button>
      <div className="featured-track" ref={track} role="list" aria-label="محصولات ویژه" aria-describedby="showcase-guide" tabIndex={0} onClickCapture={suppressDragClick}>
        {featured.length ? featured.map((product) => <article className="glass-card" role="listitem" key={product.slug}>
          <div className="glass-image">{product.image ? <Image src={product.image} alt={product.name} fill sizes="280px" draggable={false} /> : <span className="glass-image-fallback"><AvIcon name="jar" size={44} /></span>}</div>
          <div className="glass-info"><span className="glass-kicker">{product.badge || product.category}</span><h3>{product.name}</h3>{product.variants[0] && <span className="glass-price">{new Intl.NumberFormat("fa-IR").format(product.variants[0].price)} <small>تومان</small></span>}<a className="glass-link" href="#products" draggable={false}>دیدن در فروشگاه <AvIcon name="arrow" size={15} /></a></div>
        </article>) : EMPTY_SLOTS.map((label) => <article className="glass-card glass-placeholder" role="listitem" key={label}>
          <div className="glass-image"><span className="glass-image-fallback"><AvIcon name="jar" size={44} /></span><span className="placeholder-shimmer" /></div>
          <div className="glass-info"><span className="glass-kicker">{label}</span><h3>جای یک انتخابِ خوب</h3><span className="glass-hint">به‌زودی با جدیدترین عسل‌های دست‌چین آوین تکمیل می‌شود.</span></div>
        </article>)}
      </div>
      <span className="showcase-hint" id="showcase-guide"><span /> خودت ورق بزن؛ ویترین با ریتم تو همراه می‌شود.</span>
    </section>
  );
}
