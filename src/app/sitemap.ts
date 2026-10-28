import type { MetadataRoute } from "next";
import { JOURNAL_ARTICLES } from "@/lib/journal";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = (process.env.SITE_URL || "https://avinhoney.ir").replace(/\/$/, "");
  return [
    { url: site, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/discover`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/journal`, changeFrequency: "weekly", priority: 0.8 },
    ...JOURNAL_ARTICLES.map((article) => ({ url: `${site}/journal/${article.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
