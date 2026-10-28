import type { Metadata } from "next";
import { AvIcon } from "@/components/av-icon";
import { NatureOrbit } from "@/components/nature-orbit";
import { StoreFooter, StoreHeader } from "@/components/site-chrome";
import { TasteFinder } from "@/components/taste-finder";
import { loadProducts } from "@/lib/products";
import { PRODUCT_CATEGORIES } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "کشف طعم؛ راهنمای تعاملی انتخاب عسل",
  description: "با سه سؤال کوتاه، رایحه و شدت طعم دلخواهتان را کشف کنید؛ راهنمای سلیقهٔ آوین هانی، بدون ادعای درمانی.",
  alternates: { canonical: "/discover" },
  openGraph: { title: "کشف طعم با آوین هانی", url: "/discover" },
};

export default async function DiscoverPage() {
  const products = await loadProducts();
  const categories = PRODUCT_CATEGORIES.map((name) => ({ name, count: products.filter((p) => p.category === name).length }));
  return (
    <><StoreHeader /><main className="discover-page" id="main-content">
      <div className="discover-welcome page-width">
        <div><p className="eyebrow"><AvIcon name="compass" size={17} /> یک مسیر تازه، یک سلیقهٔ شخصی</p><h1 className="display">به دنیای <em>طعم خودت</em> بیا.</h1><p>قرار نیست همه یک عسل را دوست داشته باشیم.<br />از گل و جنگل شروع کن، به انتخاب خودت برس.</p><a className="button button-honey" href="#taste-quiz">کشف سلیقهٔ من <AvIcon name="arrow" size={18} /></a></div>
        <NatureOrbit />
      </div>
      <section className="taste-section section-padding" id="taste-quiz"><div className="page-width"><TasteFinder categories={categories} /></div></section>
    </main><StoreFooter compact /></>
  );
}
