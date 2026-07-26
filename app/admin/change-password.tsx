import { ChangePasswordForm } from "./change-password-form";

export function ChangePassword() {
  return (
    <div className="mb-6 rounded-[16px] border border-warm-border bg-white p-5">
      <h2 className="font-heading mb-1 text-[16px] font-bold text-navy">
        Cambiar contraseña
      </h2>
      <p className="mb-4 text-[12.5px] leading-relaxed text-muted">
        Cambiá la contraseña de acceso al panel. El cambio es inmediato: la
        próxima vez que entres, usá la nueva.
      </p>
      <ChangePasswordForm />
    </div>
  );
}
