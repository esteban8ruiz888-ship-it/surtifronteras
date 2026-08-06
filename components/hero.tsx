import Image from "next/image";

export function Hero({ onScrollToCatalog }: { onScrollToCatalog: () => void }) {
  return (
    <section className="relative overflow-hidden bg-navy px-5 pb-16 pt-12 text-center sm:px-6 sm:pb-[84px] sm:pt-16">
      <Image
        src="/logo.png"
        alt=""
        width={280}
        height={280}
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-[280px] w-[280px] object-contain opacity-[0.12]"
      />
      <div className="relative mx-auto max-w-[640px]">
        <span className="mb-[18px] inline-block rounded-full bg-brand-yellow px-[14px] py-1.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-navy">
          Productos venezolanos
        </span>
        <h1 className="font-heading mb-[14px] text-[30px] font-extrabold leading-[1.1] text-white sm:text-[38px] sm:leading-[1.08] md:text-[44px]">
          El sabor de Venezuela, a un mensaje de distancia
        </h1>
        <p className="mb-7 text-[16px] leading-[1.5] text-[#e7ecfb] sm:mb-[30px] sm:text-[17px]">
          Víveres, confitería, licores y todo lo que sabe a casa — arma tu pedido y
          lo coordinamos contigo por WhatsApp.
        </p>
        <button
          onClick={onScrollToCatalog}
          className="cursor-pointer rounded-full bg-brand-red px-8 py-[15px] text-[16px] font-extrabold text-white shadow-[0_10px_24px_rgba(204,24,48,0.35)] transition-transform hover:-translate-y-0.5"
        >
          Ver productos
        </button>
      </div>
    </section>
  );
}
