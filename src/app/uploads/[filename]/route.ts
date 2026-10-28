import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Unlike a build-time public file, this route also serves images uploaded
// after next start. The allowlist prevents path traversal and SVG scripts.
export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^product-\d{13}-[a-f0-9]{8}\.(jpg|png|webp)$/.test(filename)) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", "uploads", filename));
    const ext = filename.split(".").pop();
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": ext === "jpg" ? "image/jpeg" : ext === "png" ? "image/png" : "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    } });
  } catch { return new Response("Not found", { status: 404 }); }
}
