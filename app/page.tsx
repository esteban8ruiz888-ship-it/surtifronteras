import { Storefront } from "@/components/storefront";
import { getAboutImageUrl, getProducts } from "@/lib/db";

// Lee el catálogo en cada request para reflejar los cambios del panel al instante.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, aboutImageUrl] = await Promise.all([
    getProducts(),
    getAboutImageUrl(),
  ]);
  return <Storefront products={products} aboutImageUrl={aboutImageUrl} />;
}
