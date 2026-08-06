import Image from "next/image";
import { WHATSAPP_DESTINATIONS } from "@/lib/store-data";

export function SiteFooter() {
  return (
    <footer className="bg-navy px-6 pb-[30px] pt-[46px] text-[#eaeffb]">
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-[10px] flex items-center gap-[10px]">
            <Image
              src="/logo.png"
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] object-contain"
            />
            <span className="font-heading text-[17px] font-bold text-white">
              VENCOL
            </span>
          </div>
          <p className="text-[13.5px] leading-[1.6] text-[#c3cce8]">
            Productos venezolanos que saben a casa.
          </p>
        </div>
        <div>
          <h3 className="mb-[10px] text-[13px] uppercase tracking-[0.06em] text-brand-yellow">
            Contacto
          </h3>
          <p className="text-[13.5px] leading-[1.9] text-[#eaeffb]">
            {WHATSAPP_DESTINATIONS.map((dest) => (
              <span key={dest.id}>
                WhatsApp {dest.flag} {dest.label}: {dest.displayNumber}
                <br />
              </span>
            ))}
            <a
              href="mailto:surtifronterasdelavilla@gmail.com"
              className="text-[#eaeffb] no-underline hover:text-brand-yellow"
            >
              surtifronterasdelavilla@gmail.com
            </a>
          </p>
        </div>
        <div>
          <h3 className="mb-[10px] text-[13px] uppercase tracking-[0.06em] text-brand-yellow">
            Horario
          </h3>
          <p className="text-[13.5px] leading-[1.9] text-[#eaeffb]">
            Lun–Vie: 9:00am–6:00pm
            <br />
            Sáb: 9:00am–2:00pm
          </p>
        </div>
        <div>
          <h3 className="mb-[10px] text-[13px] uppercase tracking-[0.06em] text-brand-yellow">
            Síguenos
          </h3>
          <div className="flex gap-[10px]">
            <a
              href="https://www.instagram.com/surtifronteras_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/12 text-white! no-underline hover:bg-white/20"
            >
              IG
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/12 text-white! no-underline hover:bg-white/20"
            >
              FB
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-7 max-w-[1080px] border-t border-white/15 pt-[18px] text-[12.5px] text-[#9facd6]">
        © 2026 VENCOL. Pedidos coordinados por WhatsApp.
      </div>
    </footer>
  );
}
