import { clearAdminCookies } from "@/lib/admin-auth";
import { isTrustedOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) return Response.json({ error: "مبدأ درخواست معتبر نیست." }, { status: 403 });
  await clearAdminCookies();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
