function safeHost(value: string | null) {
  const host = value?.split(",")[0]?.trim();
  return host && /^[a-zA-Z0-9.:[\]-]+$/.test(host) ? host : null;
}

// Preview tunnels look like https://3000-<id>.e2b.app. This exception is used
// ONLY when no explicit APP_ORIGIN is configured (never on a real deployment).
const PREVIEW_ORIGIN = /^https:\/\/\d{2,5}-[a-z0-9]+\.e2b\.app$/;

export function requestOrigins(request: Request) {
  const origins = new Set<string>();
  const url = new URL(request.url);
  origins.add(url.origin);
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https" ? "https:" : url.protocol;
  for (const header of ["host", "x-forwarded-host"]) {
    const host = safeHost(request.headers.get(header));
    if (host) { try { origins.add(new URL(`${protocol}//${host}`).origin); } catch { /* Ignore malformed headers. */ } }
  }
  if (process.env.APP_ORIGIN) {
    try { origins.add(new URL(process.env.APP_ORIGIN).origin); } catch { /* Ignore malformed configuration. */ }
  }
  return origins;
}

export function isTrustedOrigin(request: Request) {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return request.headers.get("sec-fetch-site") !== "cross-site";
  try {
    const origin = new URL(originHeader).origin;
    if (requestOrigins(request).has(origin)) return true;
    return !process.env.APP_ORIGIN && PREVIEW_ORIGIN.test(origin);
  } catch { return false; }
}

export function canUseEmbeddedPreview(request: Request) {
  const candidates = Array.from(requestOrigins(request));
  const originHeader = request.headers.get("origin");
  if (originHeader) candidates.push(originHeader);
  return candidates.some((origin) => PREVIEW_ORIGIN.test(origin));
}
