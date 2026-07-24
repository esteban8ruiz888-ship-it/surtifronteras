import { requireAuth } from "@/lib/auth";
import { getPresentations } from "@/lib/db";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  await requireAuth();
  const presentations = await getPresentations();
  return <ProductForm presentations={presentations} />;
}
