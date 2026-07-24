"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePresentationsAction } from "./actions";

export function PresentationsEditor({ initial }: { initial: string[] }) {
  const router = useRouter();
  const [list, setList] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function add() {
    const v = draft.trim();
    if (!v || list.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    setList([...list, v]);
    setDraft("");
    setSaved(false);
  }

  function remove(item: string) {
    setList(list.filter((x) => x !== item));
    setSaved(false);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await savePresentationsAction(list);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="mb-5 rounded-[14px] border border-warm-border bg-white p-4">
      <h2 className="font-heading mb-1 text-[16px] text-navy">Presentaciones</h2>
      <p className="mb-3 text-[12.5px] text-muted">
        Los tipos de envase que podés elegir al cargar un producto (Lata, Botella…).
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {list.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1.5 rounded-full border border-warm-border bg-cream px-3 py-1 text-[13px] font-semibold text-navy"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              aria-label={`Quitar ${item}`}
              className="cursor-pointer text-[15px] leading-none text-brand-red"
            >
              ×
            </button>
          </span>
        ))}
        {list.length === 0 && (
          <span className="text-[13px] text-muted">Sin presentaciones todavía.</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Nueva presentación…"
          className="min-w-0 flex-1 rounded-[10px] border border-stepper bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-navy"
        />
        <button
          type="button"
          onClick={add}
          className="cursor-pointer rounded-[10px] border border-warm-border px-3 py-2 text-[13px] font-semibold text-navy hover:border-navy"
        >
          Agregar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="cursor-pointer rounded-[10px] bg-navy px-4 py-2 text-[13px] font-extrabold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar lista"}
        </button>
        {saved && !pending && (
          <span className="text-[12.5px] font-semibold text-added">Guardado ✓</span>
        )}
      </div>
      {error && (
        <p className="mt-2 text-[12.5px] font-semibold text-brand-red">{error}</p>
      )}
    </div>
  );
}
