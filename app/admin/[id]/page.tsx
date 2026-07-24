import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getPresentations, getProduct } from "@/lib/db";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();
  const [product, presentations] = await Promise.all([
    getProduct(numId),
    getPresentations(),
  ]);
  if (!product) notFound();
  return <ProductForm product={product} presentations={presentations} />;
}
