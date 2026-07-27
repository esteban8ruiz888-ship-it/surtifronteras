"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { AVAILABILITY_META, CATEGORIES, type Product } from "@/lib/store-data";
import { saveProduct } from "./actions";

const inputCls =
  "w-full rounded-[12px] border border-stepper bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-navy";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-ink";

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

function resolveContentType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return (ext && EXTENSION_CONTENT_TYPE[ext]) || "application/octet-stream";
}

function numOrNull(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function ProductForm({
  product,
  presentations,
}: {
  product?: Product;
  presentations: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState<string>(
    product?.category ?? CATEGORIES[0].id,
  );
  const [presentation, setPresentation] = useState(product?.presentation ?? "");
  const [flavor, setFlavor] = useState(product?.flavor ?? "");
  const [grams, setGrams] = useState(
    product?.grams != null ? String(product.grams) : "",
  );
  const [milliliters, setMilliliters] = useState(
    product?.milliliters != null ? String(product.milliliters) : "",
  );
  const [unitsPerBox, setUnitsPerBox] = useState(
    product?.unitsPerBox != null ? String(product.unitsPerBox) : "",
  );
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [allowHalfBox, setAllowHalfBox] = useState(
    product?.allowHalfBox ?? true,
  );
  const [soldByWeight, setSoldByWeight] = useState(
    product?.soldByWeight ?? false,
  );
  const [availability, setAvailability] = useState<string>(
    product?.availability ?? "available",
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [promoThreshold, setPromoThreshold] = useState(
    product?.promoThreshold != null ? String(product.promoThreshold) : "",
  );
  const [promoDiscount, setPromoDiscount] = useState(
    product?.promoDiscount != null ? String(product.promoDiscount) : "",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.imageUrl ?? null,
  );

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: resolveContentType(file),
      });
      setImageUrl(blob.url);
    } catch (err) {
      setError("No se pudo subir la imagen: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = Number(price);
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Poné un precio válido.");
      return;
    }

    startTransition(async () => {
      const res = await saveProduct({
        id: product?.id,
        name,
        brand,
        category,
        presentation,
        flavor,
        grams: numOrNull(grams),
        milliliters: numOrNull(milliliters),
        unitsPerBox: numOrNull(unitsPerBox),
        price: priceNum,
        unit: product?.unit ?? "",
        allowHalfBox,
        soldByWeight,
        availability,
        featured,
        isNew,
        promoThreshold: numOrNull(promoThreshold),
        promoDiscount: numOrNull(promoDiscount),
        imageUrl,
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-[620px] px-5 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-[22px] font-bold text-navy">
          {product ? "Editar producto" : "Nuevo producto"}
        </h1>
        <Link
          href="/admin"
          className="text-[13px] font-semibold text-muted no-underline hover:text-navy"
        >
          ← Volver
        </Link>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Foto */}
        <div>
          <span className={labelCls}>Foto de esta presentación</span>
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[12px] border border-warm-border bg-slot">
              {imageUrl ? (
                <Image src={imageUrl} alt="" fill sizes="96px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-semibold uppercase text-muted">
                  Sin foto
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={uploading}
                className="w-full max-w-full text-[13px] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-[12.5px] file:font-bold file:text-white"
              />
              {uploading && <span className="text-[12.5px] text-muted">Subiendo…</span>}
              {!uploading && !imageUrl && (
                <span className="text-[11.5px] text-muted">
                  JPG, PNG, WEBP o HEIC — máx. 20MB. Usá una foto real de esta presentación.
                </span>
              )}
              {imageUrl && !uploading && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="w-fit cursor-pointer text-[12px] text-brand-red underline"
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="name">Nombre completo</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="brand">Marca</label>
            <input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Mavesa, Diablitos…" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="category">Categoría</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="presentation">Presentación</label>
            <select id="presentation" value={presentation} onChange={(e) => setPresentation(e.target.value)} className={inputCls}>
              <option value="">— Sin especificar —</option>
              {presentations.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="flavor">Sabor (opcional)</label>
            <input id="flavor" value={flavor} onChange={(e) => setFlavor(e.target.value)} placeholder="Original, uva…" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="grams">Gramos</label>
            <input id="grams" type="number" min="0" step="1" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="54" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="ml">Mililitros</label>
            <input id="ml" type="number" min="0" step="1" value={milliliters} onChange={(e) => setMilliliters(e.target.value)} placeholder="350" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="upb">Unidades por caja</label>
            <input id="upb" type="number" min="0" step="1" value={unitsPerBox} onChange={(e) => setUnitsPerBox(e.target.value)} placeholder="24" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="price">
              Precio {soldByWeight ? "por kilo" : "por caja/bulto"} (COP)
            </label>
            <input id="price" type="number" step="1" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="45000" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls} htmlFor="availability">Disponibilidad</label>
            <select id="availability" value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputCls}>
              {Object.entries(AVAILABILITY_META).map(([key, meta]) => (
                <option key={key} value={key}>{meta.emoji} {meta.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reglas de venta */}
        <div className="rounded-[12px] border border-warm-border bg-cream-soft p-4">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" checked={soldByWeight} onChange={(e) => setSoldByWeight(e.target.checked)} className="mt-1 h-4 w-4 accent-navy" />
            <span className="text-[13.5px] text-ink">
              Se vende <strong>por kilo</strong> (a granel)
              <span className="mt-0.5 block text-[12px] text-muted">
                La cantidad se pide en kg (admite fracciones, ej. 1.5 kg) y el precio de arriba se entiende por kilo.
              </span>
            </span>
          </label>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" checked={allowHalfBox} onChange={(e) => setAllowHalfBox(e.target.checked)} disabled={soldByWeight} className="mt-1 h-4 w-4 accent-navy disabled:opacity-50" />
            <span className="text-[13.5px] text-ink">
              Permitir <strong>media caja/bulto</strong>
              <span className="mt-0.5 block text-[12px] text-muted">
                Confitería y cantidades por caja impares se venden solo completas, aunque esto esté tildado. No aplica si se vende por kilo (siempre admite fracciones).
              </span>
            </span>
          </label>
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-navy" />
              Producto destacado
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="h-4 w-4 accent-navy" />
              Marcar como novedad
            </label>
          </div>
        </div>

        {/* Promoción */}
        <div className="rounded-[12px] border border-warm-border bg-cream-soft p-4">
          <span className="mb-2 block text-[13px] font-semibold text-ink">
            Promoción por volumen (opcional)
          </span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] text-muted" htmlFor="pt">Si compran más de… (cajas)</label>
              <input id="pt" type="number" min="0" step="1" value={promoThreshold} onChange={(e) => setPromoThreshold(e.target.value)} placeholder="10" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-muted" htmlFor="pd">Descuento (COP)</label>
              <input id="pd" type="number" min="0" step="1" value={promoDiscount} onChange={(e) => setPromoDiscount(e.target.value)} placeholder="2000" className={inputCls} />
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-[10px] bg-[#FDECEC] px-3 py-2 text-[13px] font-semibold text-brand-red">
            {error}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending || uploading}
            className="cursor-pointer rounded-[12px] bg-navy px-6 py-3 text-[14.5px] font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
          <Link href="/admin" className="text-[13.5px] font-semibold text-muted no-underline hover:text-navy">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
