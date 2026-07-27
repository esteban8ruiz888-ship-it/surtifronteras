"use client";

import { useEffect, useState } from "react";
import { ChangePasswordForm } from "./change-password-form";

export function AdminPasswordDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full border border-warm-border bg-white px-4 py-2 text-[13px] font-semibold text-navy hover:border-navy"
      >
        Cambiar contraseña
      </button>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-[rgba(10,20,50,0.45)] transition-opacity duration-[250ms] ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel deslizante */}
      <aside
        aria-label="Cambiar contraseña"
        className={`fixed right-0 top-0 z-[61] flex h-full w-[min(400px,92vw)] flex-col bg-white shadow-[-10px_0_30px_rgba(10,42,120,0.15)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-warm-border px-5 py-[18px]">
          <span className="font-heading text-[18px] font-bold text-navy">
            Cambiar contraseña
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="cursor-pointer text-[22px] leading-none text-navy"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-4 text-[12.5px] leading-relaxed text-muted">
            Poné la contraseña actual y elegí una nueva. El cambio es inmediato:
            la próxima vez que entres, usá la nueva.
          </p>
          <ChangePasswordForm />
        </div>
      </aside>
    </>
  );
}
