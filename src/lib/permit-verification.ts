import QRCode from "qrcode";

type VerificationEntry = { id: string; label: string; host: string; url: string; qr: string };
const VERIFIED_PORTALS: { id: string; label: string; host: string; env: string }[] = [
  { id: "mojavez", label: "درگاه ملی مجوزها", host: "mojavez.ir", env: "BEEKEEPING_MOJAVEZ_URL" },
  { id: "semak", label: "سامانهٔ سماک", host: "semak.maj.ir", env: "BEEKEEPING_SEMAK_URL" },
];

function safePortalUrl(variable: string, host: string) {
  const value = process.env[variable]?.trim() || "";
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === host || url.hostname.endsWith(`.${host}`)) ? url.toString() : "";
  } catch { return ""; }
}

export async function getPermitVerification() {
  const code = process.env.BEEKEEPING_PERMIT_CODE?.trim() || "";
  const permitCode = /^[\w\u06F0-\u06F9\u0660-\u0669/ .-]{3,50}$/.test(code) ? code : "";
  const verifications: VerificationEntry[] = [];
  for (const portal of VERIFIED_PORTALS) {
    const url = safePortalUrl(portal.env, portal.host);
    if (!url) continue;
    const qr = await QRCode.toDataURL(url, { errorCorrectionLevel: "Q", margin: 1, width: 320, color: { dark: "#173e2b", light: "#ffffff" } });
    verifications.push({ id: portal.id, label: portal.label, host: portal.host, url, qr });
  }
  return { permitCode, verifications };
}
