import { readdir } from "node:fs/promises";
import path from "node:path";
import HoneyStore from "@/components/honey-store";
import { PRODUCT_CATEGORIES } from "@/lib/catalog";
import { loadProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

async function loadTrustLogos(): Promise<string[]> {
  try {
    const files = await readdir(path.join(process.cwd(), "public", "trust"));
    return files.filter((file) => /^[\w.-]+\.(png|jpg|jpeg|webp|svg)$/i.test(file)).sort().slice(0, 6).map((file) => `/trust/${file}`);
  } catch { return []; }
}

// The official beekeeping permit number is supplied by the business owner and
// stored in server configuration, never invented in code.
function readPermitCode() {
  const value = process.env.BEEKEEPING_PERMIT_CODE?.trim() || "";
  return /^[\w\u06F0-\u06F9\u0660-\u0669/ .-]{3,40}$/.test(value) ? value : "";
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category }, products, trustLogos] = await Promise.all([searchParams, loadProducts(), loadTrustLogos()]);
  const initialCategory = PRODUCT_CATEGORIES.some((name) => name === category) ? category : "همه";
  return <HoneyStore products={products} trustLogos={trustLogos} initialCategory={initialCategory} permitCode={readPermitCode()} />;
}
