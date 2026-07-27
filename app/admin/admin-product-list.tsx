"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AVAILABILITY_META,
  CATEGORIES,
  CATEGORY_COLOR,
  effectiveUnit,
  formatPrice,
  matchesQuery,
  presentationLabel,
  productSearchText,
  type Product,
} from "@/lib/store-data";
import { DeleteButton } from "./delete-button";

function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function AdminProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  // Precalcula el texto buscable de cada producto (nombre, marca, sabor, etc.).
  const indexed = useMemo(
    () =>
      products.map((p) => ({
        p,
        text: productSearchText(p, categoryLabel(p.category)),
      })),
    [products],
  );

  const filtered = useMemo(
    () => indexed.filter(({ text }) => matchesQuery(text, query)).map(({ p }) => p),
    [indexed, query],
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-[18px] text-navy">
          Productos{" "}
          <span className="text-muted">
            ({filtered.length}
            {query.trim() ? ` de ${products.length}` : ""})
          </span>
        </h2>
        <Link
          href="/admin/nuevo"
          className="rounded-full bg-navy px-4 py-2.5 text-[13.5px] font-extrabold text-white no-underline hover:opacity-90"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, marca, sabor o categoría…"
          className="w-full rounded-[12px] border border-warm-border bg-white px-4 py-3 text-[14px] text-ink outline-none placeholder:text-muted focus:border-navy"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[14px] border border-warm-border bg-white px-4 py-10 text-center text-[14px] text-muted">
          No se encontraron productos para “{query}”.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((p) => (
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
                    {presentationLabel(p) || effectiveUnit(p)}
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
      )}
    </>
  );
}
