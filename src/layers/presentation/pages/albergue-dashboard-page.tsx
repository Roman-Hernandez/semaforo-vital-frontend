"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";
import {
  miAlbergueGateway,
  type DashboardAlbergue,
  type MiAlbergueGateway,
} from "@/layers/application/services/mi-albergue-service";
import { SkeletonBloque, SkeletonMetricas } from "@/components/shared/Skeleton";

interface AlbergueDashboardProps {
  readonly gateway?: MiAlbergueGateway;
}

function indicadorNivel(nivel?: string | null) {
  const n = (nivel ?? "").toLowerCase();
  if (n === "verde") return { color: "text-[#168052]", punto: "bg-[#168052]" };
  if (n === "amarillo") return { color: "text-[#A96A00]", punto: "bg-[#D69B20]" };
  if (n === "rojo") return { color: "text-[#C53030]", punto: "bg-[#C53030]" };
  return { color: "text-[#53636B]", punto: "bg-[#829198]" };
}

export default function AlbergueDashboardPage({
  gateway = miAlbergueGateway,
}: AlbergueDashboardProps = {}) {
  const [datos, setDatos] = useState<DashboardAlbergue | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    gateway
      .consultarDashboard()
      .then((res) => {
        if (!vigente) return;
        setDatos(res);
        setError("");
        setCargando(false);
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar el resumen del albergue."
        );
        setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [gateway, intento]);

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-xl border border-[#F5C9CB] bg-white p-6 text-center"
      >
        <p className="text-sm font-semibold text-[#C53030]">{error}</p>
        <button
          type="button"
          onClick={() => {
            setCargando(true);
            setIntento((n) => n + 1);
          }}
          className="mt-4 rounded-lg border border-[#DCE6EA] bg-white px-4 py-2 text-xs font-semibold text-[#164652]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (cargando || !datos) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <SkeletonMetricas columnas={4} etiqueta="Cargando resumen operativo del albergue…" />
        <SkeletonBloque filas={4} />
      </div>
    );
  }

  const ocupacion =
    datos.porcentajeOcupacion !== null ? Math.round(datos.porcentajeOcupacion) : 0;
  const estiloSemaforo = indicadorNivel(datos.semaforoVital?.nivel);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#164652]">Panel del albergue</h1>
          <p className="mt-1 text-sm text-[#53636B]">
            {datos.albergue.nombre} ({datos.albergue.codigo}) ·{" "}
            {datos.albergue.municipio}, {datos.albergue.departamento}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCargando(true);
              setIntento((n) => n + 1);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[#DCE6EA] bg-white px-3 py-2 text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Actualizar
          </button>

          <Link
            href="/albergue/intervenciones"
            className="inline-flex items-center gap-2 rounded-lg bg-[#008994] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00747E]"
          >
            <ClipboardCheck size={14} aria-hidden="true" />
            Registrar intervención
          </Link>
        </div>
      </header>

      {/* Barra unificada de 4 indicadores (una sola superficie con divisores) */}
      <section
        aria-label="Indicadores principales del albergue"
        className="rounded-xl border border-[#DCE6EA] bg-white p-5"
      >
        <dl className="grid grid-cols-1 divide-y divide-[#EEF2F4] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="py-3 pr-4 first:pt-0 lg:py-0">
            <dt className="text-xs text-[#53636B]">Población actual</dt>
            <dd className="mt-1 text-2xl font-bold text-[#164652]">
              {datos.poblacionActual ?? "Sin registro"}
            </dd>
            <p className="mt-1 text-xs text-[#718895]">
              Capacidad: {datos.albergue.capacidadInstalada} plazas
            </p>
          </div>

          <div className="py-3 sm:pl-4 lg:px-4 lg:py-0">
            <dt className="text-xs text-[#53636B]">Ocupación</dt>
            <dd className="mt-1 text-2xl font-bold text-[#164652]">
              {datos.porcentajeOcupacion !== null ? `${ocupacion}%` : "Sin dato"}
            </dd>
            <p className="mt-1 text-xs text-[#718895]">
              Cupos libres: {datos.cuposDisponibles ?? "—"}
            </p>
          </div>

          <div className="py-3 pr-4 lg:px-4 lg:py-0">
            <dt className="text-xs text-[#53636B]">Semáforo Vital</dt>
            <dd className={`mt-1 flex items-center gap-2 text-xl font-bold ${estiloSemaforo.color}`}>
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${estiloSemaforo.punto}`} />
              <span>
                {datos.semaforoVital?.descripcion ??
                  datos.semaforoVital?.nivel ??
                  "Sin evaluar"}
              </span>
            </dd>
            <p className="mt-1 text-xs text-[#718895]">
              Nivel: {datos.semaforoVital?.nivel ?? "No calculado"}
            </p>
          </div>

          <div className="py-3 last:pb-0 sm:pl-4 lg:py-0 lg:pl-4">
            <dt className="text-xs text-[#53636B]">Alertas registradas</dt>
            <dd className="mt-1 text-2xl font-bold text-[#164652]">{datos.alertas.cantidad}</dd>
            <p className="mt-1 text-xs text-[#718895]">
              Rojo: {datos.alertas.porNivelRiesgo.rojo} · Amarillo:{" "}
              {datos.alertas.porNivelRiesgo.amarillo} · Verde:{" "}
              {datos.alertas.porNivelRiesgo.verde}
            </p>
          </div>
        </dl>
      </section>

      {/* Condición sanitaria y casos de enfermedades (2 columnas de igual altura) */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
        <section className="flex h-full flex-col justify-between rounded-xl border border-[#DCE6EA] bg-white p-5">
          <div>
            <div className="flex items-center justify-between border-b border-[#EEF2F4] pb-3">
              <h2 className="text-base font-bold text-[#164652]">
                Condición sanitaria vigente
              </h2>
              <Link
                href="/albergue/condiciones-sanitarias"
                className="text-xs font-semibold text-[#008994] hover:underline"
              >
                Gestionar
              </Link>
            </div>

            {datos.condicionesSanitarias ? (
              <dl className="mt-3 divide-y divide-[#EEF2F4] text-xs">
                <div className="flex justify-between py-2.5">
                  <dt className="text-[#53636B]">Agua potable</dt>
                  <dd className="font-semibold text-[#164652]">
                    {datos.condicionesSanitarias.aguaPotableDisponible
                      ? "Disponible"
                      : "No disponible"}
                  </dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-[#53636B]">Baños habilitados</dt>
                  <dd className="font-semibold text-[#164652]">
                    {datos.condicionesSanitarias.banosDisponibles}
                  </dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-[#53636B]">Estado de higiene</dt>
                  <dd className="font-semibold text-[#164652]">
                    {datos.condicionesSanitarias.estadoHigiene}
                  </dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-[#53636B]">Estado de saneamiento</dt>
                  <dd className="font-semibold text-[#164652]">
                    {datos.condicionesSanitarias.estadoSaneamiento}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-xs text-[#53636B]">
                Aún no se han registrado condiciones sanitarias para este albergue.
              </p>
            )}
          </div>
        </section>

        <section className="flex h-full flex-col justify-between rounded-xl border border-[#DCE6EA] bg-white p-5">
          <div>
            <div className="flex items-center justify-between border-b border-[#EEF2F4] pb-3">
              <h2 className="text-base font-bold text-[#164652]">
                Vigilancia de enfermedades
              </h2>
              <Link
                href="/albergue/enfermedades"
                className="text-xs font-semibold text-[#008994] hover:underline"
              >
                Gestionar
              </Link>
            </div>

            {datos.resumenCasos.length > 0 ? (
              <ul className="mt-3 divide-y divide-[#EEF2F4] text-xs">
                {datos.resumenCasos.map((caso) => (
                  <li
                    key={`${caso.enfermedad}-${caso.fecha}`}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div>
                      <p className="font-semibold text-[#164652]">{caso.enfermedad}</p>
                      <p className="text-[#718895]">{caso.fecha}</p>
                    </div>
                    <span className="font-bold text-[#164652]">
                      {caso.cantidadCasosActivos} casos activos
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-[#53636B]">
                No hay casos de enfermedades registrados actualmente.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Análisis estadístico y Proyecciones SIR (2 columnas de igual altura) */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
        <section className="flex h-full flex-col justify-between rounded-xl border border-[#DCE6EA] bg-white p-5">
          <div>
            <h2 className="border-b border-[#EEF2F4] pb-3 text-base font-bold text-[#164652]">
              Análisis estadístico de riesgo
            </h2>

            {datos.analisisIa ? (
              <dl className="mt-3 divide-y divide-[#EEF2F4] text-xs">
                <div className="flex justify-between py-2.5">
                  <dt className="text-[#53636B]">Probabilidad estimada</dt>
                  <dd className="font-bold text-[#164652]">
                    {Math.round(datos.analisisIa.probabilidadRiesgo * 100)}%
                  </dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-[#53636B]">Modelo ejecutado</dt>
                  <dd className="font-semibold text-[#164652]">
                    {datos.analisisIa.modeloNombre} (v{datos.analisisIa.modeloVersion})
                  </dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-[#53636B]">Registros evaluados</dt>
                  <dd className="font-semibold text-[#164652]">
                    {datos.analisisIa.registrosConsiderados}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-xs text-[#53636B]">
                No hay ejecuciones recientes del modelo de regresión para este albergue.
              </p>
            )}
          </div>
        </section>

        <section className="flex h-full flex-col justify-between rounded-xl border border-[#DCE6EA] bg-white p-5">
          <div>
            <div className="flex items-center justify-between border-b border-[#EEF2F4] pb-3">
              <h2 className="text-base font-bold text-[#164652]">
                Proyecciones epidemiológicas SIR
              </h2>
              <Link
                href="/albergue/modelo-sir"
                className="text-xs font-semibold text-[#008994] hover:underline"
              >
                Abrir laboratorio SIR
              </Link>
            </div>

            {datos.predicciones.length > 0 ? (
              <ul className="mt-3 divide-y divide-[#EEF2F4] text-xs">
                {datos.predicciones.map((pred) => (
                  <li key={pred.simulacionId} className="py-2.5">
                    <div className="flex items-center justify-between font-bold text-[#164652]">
                      <span>{pred.enfermedad}</span>
                      <span>Horizonte: {pred.diaFin} días</span>
                    </div>
                    <p className="mt-1 text-[#53636B]">
                      Pico estimado: {pred.picoInfectados} infectados (día {pred.picoDia}) ·
                      Recuperados al cierre: {pred.finalRecuperados}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-[#53636B]">
                No existen simulaciones SIR registradas para este albergue.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Últimas intervenciones */}
      <section className="rounded-xl border border-[#DCE6EA] bg-white p-5">
        <div className="flex items-center justify-between border-b border-[#EEF2F4] pb-3">
          <h2 className="text-base font-bold text-[#164652]">Últimas intervenciones</h2>
          <Link
            href="/albergue/intervenciones"
            className="text-xs font-semibold text-[#008994] hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {datos.intervenciones.length > 0 ? (
          <ul className="mt-3 divide-y divide-[#EEF2F4] text-xs">
            {datos.intervenciones.map((int) => (
              <li key={int.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold text-[#164652]">{int.tipo}</p>
                  <p className="mt-0.5 text-[#53636B]">{int.descripcion}</p>
                </div>
                <span className="shrink-0 text-[#718895]">{int.fecha}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-[#53636B]">
            Aún no hay intervenciones registradas en este albergue.
          </p>
        )}
      </section>
    </div>
  );
}
