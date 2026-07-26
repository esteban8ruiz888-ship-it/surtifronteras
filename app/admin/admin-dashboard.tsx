import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/store-data";
import { logoutAction } from "./actions";
import { AboutImageEditor } from "./about-image-editor";
import { PresentationsEditor } from "./presentations-editor";
import { ChangePassword } from "./change-password";
import { AdminProductList } from "./admin-product-list";

export function AdminDashboard({
  products,
  aboutImageUrl,
  presentations,
  dbConnected,
}: {
  products: Product[];
  aboutImageUrl: string | null;
  presentations: string[];
  dbConnected: boolean;
}) {
  return (
    <div className="mx-auto max-w-[960px] px-5 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-surtifronteras.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="font-heading text-[22px] font-bold text-navy">
              Panel
            </h1>
            <p className="text-[12.5px] text-muted">Surtifronteras</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-warm-border bg-white px-4 py-2 text-[13px] font-semibold text-navy no-underline hover:border-navy"
          >
            Ver tienda
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="cursor-pointer rounded-full border border-warm-border bg-white px-4 py-2 text-[13px] font-semibold text-ink hover:border-navy"
            >
              Salir
            </button>
          </form>
        </div>
      </div>

      {!dbConnected && (
        <div className="mb-5 rounded-[14px] border border-brand-yellow bg-[#FFF7DC] px-4 py-3 text-[13.5px] leading-relaxed text-[#7a5a00]">
          <strong className="font-extrabold">
            Base de datos no conectada.
          </strong>{" "}
          Estás viendo el catálogo de ejemplo. Los cambios no se guardarán hasta
          que conectes Vercel Postgres y agregues las variables de entorno.
        </div>
      )}

      <AboutImageEditor imageUrl={aboutImageUrl} />
      <PresentationsEditor initial={presentations} />
      <ChangePassword />

      <AdminProductList products={products} />
    </div>
  );
}
