import type { Metadata } from "next";
import AdminDashboard from "@/components/admin-dashboard";
import AdminLogin from "@/components/admin-login";
import { getAdminConfig, isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل مدیریت | آوین هانی",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdminRequest();
  const { isDemoLogin } = getAdminConfig();

  if (!authed) {
    return <AdminLogin isDemoLogin={isDemoLogin} />;
  }
  return <AdminDashboard isDemoLogin={isDemoLogin} />;
}
