"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const inputCls =
  "w-full rounded-[12px] border border-stepper bg-cream px-4 py-3 text-[15px] text-ink outline-none focus:border-navy";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ChangePasswordState, FormData>(
    changePasswordAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Al cambiar con éxito, limpia los campos.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-ink" htmlFor="current">
          Contraseña actual
        </label>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-ink" htmlFor="next">
          Nueva contraseña
        </label>
        <input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className={inputCls}
        />
        <span className="text-[11.5px] text-muted">Mínimo 6 caracteres.</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-ink" htmlFor="confirm">
          Repetir nueva contraseña
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className={inputCls}
        />
      </div>

      {state.error && (
        <p className="text-[13px] font-semibold text-brand-red">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-[13px] font-semibold text-added">
          ✓ Contraseña actualizada. Ya podés entrar con la nueva.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full cursor-pointer rounded-[12px] bg-navy px-5 py-3 text-[14px] font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
