import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const SITE_URL = process.env.SITE_URL || "https://avinhoney.ir";
const SITE_NAME = "آوین هانی";
const SITE_TITLE = "آوین هانی | عسل طبیعی، از دلِ طبیعت";
const SITE_DESCRIPTION =
  "فروشگاه اینترنتی عسل طبیعی آوین هانی؛ عسل‌های تک‌گل و چندگیاه با خاستگاه مشخص، برداشت محدود و ارسال به سراسر ایران.";

const vazirmatn = localFont({
  src: [
    { path: "../fonts/vazirmatn-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/vazirmatn-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/vazirmatn-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const lalezar = localFont({
  src: [{ path: "../fonts/lalezar-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/images/hero-honey.jpg", width: 1200, height: 675, alt: "عسل طبیعی آوین هانی" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/hero-honey.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  // کد تأیید اینماد از env خوانده می‌شود؛ مقدار را در ENAMAD_META بگذارید.
  other: process.env.ENAMAD_META ? { enamad: process.env.ENAMAD_META } : {},
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineStore",
      "@id": `${SITE_URL}/#store`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      image: `${SITE_URL}/images/hero-honey.jpg`,
      telephone: "+989913805102",
      address: { "@type": "PostalAddress", streetAddress: "خیابان فلاطوری", addressLocality: "اصفهان", addressCountry: "IR" },
      sameAs: ["https://instagram.com/avin__honey"],
      inLanguage: "fa-IR",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "fa-IR",
      publisher: { "@id": `${SITE_URL}/#store` },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${lalezar.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
