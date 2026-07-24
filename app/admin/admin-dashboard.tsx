import Image from "next/image";
import Link from "next/link";
import {
  AVAILABILITY_META,
  CATEGORIES,
  CATEGORY_COLOR,
  formatPrice,
  presentationLabel,
  type Product,
} from "@/lib/store-data";
import { logoutAction } from "./actions";
import { DeleteButton } from "./delete-button";
import { AboutImageEditor } from "./about-image-editor";
import { PresentationsEditor } from "./presentations-editor";

function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

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

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-[18px] text-navy">
          Productos <span className="text-muted">({products.length})</span>
        </h2>
        <Link
          href="/admin/nuevo"
          className="rounded-full bg-navy px-4 py-2.5 text-[13.5px] font-extrabold text-white no-underline hover:opacity-90"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="flex flex-col gap-2.5">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-3 rounded-[14px] border border-warm-border bg-white p-3"
          >
            <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:flex-1">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-slot">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold uppercase text-muted">
                    Sin foto
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase text-white"
                    style={{ backgroundColor: CATEGORY_COLOR[p.category] }}
                  >
                    {categoryLabel(p.category)}
                  </span>
                  <span
                    className="text-[10.5px] font-bold"
                    style={{ color: AVAILABILITY_META[p.availability].color }}
                    title={AVAILABILITY_META[p.availability].label}
                  >
                    {AVAILABILITY_META[p.availability].emoji}
                  </span>
                  {p.featured && (
                    <span className="text-[10px] font-bold text-gold">★ Destacado</span>
                  )}
                  {p.isNew && (
                    <span className="text-[10px] font-bold text-brand-red">Novedad</span>
                  )}
                </div>
                <div className="mt-1 truncate text-[15px] font-bold text-ink">
                  {p.brand ? `${p.brand} · ` : ""}
                  {p.name}
                </div>
                <div className="truncate text-[12.5px] text-muted">
                  {presentationLabel(p) || p.unit}
                  {p.flavor ? ` · ${p.flavor}` : ""}
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
              <div className="font-heading text-[17px] font-bold text-brand-red">
                {formatPrice(p.price)}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/${p.id}`}
                  className="rounded-[10px] border border-warm-border px-3 py-2 text-[13px] font-semibold text-navy no-underline hover:border-navy"
                >
                  Editar
                </Link>
                <DeleteButton id={p.id} name={p.name} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
