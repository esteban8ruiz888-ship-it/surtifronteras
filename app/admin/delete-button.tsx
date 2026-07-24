"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "./actions";

export function DeleteButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    if (!confirm(`¿Borrar "${name}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (res.ok) router.refresh();
      else setError(res.error ?? "No se pudo borrar.");
    });
  }

  return (
    <>
      <button
        onClick={onDelete}
        disabled={pending}
        className="cursor-pointer rounded-[10px] border border-warm-border px-3 py-2 text-[13px] font-semibold text-brand-red transition-colors hover:bg-brand-red hover:text-white disabled:opacity-50"
      >
        {pending ? "Borrando…" : "Borrar"}
      </button>
      {error && <span className="text-[12px] text-brand-red">{error}</span>}
    </>
  );
}
