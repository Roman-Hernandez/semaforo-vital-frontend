"use client";

import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import {
  calcularRangoPagina,
  MAX_LONGITUD_Q,
  TAMANOS_PAGINA,
  type Page,
} from "@/layers/application/services/paginacion";

interface ControlesPaginacionProps<T> {
  readonly pagina: Page<T>;
  readonly etiquetaItems?: string;
  readonly cargando?: boolean;
  readonly onPageChange: (nuevaPagina: number) => void;
  readonly onPageSizeChange?: (nuevoTamano: number) => void;
  readonly ariaLabel?: string;
}

export function ControlesPaginacion<T>({
  pagina,
  etiquetaItems = "registros",
  cargando = false,
  onPageChange,
  onPageSizeChange,
  ariaLabel = "Paginación de registros",
}: ControlesPaginacionProps<T>) {
  const { desde, hasta, fueraDeRango } = calcularRangoPagina(pagina);

  return (
    <div className="flex flex-col gap-3 border-t border-[#EEF2F4] bg-[#FAFCFD] px-4 py-3.5 text-xs text-[#53636B] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p aria-live="polite">
          {pagina.total === 0 ? (
            <>Sin {etiquetaItems} (0 total)</>
          ) : fueraDeRango ? (
            <>
              Página {pagina.page} sin {etiquetaItems} (total: {pagina.total} ·{" "}
              {pagina.total_pages}{" "}
              {pagina.total_pages === 1 ? "página" : "páginas"})
            </>
          ) : (
            <>
              Mostrando{" "}
              <strong className="font-semibold text-[#164652]">
                {desde}–{hasta}
              </strong>{" "}
              de{" "}
              <strong className="font-semibold text-[#164652]">
                {pagina.total}
              </strong>{" "}
              {etiquetaItems}
              {pagina.total_pages > 0 && (
                <span className="text-[#718895]">
                  {" "}
                  · Página {pagina.page} de {pagina.total_pages}
                </span>
              )}
            </>
          )}
        </p>

        {fueraDeRango && pagina.total_pages >= 1 && (
          <button
            type="button"
            onClick={() => onPageChange(pagina.total_pages)}
            className="border border-[#008994] bg-white px-2.5 py-1 text-xs font-semibold text-[#008994] transition hover:bg-[#E6F9FA]"
          >
            Ir a la página {pagina.total_pages}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <label className="inline-flex items-center gap-1.5 text-xs text-[#53636B]">
            <span>Filas por página</span>
            <select
              aria-label="Filas por página"
              value={pagina.page_size}
              disabled={cargando}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 border border-[#DCE6EA] bg-white px-2 text-xs font-semibold text-[#164652] outline-none focus:border-[#008994] disabled:opacity-50"
            >
              {TAMANOS_PAGINA.map((tam) => (
                <option key={tam} value={tam}>
                  {tam}
                </option>
              ))}
            </select>
          </label>
        )}

        <nav aria-label={ariaLabel} className="inline-flex items-center gap-1">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={!pagina.has_previous || cargando}
            onClick={() => onPageChange(Math.max(1, pagina.page - 1))}
            className="inline-flex h-8 items-center gap-1 border border-[#DCE6EA] bg-white px-2.5 text-xs font-semibold text-[#164652] transition hover:bg-[#E6F9FA] hover:text-[#008994] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            <span>Anterior</span>
          </button>

          <span className="px-2 text-xs font-semibold text-[#164652]">
            {pagina.total_pages === 0
              ? "0 / 0"
              : `${pagina.page} / ${pagina.total_pages}`}
          </span>

          <button
            type="button"
            aria-label="Página siguiente"
            disabled={!pagina.has_next || cargando}
            onClick={() => onPageChange(pagina.page + 1)}
            className="inline-flex h-8 items-center gap-1 border border-[#DCE6EA] bg-white px-2.5 text-xs font-semibold text-[#164652] transition hover:bg-[#E6F9FA] hover:text-[#008994] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Siguiente</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
}

interface BarraFiltrosServidorProps {
  readonly q?: string;
  readonly onQChange?: (valor: string) => void;
  readonly placeholderQ?: string;
  readonly ariaLabelQ?: string;
  readonly mostrarQ?: boolean;
  readonly desde: string;
  readonly hasta: string;
  readonly onDesdeChange: (valor: string) => void;
  readonly onHastaChange: (valor: string) => void;
  readonly onLimpiar: () => void;
  readonly children?: React.ReactNode;
}

export function BarraFiltrosServidor({
  q = "",
  onQChange,
  placeholderQ = "Buscar…",
  ariaLabelQ = "Buscar registros",
  mostrarQ = true,
  desde,
  hasta,
  onDesdeChange,
  onHastaChange,
  onLimpiar,
  children,
}: BarraFiltrosServidorProps) {
  const hayFiltrosActivos =
    (mostrarQ && q.trim().length > 0) ||
    desde.trim().length > 0 ||
    hasta.trim().length > 0;

  const rangoInvalido = Boolean(desde && hasta && desde > hasta);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2.5">
        {mostrarQ && onQChange && (
          <label className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <span className="mb-1 block text-[11px] font-semibold text-[#53636B]">
              Búsqueda
            </span>
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2.5 left-3 text-[#718895]"
            />
            <input
              type="search"
              aria-label={ariaLabelQ}
              maxLength={MAX_LONGITUD_Q}
              value={q}
              onChange={(e) => onQChange(e.target.value)}
              placeholder={placeholderQ}
              className="h-9 w-full border border-[#DCE6EA] bg-white pr-3 pl-8 text-xs text-[#164652] outline-none transition focus:border-[#008994]"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-[#53636B]">
            Desde
          </span>
          <input
            type="date"
            aria-label="Filtrar desde fecha"
            max={hasta || undefined}
            value={desde}
            onChange={(e) => onDesdeChange(e.target.value)}
            className="h-9 border border-[#DCE6EA] bg-white px-2.5 text-xs text-[#164652] outline-none focus:border-[#008994]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-[#53636B]">
            Hasta
          </span>
          <input
            type="date"
            aria-label="Filtrar hasta fecha"
            min={desde || undefined}
            value={hasta}
            onChange={(e) => onHastaChange(e.target.value)}
            className="h-9 border border-[#DCE6EA] bg-white px-2.5 text-xs text-[#164652] outline-none focus:border-[#008994]"
          />
        </label>

        {children}

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={onLimpiar}
            className="inline-flex h-9 items-center gap-1.5 border border-[#DCE6EA] bg-white px-3 text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {rangoInvalido && (
        <p role="alert" className="text-xs font-medium text-[#C53030]">
          La fecha inicial (desde) no puede ser posterior a la fecha final (hasta).
        </p>
      )}
    </div>
  );
}
