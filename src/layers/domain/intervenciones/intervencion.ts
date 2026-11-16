export const TIPOS_INTERVENCION = [
  "Agua potable",
  "Saneamiento",
  "Higiene",
  "Ventilación",
  "Aislamiento temprano",
  "Control de aforo",
  "Vacunación",
  "Atención médica",
  "Otra",
] as const;

export type TipoIntervencion = (typeof TIPOS_INTERVENCION)[number];

export interface Intervencion {
  readonly id: string;
  readonly tipo: string;
  readonly descripcion: string;
  readonly observaciones: string;
  /** Fecha funcional en formato AAAA-MM-DD (zona America/Bogota). */
  readonly fecha: string;
  readonly registradoEn: string;
}

export interface IntervencionEntrada {
  tipo: string;
  descripcion: string;
  observaciones: string;
  fecha: string;
}

export type CampoIntervencion = keyof IntervencionEntrada;

export type ErroresIntervencion = Partial<Record<CampoIntervencion, string>>;

export const DESCRIPCION_MINIMA = 10;
export const DESCRIPCION_MAXIMA = 500;
export const OBSERVACIONES_MAXIMA = 300;

export const INTERVENCION_VACIA: IntervencionEntrada = {
  tipo: "",
  descripcion: "",
  observaciones: "",
  fecha: "",
};

const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Fecha de hoy en Colombia, en formato AAAA-MM-DD. */
export function hoyEnBogota(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

function esFechaReal(texto: string): boolean {
  if (!PATRON_FECHA.test(texto)) {
    return false;
  }

  const [anio, mes, dia] = texto.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
}

export function formatearFecha(fecha: string): string {
  if (!esFechaReal(fecha)) {
    return "Sin fecha";
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);
  return `${dia} ${MESES[mes - 1]} ${anio}`;
}

export function validarIntervencion(
  entrada: IntervencionEntrada,
  hoy: string = hoyEnBogota()
): ErroresIntervencion {
  const errores: ErroresIntervencion = {};
  const descripcion = entrada.descripcion.trim();
  const fecha = entrada.fecha.trim();

  if (!entrada.tipo.trim()) {
    errores.tipo = "Selecciona el tipo de intervención.";
  }

  if (!descripcion) {
    errores.descripcion = "La descripción es obligatoria.";
  } else if (descripcion.length < DESCRIPCION_MINIMA) {
    errores.descripcion = `Describe la intervención con al menos ${DESCRIPCION_MINIMA} caracteres.`;
  } else if (descripcion.length > DESCRIPCION_MAXIMA) {
    errores.descripcion = `La descripción no puede superar ${DESCRIPCION_MAXIMA} caracteres.`;
  }

  if (entrada.observaciones.trim().length > OBSERVACIONES_MAXIMA) {
    errores.observaciones = `Las observaciones no pueden superar ${OBSERVACIONES_MAXIMA} caracteres.`;
  }

  if (!fecha) {
    errores.fecha = "La fecha de realización es obligatoria.";
  } else if (!esFechaReal(fecha)) {
    errores.fecha = "Ingresa una fecha válida.";
  } else if (fecha > hoy) {
    errores.fecha = "La fecha no puede ser posterior a hoy.";
  }

  return errores;
}

export function normalizarIntervencion(
  entrada: IntervencionEntrada
): IntervencionEntrada {
  return {
    tipo: entrada.tipo.trim(),
    descripcion: entrada.descripcion.trim(),
    observaciones: entrada.observaciones.trim(),
    fecha: entrada.fecha.trim(),
  };
}

/** Más recientes primero; a igual fecha, el último registrado primero. */
export function ordenarIntervenciones(
  intervenciones: readonly Intervencion[]
): Intervencion[] {
  return [...intervenciones].sort(
    (a, b) =>
      b.fecha.localeCompare(a.fecha) ||
      b.registradoEn.localeCompare(a.registradoEn)
  );
}
