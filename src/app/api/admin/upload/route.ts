import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024; // 3MB

const SIGNATURES: Array<{ ext: string; check: (bytes: Uint8Array) => boolean }> = [
  { ext: "jpg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    ext: "webp",
    check: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "فایل دریافت نشد." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "فایل تصویر را انتخاب کنید." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return Response.json({ error: "حجم تصویر باید حداکثر ۳ مگابایت باشد." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = SIGNATURES.find((candidate) => candidate.check(bytes));
  if (!signature) {
    return Response.json({ error: "فقط تصویر JPG، PNG یا WebP پذیرفته می‌شود." }, { status: 400 });
  }

  const fileName = `product-${Date.now()}-${randomBytes(4).toString("hex")}.${signature.ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, fileName), bytes);
  } catch (error) {
    console.error("Could not store uploaded image", error);
    return Response.json({ error: "ذخیرهٔ تصویر ممکن نشد." }, { status: 500 });
  }

  return Response.json({ ok: true, path: `/uploads/${fileName}` }, { status: 201 });
}
