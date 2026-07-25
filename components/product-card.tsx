import Image from "next/image";
import {
  AVAILABILITY_META,
  formatPrice,
  formatQty,
  hasPromo,
  presentationLabel,
  qtyHint,
  type Product,
} from "@/lib/store-data";
import { ImageSlot } from "./image-slot";

export function ProductCard({
  product,
  categoryLabel,
  categoryColor,
  qty,
  justAdded,
  onInc,
  onDec,
  onAdd,
}: {
  product: Product;
  categoryLabel: string;
  categoryColor: string;
  qty: number;
  justAdded: boolean;
  onInc: () => void;
  onDec: () => void;
  onAdd: () => void;
}) {
  const av = AVAILABILITY_META[product.availability];
  const addable = product.availability === "available";
  const pres = presentationLabel(product);
  const meta = [pres, product.flavor].filter(Boolean).join(" · ");
  const unitLabel = product.unit || "caja";
  // "caja de 24", pero "unidad" sola (sin "de N"); tampoco mostramos "de 0".
  const priceSuffix =
    unitLabel === "caja" && product.unitsPerBox != null && product.unitsPerBox > 0
      ? `${unitLabel} de ${product.unitsPerBox}`
      : unitLabel;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-[18px] border border-warm-border bg-white shadow-[0_6px_18px_rgba(10,42,120,0.06)] ${
        addable ? "" : "opacity-95"
      }`}
    >
      <div className="relative aspect-[4/3] w-full bg-slot">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1180px) 33vw, 280px"
            className="object-cover"
          />
        ) : (
          <ImageSlot label="Foto del producto" />
        )}
        {product.availability !== "available" && (
          <span
            className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-extrabold shadow-sm"
            style={{ color: av.color }}
          >
            {av.emoji} {av.label}
          </span>
        )}
        {hasPromo(product) && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-extrabold uppercase text-white shadow-sm">
            Promo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span
          className="w-fit self-start rounded-full px-[10px] py-1 text-[10.5px] font-extrabold uppercase tracking-[0.04em] text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryLabel}
        </span>
        {product.brand && (
          <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-gold">
            {product.brand}
          </span>
        )}
        <span className="text-[15.5px] font-bold leading-[1.25] text-ink">
          {product.name}
        </span>
        {meta && <span className="text-[12.5px] text-muted">{meta}</span>}
        <span className="font-heading mt-0.5 text-[19px] font-bold text-brand-red">
          {formatPrice(product.price)}
          <span className="ml-1 text-[11px] font-semibold text-muted">/ {priceSuffix}</span>
        </span>

        {addable ? (
          <>
            <div className="mt-1.5 flex items-center gap-[10px]">
              <button
                onClick={onDec}
                aria-label="Disminuir cantidad"
                className="h-[30px] w-[30px] cursor-pointer rounded-[8px] border border-stepper bg-cream text-[16px] font-bold text-navy"
              >
                –
              </button>
              <span className="min-w-5 text-center font-bold">{formatQty(qty)}</span>
              <button
                onClick={onInc}
                aria-label="Aumentar cantidad"
                className="h-[30px] w-[30px] cursor-pointer rounded-[8px] border border-stepper bg-cream text-[16px] font-bold text-navy"
              >
                +
              </button>
              {qtyHint(qty) && (
                <span className="text-[11px] italic text-muted">{qtyHint(qty)}</span>
              )}
            </div>
            <button
              onClick={onAdd}
              className={`mt-1.5 w-full cursor-pointer rounded-[12px] px-3 py-[11px] text-[13.5px] font-extrabold text-white transition-colors duration-200 ${
                justAdded ? "bg-added" : "bg-navy"
              }`}
            >
              {justAdded ? "¡Añadido! ✓" : "Añadir al carrito"}
            </button>
          </>
        ) : (
          <div
            className="mt-auto rounded-[12px] border border-warm-border bg-cream px-3 py-[11px] text-center text-[13px] font-extrabold"
            style={{ color: av.color }}
          >
            {av.emoji} {av.label}
          </div>
        )}
      </div>
    </div>
  );
}
