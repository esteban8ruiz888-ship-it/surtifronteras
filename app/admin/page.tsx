import { isAuthConfigured, isAuthenticated } from "@/lib/auth";
import {
  getAboutImageUrl,
  getPresentations,
  getProducts,
  isDbConfigured,
} from "@/lib/db";
import { LoginForm } from "./login-form";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    return <LoginForm configured={isAuthConfigured()} />;
  }
  const [products, aboutImageUrl, presentations] = await Promise.all([
    getProducts(),
    getAboutImageUrl(),
    getPresentations(),
  ]);
  return (
    <AdminDashboard
      products={products}
      aboutImageUrl={aboutImageUrl}
      presentations={presentations}
      dbConnected={isDbConfigured()}
    />
  );
}
