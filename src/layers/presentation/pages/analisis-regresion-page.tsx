"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  CalendarClock,
  Cpu,
  Info,
  RefreshCw,
  ServerCrash,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  ETIQUETAS_CLASIFICACION,
  agruparPorEjecucion,
  describirModelo,
  formatearFechaHora,
  formatearProbabilidad,
  resumirEjecucion,
  type Clasificacion,
  type EjecucionAnalisis,
  type ResultadoRegresion,
} from "../../domain/analisis-regresion/resultado";
import { ApiError } from "../../application/services/api-client";
import {
  obtenerAnalisisRegresionGateway,
  type AnalisisRegresionGateway,
} from "../../application/services/analisis-regresion-service";

type EstadoCarga = "cargando" | "listo" | "error";
type FiltroClasificacion = "todos" | Clasificacion;

interface AnalisisRegresionPageProps {
  /** Permite inyectar datos en pruebas. */
  readonly gateway?: AnalisisRegresionGateway;
  readonly modoDemostracion?: boolean;
}

const SELECTOR =
  "h-10 w-full rounded-lg border border-[#DCE5EA] bg-white px-3 text-sm text-[#203B45] outline-none transition focus:border-[#00B9C7] focus:ring-2 focus:ring-[#00B9C7]/20";

const ESTILOS_CLASIFICACION: Readonly<Record<Clasificacion, string>> = {
  contagiado: "bg-[#FFF0F0] text-[#C53030]",
  no_contagiado: "bg-[#E9F7F0] text-[#23845A]",
};

const COLOR_BARRA: Readonly<Record<Clasificacion, string>> = {
  contagiado: "bg-[#E05A5A]",
  no_contagiado: "bg-[#2FB27A]",
};

function claveEjecucion(ejecucion: EjecucionAnalisis): string {
  return `${ejecucion.fechaEjecucion}|${describirModelo(ejecucion.modelo)}`;
}

/* ---------------------------- Componentes ---------------------------- */

function AvisoNoDiagnostico() {
  return (
    <aside
      aria-label="Aviso sobre los resultados"
      className="flex items-start gap-3 rounded-xl border border-[#F3D9A4] bg-[#FFF7E4] p-4"
    >
      <ShieldAlert size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-[#B77D00]" />
      <div>
        <p className="text-sm font-semibold text-[#7A5300]">
          Estos resultados son estimaciones estadísticas, no un diagnóstico médico
        </p>
        <p className="mt-1 text-xs text-[#8A6A1E]">
          La clasificación “contagiado” o “no contagiado” proviene de un modelo de regresión logística y solo sirve
          para priorizar el seguimiento. La confirmación de cualquier caso la debe hacer personal de salud.
        </p>
      </div>
    </aside>
  );
}

function ClasificacionBadge({ clasificacion }: { readonly clasificacion: Clasificacion }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${ESTILOS_CLASIFICACION[clasificacion]}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{ETIQUETAS_CLASIFICACION[clasificacion]}</span>
    </span>
  );
}

function Probabilidad({ resultado }: { readonly resultado: ResultadoRegresion }) {
  const porcentaje = formatearProbabilidad(resultado.probabilidad);

  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[#EEF2F4]" aria-hidden="true">
        <span
          className={`block h-full rounded-full ${COLOR_BARRA[resultado.clasificacion]}`}
          style={{ width: porcentaje }}
        />
      </span>
      <span className="font-semibold tabular-nums text-[#203B45]">{porcentaje}</span>
    </span>
  );
}

function ResumenEjecucion({ ejecucion }: { readonly ejecucion: EjecucionAnalisis }) {
  const resumen = resumirEjecucion(ejecucion);
  const porcentajeContagiados = resumen.total === 0 ? 0 : resumen.contagiados / resumen.total;

  const tarjetas = [
    {
      titulo: "Fecha de ejecución",
      valor: formatearFechaHora(ejecucion.fechaEjecucion),
      detalle: "Hora de Colombia",
      icono: CalendarClock,
    },
    {
      titulo: "Versión del modelo",
      valor: ejecucion.modelo ? `v${ejecucion.modelo.version}` : "No disponible",
      detalle: ejecucion.modelo?.nombre ?? "El análisis no reportó versión",
      icono: Cpu,
    },
    {
      titulo: "Registros analizados",
      valor: String(resumen.total),
      detalle: `Probabilidad promedio ${formatearProbabilidad(resumen.probabilidadPromedio)}`,
      icono: Users,
    },
    {
      titulo: "Estimados como contagiados",
      valor: String(resumen.contagiados),
      detalle: `${formatearProbabilidad(porcentajeContagiados)} de los registros`,
      icono: BrainCircuit,
    },
  ];

  return (
    <section aria-label="Resumen del análisis" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tarjetas.map((tarjeta) => {
        const Icono = tarjeta.icono;

        return (
          <article key={tarjeta.titulo} className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-medium text-[#718895]">{tarjeta.titulo}</h2>
              <Icono size={18} aria-hidden="true" className="shrink-0 text-[#009EAD]" />
            </div>
            <p className="mt-2 text-xl font-semibold text-[#203B45]">{tarjeta.valor}</p>
            <p className="mt-0.5 text-xs text-[#8297A1]">{tarjeta.detalle}</p>
          </article>
        );
      })}
    </section>
  );
}

function TablaResultados({ resultados }: { readonly resultados: readonly ResultadoRegresion[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm text-[#29434D]">
          <caption className="sr-only">Resultados de la regresión logística</caption>
          <thead>
            <tr className="bg-[#F6F9FB] text-xs text-[#718895]">
              <th scope="col" className="px-4 py-3 font-medium">Registro</th>
              <th scope="col" className="px-3 py-3 font-medium">Clasificación estimada</th>
              <th scope="col" className="px-3 py-3 font-medium">Probabilidad estimada</th>
              <th scope="col" className="px-3 py-3 font-medium">Fecha de ejecución</th>
              <th scope="col" className="px-4 py-3 font-medium">Modelo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2F4]">
            {resultados.map((resultado) => (
              <tr key={resultado.id}>
                <td className="px-4 py-3.5 font-medium text-[#203B45]">{resultado.registro}</td>
                <td className="px-3 py-3.5"><ClasificacionBadge clasificacion={resultado.clasificacion} /></td>
                <td className="px-3 py-3.5"><Probabilidad resultado={resultado} /></td>
                <td className="whitespace-nowrap px-3 py-3.5">{formatearFechaHora(resultado.fechaEjecucion)}</td>
                <td className="px-4 py-3.5 text-[#718895]">{describirModelo(resultado.modelo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label="Resultados del análisis" className="space-y-3 p-3 md:hidden">
        {resultados.map((resultado) => (
          <li key={resultado.id} className="rounded-xl border border-[#E4EBEF] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#203B45]">{resultado.registro}</span>
              <ClasificacionBadge clasificacion={resultado.clasificacion} />
            </div>
            <dl className="mt-3 grid grid-cols-[110px_1fr] gap-x-2 gap-y-2 text-xs">
              <dt className="text-[#8297A1]">Probabilidad</dt>
              <dd><Probabilidad resultado={resultado} /></dd>
              <dt className="text-[#8297A1]">Ejecución</dt>
              <dd className="text-[#29434D]">{formatearFechaHora(resultado.fechaEjecucion)}</dd>
              <dt className="text-[#8297A1]">Modelo</dt>
              <dd className="text-[#29434D]">{describirModelo(resultado.modelo)}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

function EstadoVacio({ titulo, detalle }: { readonly titulo: string; readonly detalle: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F8F8] text-[#009EAD]">
        <BrainCircuit size={22} aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#203B45]">{titulo}</p>
      <p className="mt-1 max-w-sm text-sm text-[#718895]">{detalle}</p>
    </div>
  );
}

function Esqueleto() {
  return (
    <output className="block" aria-label="Cargando resultados">
      <span className="sr-only">Cargando resultados del análisis…</span>
      <span aria-hidden="true" className="block divide-y divide-[#EEF2F4]">
        {[1, 2, 3, 4].map((fila) => (
          <span key={fila} className="flex animate-pulse items-center gap-4 px-4 py-4">
            <span className="block h-3 w-20 rounded bg-[#EEF2F4]" />
            <span className="block h-5 w-24 rounded-full bg-[#EEF2F4]" />
            <span className="block h-3 flex-1 rounded bg-[#EEF2F4]" />
          </span>
        ))}
      </span>
    </output>
  );
}

/* -------------------------------- Página ----------------------------- */

export function AnalisisRegresionPage({
  gateway: gatewayInyectado,
  modoDemostracion = !process.env.NEXT_PUBLIC_API_URL,
}: AnalisisRegresionPageProps) {
  const [gateway] = useState<AnalisisRegresionGateway>(
    () => gatewayInyectado ?? obtenerAnalisisRegresionGateway()
  );
  const [resultados, setResultados] = useState<ResultadoRegresion[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>("cargando");
  const [mensajeError, setMensajeError] = useState("");
  const [intento, setIntento] = useState(0);
  const [ejecucionElegida, setEjecucionElegida] = useState("");
  const [filtro, setFiltro] = useState<FiltroClasificacion>("todos");

  useEffect(() => {
    let vigente = true;

    gateway
      .listarResultados()
      .then((datos) => {
        if (!vigente) return;
        setResultados(datos);
        setEstadoCarga("listo");
      })
      .catch((error: unknown) => {
        if (!vigente) return;
        setMensajeError(
          error instanceof ApiError ? error.message : "Verifica tu conexión e inténtalo nuevamente."
        );
        setEstadoCarga("error");
      });

    return () => {
      vigente = false;
    };
  }, [gateway, intento]);

  const ejecuciones = useMemo(() => agruparPorEjecucion(resultados), [resultados]);
  const ejecucion =
    ejecuciones.find((item) => claveEjecucion(item) === ejecucionElegida) ?? ejecuciones[0];
  const visibles =
    ejecucion?.resultados.filter((r) => filtro === "todos" || r.clasificacion === filtro) ?? [];

  function reintentar() {
    setEstadoCarga("cargando");
    setIntento((valor) => valor + 1);
  }

  function contenido() {
    if (estadoCarga === "cargando") {
      return <Esqueleto />;
    }

    if (estadoCarga === "error") {
      return (
        <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0F0] text-[#D64545]">
            <ServerCrash size={22} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#203B45]">No fue posible cargar los resultados</p>
          <p className="mt-1 max-w-sm text-sm text-[#718895]">{mensajeError}</p>
          <button
            type="button"
            onClick={reintentar}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#DCE5EA] px-4 py-2 text-sm font-semibold text-[#29434D] transition hover:bg-[#F6F9FB]"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Reintentar</span>
          </button>
        </div>
      );
    }

    if (!ejecucion) {
      return (
        <EstadoVacio
          titulo="Aún no hay resultados del análisis"
          detalle="Cuando se ejecute la regresión logística para tu albergue, los resultados aparecerán aquí."
        />
      );
    }

    if (visibles.length === 0) {
      return (
        <EstadoVacio
          titulo="No hay resultados con esta clasificación"
          detalle="Cambia el filtro para ver los demás registros de esta ejecución."
        />
      );
    }

    return (
      <>
        <TablaResultados resultados={visibles} />
        <p className="border-t border-[#EEF2F4] px-4 py-3 text-xs text-[#8297A1]">
          Mostrando {visibles.length} de {ejecucion.resultados.length} registros de esta ejecución
        </p>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs text-[#8297A1]">Mi albergue / Análisis IA</p>
        <h1 className="text-2xl font-semibold text-[#203B45]">Análisis de regresión logística</h1>
        <p className="mt-1 text-sm text-[#718895]">
          Clasificaciones estimadas y probabilidades de los registros individuales de tu albergue.
        </p>
      </div>

      {modoDemostracion && (
        <p className="rounded-lg bg-[#E4F8F8] px-3 py-2 text-xs text-[#007F8A]">
          Datos demostrativos: la API del análisis aún no está configurada (<code>NEXT_PUBLIC_API_URL</code>).
        </p>
      )}

      <AvisoNoDiagnostico />

      {estadoCarga === "listo" && ejecucion && <ResumenEjecucion ejecucion={ejecucion} />}

      <section
        aria-labelledby="titulo-resultados"
        aria-busy={estadoCarga === "cargando"}
        className="min-w-0 rounded-xl border border-[#E4EBEF] bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="titulo-resultados" className="text-lg font-semibold text-[#203B45]">
            Resultados por registro
          </h2>

          {estadoCarga === "listo" && ejecucion && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[520px]">
              <label className="block text-xs font-medium text-[#29434D]">
                <span>Ejecución del análisis</span>
                <select
                  value={claveEjecucion(ejecucion)}
                  onChange={(e) => setEjecucionElegida(e.target.value)}
                  className={`${SELECTOR} mt-1`}
                >
                  {ejecuciones.map((item) => (
                    <option key={claveEjecucion(item)} value={claveEjecucion(item)}>
                      {`${formatearFechaHora(item.fechaEjecucion)} · ${describirModelo(item.modelo)}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-[#29434D]">
                <span>Clasificación</span>
                <select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value as FiltroClasificacion)}
                  className={`${SELECTOR} mt-1`}
                >
                  <option value="todos">Todas</option>
                  <option value="contagiado">Contagiado</option>
                  <option value="no_contagiado">No contagiado</option>
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="border-t border-[#EEF2F4]">{contenido()}</div>
      </section>

      <p className="flex items-start gap-2 text-xs text-[#8297A1]">
        <Info size={14} aria-hidden="true" className="mt-px shrink-0" />
        <span>
          Estimación estadística · No sustituye la valoración de profesionales de salud. Un registro se clasifica como
          “contagiado” cuando la probabilidad estimada es igual o mayor al umbral definido por el modelo.
        </span>
      </p>
    </div>
  );
}
