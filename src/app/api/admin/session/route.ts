import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authenticated = await isAdminRequest(request);
  return Response.json(
    { authenticated },
    { status: authenticated ? 200 : 401, headers: { "Cache-Control": "private, no-store" } }
  );
}
