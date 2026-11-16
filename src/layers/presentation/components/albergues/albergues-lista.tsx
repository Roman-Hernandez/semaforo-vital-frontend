"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Eye,
  Pencil,
  RefreshCw,
  Search,
  ServerCrash,
  Tent,
} from "lucide-react";
import {
  calcularOcupacion,
  type Albergue,
  type NivelRiesgo,
} from "@/layers/domain/albergues/albergue";
import { EstadoBadge, RiesgoBadge } from "./insignias";

export type FiltroEstado = "todos" | "activos" | "inactivos";
export type FiltroRiesgo = "todos" | NivelRiesgo;

export interface FiltrosAlbergues {
  busqueda: string;
  estado: FiltroEstado;
  riesgo: FiltroRiesgo;
}

export const FILTROS_INICIALES: FiltrosAlbergues = {
  busqueda: "",
  estado: "todos",
  riesgo: "todos",
};

export type EstadoCarga = "cargando" | "listo" | "error";

interface AlberguesListaProps {
  readonly estadoCarga: EstadoCarga;
  readonly mensajeError: string;
  readonly totalRegistrados: number;
  readonly totalActivos: number;
  readonly albergues: readonly Albergue[];
  readonly totalFiltrados: number;
  readonly pagina: number;
  readonly totalPaginas: number;
  readonly porPagina: number;
  readonly filtros: FiltrosAlbergues;
  readonly seleccionadoId: string | null;
  readonly puedeAdministrar: boolean;
  readonly onFiltrosChange: (filtros: FiltrosAlbergues) => void;
  readonly onPaginaChange: (pagina: number) => void;
  readonly onConsultar: (albergue: Albergue) => void;
  readonly onEditar: (albergue: Albergue) => void;
  readonly onCambiarEstado: (albergue: Albergue) => void;
  readonly onReintentar: () => void;
  readonly onRegistrar: () => void;
}

const CONTROL =
  "h-10 rounded-lg border border-[#E3EAEE] bg-white px-3 text-[13px] text-[#172126] outline-none transition focus:border-[#00C3D0] focus:ring-2 focus:ring-[#00C3D0]/20";

function Ocupacion({ albergue }: { readonly albergue: Albergue }) {
  const ocupacion = calcularOcupacion(albergue);

  if (albergue.poblacionActual === null) {
    return <span className="text-[#829198]">Sin datos</span>;
  }

  return (
    <span className="flex flex-col">
      <span className="text-[#172126]">{albergue.poblacionActual}</span>
      <span className="whitespace-nowrap text-[10px] text-[#829198]">
        {ocupacion}% ocupación
      </span>
    </span>
  );
}

function IconoAlbergue() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F9FA] text-[#008E99]">
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
        className="rounded-md p-1.5 text-[#53636B] transition hover:bg-[#F3F8FA]"
      >
        <Ellipsis size={16} aria-hidden="true" />
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-[#E3EAEE] bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false);
              onCambiarEstado(albergue);
            }}
            className={`w-full rounded-md px-3 py-2 text-left text-[13px] font-semibold transition hover:bg-[#F3F8FA] ${
              albergue.activo ? "text-[#CF343B]" : "text-[#008E99]"
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
        <div key={fila} className="flex animate-pulse items-center gap-4 px-4 py-4">
          <div className="h-9 w-9 rounded-lg bg-[#EEF2F4]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-[#EEF2F4]" />
            <div className="h-2.5 w-1/5 rounded bg-[#EEF2F4]" />
          </div>
          <div className="hidden h-3 w-24 rounded bg-[#EEF2F4] sm:block" />
          <div className="h-6 w-16 rounded-full bg-[#EEF2F4]" />
        </div>
      ))}
    </div>
  );
}

function EstadoVacio({
  hayAlbergues,
  puedeAdministrar,
  onLimpiar,
  onRegistrar,
}: {
  readonly hayAlbergues: boolean;
  readonly puedeAdministrar: boolean;
  readonly onLimpiar: () => void;
  readonly onRegistrar: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F9FA] text-[#008E99]">
        {hayAlbergues ? <Search size={22} aria-hidden="true" /> : <Tent size={22} aria-hidden="true" />}
      </span>

      <p className="mt-4 text-sm font-semibold text-[#172126]">
        {hayAlbergues
          ? "No se encontraron albergues con los filtros aplicados"
          : "Aún no hay albergues registrados"}
      </p>

      <p className="mt-1 max-w-sm text-[13px] text-[#53636B]">
        {hayAlbergues
          ? "Prueba con otro nombre, código o municipio, o limpia los filtros."
          : "Registra el primer centro habilitado para empezar su seguimiento."}
      </p>

      {hayAlbergues && (
        <button
          type="button"
          onClick={onLimpiar}
          className="mt-4 rounded-lg border border-[#E3EAEE] px-4 py-2 text-[13px] font-semibold text-[#172126] transition hover:bg-[#F8FAFB]"
        >
          Limpiar filtros
        </button>
      )}

      {!hayAlbergues && puedeAdministrar && (
        <button
          type="button"
          onClick={onRegistrar}
          className="mt-4 rounded-lg bg-[#00C3D0] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#00AEB9]"
        >
          Registrar albergue
        </button>
      )}
    </div>
  );
}

function Paginacion({
  pagina,
  totalPaginas,
  desde,
  hasta,
  total,
  onPaginaChange,
}: {
  readonly pagina: number;
  readonly totalPaginas: number;
  readonly desde: number;
  readonly hasta: number;
  readonly total: number;
  readonly onPaginaChange: (pagina: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#EEF2F4] px-4 py-4 text-[12px] text-[#829198] sm:flex-row sm:items-center sm:justify-between">
      <p>
        Mostrando {desde}–{hasta} de {total} albergues
      </p>

      <nav aria-label="Paginación de albergues" className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={pagina <= 1}
          onClick={() => onPaginaChange(pagina - 1)}
          className="rounded-md p-1.5 text-[#008E99] transition hover:bg-[#E6F9FA] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map(
          (numero) => (
            <button
              key={numero}
              type="button"
              aria-label={`Página ${numero}`}
              aria-current={numero === pagina ? "page" : undefined}
              onClick={() => onPaginaChange(numero)}
              className={`min-w-7 rounded-md px-2 py-1 text-[12px] font-semibold transition ${
                numero === pagina
                  ? "bg-[#E6F9FA] text-[#008E99]"
                  : "text-[#008E99] hover:bg-[#F3F8FA]"
              }`}
            >
              {numero}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Página siguiente"
          disabled={pagina >= totalPaginas}
          onClick={() => onPaginaChange(pagina + 1)}
          className="rounded-md p-1.5 text-[#008E99] transition hover:bg-[#E6F9FA] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

export function AlberguesLista({
  estadoCarga,
  mensajeError,
  totalRegistrados,
  totalActivos,
  albergues,
  totalFiltrados,
  pagina,
  totalPaginas,
  porPagina,
  filtros,
  seleccionadoId,
  puedeAdministrar,
  onFiltrosChange,
  onPaginaChange,
  onConsultar,
  onEditar,
  onCambiarEstado,
  onReintentar,
  onRegistrar,
}: AlberguesListaProps) {
  const desde = totalFiltrados === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, totalFiltrados);

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
        <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDECEE] text-[#CF343B]">
            <ServerCrash size={22} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#172126]">
            No fue posible cargar los albergues
          </p>
          <p className="mt-1 max-w-sm text-[13px] text-[#53636B]">{mensajeError}</p>
          <button
            type="button"
            onClick={onReintentar}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#E3EAEE] px-4 py-2 text-[13px] font-semibold text-[#172126] transition hover:bg-[#F8FAFB]"
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
          hayAlbergues={totalRegistrados > 0}
          puedeAdministrar={puedeAdministrar}
          onLimpiar={() => onFiltrosChange(FILTROS_INICIALES)}
          onRegistrar={onRegistrar}
        />
      );
    }

    return (
      <>
        {/* TABLA: tabletas y computadores */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-[12px] text-[#53636B]">
            <caption className="sr-only">Listado de albergues registrados</caption>
            <thead>
              <tr className="border-b border-[#EEF2F4] text-[10px] uppercase tracking-wide text-[#829198]">
                <th scope="col" className="px-4 py-3 font-normal">Albergue</th>
                <th scope="col" className="px-2 py-3 font-normal">Ubicación</th>
                <th scope="col" className="px-2 py-3 font-normal">Población</th>
                <th scope="col" className="px-2 py-3 font-normal">Administrador</th>
                <th scope="col" className="px-2 py-3 font-normal">Riesgo</th>
                <th scope="col" className="px-2 py-3 font-normal">Estado</th>
                <th scope="col" className="px-4 py-3 font-normal">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F4]">
              {albergues.map((albergue) => (
                <tr
                  key={albergue.id}
                  className={`transition ${
                    seleccionadoId === albergue.id ? "bg-[#F4FCFC]" : "hover:bg-[#FAFCFD]"
                  } ${albergue.activo ? "" : "text-[#829198]"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <IconoAlbergue />
                      <div>
                        <p className={`text-[13px] font-semibold ${albergue.activo ? "text-[#172126]" : "text-[#53636B]"}`}>
                          {albergue.nombre}
                        </p>
                        <p className="text-[10px] text-[#829198]">{albergue.codigo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">{albergue.municipio}</td>
                  <td className="px-2 py-3"><Ocupacion albergue={albergue} /></td>
                  <td className="px-2 py-3">{albergue.administrador ?? "Sin asignar"}</td>
                  <td className="px-2 py-3"><RiesgoBadge riesgo={albergue.riesgo} /></td>
                  <td className="px-2 py-3"><EstadoBadge activo={albergue.activo} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5 text-[#008E99]">
                      <button
                        type="button"
                        aria-label={`Consultar ${albergue.nombre}`}
                        onClick={() => onConsultar(albergue)}
                        className="rounded-md p-1.5 transition hover:bg-[#E6F9FA]"
                      >
                        <Eye size={16} aria-hidden="true" />
                      </button>
                      {puedeAdministrar && (
                        <>
                          <button
                            type="button"
                            aria-label={`Editar ${albergue.nombre}`}
                            onClick={() => onEditar(albergue)}
                            className="rounded-md p-1.5 text-[#53636B] transition hover:bg-[#F3F8FA]"
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </button>
                          <MenuEstado albergue={albergue} onCambiarEstado={onCambiarEstado} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TARJETAS: celulares */}
        <ul className="space-y-3 p-3 md:hidden" aria-label="Albergues registrados">
          {albergues.map((albergue) => (
            <li
              key={albergue.id}
              className={`rounded-xl border p-3 ${
                seleccionadoId === albergue.id ? "border-[#00C3D0] bg-[#F4FCFC]" : "border-[#E3EAEE] bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconoAlbergue />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#172126]">{albergue.nombre}</p>
                  <p className="text-[10px] text-[#829198]">{albergue.codigo}</p>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-[96px_1fr] gap-x-2 gap-y-2 text-[12px]">
                <dt className="text-[10px] uppercase tracking-wide text-[#829198]">Ubicación</dt>
                <dd className="text-[#53636B]">{albergue.municipio}</dd>
                <dt className="text-[10px] uppercase tracking-wide text-[#829198]">Población</dt>
                <dd className="text-[#53636B]"><Ocupacion albergue={albergue} /></dd>
                <dt className="text-[10px] uppercase tracking-wide text-[#829198]">Administrador</dt>
                <dd className="text-[#53636B]">{albergue.administrador ?? "Sin asignar"}</dd>
                <dt className="text-[10px] uppercase tracking-wide text-[#829198]">Riesgo</dt>
                <dd><RiesgoBadge riesgo={albergue.riesgo} /></dd>
                <dt className="text-[10px] uppercase tracking-wide text-[#829198]">Estado</dt>
                <dd><EstadoBadge activo={albergue.activo} /></dd>
              </dl>

              <div className={`mt-3 grid gap-2 ${puedeAdministrar ? "grid-cols-3" : "grid-cols-1"}`}>
                <button
                  type="button"
                  aria-label={`Consultar ${albergue.nombre}`}
                  onClick={() => onConsultar(albergue)}
                  className="rounded-lg border border-[#E3EAEE] py-2 text-[12px] font-semibold text-[#172126]"
                >
                  Consultar
                </button>
                {puedeAdministrar && (
                  <>
                    <button
                      type="button"
                      aria-label={`Editar ${albergue.nombre}`}
                      onClick={() => onEditar(albergue)}
                      className="rounded-lg border border-[#E3EAEE] py-2 text-[12px] font-semibold text-[#172126]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      aria-label={`${albergue.activo ? "Desactivar" : "Reactivar"} ${albergue.nombre}`}
                      onClick={() => onCambiarEstado(albergue)}
                      className={`rounded-lg border border-[#E3EAEE] py-2 text-[12px] font-semibold ${
                        albergue.activo ? "text-[#CF343B]" : "text-[#008E99]"
                      }`}
                    >
                      {albergue.activo ? "Desactivar" : "Reactivar"}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        <Paginacion
          pagina={pagina}
          totalPaginas={totalPaginas}
          desde={desde}
          hasta={hasta}
          total={totalFiltrados}
          onPaginaChange={onPaginaChange}
        />
      </>
    );
  }

  return (
    <section
      aria-labelledby="titulo-albergues"
      aria-busy={estadoCarga === "cargando"}
      className="min-w-0 rounded-2xl bg-white shadow-sm ring-1 ring-[#E3EAEE]"
    >
      <div className="flex flex-col gap-3 p-4 sm:p-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div>
          <h2 id="titulo-albergues" className="text-lg font-bold leading-6 text-[#172126]">
            Albergues registrados
          </h2>
          <p className="text-[12px] text-[#829198]">
            {totalRegistrados} centros · {totalActivos} activos
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(160px,auto)_minmax(160px,auto)]">
          <label className="relative">
            <span className="sr-only">Buscar albergue</span>
            <Search
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#829198]"
            />
            <input
              type="search"
              value={filtros.busqueda}
              onChange={(evento) =>
                onFiltrosChange({ ...filtros, busqueda: evento.target.value })
              }
              placeholder="Buscar albergue…"
              className={`${CONTROL} w-full pl-9 sm:min-w-56`}
            />
          </label>

          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              value={filtros.estado}
              onChange={(evento) =>
                onFiltrosChange({ ...filtros, estado: evento.target.value as FiltroEstado })
              }
              className={`${CONTROL} w-full`}
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </label>

          <label>
            <span className="sr-only">Filtrar por riesgo</span>
            <select
              value={filtros.riesgo}
              onChange={(evento) =>
                onFiltrosChange({ ...filtros, riesgo: evento.target.value as FiltroRiesgo })
              }
              className={`${CONTROL} w-full`}
            >
              <option value="todos">Todos los riesgos</option>
              <option value="bajo">Bajo</option>
              <option value="medio">Medio</option>
              <option value="alto">Alto</option>
              <option value="critico">Crítico</option>
            </select>
          </label>
        </div>
      </div>

      <div className="border-t border-[#EEF2F4]">{contenido()}</div>
    </section>
  );
}
