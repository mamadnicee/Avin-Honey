import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvIcon } from "@/components/av-icon";
import { StoreFooter, StoreHeader } from "@/components/site-chrome";
import { JOURNAL_ARTICLES } from "@/lib/journal";

export function generateStaticParams() { return JOURNAL_ARTICLES.map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = JOURNAL_ARTICLES.find((a) => a.slug === slug);
  if (!article) return { title: "مطلب پیدا نشد" };
  return { title: article.title, description: article.excerpt, alternates: { canonical: `/journal/${slug}` }, openGraph: { type: "article", title: article.title, description: article.excerpt, url: `/journal/${slug}`, images: [{ url: article.image, alt: article.imageAlt }] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = JOURNAL_ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();
  const site = process.env.SITE_URL || "https://avinhoney.ir";
  const jsonld = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.excerpt, image: `${site}${article.image}`, inLanguage: "fa-IR", author: { "@type": "Organization", name: "آوین هانی", url: site }, mainEntityOfPage: `${site}/journal/${article.slug}` };
  return (
    <><StoreHeader /><main className="article-page" id="main-content">
      <article>
        <header className="article-header page-width"><Link href="/journal" className="article-back"><AvIcon name="arrow" size={17} /> بازگشت به مجلهٔ کندو</Link><span className="eyebrow">{article.category} · {article.readTime} مطالعه</span><h1 className="display">{article.title}</h1><p>{article.excerpt}</p></header>
        <div className="article-cover"><Image src={article.image} alt={article.imageAlt} fill priority sizes="(max-width: 1000px) 100vw, 1000px" /></div>
        <div className="article-body">{article.sections.map((section) => <section key={section.heading}><h2 className="display">{section.heading}</h2><p>{section.body}</p></section>)}<aside className="article-note"><AvIcon name="leaf" size={24} /><p>این مطلب دربارهٔ شناخت و نگهداری یک مادهٔ غذایی است، نه توصیهٔ پزشکی. مشخصات و دستور روی بسته‌بندی محصول خودتان را بررسی کنید.</p></aside><Link href="/discover" className="button button-green">حالا سلیقه‌ام را کشف کنم <AvIcon name="arrow" size={18} /></Link></div>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld).replace(/</g, "\\u003c") }} />
    </main><StoreFooter compact /></>
  );
}
