import { loadProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await loadProducts();
  return Response.json(
    { products },
    { headers: { "Cache-Control": "no-store" } },
  );
}
