/**
 * Placeholder para las fotos de producto / equipo.
 * El diseño original usaba <image-slot> del runtime de Claude Design;
 * acá lo reemplazamos por un placeholder estático. Cuando tengas las fotos,
 * cambiá esto por <Image> de next/image.
 */
export function ImageSlot({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-slot text-muted ${className ?? ""}`}
    >
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="opacity-60"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className="px-3 text-center text-[11px] font-semibold uppercase tracking-[0.05em]">
        {label}
      </span>
    </div>
  );
}
