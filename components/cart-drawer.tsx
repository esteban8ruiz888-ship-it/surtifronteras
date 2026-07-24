import { formatPrice, formatQty, qtyHint, WHATSAPP_DESTINATIONS, type CartLine } from "@/lib/store-data";
import { WhatsappIcon } from "./icons";

export function CartDrawer({
  open,
  lines,
  total,
  discountTotal,
  onClose,
  onIncLine,
  onDecLine,
  onRemoveLine,
  onWhatsAppSelect,
}: {
  open: boolean;
  lines: CartLine[];
  total: number;
  discountTotal: number;
  onClose: () => void;
  onIncLine: (id: number) => void;
  onDecLine: (id: number) => void;
  onRemoveLine: (id: number) => void;
  onWhatsAppSelect: (destinationNumber: string) => void;
}) {
  const isEmpty = lines.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-[rgba(10,20,50,0.45)] transition-opacity duration-[250ms] ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 z-[61] flex h-full w-[min(380px,92vw)] flex-col bg-white shadow-[-10px_0_30px_rgba(10,42,120,0.15)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-warm-border px-5 py-[18px]">
          <span className="font-heading text-[18px] font-bold text-navy">
            Tu carrito
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="cursor-pointer text-[22px] leading-none text-navy"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-5 py-[14px]">
          {isEmpty && (
            <p className="mt-[30px] text-center text-[14px] text-[#9c927a]">
              Tu carrito está vacío.
            </p>
          )}
          {lines.map((line) => (
            <div
              key={line.id}
              className="flex items-center gap-3 border-b border-line py-3"
            >
              <div className="flex-1">
                <div className="text-[14.5px] font-bold text-ink">
                  {line.brand ? `${line.brand} ` : ""}
                  {line.name}
                </div>
                <div className="text-[12.5px] text-muted">
                  {formatPrice(line.price)}
                  {line.presentationLabel ? ` · ${line.presentationLabel}` : ""}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    onClick={() => onDecLine(line.id)}
                    aria-label="Disminuir cantidad"
                    className="h-6 w-6 cursor-pointer rounded-[6px] border border-stepper bg-cream font-bold text-navy"
                  >
                    –
                  </button>
                  <span className="min-w-4 text-center text-[13px] font-bold">
                    {formatQty(line.qty)}
                  </span>
                  <button
                    onClick={() => onIncLine(line.id)}
                    aria-label="Aumentar cantidad"
                    className="h-6 w-6 cursor-pointer rounded-[6px] border border-stepper bg-cream font-bold text-navy"
                  >
                    +
                  </button>
                  {qtyHint(line.qty) && (
                    <span className="text-[11px] italic text-muted">
                      {qtyHint(line.qty)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {line.discount > 0 && (
                  <span className="text-[11px] text-muted line-through">
                    {formatPrice(line.subtotal)}
                  </span>
                )}
                <span className="text-[14.5px] font-bold text-brand-red">
                  {formatPrice(line.total)}
                </span>
                {line.discount > 0 && (
                  <span className="rounded-full bg-[#E9F7EE] px-1.5 py-0.5 text-[10px] font-bold text-added">
                    promo -{formatPrice(line.discount)}
                  </span>
                )}
                <button
                  onClick={() => onRemoveLine(line.id)}
                  className="cursor-pointer text-[12px] text-[#b0a88f] underline"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-warm-border px-5 pb-[22px] pt-4">
          {discountTotal > 0 && (
            <div className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-added">
              <span>Descuento por promociones</span>
              <span>-{formatPrice(discountTotal)}</span>
            </div>
          )}
          <div className="mb-[14px] flex items-center justify-between">
            <span className="font-bold text-ink">Total</span>
            <span className="font-heading text-[22px] font-extrabold text-navy">
              {formatPrice(total)}
            </span>
          </div>
          <p className="mb-2 text-center text-[12px] font-semibold text-muted">
            Elegí a dónde enviar tu pedido
          </p>
          <div className="flex flex-col gap-2">
            {WHATSAPP_DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                onClick={() => onWhatsAppSelect(dest.number)}
                disabled={isEmpty}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-whatsapp p-[13px] text-[14.5px] font-extrabold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <WhatsappIcon className="h-5 w-5 shrink-0" />
                <span>
                  Pedir por WhatsApp · {dest.flag} {dest.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
