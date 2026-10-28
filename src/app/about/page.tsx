import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AvIcon } from "@/components/av-icon";
import { AvinWordmark } from "@/components/avin-wordmark";
import { BrandMark } from "@/components/brand-mark";
import { StoreFooter, StoreHeader } from "@/components/site-chrome";

const SITE = process.env.SITE_URL || "https://avinhoney.ir";
export const metadata: Metadata = {
  title: "دربارهٔ آوین هانی؛ زنبورستان زاگرس و کارگاه اصفهان",
  description: "با آوین هانی آشنا شوید؛ زنبورستانِ تحت پرورش مستقیم در دامنه‌های زاگرس و کارگاه اصفهان، خیابان فلاطوری.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "دربارهٔ آوین هانی",
    description: "از دامنه‌های زاگرس تا کارگاه اصفهان؛ داستان زنبورستان آوین.",
    url: "/about",
    images: [{ url: "/brand/avin-a-mark-white.png", width: 1024, height: 1024, alt: "نشان A آوین هانی" }],
  },
};

const PILLARS = [
  {
    n: "۰۱",
    icon: "forest" as const,
    title: "پرورشِ اختصاصی کندوها",
    text: "زنبورها را خودمان پرورش می‌دهیم و در تمامی فصل‌های شهدآوری از کندوها مراقبت می‌کنیم؛ آوین از دل کار واقعی زنبورداری شکل گرفته است.",
  },
  {
    n: "۰۲",
    icon: "flower" as const,
    title: "دامنه‌ها و مراتع زاگرس",
    text: "بخش عمدهٔ زنبورستان در مراتع کوهستانی زاگرس مستقر است؛ پوشش گیاهی بکر کوهستان سرشار از آویشن، گون و گیاهان دارویی خودرو است.",
  },
  {
    n: "۰۳",
    icon: "compass" as const,
    title: "کارگاه و توزیع در اصفهان",
    text: "پیگیری سفارش‌ها، بسته‌بندی بهداشتی شیشه‌ها و ارسال به سراسر کشور از اصفهان، خیابان فلاطوری انجام می‌پذیرد.",
  },
];

export default function AboutPage() {
  const permitCode = "۱۹۲۴۱۰۷۳۱۷";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "دربارهٔ آوین هانی",
    url: `${SITE}/about`,
    inLanguage: "fa-IR",
    about: {
      "@type": "Organization",
      name: "آوین هانی",
      url: SITE,
      telephone: "+989913805102",
      sameAs: ["https://instagram.com/avin__honey"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "خیابان فلاطوری",
        addressLocality: "اصفهان",
        addressCountry: "IR",
      },
    },
  };

  return (
    <>
      <StoreHeader />
      <main className="about-page" id="main-content">
        <section className="about-hero">
          <div className="about-hero-glow" aria-hidden="true" />
          <div className="page-width about-hero-inner">
            <div className="about-brand-lockup">
              <BrandMark size={48} />
              <span className="about-brand-name">آوین هانی</span>
              <AvinWordmark large tone="dark" />
            </div>
            <p className="eyebrow">
              <AvIcon name="flower" size={16} /> شناسنامه و داستان آوین
            </p>
            <h1 className="display">
              شهدِ خالص، <em>از دلِ زاگرس</em>
              <br />
              تا سفرهٔ آرامِ شما
            </h1>
            <p className="about-hero-copy">
              آوین هانی زنبورستان اختصاصی در دامنه‌های سرسبز زاگرس است؛ جایی که کیفیت، عطر طبیعی و سلامت عسل در اولویت
              همیشگی قرار دارد.
            </p>
            <a className="about-scroll-link" href="#apiary">
              <span /> شناخت زنبورستان و مجوزها
            </a>
          </div>
        </section>

        <section className="about-origin-section section-padding" id="apiary">
          <div className="page-width">
            <div className="about-origin-layout">
              <div className="about-origin-photo">
                <Image
                  src="/images/about-apiary.jpg"
                  alt="کندوهای چوبی زنبورستان در دامنه‌های سرسبز"
                  fill
                  sizes="(max-width: 760px) 100vw, 48vw"
                />
              </div>
              <div className="about-origin-copy">
                <p className="eyebrow">
                  <AvIcon name="compass" size={16} /> پرورش طبیعی در مراتع زاگرس
                </p>
                <h2 className="display">
                  از ارتفاعات کوهستان،
                  <br />
                  <em>تا شیشهٔ روی میز شما</em>
                </h2>
                <p>
                  در زنبورستان آوین هانی، زنبورها در مناطق خوش‌آب‌وهوا و دور از سموم شیمیایی پرورش می‌یابند. هر برداشت
                  منعکس‌کنندهٔ پوشش گیاهی همان منطقه در فصل گل‌دهی است.
                </p>
                <p>
                  تمامی سفارش‌ها با نظارت کیفی و بسته‌بندی ویژه از کارگاه اصفهان ارسال می‌شوند تا طعم اصیل و خواص عسل
                  طبیعی به‌طور کامل حفظ شود.
                </p>
                <div className="about-contact">
                  <a href="tel:+989913805102">
                    <AvIcon name="phone" size={15} />
                    <b dir="ltr">+98 991 380 5102</b>
                  </a>
                  <span>اصفهان · خیابان فلاطوری</span>
                  <a href="https://instagram.com/avin__honey" target="_blank" rel="noopener noreferrer" dir="ltr">
                    @avin__honey
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-pillars-section section-padding">
          <div className="page-width">
            <div className="section-heading">
              <p className="eyebrow">
                <AvIcon name="leaf" size={16} /> اصول و استانداردهای آوین
              </p>
              <h2 className="display">
                سه ستون <em>اصالت و سلامت</em>
              </h2>
            </div>
            <div className="about-pillars">
              {PILLARS.map((pillar) => (
                <article className="about-pillar" key={pillar.n}>
                  <span className="about-pillar-icon">
                    <AvIcon name={pillar.icon} size={25} />
                  </span>
                  <h3 className="display">{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-permit-section section-padding" id="permit">
          <div className="page-width">
            <div className="about-permit-card">
              <div className="permit-card-heading">
                <span className="permit-medallion">
                  <AvIcon name="shield" size={26} />
                </span>
                <p className="eyebrow">مجوزها و اسناد قانونی</p>
                <h2 className="display">
                  شناسنامهٔ رسمی <em>زنبورداری</em>
                </h2>
                <p>
                  فعالیت زنبورستان آوین هانی دارای مجوز رسمی از مراجع قانونی کشاورزی و صنف زنبورداران است.
                </p>
              </div>

              <div className="permit-detail-row">
                <span className="permit-detail-icon">
                  <AvIcon name="compass" size={22} />
                </span>
                <div>
                  <b>عنوان مدرک:</b>
                  <span>شناسنامه زنبورداری</span>
                  <b>شماره ثبت پروانه:</b>
                  <code dir="ltr">{permitCode}</code>
                  <small>صادرشده توسط سازمان جهاد کشاورزی و اتحادیه تعاونی زنبورداران استان اصفهان</small>
                </div>
              </div>

              <div className="official-portals-grid">
                <div className="official-portal-card">
                  <span className="portal-icon">
                    <AvIcon name="shield" size={24} />
                  </span>
                  <div>
                    <b>سامانه سماک جهاد کشاورزی</b>
                    <small dir="ltr">semak.maj.ir</small>
                    <p>سامانهٔ جامع صدور مجوزهای الکترونیکی بخش کشاورزی کشور</p>
                  </div>
                  <a
                    href="https://semak.maj.ir"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portal-link"
                  >
                    مشاهده سامانه <AvIcon name="arrow" size={13} />
                  </a>
                </div>

                <div className="official-portal-card">
                  <span className="portal-icon">
                    <AvIcon name="compass" size={24} />
                  </span>
                  <div>
                    <b>درگاه ملی مجوزهای کشور</b>
                    <small dir="ltr">mojavez.ir</small>
                    <p>پایگاه رسمی اعتبارسنجی و استعلام شناسهٔ یکتای کسب‌وکارها</p>
                  </div>
                  <a
                    href="https://mojavez.ir"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portal-link"
                  >
                    مشاهده سامانه <AvIcon name="arrow" size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-end-section section-padding">
          <div className="page-width about-end-card">
            <Image
              src="/brand/avin-a-mark-white.png"
              alt="نشان آوین هانی"
              width={90}
              height={90}
              unoptimized
            />
            <AvinWordmark large tone="light" />
            <h2 className="display">
              طبیعت در <em>یک شیشه عسل</em>
            </h2>
            <p>
              با خیال آسوده از سلامت، خلوص و اصالت، عسل دلخواهتان را انتخاب کنید.
            </p>
            <div>
              <Link href="/#products" className="button button-honey">
                مشاهدهٔ محصولات <AvIcon name="arrow" size={16} />
              </Link>
              <Link href="/journal" className="about-journal-link">
                مطالعهٔ مجلهٔ کندو
              </Link>
            </div>
          </div>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </main>
      <StoreFooter />
    </>
  );
}
