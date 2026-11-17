"use client";

import { useState } from "react";
import type {
  SIRObservation,
  SIRProjectedDay,
} from "@/layers/application/services/sir-service";

export interface SIRChartProps {
  readonly titulo: string;
  readonly observado: readonly SIRObservation[];
  readonly proyeccion: readonly SIRProjectedDay[];
}

interface PuntoFecha {
  readonly fecha: string;
  readonly indice: number;
  readonly obs?: SIRObservation;
  readonly proy?: SIRProjectedDay;
}

const COLORES={
  susceptibles: "#1d4ed8",
  infectados: "#c53030",
  recuperados: "#15803d",
} as const;

function formatearNumero(valor: number|null|undefined): string {
  if(valor===null||valor===undefined||!Number.isFinite(valor)) {
    return "Sin dato";
  }
  return valor.toLocaleString("es-CO",{ maximumFractionDigits: 2 });
}

function formatearFechaCorta(iso: string): string {
  const limpia=iso.slice(0,10);
  const partes=limpia.split("-");
  if(partes.length!==3) return limpia;
  return `${partes[2]}/${partes[1]}`;
}

export function SIRChart({ titulo,observado,proyeccion }: SIRChartProps) {
  const [indiceActivo,setIndiceActivo]=useState<number|null>(null);

  // Construye el eje de fechas únicamente con las fechas entregadas por el API
  const mapaFechas=new Map<
    string,
    { obs?: SIRObservation; proy?: SIRProjectedDay }
  >();

  for(const o of observado) {
    const f=o.fecha.slice(0,10);
    mapaFechas.set(f,{ ...mapaFechas.get(f),obs: o });
  }
  for(const p of proyeccion) {
    const f=p.fecha.slice(0,10);
    mapaFechas.set(f,{ ...mapaFechas.get(f),proy: p });
  }

  const fechasOrdenadas=Array.from(mapaFechas.keys()).sort((a,b) =>
    a.localeCompare(b)
  );

  const puntosEje: PuntoFecha[]=fechasOrdenadas.map((fecha,indice) => ({
    fecha,
    indice,
    ...mapaFechas.get(fecha),
  }));

  if(puntosEje.length===0) {
    return null;
  }

  const valoresNumericos: number[]=[];
  for(const o of observado) {
    valoresNumericos.push(o.infectados);
    if(o.susceptibles!==null) valoresNumericos.push(o.susceptibles);
    if(o.recuperados!==null) valoresNumericos.push(o.recuperados);
  }
  for(const p of proyeccion) {
    valoresNumericos.push(p.susceptibles,p.infectados,p.recuperados);
  }

  const maximo=Math.max(1,...valoresNumericos);
  const totalPasos=Math.max(1,puntosEje.length-1);

  const x=(indice: number) => 70+(indice/totalPasos)*650;
  const y=(valor: number) => 230-(valor/maximo)*195;

  const indicePorFecha=new Map<string,number>();
  puntosEje.forEach((p) => indicePorFecha.set(p.fecha,p.indice));

  function construirPuntosObs(
    selector: (o: SIRObservation) => number|null
  ): { x: number; y: number; fecha: string; valor: number }[] {
    const lista: { x: number; y: number; fecha: string; valor: number }[]=[];
    for(const o of observado) {
      const val=selector(o);
      const idx=indicePorFecha.get(o.fecha.slice(0,10));
      if(val!==null&&Number.isFinite(val)&&idx!==undefined) {
        lista.push({
          x: x(idx),
          y: y(val),
          fecha: o.fecha.slice(0,10),
          valor: val,
        });
      }
    }
    return lista;
  }

  function construirPuntosProy(
    selector: (p: SIRProjectedDay) => number
  ): { x: number; y: number; fecha: string; valor: number }[] {
    const lista: { x: number; y: number; fecha: string; valor: number }[]=[];
    for(const p of proyeccion) {
      const val=selector(p);
      const idx=indicePorFecha.get(p.fecha.slice(0,10));
      if(Number.isFinite(val)&&idx!==undefined) {
        lista.push({
          x: x(idx),
          y: y(val),
          fecha: p.fecha.slice(0,10),
          valor: val,
        });
      }
    }
    return lista;
  }

  const obsS=construirPuntosObs((o) => o.susceptibles);
  const obsI=construirPuntosObs((o) => o.infectados);
  const obsR=construirPuntosObs((o) => o.recuperados);

  const proyS=construirPuntosProy((p) => p.susceptibles);
  const proyI=construirPuntosProy((p) => p.infectados);
  const proyR=construirPuntosProy((p) => p.recuperados);

  const fechaInicioProy=proyeccion[0]?.fecha.slice(0,10);
  const idxInicioProy=fechaInicioProy
    ? indicePorFecha.get(fechaInicioProy)
    :undefined;

  const etiquetasX=
    puntosEje.length<=6
      ? puntosEje
      :[
        puntosEje[0],
        puntosEje[Math.floor(puntosEje.length*0.25)],
        puntosEje[Math.floor(puntosEje.length*0.5)],
        puntosEje[Math.floor(puntosEje.length*0.75)],
        puntosEje.at(-1)!,
      ];

  const puntoSeleccionado=
    indiceActivo!==null? puntosEje[indiceActivo]??null:null;

  return (
    <figure className="border-t-2 border-[#008994] bg-white p-5 shadow-xs">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-sm font-bold text-[#164652]">
          {titulo}
        </figcaption>
        <span className="text-xs text-[#53636B]">
          Línea continua: observado · Línea punteada: proyección RK4
        </span>
      </div>

      <svg
        viewBox="0 0 760 285"
        role="img"
        aria-label={titulo}
        className="h-auto w-full select-none"
      >
        <title>
          {titulo}. Eje horizontal: fechas del registro y proyección. Eje
          vertical: personas.
        </title>

        {/* Líneas guía horizontales */}
        {[0,0.25,0.5,0.75,1].map((fraccion) => (
          <g key={fraccion}>
            <line
              x1="70"
              y1={y(maximo*fraccion)}
              x2="720"
              y2={y(maximo*fraccion)}
              stroke="#E6EEF0"
            />
            <text
              x="62"
              y={y(maximo*fraccion)+4}
              textAnchor="end"
              fontSize="11"
              fill="#53636B"
            >
              {Math.round(maximo*fraccion).toLocaleString("es-CO")}
            </text>
          </g>
        ))}

        {/* Línea divisoria de inicio de proyección */}
        {idxInicioProy!==undefined&&proyeccion.length>0&&(
          <g>
            <line
              x1={x(idxInicioProy)}
              y1="28"
              x2={x(idxInicioProy)}
              y2="230"
              stroke="#008994"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={x(idxInicioProy)+6}
              y="24"
              fontSize="10"
              fontWeight="600"
              fill="#008994"
            >
              Inicio proyección ({formatearFechaCorta(fechaInicioProy!)})
            </text>
          </g>
        )}

        {/* Etiquetas de fechas en eje X */}
        {etiquetasX.map((pt) => (
          <text
            key={pt.fecha}
            x={x(pt.indice)}
            y="252"
            textAnchor="middle"
            fontSize="11"
            fill="#53636B"
          >
            {formatearFechaCorta(pt.fecha)}
          </text>
        ))}

        <text
          x="395"
          y="274"
          textAnchor="middle"
          fontSize="11"
          fill="#53636B"
        >
          Fecha (observado y horizonte proyectado)
        </text>

        {/* Series Observadas (línea continua + puntos) */}
        {[
          { clave: "obs-s",puntos: obsS,color: COLORES.susceptibles },
          { clave: "obs-i",puntos: obsI,color: COLORES.infectados },
          { clave: "obs-r",puntos: obsR,color: COLORES.recuperados },
        ].map(
          ({ clave,puntos,color }) =>
            puntos.length>0&&(
              <g key={clave}>
                {puntos.length>1&&(
                  <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    points={puntos.map((p) => `${p.x},${p.y}`).join(" ")}
                  />
                )}
                {puntos.map((p) => (
                  <circle
                    key={`${clave}-${p.fecha}`}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                ))}
              </g>
            )
        )}

        {/* Series Proyectadas (línea discontinua) */}
        {[
          { clave: "proy-s",puntos: proyS,color: COLORES.susceptibles },
          { clave: "proy-i",puntos: proyI,color: COLORES.infectados },
          { clave: "proy-r",puntos: proyR,color: COLORES.recuperados },
        ].map(
          ({ clave,puntos,color }) =>
            puntos.length>1&&(
              <polyline
                key={clave}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeDasharray="6 4"
                points={puntos.map((p) => `${p.x},${p.y}`).join(" ")}
              />
            )
        )}

        {/* Franjas interactivas para inspección por fecha */}
        {puntosEje.map((pt) => {
          const ancho=Math.max(12,650/Math.max(1,puntosEje.length));
          return (
            <rect
              key={`hit-${pt.fecha}`}
              x={x(pt.indice)-ancho/2}
              y="25"
              width={ancho}
              height="210"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setIndiceActivo(pt.indice)}
              onClick={() => setIndiceActivo(pt.indice)}
            />
          );
        })}
      </svg>

      {/* Tooltip / Detalle de fecha seleccionada */}
      {puntoSeleccionado&&(
        <div
          aria-live="polite"
          className="mt-2 flex flex-wrap items-center gap-4 bg-[#F4F8FA] px-3.5 py-2 text-xs text-[#164652]"
        >
          <strong className="font-bold">
            Fecha: {puntoSeleccionado.fecha}
          </strong>
          {puntoSeleccionado.obs&&(
            <span>
              <strong>Observado</strong> — S:{" "}
              {formatearNumero(puntoSeleccionado.obs.susceptibles)} · I:{" "}
              {formatearNumero(puntoSeleccionado.obs.infectados)} · R:{" "}
              {formatearNumero(puntoSeleccionado.obs.recuperados)}
            </span>
          )}
          {puntoSeleccionado.proy&&(
            <span>
              <strong>Proyección (día {puntoSeleccionado.proy.dia})</strong> —
              S: {formatearNumero(puntoSeleccionado.proy.susceptibles)} · I:{" "}
              {formatearNumero(puntoSeleccionado.proy.infectados)} · R:{" "}
              {formatearNumero(puntoSeleccionado.proy.recuperados)}
            </span>
          )}
        </div>
      )}

      {/* Leyenda accesible */}
      <ul className="mt-3 flex flex-wrap gap-5 border-t border-[#EEF2F4] pt-3 text-xs text-[#375257]">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1 w-5"
            style={{ backgroundColor: COLORES.susceptibles }}
          />
          <span>Susceptibles (S) — observado</span>
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1 w-5"
            style={{ backgroundColor: COLORES.infectados }}
          />
          <span>Infectados activos (I) — observado</span>
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1 w-5"
            style={{ backgroundColor: COLORES.recuperados }}
          />
          <span>Recuperados (R) — observado</span>
        </li>
        {proyeccion.length>0&&(
          <li className="flex items-center gap-2 font-medium text-[#164652]">
            <span
              aria-hidden="true"
              className="inline-block w-5 border-t-2 border-dashed border-[#164652]"
            />
            <span>Proyección RK4 (S, I, R discontinuas)</span>
          </li>
        )}
      </ul>
    </figure>
  );
}
