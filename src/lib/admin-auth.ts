import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { canUseEmbeddedPreview, isTrustedOrigin } from "@/lib/request-security";

export const ADMIN_COOKIE = "mehrshahd_admin_session";
export const EMBEDDED_ADMIN_COOKIE = "__Host-avinhoney_admin_embed";
const SESSION_MS = 8 * 60 * 60 * 1000;

export function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME?.trim() || "";
  const password = process.env.ADMIN_PASSWORD?.trim() || "";
  const configured = username.length > 0 && password.length >= 12;
  const suppliedSecret = process.env.ADMIN_SECRET?.trim() || "";
  const secret = configured ? createHmac("sha256", password).update(`${username}:avinhoney-session-v2:${suppliedSecret}`).digest("hex") : "";
  return { username, password, secret, configured, isDemoLogin: !configured };
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a); const right = Buffer.from(b);
  if (left.length !== right.length) { timingSafeEqual(right, right); return false; }
  return timingSafeEqual(left, right);
}

export function checkAdminCredentials(username: string, password: string) {
  const config = getAdminConfig();
  if (!config.configured) return false;
  const userOk = safeEqual(username, config.username);
  const passOk = safeEqual(password, config.password);
  return userOk && passOk;
}

export function createAdminSessionToken() {
  const { configured, secret } = getAdminConfig();
  if (!configured) throw new Error("Admin credentials are not configured");
  const payload = `admin.${Date.now() + SESSION_MS}`;
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token || token.length > 200) return false;
  const config = getAdminConfig();
  if (!config.configured) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const expiry = Number(parts[1]);
  if (!Number.isFinite(expiry) || expiry <= Date.now() || expiry > Date.now() + SESSION_MS + 60_000) return false;
  return safeEqual(parts[2], createHmac("sha256", config.secret).update(`${parts[0]}.${parts[1]}`).digest("hex"));
}

export async function issueAdminCookies(request: Request, embedded: boolean) {
  const jar = await cookies();
  const token = createAdminSessionToken();
  const secure = process.env.NODE_ENV === "production";
  jar.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: SESSION_MS / 1000 });
  const partitioned = embedded && canUseEmbeddedPreview(request);
  if (partitioned) {
    // CHIPS keeps the preview session isolated by its top-level host. It never
    // exposes the token to JavaScript, URLs, localStorage or another website.
    jar.set(EMBEDDED_ADMIN_COOKIE, token, { httpOnly: true, secure: true, sameSite: "none", partitioned: true, path: "/", maxAge: SESSION_MS / 1000 });
  }
  return partitioned ? "partitioned" : "first-party";
}

export async function clearAdminCookies() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  jar.set(EMBEDDED_ADMIN_COOKIE, "", { httpOnly: true, secure: true, sameSite: "none", partitioned: true, path: "/", maxAge: 0 });
}

export async function isAdminRequest(request?: Request) {
  if (request && !isTrustedOrigin(request)) return false;
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value) || verifyAdminSessionToken(jar.get(EMBEDDED_ADMIN_COOKIE)?.value);
}
