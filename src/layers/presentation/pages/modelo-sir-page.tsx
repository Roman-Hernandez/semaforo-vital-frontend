"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  sirGateway,
  type EstadoSIR,
  type SIRDiseaseResult,
  type SIRGateway,
  type SIRResult,
} from "@/layers/application/services/sir-service";
import {
  TAMANO_PAGINA_PREDETERMINADO,
} from "@/layers/application/services/paginacion";
import { ControlesPaginacion } from "@/components/shared/ControlesPaginacion";
import { SkeletonBloque, SkeletonMetricas } from "@/components/shared/Skeleton";
import { SIRChart } from "@/layers/presentation/components/sir/sir-chart";

export interface ModeloSIRPageProps {
  readonly gateway?: SIRGateway;
}

const ETIQUETAS_ESTADO_SIR: Record<
  EstadoSIR,
  { texto: string; clase: string }
> = {
  estimacion_disponible: {
    texto: "Estimación disponible",
    clase: "bg-[#E2F5EB] text-[#146C43]",
  },
  datos_insuficientes: {
    texto: "Datos insuficientes",
    clase: "bg-[#FEF2D6] text-[#9A6300]",
  },
  datos_incompatibles: {
    texto: "Datos incompatibles con SIR cerrado",
    clase: "bg-[#FCE6E7] text-[#B02A30]",
  },
  sin_casos_activos: {
    texto: "Sin casos activos al corte",
    clase: "bg-[#EEF3F4] text-[#53636B]",
  },
};

const DESCRIPCION_FALTANTES: Record<string, string> = {
  poblacion_actual:
    "Falta registrar el conteo de población vigente del albergue.",
  casos_enfermedades:
    "No hay reportes de enfermedades en la ventana reciente de observación.",
  cantidad_recuperados:
    "Falta informar la cantidad de personas recuperadas observadas en los reportes de la enfermedad.",
  poblacion_historica:
    "Existen fechas de casos sin un registro de población vigente para ese día.",
  historial_minimo_4_fechas:
    "Se requieren al menos 4 fechas distintas de seguimiento para ajustar las tasas β y γ.",
  casos_recientes:
    "El último reporte de casos tiene más de 7 días de antigüedad.",
  casos_con_poblacion_actual:
    "La población del albergue cambió después del último reporte de casos.",
  poblacion_reciente:
    "El registro de población tiene más de 7 días de antigüedad.",
  serie_para_estimacion:
    "La serie observada requiere fechas con separación máxima de 3 días y recuperaciones observadas.",
};

function formatearDecimal(
  valor: number | null | undefined,
  maxDecimales = 2
): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return "Sin dato";
  }
  return valor.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimales,
  });
}

function formatearFechaHora(iso: string | null | undefined): string {
  if (!iso) return "Sin fecha registrada";
  return iso.slice(0, 10);
}

function BadgeEstadoSIR({ estado }: { readonly estado: EstadoSIR }) {
  const cfg = ETIQUETAS_ESTADO_SIR[estado];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${cfg.clase}`}
    >
      {cfg.texto}
    </span>
  );
}

function TarjetaEnfermedadSIR({
  item,
}: {
  readonly item: SIRDiseaseResult;
}) {
  const { resumen, parametros_estimados: params } = item;

  return (
    <article
      aria-label={`Resultado SIR para ${item.enfermedad}`}
      className="space-y-5 border-t-2 border-[#008994] bg-white p-6 shadow-xs"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF2F4] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#164652]">{item.enfermedad}</h3>
          <p className="mt-0.5 text-xs text-[#53636B]">
            Observaciones en ventana: {item.observado.length} fechas
            {item.proyeccion.length > 0 &&
              ` · Proyección: ${item.proyeccion.length} puntos (día 0 a ${
                item.proyeccion.at(-1)?.dia ?? 14
              })`}
          </p>
        </div>
        <BadgeEstadoSIR estado={item.estado} />
      </div>

      {/* Mensajes de estado cuando no hay estimación o cuando no hay casos activos */}
      {item.estado !== "estimacion_disponible" && (
        <div
          className={`space-y-3 border-l-4 p-4 text-xs ${
            item.estado === "datos_incompatibles"
              ? "border-[#C53030] bg-[#FDF4F4] text-[#7A1C20]"
              : item.estado === "datos_insuficientes"
              ? "border-[#D48806] bg-[#FFFBEB] text-[#784900]"
              : "border-[#008994] bg-[#F4F8FA] text-[#164652]"
          }`}
        >
          {item.motivos.length > 0 && (
            <ul className="list-disc space-y-1 pl-4 font-medium">
              {item.motivos.map((motivo) => (
                <li key={motivo}>{motivo}</li>
              ))}
            </ul>
          )}

          {item.datos_faltantes.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="font-bold">Requerimientos pendientes:</p>
              <ul className="list-disc space-y-1 pl-4">
                {item.datos_faltantes.map((codigo) => (
                  <li key={codigo}>
                    {DESCRIPCION_FALTANTES[codigo] ?? codigo}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.estado === "datos_insuficientes" && (
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/albergue/poblacion"
                className="border border-[#164652] bg-white px-3 py-1.5 text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
              >
                Registrar población →
              </Link>
              <Link
                href="/albergue/enfermedades"
                className="bg-[#008994] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#00747E]"
              >
                Registrar casos y recuperados →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Resumen numérico cuando la estimación está disponible */}
      {item.estado === "estimacion_disponible" && resumen && (
        <dl className="grid grid-cols-1 divide-y divide-[#EEF2F4] border border-[#EEF2F4] bg-[#FAFCFD] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="p-4">
            <dt className="text-xs text-[#53636B]">
              Máximo de infectados en el horizonte
            </dt>
            <dd className="mt-1 text-xl font-bold text-[#164652]">
              {formatearDecimal(resumen.pico_infectados_en_horizonte)} personas
            </dd>
            <p className="mt-1 text-[11px] text-[#718895]">
              Fecha en horizonte: {resumen.fecha_pico_en_horizonte.slice(0, 10)}{" "}
              (no implica pico definitivo de epidemia)
            </p>
          </div>

          <div className="p-4">
            <dt className="text-xs text-[#53636B]">
              Infectados al cierre del horizonte
            </dt>
            <dd className="mt-1 text-xl font-bold text-[#164652]">
              {formatearDecimal(resumen.infectados_finales)} personas
            </dd>
            <p className="mt-1 text-[11px] text-[#718895]">
              Estimación continua al último día proyectado
            </p>
          </div>

          <div className="p-4">
            <dt className="text-xs text-[#53636B]">
              Recuperados al cierre del horizonte
            </dt>
            <dd className="mt-1 text-xl font-bold text-[#164652]">
              {formatearDecimal(resumen.recuperados_finales)} personas
            </dd>
            <p className="mt-1 text-[11px] text-[#718895]">
              Acumulado estimado en la población actual
            </p>
          </div>

          <div className="p-4">
            <dt className="text-xs text-[#53636B]">
              R efectivo inicial (adimensional)
            </dt>
            <dd className="mt-1 text-xl font-bold text-[#164652]">
              {resumen.r_efectivo_inicial === null
                ? "No definido"
                : formatearDecimal(resumen.r_efectivo_inicial, 3)}
            </dd>
            <p className="mt-1 text-[11px] text-[#718895]">
              Razón reproductiva al inicio de la proyección (no es cantidad de personas)
            </p>
          </div>
        </dl>
      )}

      {/* Gráfica S / I / R de observaciones y proyección */}
      {(item.observado.length > 0 || item.proyeccion.length > 0) && (
        <SIRChart
          titulo={`Trayectoria S / I / R · ${item.enfermedad}`}
          observado={item.observado}
          proyeccion={item.proyeccion}
        />
      )}

      {/* Parámetros estimados por el servidor (solo lectura) */}
      {params && (
        <div className="bg-[#F8FAFB] p-4 text-xs text-[#164652]">
          <h4 className="font-bold text-[#164652]">
            Parámetros estimados automáticamente (solo lectura)
          </h4>
          <dl className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <dt className="text-[#53636B]">Tasa de transmisión (β)</dt>
              <dd className="mt-0.5 font-bold">
                {formatearDecimal(params.beta, 4)} / día
              </dd>
            </div>
            <div>
              <dt className="text-[#53636B]">Tasa de recuperación (γ)</dt>
              <dd className="mt-0.5 font-bold">
                {formatearDecimal(params.gamma, 4)} / día
              </dd>
            </div>
            <div>
              <dt className="text-[#53636B]">Error de ajuste (RMSE I)</dt>
              <dd className="mt-0.5 font-bold">
                {formatearDecimal(params.error_ajuste_infectados, 4)}
              </dd>
            </div>
            <div>
              <dt className="text-[#53636B]">Intervalos utilizados</dt>
              <dd className="mt-0.5 font-bold">{params.intervalos_utilizados}</dd>
            </div>
            {resumen && (
              <div>
                <dt className="text-[#53636B]">Conservación |S+I+R−N|</dt>
                <dd className="mt-0.5 font-bold">
                  {resumen.error_maximo_poblacion.toExponential(2)}
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-2 text-[11px] text-[#53636B]">
            Método de ajuste: {params.metodo}
          </p>
        </div>
      )}

      {/* Tabla de observaciones registradas y procedencia */}
      {item.observado.length > 0 && (
        <details className="border border-[#EEF2F4] bg-white">
          <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-[#164652] hover:bg-[#F8FAFB]">
            Ver serie observada y procedencia ({item.observado.length} fechas)
          </summary>
          <div className="overflow-x-auto border-t border-[#EEF2F4]">
            <table className="w-full min-w-[560px] text-left text-xs text-[#53636B]">
              <caption className="sr-only">
                Observaciones utilizadas para {item.enfermedad}
              </caption>
              <thead>
                <tr className="border-b border-[#EEF2F4] bg-[#F8FAFB] font-semibold text-[#53636B]">
                  <th scope="col" className="px-4 py-2.5">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Población (N)
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Susceptibles (S)
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Infectados (I)
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Recuperados (R)
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Trazabilidad (IDs)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F4]">
                {item.observado.map((obs) => (
                  <tr key={`${obs.fecha}-${obs.registro_casos_id}`}>
                    <td className="px-4 py-2 font-medium text-[#164652]">
                      {obs.fecha.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2">
                      {obs.poblacion === null
                        ? "Sin dato"
                        : obs.poblacion.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-2">
                      {obs.susceptibles === null
                        ? "Sin dato"
                        : obs.susceptibles.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-2 font-semibold text-[#164652]">
                      {obs.infectados.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-2">
                      {obs.recuperados === null
                        ? "Sin dato"
                        : obs.recuperados.toLocaleString("es-CO")}
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-[#718895]">
                      Caso: {obs.registro_casos_id.slice(-6)} · Pob:{" "}
                      {obs.registro_poblacion_id
                        ? obs.registro_poblacion_id.slice(-6)
                        : "Sin registro"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </article>
  );
}

export default function ModeloSIRPage({
  gateway: gatewayInyectado,
}: ModeloSIRPageProps = {}) {
  const [gateway] = useState<SIRGateway>(() => gatewayInyectado ?? sirGateway);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(TAMANO_PAGINA_PREDETERMINADO);
  const [entradaEnfermedad, setEntradaEnfermedad] = useState("");
  const [enfermedadFiltro, setEnfermedadFiltro] = useState("");
  const [enfermedadSeleccionada, setEnfermedadSeleccionada] =
    useState<string>("todas");
  const [version, setVersion] = useState(0);

  const [datos, setDatos] = useState<SIRResult | null>(null);
  const [claveResuelta, setClaveResuelta] = useState("");
  const [error, setError] = useState("");

  const claveActiva = `${page}|${pageSize}|${enfermedadFiltro}|${version}`;
  const cargando = claveResuelta !== claveActiva;

  const secuenciaRef = useRef(0);

  useEffect(() => {
    const idPeticion = ++secuenciaRef.current;

    gateway
      .consultarResultados({
        page,
        page_size: pageSize,
        enfermedad: enfermedadFiltro || undefined,
      })
      .then((res) => {
        if (idPeticion !== secuenciaRef.current) return;
        setDatos(res);
        setEnfermedadSeleccionada("todas");
        setError("");
        setClaveResuelta(claveActiva);
      })
      .catch((err: unknown) => {
        if (idPeticion !== secuenciaRef.current) return;
        setError(
          err instanceof Error
            ? err.message
            : "No fue posible consultar los resultados del modelo SIR."
        );
        setClaveResuelta(claveActiva);
      });
  }, [gateway, claveActiva, page, pageSize, enfermedadFiltro, version]);

  function aplicarFiltroEnfermedad(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    setEnfermedadFiltro(entradaEnfermedad.trim());
  }

  function limpiarFiltroEnfermedad() {
    setEntradaEnfermedad("");
    setEnfermedadFiltro("");
    setPage(1);
  }

  const itemsPagina = datos?.resultados.items ?? [];
  const itemsVisibles =
    enfermedadSeleccionada === "todas"
      ? itemsPagina
      : itemsPagina.filter((i) => i.enfermedad === enfermedadSeleccionada);

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-[#164652]">
      <header className="flex flex-col justify-between gap-4 border-b border-[#DCE6EA] pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#164652]">
            Laboratorio SIR automático
          </h1>
          <p className="mt-1 text-xs text-[#53636B]">
            Estimación determinista automática a partir del historial de
            población y casos registrados en el albergue, sin validación clínica
            ni carácter de recomendación médica.
          </p>
        </div>

        <button
          type="button"
          disabled={cargando}
          onClick={() => setVersion((v) => v + 1)}
          className="inline-flex items-center gap-2 self-start border border-[#DCE6EA] bg-white px-4 py-2 text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA] disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
            className={cargando ? "animate-spin" : ""}
          />
          <span>{cargando ? "Actualizando…" : "Actualizar resultados"}</span>
        </button>
      </header>

      {error ? (
        <div
          role="alert"
          className="border-l-4 border-[#C53030] bg-white p-5 text-sm text-[#C53030]"
        >
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => setVersion((v) => v + 1)}
            className="mt-3 border border-[#DCE6EA] bg-white px-4 py-1.5 text-xs font-semibold text-[#164652]"
          >
            Reintentar
          </button>
        </div>
      ) : cargando && !datos ? (
        <div className="space-y-6">
          <SkeletonMetricas
            columnas={4}
            etiqueta="Cargando estimaciones automáticas SIR…"
          />
          <SkeletonBloque filas={5} />
        </div>
      ) : datos ? (
        <>
          {/* Contexto operativo del albergue y parámetros de ventana */}
          <section
            aria-label="Contexto del modelo SIR"
            className="border-t-2 border-[#008994] bg-white p-5 shadow-xs"
          >
            <dl className="grid grid-cols-1 divide-y divide-[#EEF2F4] sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
              <div className="py-2 pr-4 lg:py-0">
                <dt className="text-xs text-[#53636B]">Albergue</dt>
                <dd className="mt-1 text-sm font-bold text-[#164652]">
                  {datos.albergue_nombre}
                </dd>
              </div>

              <div className="py-2 sm:pl-4 lg:px-4 lg:py-0">
                <dt className="text-xs text-[#53636B]">
                  Población base registrada
                </dt>
                <dd className="mt-1 text-base font-bold text-[#164652]">
                  {datos.poblacion_actual === null
                    ? "Sin registro"
                    : `${datos.poblacion_actual.toLocaleString("es-CO")} personas`}
                </dd>
                <p className="text-[11px] text-[#718895]">
                  Fecha fuente: {formatearFechaHora(datos.fecha_poblacion)}
                </p>
              </div>

              <div className="py-2 pr-4 lg:px-4 lg:py-0">
                <dt className="text-xs text-[#53636B]">Ventana observada</dt>
                <dd className="mt-1 text-base font-bold text-[#164652]">
                  {datos.ventana_datos_dias} días
                </dd>
                <p className="text-[11px] text-[#718895]">
                  Historial clínico evaluado
                </p>
              </div>

              <div className="py-2 sm:pl-4 lg:px-4 lg:py-0">
                <dt className="text-xs text-[#53636B]">
                  Horizonte y método numérico
                </dt>
                <dd className="mt-1 text-base font-bold text-[#164652]">
                  {datos.horizonte_dias} días · {datos.metodo_numerico}
                </dd>
                <p className="text-[11px] text-[#718895]">
                  Generado: {formatearFechaHora(datos.generado_en)}
                </p>
              </div>

              <div className="py-2 lg:py-0 lg:pl-4">
                <dt className="text-xs text-[#53636B]">
                  Enfermedades evaluadas
                </dt>
                <dd className="mt-1 text-base font-bold text-[#164652]">
                  {datos.resultados.total} en total
                </dd>
                <p className="text-[11px] text-[#718895]">
                  Mostrando {itemsPagina.length} en esta página
                </p>
              </div>
            </dl>
          </section>

          {/* Barra de filtro por nombre exacto de enfermedad y selección dentro de la página */}
          <section
            aria-label="Filtro y selección de enfermedades"
            className="flex flex-col justify-between gap-3 bg-white p-4 shadow-xs lg:flex-row lg:items-end"
          >
            <form
              onSubmit={aplicarFiltroEnfermedad}
              className="flex flex-wrap items-end gap-2.5"
            >
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#53636B]">
                  Consultar enfermedad específica en servidor
                </span>
                <div className="relative">
                  <Search
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#718895]"
                  />
                  <input
                    type="search"
                    aria-label="Filtrar por enfermedad"
                    value={entradaEnfermedad}
                    onChange={(e) => setEntradaEnfermedad(e.target.value)}
                    placeholder="Nombre de la enfermedad…"
                    maxLength={300}
                    className="h-9 w-64 border border-[#DCE6EA] bg-white pr-3 pl-8 text-xs text-[#164652] outline-none focus:border-[#008994]"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="h-9 bg-[#008994] px-3.5 text-xs font-semibold text-white transition hover:bg-[#00747E]"
              >
                Filtrar
              </button>

              {enfermedadFiltro && (
                <button
                  type="button"
                  onClick={limpiarFiltroEnfermedad}
                  className="inline-flex h-9 items-center gap-1 border border-[#DCE6EA] bg-white px-3 text-xs font-semibold text-[#164652]"
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  <span>Ver todas</span>
                </button>
              )}
            </form>

            {itemsPagina.length > 1 && (
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#53636B]">
                  Enfocar enfermedad de la página actual ({itemsPagina.length} de{" "}
                  {datos.resultados.total})
                </span>
                <select
                  aria-label="Seleccionar enfermedad de la página actual"
                  value={enfermedadSeleccionada}
                  onChange={(e) => setEnfermedadSeleccionada(e.target.value)}
                  className="h-9 border border-[#DCE6EA] bg-white px-3 text-xs font-semibold text-[#164652] outline-none focus:border-[#008994]"
                >
                  <option value="todas">
                    Mostrar las {itemsPagina.length} enfermedades de esta página
                  </option>
                  {itemsPagina.map((item) => (
                    <option key={item.enfermedad} value={item.enfermedad}>
                      {item.enfermedad} ({ETIQUETAS_ESTADO_SIR[item.estado].texto})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </section>

          {/* Estado vacío raíz cuando no hay enfermedades registradas */}
          {itemsPagina.length === 0 ? (
            <section
              aria-label="Sin enfermedades para estimar"
              className="border-t-2 border-[#D48806] bg-white p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[#D48806]"
                />
                <div>
                  <h2 className="text-base font-bold text-[#164652]">
                    No se encontraron enfermedades con registros en la ventana de{" "}
                    {datos.ventana_datos_dias} días
                  </h2>
                  <p className="mt-1 text-xs text-[#53636B]">
                    El modelo SIR se calcula automáticamente cuando existen
                    reportes recientes de población, casos activos y recuperados.
                  </p>
                </div>
              </div>

              {datos.datos_faltantes.length > 0 && (
                <div className="bg-[#FFFBEB] p-4 text-xs text-[#784900]">
                  <p className="font-bold">Datos faltantes en el albergue:</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4">
                    {datos.datos_faltantes.map((codigo) => (
                      <li key={codigo}>
                        {DESCRIPCION_FALTANTES[codigo] ?? codigo}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/albergue/poblacion"
                  className="border border-[#164652] bg-white px-4 py-2 text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
                >
                  Ir a registro de población
                </Link>
                <Link
                  href="/albergue/enfermedades"
                  className="bg-[#008994] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00747E]"
                >
                  Ir a registro de enfermedades y recuperados
                </Link>
              </div>
            </section>
          ) : (
            <section
              aria-label="Resultados por enfermedad"
              className="space-y-6"
            >
              {itemsVisibles.map((item) => (
                <TarjetaEnfermedadSIR key={item.enfermedad} item={item} />
              ))}

              <div className="bg-white shadow-xs">
                <ControlesPaginacion
                  pagina={datos.resultados}
                  etiquetaItems="enfermedades"
                  cargando={cargando}
                  onPageChange={setPage}
                  onPageSizeChange={(tam) => {
                    setPageSize(tam);
                    setPage(1);
                  }}
                  ariaLabel="Paginación de enfermedades SIR"
                />
              </div>
            </section>
          )}

          {/* Supuestos metodológicos devueltos por el backend */}
          {datos.supuestos.length > 0 && (
            <section
              aria-label="Supuestos metodológicos del modelo"
              className="bg-white p-5 text-xs text-[#53636B] shadow-xs"
            >
              <div className="flex items-center gap-2 font-bold text-[#164652]">
                <Info size={15} aria-hidden="true" className="text-[#008994]" />
                <h2>Supuestos y alcance del modelo SIR automático</h2>
              </div>
              <ul className="mt-2.5 space-y-1.5 pl-5 list-disc">
                {datos.supuestos.map((supuesto) => (
                  <li key={supuesto}>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2
                        size={12}
                        aria-hidden="true"
                        className=" hidden"
                      />
                      {supuesto}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
