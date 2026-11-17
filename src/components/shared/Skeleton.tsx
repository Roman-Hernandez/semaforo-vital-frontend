export function SkeletonBloque({
  filas = 3,
  etiqueta = "Cargando contenido…",
}: {
  readonly filas?: number;
  readonly etiqueta?: string;
}) {
  return (
    <output
      aria-live="polite"
      className="block space-y-4 bg-white p-6"
    >
      <span className="sr-only">{etiqueta}</span>
      <div className="h-5 w-48 animate-pulse rounded-sm bg-[#E2ECEE]" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: filas }, (_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 border-b border-[#EEF3F4] pb-3 last:border-none"
          >
            <div className="h-4 w-2/5 animate-pulse rounded-sm bg-[#EAF1F3]" />
            <div className="h-4 w-1/4 animate-pulse rounded-sm bg-[#EAF1F3]" />
            <div className="h-4 w-16 animate-pulse rounded-sm bg-[#E2ECEE]" />
          </div>
        ))}
      </div>
    </output>
  );
}

export function SkeletonTarjetasAlbergues({
  cantidad = 6,
  etiqueta = "Cargando albergues habilitados…",
}: {
  readonly cantidad?: number;
  readonly etiqueta?: string;
}) {
  return (
    <output aria-live="polite" className="block">
      <span className="sr-only">{etiqueta}</span>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cantidad }, (_, idx) => (
          <div
            key={idx}
            className="space-y-4 border-t-2 border-[#047270]/30 bg-white p-6 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="h-5 w-44 animate-pulse rounded-sm bg-[#E2ECEE]" />
                <div className="h-3.5 w-28 animate-pulse rounded-sm bg-[#EAF1F3]" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-sm bg-[#E2ECEE]" />
            </div>
            <div className="h-3.5 w-3/4 animate-pulse rounded-sm bg-[#EAF1F3]" />
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <div className="h-3 w-20 animate-pulse rounded-sm bg-[#EAF1F3]" />
                <div className="h-3 w-16 animate-pulse rounded-sm bg-[#E2ECEE]" />
              </div>
              <div className="h-2 w-full animate-pulse bg-[#EAF1F3]" />
            </div>
          </div>
        ))}
      </div>
    </output>
  );
}

export function SkeletonMetricas({
  columnas = 4,
  etiqueta = "Cargando indicadores…",
}: {
  readonly columnas?: number;
  readonly etiqueta?: string;
}) {
  return (
    <output aria-live="polite" className="block">
      <span className="sr-only">{etiqueta}</span>
      <div
        className={`grid gap-6 bg-white p-6 sm:grid-cols-2 lg:grid-cols-${columnas}`}
      >
        {Array.from({ length: columnas }, (_, idx) => (
          <div key={idx} className="space-y-2 border-l-2 border-[#DCE6EA] pl-4">
            <div className="h-3.5 w-28 animate-pulse rounded-sm bg-[#EAF1F3]" />
            <div className="h-7 w-16 animate-pulse rounded-sm bg-[#E2ECEE]" />
          </div>
        ))}
      </div>
    </output>
  );
}
