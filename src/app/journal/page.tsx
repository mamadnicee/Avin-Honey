import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AvIcon } from "@/components/av-icon";
import { StoreFooter, StoreHeader } from "@/components/site-chrome";
import { JOURNAL_ARTICLES } from "@/lib/journal";

export const metadata: Metadata = {
  title: "مجلهٔ کندو؛ دانستنی‌های عسل",
  description: "راهنمای نگهداری عسل، شناخت شکرک و کشف طعم‌ها در مجلهٔ کندوی آوین هانی؛ اطلاعات کاربردی بدون ادعاهای درمانی.",
  alternates: { canonical: "/journal" },
  openGraph: { title: "مجلهٔ کندو | آوین هانی", url: "/journal" },
};

export default function JournalPage() {
  return (
    <><StoreHeader /><main className="journal-page page-width" id="main-content">
      <div className="section-heading"><p className="eyebrow"><AvIcon name="book" size={17} /> از آن سوی شیشه</p><h1 className="display">یک مکث در <em>مجلهٔ کندو</em></h1><p className="section-description">کوتاه بخوان، آگاهانه انتخاب کن؛ از شناخت عسل تا نگهداری در خانه.</p></div>
      <div className="journal-grid">{JOURNAL_ARTICLES.map((article) => <Link href={`/journal/${article.slug}`} className="journal-card" key={article.slug}>
        <div className="journal-image"><Image src={article.image} alt={article.imageAlt} fill sizes="(max-width: 650px) 100vw, 33vw" /></div>
        <div className="journal-card-copy"><span>{article.category}<i />{article.readTime} مطالعه</span><h2 className="display">{article.title}</h2><p>{article.excerpt}</p><b>خواندن داستان <AvIcon name="arrow" size={16} /></b></div>
      </Link>)}</div>
    </main><StoreFooter compact /></>
  );
}
