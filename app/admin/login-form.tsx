"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { loginAction, type LoginState } from "./actions";
import { ChangePasswordForm } from "./change-password-form";

export function LoginForm({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<"login" | "change">("login");
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm rounded-[20px] border border-warm-border bg-white p-7 shadow-[0_10px_30px_rgba(10,42,120,0.08)]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image
            src="/logo.png"
            alt="VENCOL"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <div>
            <h1 className="font-heading text-[22px] font-bold text-navy">
              {mode === "login" ? "Panel de administración" : "Cambiar contraseña"}
            </h1>
            <p className="text-[13px] text-muted">VENCOL</p>
          </div>
        </div>

        {!configured && (
          <p className="mb-4 rounded-[10px] border border-brand-yellow bg-[#FFF7DC] px-3 py-2 text-[12.5px] leading-relaxed text-[#7a5a00]">
            Faltan configurar <code>ADMIN_PASSWORD</code> y{" "}
            <code>SESSION_SECRET</code> en las variables de entorno.
          </p>
        )}

        {mode === "login" ? (
          <>
            <form action={action} className="flex flex-col gap-3">
              <label
                className="text-[13px] font-semibold text-ink"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-[12px] border border-stepper bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-navy"
              />
              {state?.error && (
                <p className="text-[13px] font-semibold text-brand-red">
                  {state.error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="mt-1 w-full cursor-pointer rounded-[12px] bg-navy px-4 py-3 text-[15px] font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Entrando…" : "Entrar"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setMode("change")}
              className="mt-4 w-full cursor-pointer text-center text-[13px] font-semibold text-navy underline underline-offset-2 hover:opacity-80"
            >
              Cambiar contraseña
            </button>
          </>
        ) : (
          <>
            <p className="mb-4 text-[12.5px] leading-relaxed text-muted">
              Poné tu contraseña actual y elegí una nueva. El cambio es inmediato.
            </p>
            <ChangePasswordForm />
            <button
              type="button"
              onClick={() => setMode("login")}
              className="mt-4 w-full cursor-pointer text-center text-[13px] font-semibold text-navy underline underline-offset-2 hover:opacity-80"
            >
              ← Volver a entrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
