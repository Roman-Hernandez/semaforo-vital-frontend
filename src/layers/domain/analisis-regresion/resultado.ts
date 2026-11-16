export type Clasificacion = "contagiado" | "no_contagiado";

export interface ModeloRegresion {
  readonly nombre: string;
  readonly version: string;
}

export interface ResultadoRegresion {
  readonly id: string;
  /** Identificador del registro individual analizado (sin datos personales). */
  readonly registro: string;
  readonly clasificacion: Clasificacion;
  /** Probabilidad estimada de contagio, entre 0 y 1. */
  readonly probabilidad: number;
  /** Instante de ejecución del análisis (ISO 8601). */
  readonly fechaEjecucion: string;
  readonly modelo: ModeloRegresion | null;
}

export interface EjecucionAnalisis {
  readonly fechaEjecucion: string;
  readonly modelo: ModeloRegresion | null;
  readonly resultados: ResultadoRegresion[];
}

export const ETIQUETAS_CLASIFICACION: Readonly<Record<Clasificacion, string>> = {
  contagiado: "Contagiado",
  no_contagiado: "No contagiado",
};

export function formatearProbabilidad(probabilidad: number): string {
  const acotada = Math.min(1, Math.max(0, probabilidad));
  return `${Math.round(acotada * 100)}%`;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatearFechaHora(instante: string): string {
  const fecha = new Date(instante);

  if (!instante || Number.isNaN(fecha.getTime())) {
    return "Fecha no disponible";
  }

  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  return `${valor("day")} ${MESES[Number(valor("month")) - 1]} ${valor("year")} · ${valor("hour")}:${valor("minute")}`;
}

export function describirModelo(modelo: ModeloRegresion | null): string {
  return modelo ? `${modelo.nombre} · v${modelo.version}` : "Versión no disponible";
}

/** Agrupa los resultados por ejecución, de la más reciente a la más antigua. */
export function agruparPorEjecucion(
  resultados: readonly ResultadoRegresion[]
): EjecucionAnalisis[] {
  const grupos = new Map<string, EjecucionAnalisis>();

  for (const resultado of resultados) {
    const clave = `${resultado.fechaEjecucion}|${describirModelo(resultado.modelo)}`;
    const grupo = grupos.get(clave);

    if (grupo) {
      grupo.resultados.push(resultado);
    } else {
      grupos.set(clave, {
        fechaEjecucion: resultado.fechaEjecucion,
        modelo: resultado.modelo,
        resultados: [resultado],
      });
    }
  }

  return [...grupos.values()]
    .map((grupo) => ({
      ...grupo,
      resultados: [...grupo.resultados].sort((a, b) => b.probabilidad - a.probabilidad),
    }))
    .sort((a, b) => b.fechaEjecucion.localeCompare(a.fechaEjecucion));
}

export function resumirEjecucion(ejecucion: EjecucionAnalisis) {
  const total = ejecucion.resultados.length;
  const contagiados = ejecucion.resultados.filter((r) => r.clasificacion === "contagiado").length;
  const promedio =
    total === 0 ? 0 : ejecucion.resultados.reduce((suma, r) => suma + r.probabilidad, 0) / total;

  return {
    total,
    contagiados,
    noContagiados: total - contagiados,
    probabilidadPromedio: promedio,
  };
}
