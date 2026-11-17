"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ellipsis,
  Eye,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  ServerCrash,
  Tent,
} from "lucide-react";
import type { Albergue } from "@/layers/domain/albergues/albergue";
import type { Page } from "@/layers/application/services/paginacion";
import { ControlesPaginacion } from "@/components/shared/ControlesPaginacion";
import { EstadoBadge, RiesgoBadge } from "./insignias";

export type FiltroEstado = "todos" | "activos" | "inactivos";

export interface FiltrosAlbergues {
  busqueda: string;
  estado: FiltroEstado;
  desde: string;
  hasta: string;
}

export const FILTROS_INICIALES: FiltrosAlbergues = {
  busqueda: "",
  estado: "todos",
  desde: "",
  hasta: "",
};

export type EstadoCarga = "cargando" | "listo" | "error";

interface AlberguesListaProps {
  readonly estadoCarga: EstadoCarga;
  readonly mensajeError: string;
  readonly totalRegistrados: number;
  readonly totalActivos: number;
  readonly pagina: Page<Albergue>;
  readonly filtros: FiltrosAlbergues;
  readonly seleccionadoId: string | null;
  readonly puedeAdministrar: boolean;
  readonly onFiltrosChange: (filtros: FiltrosAlbergues) => void;
  readonly onPaginaChange: (pagina: number) => void;
  readonly onPageSizeChange: (pageSize: number) => void;
  readonly onConsultar: (albergue: Albergue) => void;
  readonly onEditar: (albergue: Albergue) => void;
  readonly onCambiarEstado: (albergue: Albergue) => void;
  readonly onReintentar: () => void;
  readonly onRegistrar: () => void;
}

const CONTROL =
  "h-9 border border-[#DCE6EA] bg-white px-3 text-xs text-[#164652] outline-none transition focus:border-[#008994]";

function IconoAlbergue() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#E6F9FA] text-[#008994]">
      <Tent size={18} aria-hidden="true" />
    </span>
  );
}

function MenuEstado({
  albergue,
  onCambiarEstado,
}: {
  readonly albergue: Albergue;
  readonly onCambiarEstado: (albergue: Albergue) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    function cerrar(evento: MouseEvent | KeyboardEvent) {
      if (evento instanceof KeyboardEvent && evento.key !== "Escape") return;
      if (
        evento instanceof MouseEvent &&
        contenedor.current?.contains(evento.target as Node)
      ) {
        return;
      }
      setAbierto(false);
    }

    document.addEventListener("mousedown", cerrar);
    document.addEventListener("keydown", cerrar);

    return () => {
      document.removeEventListener("mousedown", cerrar);
      document.removeEventListener("keydown", cerrar);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-label={`Más acciones para ${albergue.nombre}`}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((valor) => !valor)}
        className="p-1.5 text-[#53636B] transition hover:bg-[#F3F8FA]"
      >
        <Ellipsis size={16} aria-hidden="true" />
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 w-40 border border-[#DCE6EA] bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false);
              onCambiarEstado(albergue);
            }}
            className={`w-full px-3 py-2 text-left text-xs font-semibold transition hover:bg-[#F3F8FA] ${
              albergue.activo ? "text-[#C53030]" : "text-[#008994]"
            }`}
          >
            {albergue.activo ? "Desactivar" : "Reactivar"}
          </button>
        </div>
      )}
    </div>
  );
}

function FilasCargando() {
  return (
    <div aria-hidden="true" className="divide-y divide-[#EEF2F4]">
      {[1, 2, 3, 4, 5].map((fila) => (
        <div
          key={fila}
          className="flex animate-pulse items-center gap-4 px-4 py-4"
        >
          <div className="h-9 w-9 bg-[#EEF2F4]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 bg-[#EEF2F4]" />
            <div className="h-2.5 w-1/5 bg-[#EEF2F4]" />
          </div>
          <div className="hidden h-3 w-24 bg-[#EEF2F4] sm:block" />
          <div className="h-6 w-16 bg-[#EEF2F4]" />
        </div>
      ))}
    </div>
  );
}

function EstadoVacio({
  hayFiltros,
  puedeAdministrar,
  onLimpiar,
  onRegistrar,
}: {
  readonly hayFiltros: boolean;
  readonly puedeAdministrar: boolean;
  readonly onLimpiar: () => void;
  readonly onRegistrar: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F9FA] text-[#008994]">
        {hayFiltros ? (
          <Search size={22} aria-hidden="true" />
        ) : (
          <Tent size={22} aria-hidden="true" />
        )}
      </span>

      <p className="mt-4 text-sm font-semibold text-[#164652]">
        {hayFiltros
          ? "No se encontraron albergues con los filtros aplicados"
          : "Aún no hay albergues registrados"}
      </p>

      <p className="mt-1 max-w-sm text-xs text-[#53636B]">
        {hayFiltros
          ? "Prueba con otro nombre, código, municipio, departamento o rango de fechas."
          : "Registra el primer centro habilitado para empezar su seguimiento."}
      </p>

      {hayFiltros && (
        <button
          type="button"
          onClick={onLimpiar}
          className="mt-4 border border-[#DCE6EA] px-4 py-2 text-xs font-semibold text-[#164652] transition hover:bg-[#F8FAFB]"
        >
          Limpiar filtros
        </button>
      )}

      {!hayFiltros && puedeAdministrar && (
        <button
          type="button"
          onClick={onRegistrar}
          className="mt-4 bg-[#008994] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00747E]"
        >
          Registrar albergue
        </button>
      )}
    </div>
  );
}

export function AlberguesLista({
  estadoCarga,
  mensajeError,
  totalRegistrados,
  totalActivos,
  pagina,
  filtros,
  seleccionadoId,
  puedeAdministrar,
  onFiltrosChange,
  onPaginaChange,
  onPageSizeChange,
  onConsultar,
  onEditar,
  onCambiarEstado,
  onReintentar,
  onRegistrar,
}: AlberguesListaProps) {
  const albergues = pagina.items;
  const hayFiltros = Boolean(
    filtros.busqueda.trim() ||
      filtros.estado !== "todos" ||
      filtros.desde ||
      filtros.hasta
  );

  function contenido() {
    if (estadoCarga === "cargando") {
      return (
        <div role="status" aria-live="polite">
          <span className="sr-only">Cargando albergues…</span>
          <FilasCargando />
        </div>
      );
    }

    if (estadoCarga === "error") {
      return (
        <div
          role="alert"
          className="flex flex-col items-center px-6 py-14 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDECEC] text-[#C53030]">
            <ServerCrash size={22} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#164652]">
            No fue posible cargar los albergues
          </p>
          <p className="mt-1 max-w-sm text-xs text-[#53636B]">{mensajeError}</p>
          <button
            type="button"
            onClick={onReintentar}
            className="mt-4 inline-flex items-center gap-2 border border-[#DCE6EA] px-4 py-2 text-xs font-semibold text-[#164652] transition hover:bg-[#F8FAFB]"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      );
    }

    if (albergues.length === 0) {
      return (
        <EstadoVacio
          hayFiltros={hayFiltros || totalRegistrados > 0}
          puedeAdministrar={puedeAdministrar}
          onLimpiar={() => onFiltrosChange(FILTROS_INICIALES)}
          onRegistrar={onRegistrar}
        />
      );
    }

    return (
      <>
        {/* Tabla escritorio */}
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="titulo-albergues"
          className="hidden overflow-x-auto md:block"
        >
          <table className="w-full min-w-[780px] text-left text-xs text-[#53636B]">
            <caption className="sr-only">
              Listado de albergues registrados
            </caption>
            <thead>
              <tr className="border-b border-[#EEF2F4] bg-[#F8FAFB] text-xs font-semibold text-[#53636B]">
                <th scope="col" className="px-4 py-3">
                  Albergue
                </th>
                <th scope="col" className="px-3 py-3">
                  Ubicación
                </th>
                <th scope="col" className="px-3 py-3">
                  Población / Capacidad
                </th>
                <th scope="col" className="px-3 py-3">
                  Riesgo
                </th>
                <th scope="col" className="px-3 py-3">
                  Administrador
                </th>
                <th scope="col" className="px-3 py-3">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F4]">
              {albergues.map((albergue) => (
                <tr
                  key={albergue.id}
                  className={`transition ${
                    seleccionadoId === albergue.id
                      ? "bg-[#F4FCFC]"
                      : "hover:bg-[#FAFCFD]"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <IconoAlbergue />
                      <div>
                        <p className="text-[13px] font-semibold text-[#164652]">
                          {albergue.nombre}
                        </p>
                        <p className="text-[11px] text-[#718895]">
                          {albergue.codigo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {albergue.municipio}, {albergue.departamento}
                  </td>
                  <td className="px-3 py-3 font-medium text-[#164652]">
                    <span className="font-semibold">
                      {albergue.poblacionActual === null
                        ? "Sin dato"
                        : albergue.poblacionActual}
                    </span>
                    <span className="text-[#718895]"> · </span>
                    <span>{albergue.capacidadInstalada} personas</span>
                  </td>
                  <td className="px-3 py-3">
                    <RiesgoBadge riesgo={albergue.riesgo} />
                  </td>
                  <td className="px-3 py-3">
                    {albergue.administrador ?? "Sin asignar"}
                  </td>
                  <td className="px-3 py-3">
                    <EstadoBadge activo={albergue.activo} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5 text-[#008994]">
                      <button
                        type="button"
                        aria-label={`Consultar ${albergue.nombre}`}
                        onClick={() => onConsultar(albergue)}
                        className="p-1.5 transition hover:bg-[#E6F9FA]"
                      >
                        <Eye size={16} aria-hidden="true" />
                      </button>
                      {puedeAdministrar && albergue.activo && (
                        <>
                          <button
                            type="button"
                            aria-label={`Editar ${albergue.nombre}`}
                            onClick={() => onEditar(albergue)}
                            className="p-1.5 text-[#53636B] transition hover:bg-[#F3F8FA]"
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </button>
                          <MenuEstado
                            albergue={albergue}
                            onCambiarEstado={onCambiarEstado}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tarjetas móvil */}
        <ul
          className="space-y-3 p-3 md:hidden"
          aria-label="Albergues registrados"
        >
          {albergues.map((albergue) => (
            <li
              key={albergue.id}
              className={`border p-3 ${
                seleccionadoId === albergue.id
                  ? "border-[#008994] bg-[#F4FCFC]"
                  : "border-[#DCE6EA] bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconoAlbergue />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#164652]">
                    {albergue.nombre}
                  </p>
                  <p className="text-[11px] text-[#718895]">{albergue.codigo}</p>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-[96px_1fr] gap-x-2 gap-y-2 text-[12px]">
                <dt className="text-[11px] text-[#718895]">Ubicación</dt>
                <dd className="text-[#53636B]">
                  {albergue.municipio}, {albergue.departamento}
                </dd>
                <dt className="text-[11px] text-[#718895]">Población</dt>
                <dd className="text-[#53636B]">
                  {albergue.poblacionActual === null
                    ? "Sin dato"
                    : albergue.poblacionActual}{" "}
                  / {albergue.capacidadInstalada} personas
                </dd>
                <dt className="text-[11px] text-[#718895]">Riesgo</dt>
                <dd>
                  <RiesgoBadge riesgo={albergue.riesgo} />
                </dd>
                <dt className="text-[11px] text-[#718895]">Administrador</dt>
                <dd className="text-[#53636B]">
                  {albergue.administrador ?? "Sin asignar"}
                </dd>
                <dt className="text-[11px] text-[#718895]">Estado</dt>
                <dd>
                  <EstadoBadge activo={albergue.activo} />
                </dd>
              </dl>

              <div
                className={`mt-3 grid gap-2 ${
                  puedeAdministrar && albergue.activo
                    ? "grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                <button
                  type="button"
                  aria-label={`Consultar ${albergue.nombre}`}
                  onClick={() => onConsultar(albergue)}
                  className="border border-[#DCE6EA] py-2 text-[12px] font-semibold text-[#164652]"
                >
                  Consultar
                </button>
                {puedeAdministrar && albergue.activo && (
                  <>
                    <button
                      type="button"
                      aria-label={`Editar ${albergue.nombre}`}
                      onClick={() => onEditar(albergue)}
                      className="border border-[#DCE6EA] py-2 text-[12px] font-semibold text-[#164652]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      aria-label={`Desactivar ${albergue.nombre}`}
                      onClick={() => onCambiarEstado(albergue)}
                      className="border border-[#DCE6EA] py-2 text-[12px] font-semibold text-[#C53030]"
                    >
                      Desactivar
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <section
      aria-labelledby="titulo-albergues"
      aria-busy={estadoCarga === "cargando"}
      className="min-w-0 border-t-2 border-[#008994] bg-white shadow-xs"
    >
      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2
            id="titulo-albergues"
            className="text-lg font-bold leading-6 text-[#164652]"
          >
            Albergues registrados
          </h2>
          <p className="text-[12px] text-[#718895]">
            {totalRegistrados} centros · {totalActivos} activos
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="relative">
            <span className="sr-only">Buscar albergue</span>
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#718895]"
            />
            <input
              type="search"
              maxLength={100}
              value={filtros.busqueda}
              onChange={(evento) =>
                onFiltrosChange({
                  ...filtros,
                  busqueda: evento.target.value,
                })
              }
              placeholder="Nombre, código, municipio o depto…"
              className={`${CONTROL} pl-8 sm:w-56`}
            />
          </label>

          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              value={filtros.estado}
              onChange={(evento) =>
                onFiltrosChange({
                  ...filtros,
                  estado: evento.target.value as FiltroEstado,
                })
              }
              className={CONTROL}
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </label>

          <label>
            <span className="sr-only">Filtrar desde fecha de creación</span>
            <input
              type="date"
              aria-label="Filtrar desde fecha"
              max={filtros.hasta || undefined}
              value={filtros.desde}
              onChange={(e) =>
                onFiltrosChange({ ...filtros, desde: e.target.value })
              }
              className={CONTROL}
            />
          </label>

          <label>
            <span className="sr-only">Filtrar hasta fecha de creación</span>
            <input
              type="date"
              aria-label="Filtrar hasta fecha"
              min={filtros.desde || undefined}
              value={filtros.hasta}
              onChange={(e) =>
                onFiltrosChange({ ...filtros, hasta: e.target.value })
              }
              className={CONTROL}
            />
          </label>

          {hayFiltros && (
            <button
              type="button"
              onClick={() => onFiltrosChange(FILTROS_INICIALES)}
              className="inline-flex h-9 items-center gap-1 border border-[#DCE6EA] bg-white px-2.5 text-xs font-semibold text-[#164652] transition hover:bg-[#F8FAFB]"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[#EEF2F4]">{contenido()}</div>

      <ControlesPaginacion
        pagina={pagina}
        etiquetaItems="albergues"
        cargando={estadoCarga === "cargando"}
        onPageChange={onPaginaChange}
        onPageSizeChange={onPageSizeChange}
        ariaLabel="Paginación de albergues"
      />
    </section>
  );
}
