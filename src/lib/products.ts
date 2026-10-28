import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import type { StoreProduct } from "@/lib/catalog";
import { CATALOG_SEED } from "@/lib/catalog";

/**
 * Loads products from the database, falling back to CATALOG_SEED when the
 * database is empty or unreachable (e.g. a build without a DB connection).
 */
export async function loadProducts(): Promise<StoreProduct[]> {
  try {
    const rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        subtitle: products.subtitle,
        category: products.category,
        description: products.description,
        image: products.image,
        origin: products.origin,
        harvestSeason: products.harvestSeason,
        badge: products.badge,
        isFeatured: products.isFeatured,
        variantId: productVariants.id,
        sku: productVariants.sku,
        label: productVariants.label,
        weight: productVariants.weight,
        price: productVariants.price,
        compareAtPrice: productVariants.compareAtPrice,
        stock: productVariants.stock,
      })
      .from(products)
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .orderBy(asc(products.id), asc(productVariants.id));

    const catalog = new Map<string, StoreProduct>();
    for (const row of rows) {
      let product = catalog.get(row.slug);
      if (!product) {
        product = {
          id: row.id,
          slug: row.slug,
          name: row.name,
          subtitle: row.subtitle,
          category: row.category,
          description: row.description,
          image: row.image,
          origin: row.origin,
          harvestSeason: row.harvestSeason,
          badge: row.badge,
          isFeatured: row.isFeatured,
          botanicalNote: "",
          variants: [],
        };
        catalog.set(row.slug, product);
      }
      if (row.variantId !== null && row.sku !== null && row.label !== null && row.weight !== null && row.stock !== null) {
        product.variants.push({
          id: row.variantId,
          sku: row.sku,
          label: row.label,
          weight: row.weight,
          price: row.price,
          compareAtPrice: row.compareAtPrice,
          stock: row.stock,
        });
      }
    }

    const loaded = Array.from(catalog.values()).filter((product) => product.variants.length > 0);
    if (loaded.length === 0) return structuredClone(CATALOG_SEED);
    return loaded;
  } catch {
    // No DB connection (build time, static export, local preview): serve the
    // editorial seed catalog so pages render without a database.
    return structuredClone(CATALOG_SEED);
  }
}
