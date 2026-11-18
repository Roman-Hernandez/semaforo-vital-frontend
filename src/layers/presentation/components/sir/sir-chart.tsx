"use client";

import { useId, useState } from "react";
import type {
  SIRObservation,
  SIRProjectedDay,
} from "@/layers/application/services/sir-service";

export interface SIRChartProps {
  readonly titulo: string;
  readonly observado: readonly SIRObservation[];
  readonly proyeccion: readonly SIRProjectedDay[];
}

type Variable = "susceptibles" | "infectados" | "recuperados";
type ValorSIR = Pick<SIRObservation, Variable>;
interface PuntoFecha {
  readonly fecha: string;
  readonly observado?: SIRObservation;
  readonly proyectado?: SIRProjectedDay;
}
interface PuntoSerie {
  readonly x: number;
  readonly y: number;
  readonly fecha: string;
  readonly valor: number;
}

const SERIES = [
  { clave: "susceptibles", nombre: "Susceptibles (S)", color: "#1d4ed8" },
  { clave: "infectados", nombre: "Infectados activos (I)", color: "#c53030" },
  { clave: "recuperados", nombre: "Recuperados (R)", color: "#15803d" },
] as const;
const DIA_MS = 86_400_000;
const fechaEnMs = (fecha: string) => Date.parse(`${fecha.slice(0, 10)}T00:00:00Z`);

function formatearNumero(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) return "Sin dato";
  return valor.toLocaleString("es-CO", { maximumFractionDigits: 2 });
}

function fechaCorta(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio.slice(2)}`;
}

function combinarFechas(observado: readonly SIRObservation[], proyeccion: readonly SIRProjectedDay[]): PuntoFecha[] {
  const fechas = new Map<string, PuntoFecha>();
  for (const dato of observado) {
    const fecha = dato.fecha.slice(0, 10);
    fechas.set(fecha, { ...fechas.get(fecha), fecha, observado: dato });
  }
  for (const dato of proyeccion) {
    const fecha = dato.fecha.slice(0, 10);
    fechas.set(fecha, { ...fechas.get(fecha), fecha, proyectado: dato });
  }
  return [...fechas.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function construirSerie(datos: readonly PuntoFecha[], fuente: "observado" | "proyectado", variable: Variable,
  x: (fecha: string) => number, y: (valor: number) => number) {
  let trazado = "";
  let continuar = false;
  const puntos: PuntoSerie[] = [];
  for (const dato of datos) {
    const valor = dato[fuente]?.[variable];
    if (valor == null || !Number.isFinite(valor)) {
      continuar = false;
      continue;
    }
    const punto = { x: x(dato.fecha), y: y(valor), fecha: dato.fecha, valor };
    trazado += `${continuar ? "L" : "M"}${punto.x},${punto.y} `;
    puntos.push(punto);
    continuar = true;
  }
  return { trazado: trazado.trim(), puntos };
}

function DetalleValores({ etiqueta, valores }: { readonly etiqueta: string; readonly valores: ValorSIR }) {
  return <span><strong>{etiqueta}</strong> — S: {formatearNumero(valores.susceptibles)} · I: {formatearNumero(valores.infectados)} · R: {formatearNumero(valores.recuperados)}</span>;
}

export function SIRChart({ titulo, observado, proyeccion }: SIRChartProps) {
  const id = useId();
  const [soloInfectados, setSoloInfectados] = useState(false);
  const [fechaActiva, setFechaActiva] = useState<string | null>(null);
  const fechas = combinarFechas(observado, proyeccion);
  if (!fechas.length) return null;

  const primeraFecha = fechas[0].fecha;
  const ultimaFecha = fechas.at(-1)!.fecha;
  const dias = Math.max(1, (fechaEnMs(ultimaFecha) - fechaEnMs(primeraFecha)) / DIA_MS);
  const x = (fecha: string) => 70 + ((fechaEnMs(fecha) - fechaEnMs(primeraFecha)) / DIA_MS / dias) * 650;
  const visibles = SERIES.filter((serie) => !soloInfectados || serie.clave === "infectados");
  const valores = fechas.flatMap((punto) => visibles.flatMap(({ clave }) => [punto.observado?.[clave], punto.proyectado?.[clave]]))
    .filter((valor): valor is number => valor != null && Number.isFinite(valor));
  const maximo = Math.max(1, ...valores);
  const pasoEje = Math.max(1, Math.ceil(maximo / 4));
  const techo = pasoEje * 4;
  const y = (valor: number) => 230 - (valor / techo) * 195;
  const inicioProyeccion = fechas.find((punto) => punto.proyectado)?.fecha;
  const seleccion = fechas.find((punto) => punto.fecha === fechaActiva)
    ?? fechas.findLast((punto) => punto.observado) ?? fechas[0];
  const etiquetas = fechas.filter((_, indice) => indice % Math.max(1, Math.ceil((fechas.length - 1) / 4)) === 0 || indice === fechas.length - 1);

  return (
    <figure aria-labelledby={`${id}-titulo`} className="border-t-2 border-[#008994] bg-white p-4 shadow-xs sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <figcaption id={`${id}-titulo`} className="text-sm font-bold text-[#164652]">{titulo}</figcaption>
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">Series visibles</legend>
          <button type="button" aria-pressed={!soloInfectados} onClick={() => setSoloInfectados(false)}
            className="border border-[#DCE6EA] px-3 py-1.5 text-xs font-semibold text-[#164652] aria-pressed:bg-[#E6F9FA] focus-visible:outline-2 focus-visible:outline-[#008994]">Todas las series</button>
          <button type="button" aria-pressed={soloInfectados} onClick={() => setSoloInfectados(true)}
            className="border border-[#DCE6EA] px-3 py-1.5 text-xs font-semibold text-[#164652] aria-pressed:bg-[#E6F9FA] focus-visible:outline-2 focus-visible:outline-[#008994]">Solo infectados</button>
        </fieldset>
      </div>
      <p className="text-xs text-[#53636B]">Línea continua y puntos: observado. Línea discontinua y fondo sombreado: proyección RK4.</p>
      <p className="mt-1 text-xs text-[#53636B]">La distancia entre fechas representa días reales. Los datos desconocidos interrumpen la línea.</p>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox="0 0 760 285" role="img" aria-labelledby={`${id}-titulo ${id}-descripcion`}
          className="h-auto w-full min-w-[620px] select-none">
          <title>{titulo}</title>
          <desc id={`${id}-descripcion`}>Eje horizontal: fechas. Eje vertical: personas. Use el selector de fecha para consultar los valores observados y estimados.</desc>
          {inicioProyeccion && <rect x={x(inicioProyeccion)} y="28" width={720 - x(inicioProyeccion)} height="202" fill="#E6F9FA" opacity="0.65" />}
          {[0, 1, 2, 3, 4].map((indice) => <g key={indice}>
            <line x1="70" y1={y(pasoEje * indice)} x2="720" y2={y(pasoEje * indice)} stroke="#DCE6EA" />
            <text x="62" y={y(pasoEje * indice) + 4} textAnchor="end" fontSize="11" fill="#53636B">{formatearNumero(pasoEje * indice)}</text>
          </g>)}
          <text x="70" y="16" fontSize="11" fill="#53636B">Personas</text>
          {inicioProyeccion && <g>
            <line x1={x(inicioProyeccion)} y1="28" x2={x(inicioProyeccion)} y2="230" stroke="#008994" strokeDasharray="4 4" />
            <text x={Math.min(714, x(inicioProyeccion) + 6)} y="24" textAnchor={x(inicioProyeccion) > 500 ? "end" : "start"} fontSize="10" fill="#047270">Inicio proyección ({fechaCorta(inicioProyeccion)})</text>
          </g>}
          {etiquetas.map((punto) => <text key={punto.fecha} x={x(punto.fecha)} y="252" textAnchor="middle" fontSize="11" fill="#53636B">{fechaCorta(punto.fecha)}</text>)}
          <text x="395" y="274" textAnchor="middle" fontSize="11" fill="#53636B">Fecha · observado y horizonte proyectado</text>
          {visibles.map((serie) => {
            const obs = construirSerie(fechas, "observado", serie.clave, x, y);
            const proy = construirSerie(fechas, "proyectado", serie.clave, x, y);
            return <g key={serie.clave} data-serie={serie.clave}>
              <path data-fuente="observado" d={obs.trazado} fill="none" stroke={serie.color} strokeWidth="2.5" />
              {obs.puntos.map((punto) => <circle key={punto.fecha} cx={punto.x} cy={punto.y} r="3.5" fill={serie.color} stroke="white" strokeWidth="1.2">
                <title>{`${serie.nombre} · ${punto.fecha}: ${formatearNumero(punto.valor)} observado`}</title>
              </circle>)}
              <path data-fuente="proyectado" d={proy.trazado} fill="none" stroke={serie.color} strokeWidth="2.5" strokeDasharray="6 4" />
              {proy.puntos.length === 1 && <circle cx={proy.puntos[0].x} cy={proy.puntos[0].y} r="3.5" fill={serie.color} />}
            </g>;
          })}
          <line x1={x(seleccion.fecha)} x2={x(seleccion.fecha)} y1="28" y2="230" stroke="#718895" strokeDasharray="2 5" />
          {fechas.map((punto) => <rect key={punto.fecha} x={Math.max(70, x(punto.fecha) - 6)} y="28" width="12" height="202" fill="transparent" onMouseEnter={() => setFechaActiva(punto.fecha)} />)}
        </svg>
      </div>
      <p className="mt-1 text-xs text-[#53636B] sm:hidden">Desliza horizontalmente para ver toda la gráfica.</p>
      <ul className="mt-3 flex flex-wrap gap-4 border-t border-[#EEF2F4] pt-3 text-xs text-[#375257]">
        {visibles.map((serie) => <li key={serie.clave} className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-1 w-5" style={{ backgroundColor: serie.color }} />{serie.nombre}
        </li>)}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#164652]">
        <label htmlFor={`${id}-fecha`} className="font-semibold">Fecha para inspeccionar</label>
        <select id={`${id}-fecha`} value={seleccion.fecha} onChange={(event) => setFechaActiva(event.target.value)} className="border border-[#DCE6EA] bg-white px-2 py-1.5 focus-visible:outline-2 focus-visible:outline-[#008994]">
          {fechas.map((punto) => <option key={punto.fecha} value={punto.fecha}>{punto.fecha}</option>)}
        </select>
      </div>
      <div aria-live="polite" className="mt-2 flex flex-wrap gap-3 bg-[#F4F8FA] px-3 py-2 text-xs text-[#164652]">
        <strong>Fecha: {seleccion.fecha}</strong>
        {seleccion.observado && <DetalleValores etiqueta="Observado" valores={seleccion.observado} />}
        {seleccion.proyectado && <DetalleValores etiqueta={`Proyección (día ${seleccion.proyectado.dia})`} valores={seleccion.proyectado} />}
      </div>
      {!inicioProyeccion && <p className="mt-2 text-xs text-[#784900]">Solo hay observaciones disponibles; no se ha generado una proyección para esta serie.</p>}
    </figure>
  );
}
