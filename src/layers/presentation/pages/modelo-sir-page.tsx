"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  sirGateway,
  type EstadoSIR,
  type SIRDiseaseResult,
  type SIRGateway,
  type SIRResult,
} from "@/layers/application/services/sir-service";
import { SIRChart } from "@/layers/presentation/components/sir/sir-chart";

export interface ModeloSIRPageProps {
  readonly gateway?: SIRGateway;
}

const ETIQUETAS_ESTADO_SIR: Record<
  EstadoSIR,
  { texto: string; clase: string }
>={
  estimacion_disponible: {
    texto: "Simulación disponible",
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

function formatearDecimal(
  valor: number|null|undefined,
  maxDecimales: number
): string {
  if(valor===null||valor===undefined||!Number.isFinite(valor)) {
    return "Sin dato";
  }
  return valor.toLocaleString("es-CO",{
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimales,
  });
}

function formatearFechaHora(iso: string|null|undefined): string {
  if(!iso) return "Sin fecha registrada";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(iso));
}

function BadgeEstadoSIR({ estado }: { readonly estado: EstadoSIR }) {
  const cfg=ETIQUETAS_ESTADO_SIR[estado];
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
  const { resumen,parametros_referencia: params }=item;

  function claseEstadoEnfermedad() {
    if(item.estado==="datos_incompatibles") { return "border-[#C53030] bg-[#FDF4F4] text-[#7A1C20]"; }
    if(item.estado==="datos_insuficientes") { return "border-[#D48806] bg-[#FFFBEB] text-[#784900]"; }
    return "border-[#008994] bg-[#F4F8FA] text-[#164652]";
  }

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
            {item.proyeccion.length>0&&
              ` · Proyección: ${item.proyeccion.length} puntos (día 0 a ${item.proyeccion.at(-1)?.dia??14
              })`}
          </p>
        </div>
        <BadgeEstadoSIR estado={item.estado} />
      </div>

      {/* Mensajes de estado cuando no hay estimación o cuando no hay casos activos */}
      {item.estado!=="estimacion_disponible"&&(
        <div
          className={`space-y-3 border-l-4 p-4 text-xs ${claseEstadoEnfermedad()
            }`}
        >
          {item.motivos.length>0&&(
            <ul className="list-disc space-y-1 pl-4 font-medium">
              {item.motivos.map((motivo) => (
                <li key={motivo}>{motivo}</li>
              ))}
            </ul>
          )}

          {item.estado==="datos_insuficientes"&&(
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
      {item.estado==="estimacion_disponible"&&resumen&&(
        <dl className="grid grid-cols-1 divide-y divide-[#EEF2F4] border border-[#EEF2F4] bg-[#FAFCFD] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="p-4">
            <dt className="text-xs text-[#53636B]">
              Máximo de infectados en el horizonte
            </dt>
            <dd className="mt-1 text-xl font-bold text-[#164652]">
              ≈ {formatearDecimal(resumen.pico_infectados_en_horizonte,0)} personas
            </dd>
            <p className="mt-1 text-[11px] text-[#718895]">
              Fecha en horizonte: {resumen.fecha_pico_en_horizonte.slice(0,10)}{" "}
              (no implica pico definitivo de epidemia)
            </p>
          </div>

          <div className="p-4">
            <dt className="text-xs text-[#53636B]">
              Infectados al cierre del horizonte
            </dt>
            <dd className="mt-1 text-xl font-bold text-[#164652]">
              ≈ {formatearDecimal(resumen.infectados_finales,0)} personas
            </dd>
            <p className="mt-1 text-[11px] text-[#718895]">
              Estimación redondeada al último día proyectado
            </p>
          </div>

          <div className="p-4">
            <dt className="text-xs text-[#53636B]">
              Recuperados al cierre del horizonte
            </dt>
            <dd className="mt-1 text-xl font-bold text-[#164652]">
              ≈ {formatearDecimal(resumen.recuperados_finales,0)} personas
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
              {resumen.r_efectivo_inicial===null
                ? "No definido"
                :formatearDecimal(resumen.r_efectivo_inicial,3)}
            </dd>
            <p className="mt-1 text-[11px] text-[#718895]">
              Razón reproductiva al inicio de la proyección (no es cantidad de personas)
            </p>
          </div>
        </dl>
      )}

      {/* Gráfica S / I / R de observaciones y proyección */}
      {(item.observado.length>0||item.proyeccion.length>0)&&(
        <SIRChart
          titulo={`Trayectoria S / I / R · ${item.enfermedad}`}
          observado={item.observado}
          proyeccion={item.proyeccion}
        />
      )}

      {/* Parámetros de referencia aplicados por el servidor */}
      {params&&(
        <div className="bg-[#F8FAFB] p-4 text-xs text-[#164652]">
          <h4 className="font-bold text-[#164652]">
            Tasas de referencia de estudios de norovirus
          </h4>
          <dl className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <dt className="text-[#53636B]">Tasa de transmisión (β)</dt>
              <dd className="mt-0.5 font-bold">
                {formatearDecimal(params.beta,4)} / día
              </dd>
            </div>
            <div>
              <dt className="text-[#53636B]">Salida de la fase infecciosa (γ)</dt>
              <dd className="mt-0.5 font-bold">
                {formatearDecimal(params.gamma,4)} / día
              </dd>
            </div>
            {resumen&&(
              <div>
                <dt className="text-[#53636B]">Conservación |S+I+R−N|</dt>
                <dd className="mt-0.5 font-bold">
                  {resumen.error_maximo_poblacion.toExponential(2)}
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-2 text-[#53636B]">
            Fuentes de referencia. <a className="underline" href="https://pubmed.ncbi.nlm.nih.gov/32687043/">Estudio de brotes (2020)</a>
            {" · "}<a className="underline" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC13544057/#Tab2">Duración infecciosa (2026)</a>
          </p>
        </div>
      )}

      {/* Tabla de observaciones registradas y procedencia */}
      {item.observado.length>0&&(
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
                      {obs.fecha.slice(0,10)}
                    </td>
                    <td className="px-3 py-2">
                      {obs.poblacion===null
                        ? "Sin dato"
                        :obs.poblacion.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-2">
                      {obs.susceptibles===null
                        ? "Sin dato"
                        :obs.susceptibles.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-2 font-semibold text-[#164652]">
                      {obs.infectados.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-2">
                      {obs.recuperados===null
                        ? "Sin dato"
                        :obs.recuperados.toLocaleString("es-CO")}
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-[#718895]">
                      Caso: {obs.registro_casos_id.slice(-6)} · Pob:{" "}
                      {obs.registro_poblacion_id
                        ? obs.registro_poblacion_id.slice(-6)
                        :"Sin registro"}
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

const PESTANAS = ["Simulación", "Cómo funciona el SIR"] as const;

function GuiaSIR() {
  return (
    <div className="space-y-6 border-t-2 border-[#008994] bg-white p-5 text-sm leading-relaxed text-[#53636B] sm:p-7">
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#164652]">Qué representa el SIR</h2>
        <p>El modelo divide a la población del albergue en tres grupos y simula cómo cambian durante 14 días.</p>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div><dt className="font-bold text-[#164652]">S · Susceptibles</dt><dd>Personas que pueden infectarse. Al inicio, se calculan restando casos activos y recuperados de la población.</dd></div>
          <div><dt className="font-bold text-[#164652]">I · Infectados</dt><dd>Personas en la fase infecciosa del modelo. La corrida usa los casos activos registrados como aproximación inicial.</dd></div>
          <div><dt className="font-bold text-[#164652]">R · Recuperados</dt><dd>Personas registradas como recuperadas al inicio y quienes salen de la fase infecciosa durante la corrida.</dd></div>
        </dl>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#164652]">Tasas de referencia para el escenario de EDA</h2>
        <p><strong>Transmisión (β) · 0,275 por día.</strong> Multiplicamos 2,75, la mediana del número reproductivo básico estimado en 7.094 brotes de norovirus, por la tasa de salida del escenario. <a className="underline" href="https://pubmed.ncbi.nlm.nih.gov/32687043/">Estudio de brotes (2020)</a>.</p>
        <p><strong>Salida de la fase infecciosa (γ) · 0,100 por día.</strong> Usamos 1 dividido entre 10 días, la duración que un estudio de norovirus asignó a la fase de alta excreción viral. <a className="underline" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC13544057/#Tab2">Estudio de duración (2026)</a>.</p>
        <p>Usamos estas referencias para explorar un escenario con tasas publicadas o derivadas de estudios. La EDA puede tener distintas causas. Aquí el norovirus es un supuesto del escenario.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#164652]">Cómo leer la simulación</h2>
        <p>Al pulsar el botón, el servidor toma el último reporte de EDA y comprueba que corresponda a la población vigente. Usa esos conteos como punto de partida y mantiene fija la población durante la corrida. Si cambia la población, actualiza el reporte de EDA antes de volver a simular.</p>
        <p>Los susceptibles pasan a infectados y los infectados pasan a recuperados. Si el R efectivo inicial es menor que 1, los casos activos empiezan a bajar. Dos curvas se cruzan solo si esos grupos alcanzan el mismo tamaño durante los 14 días.</p>
        <p>Los puntos históricos son observaciones. Las líneas discontinuas muestran el escenario calculado con RK4. Los conteos proyectados se muestran redondeados a personas enteras y la curva conserva la precisión del cálculo.</p>
      </section>
    </div>
  );
}

export default function ModeloSIRPage({ gateway = sirGateway }: ModeloSIRPageProps = {}) {
  const id = useId();
  const [pestana, setPestana] = useState(0);
  const [resultado, setResultado] = useState<SIRResult | null>(null);
  const [ultimaCorrida, setUltimaCorrida] = useState<SIRResult | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function simular() {
    if (cargando || !gateway.simular) return;
    setCargando(true);
    setError("");
    try {
      const respuesta = await gateway.simular({ enfermedad: "Enfermedad diarreica aguda" });
      setResultado(respuesta);
      if (respuesta.resultados.items[0]?.proyeccion.length) setUltimaCorrida(respuesta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible generar la simulación.");
    } finally {
      setCargando(false);
    }
  }

  const item = resultado?.resultados.items[0];
  const corrida = ultimaCorrida?.resultados.items[0];
  const reporte = corrida?.observado.at(-1);

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-[#164652]">
      <header className="flex flex-col gap-4 border-b border-[#DCE6EA] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">EDA · Simulación SIR</h1>
          <p className="mt-1 max-w-xl text-sm text-[#53636B]">
            Escenario ilustrativo de enfermedad diarreica aguda. Usa el último reporte como punto de partida y mantiene fija la población durante la corrida.
          </p>
        </div>
      </header>

      <div role="tablist" aria-label="Laboratorio SIR" className="flex flex-wrap gap-2 border-b border-[#DCE6EA]">
        {PESTANAS.map((nombre, indice) => (
          <button key={nombre} type="button" role="tab" id={`${id}-tab-${indice}`}
            aria-controls={`${id}-panel-${indice}`} aria-selected={pestana === indice}
            tabIndex={pestana === indice ? 0 : -1} onClick={() => setPestana(indice)}
            onKeyDown={(evento) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(evento.key)) return;
              evento.preventDefault();
              const siguiente = evento.key === "Home" ? 0 : evento.key === "End" ? 1 : 1 - indice;
              setPestana(siguiente);
              document.getElementById(`${id}-tab-${siguiente}`)?.focus();
            }}
            className="border-b-2 border-transparent px-3 py-2 text-sm font-semibold aria-selected:border-[#008994] aria-selected:bg-[#E6F9FA]">
            {nombre}
          </button>
        ))}
      </div>

      <section role="tabpanel" id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`}
        hidden={pestana !== 0} className="space-y-6">
        <button type="button" disabled={cargando} onClick={simular}
          className="bg-[#00747E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          <RefreshCw size={16} aria-hidden="true" className="mr-2 inline" />
          Simular 14 días
        </button>

        {cargando && <p role="status">Consultando registros y simulando…</p>}
        {error && <p role="alert" className="text-[#B02A30]">{error}</p>}
        {resultado && !item && (
          <p role="status">
            No hay reportes recientes de EDA.{" "}
            <Link className="underline" href="/albergue/enfermedades">Ir al registro de enfermedades</Link>
          </p>
        )}
        {item && !item.proyeccion.length && <TarjetaEnfermedadSIR item={item} />}
        {ultimaCorrida && corrida && (
          <>
            <section aria-label="Datos de la corrida" className="bg-white p-4 text-sm">
              <p>Última simulación · {formatearFechaHora(ultimaCorrida.generado_en)}</p>
              <p>Reporte de EDA de la corrida · {reporte?.fecha}</p>
              <p>Población de la corrida · {reporte?.poblacion}</p>
            </section>
            <TarjetaEnfermedadSIR key={ultimaCorrida.generado_en} item={corrida} />
          </>
        )}
      </section>
      <section role="tabpanel" id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`}
        hidden={pestana !== 1} tabIndex={0}>
        <GuiaSIR />
      </section>
    </div>
  );
}
