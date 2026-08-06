import Image from "next/image";
import { CartIcon } from "./icons";

export function SiteHeader({
  cartCount,
  onToggleCart,
}: {
  cartCount: number;
  onToggleCart: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-warm-border bg-white px-4 py-[14px] shadow-[0_2px_10px_rgba(10,42,120,0.05)] sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Image
          src="/logo.png"
          alt="VENCOL"
          width={46}
          height={46}
          priority
          className="h-10 w-10 shrink-0 object-contain sm:h-[46px] sm:w-[46px]"
        />
        <div className="flex min-w-0 flex-col leading-[1.05]">
          <span className="font-heading truncate text-[18px] font-bold text-navy sm:text-[20px]">
            VENCOL
          </span>
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-gold">
            Sabor de casa
          </span>
        </div>
      </div>
      <button
        onClick={onToggleCart}
        aria-label="Abrir carrito"
        className="relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-navy px-3 py-[10px] text-[14px] font-bold text-white transition-opacity hover:opacity-90 sm:gap-2 sm:px-[18px]"
      >
        <CartIcon className="h-5 w-5" />
        <span className="hidden min-[360px]:inline">Carrito</span>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow px-1.5 text-[12px] font-extrabold text-navy">
          {cartCount}
        </span>
      </button>
    </header>
  );
}
