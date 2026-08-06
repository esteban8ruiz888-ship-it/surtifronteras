import Image from "next/image";
import { ImageSlot } from "./image-slot";

export function AboutSection({ imageUrl }: { imageUrl: string | null }) {
  return (
    <section className="border-y border-warm-border bg-cream-soft px-6 py-[60px]">
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-[46px] md:grid-cols-2">
        <div>
          <span className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-brand-red">
            Sobre nosotros
          </span>
          <h2 className="font-heading mb-4 mt-[10px] text-[30px] text-navy">
            Una maleta llena de sabores, para que nada te quede lejos
          </h2>
          <p className="mb-[14px] text-[15.5px] leading-[1.7] text-[#3b3628]">
            Empezamos como muchas familias venezolanas: trayendo en la maleta lo
            que no se conseguía lejos de casa. Hoy seguimos escogiendo cada
            producto con la misma dedicación, para que cada pedido llegue con el
            mismo sabor de siempre.
          </p>
          <p className="text-[15.5px] leading-[1.7] text-[#3b3628]">
            Trabajamos directo con proveedores de confianza para garantizar
            productos frescos y auténticos, del tipo que solo se consigue en
            casa.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="VENCOL"
              fill
              sizes="(max-width: 768px) 100vw, 540px"
              className="object-cover"
            />
          ) : (
            <ImageSlot label="Foto del equipo o del local" />
          )}
        </div>
      </div>
    </section>
  );
}
