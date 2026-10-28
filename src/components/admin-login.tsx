"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BrandMark } from "@/components/brand-mark";

function isCrossFramed() {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true;
  }
}

export default function AdminLogin({ isDemoLogin }: { isDemoLogin: boolean }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  const [adminUrl, setAdminUrl] = useState("/admin");
  const [cookieBlocked, setCookieBlocked] = useState(false);

  useEffect(() => {
    setEmbedded(isCrossFramed());
    try {
      setAdminUrl(new URL("/admin", window.location.href).href);
    } catch {
      setAdminUrl("/admin");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCookieBlocked(false);
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username") || "").trim();
    const password = String(data.get("password") || "");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          embedded: isCrossFramed(),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "ورود انجام نشد.");
        return;
      }

      // Check session
      const session = await fetch("/api/admin/session", { cache: "no-store", credentials: "include" });
      if (!session.ok) {
        setCookieBlocked(true);
        setError("رمز درست است، اما مرورگر در این قاب کوکی نشست را مسدود کرده. لطفاً با دکمهٔ زیر در تب مستقل باز کنید.");
        return;
      }
      window.location.replace("/admin");
    } catch {
      setError("ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-wrap" dir="rtl">
      <form className="admin-login-card" onSubmit={submit}>
        <BrandMark size={50} />
        <h1>پنل مدیریت آوین هانی</h1>
        <p>محصولات، تصاویر و سفارش‌ها؛ همه در یک کندو.</p>
        {embedded && <span className="admin-context-note">پیش‌نمایش تعبیه‌شده · نشست امن</span>}
        <label>
          <span>نام کاربری</span>
          <input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} dir="ltr" required maxLength={64} />
        </label>
        <label>
          <span>رمز عبور</span>
          <input name="password" type="password" autoComplete="current-password" dir="ltr" required maxLength={128} />
        </label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "در حال بررسی نشست…" : "ورود به پنل"}</button>
        <a href={adminUrl} target="_blank" rel="noopener noreferrer" className={`admin-open-tab${cookieBlocked ? " admin-open-tab-primary" : ""}`}>
          باز کردن پنل در تب مستقل مرورگر ↗
        </a>
        {cookieBlocked && (
          <p className="admin-cookie-help">
            مرورگرهای دارای سپر حریم خصوصی (مثل Brave) کوکی داخل قاب را مسدود می‌کنند. در تب مستقل بدون هیچ مشکلی وارد می‌شوید.
          </p>
        )}
        {isDemoLogin && (
          <div className="admin-demo-note">
            <b>اطلاعات مدیر هنوز کامل نیست.</b>
            <span>در Secrets مقدارهای <code>ADMIN_USERNAME</code> و <code>ADMIN_PASSWORD</code> را وارد کن. رمز حداقل ۱۲ کاراکتر باشد.</span>
            <span>سپس Save و Redeploy را بزن.</span>
          </div>
        )}
      </form>
    </div>
  );
}
