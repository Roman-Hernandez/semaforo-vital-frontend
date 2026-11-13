export type NivelRiesgo = "bajo" | "medio" | "alto" | "critico";

export interface Albergue {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly departamento: string;
  readonly municipio: string;
  readonly direccion: string;
  readonly latitud: number;
  readonly longitud: number;
  readonly capacidadInstalada: number;
  readonly activo: boolean;
  readonly poblacionActual: number | null;
  readonly administrador: string | null;
  readonly riesgo: NivelRiesgo | null;
  readonly creadoEn: string;
}

export interface AlbergueEntrada {
  codigo: string;
  nombre: string;
  departamento: string;
  municipio: string;
  direccion: string;
  latitud: number;
  longitud: number;
  capacidadInstalada: number;
  activo: boolean;
}

/** Valores del formulario tal como los escribe la persona (texto). */
export interface AlbergueFormulario {
  codigo: string;
  nombre: string;
  departamento: string;
  municipio: string;
  direccion: string;
  latitud: string;
  longitud: string;
  capacidadInstalada: string;
  activo: boolean;
}

export type CampoAlbergue = keyof AlbergueFormulario;

export type ErroresAlbergue = Partial<Record<CampoAlbergue, string>>;

export const CAPACIDAD_MAXIMA = 10000;

export const ETIQUETAS_RIESGO: Record<NivelRiesgo, string> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  critico: "Crítico",
};

export const FORMULARIO_VACIO: AlbergueFormulario = {
  codigo: "",
  nombre: "",
  departamento: "",
  municipio: "",
  direccion: "",
  latitud: "",
  longitud: "",
  capacidadInstalada: "",
  activo: true,
};

const PATRON_CODIGO = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const PATRON_DECIMAL = /^-?\d+(?:[.,]\d+)?$/;

function aNumero(valor: string): number {
  return Number(valor.trim().replace(",", "."));
}

function validarCoordenada(
  valor: string,
  minimo: number,
  maximo: number,
  nombre: string
): string | undefined {
  const texto = valor.trim();

  if (!texto) {
    return `La ${nombre} es obligatoria.`;
  }

  if (!PATRON_DECIMAL.test(texto)) {
    return `La ${nombre} debe ser un número decimal.`;
  }

  const numero = aNumero(texto);

  if (numero < minimo || numero > maximo) {
    return `La ${nombre} debe estar entre ${minimo} y ${maximo}.`;
  }

  return undefined;
}

function validarTexto(
  valor: string,
  etiqueta: string,
  minimo: number,
  maximo: number
): string | undefined {
  const texto = valor.trim();

  if (!texto) {
    return `${etiqueta} es obligatorio.`;
  }

  if (texto.length < minimo) {
    return `${etiqueta} debe tener al menos ${minimo} caracteres.`;
  }

  if (texto.length > maximo) {
    return `${etiqueta} no puede superar ${maximo} caracteres.`;
  }

  return undefined;
}

export function validarAlbergue(
  formulario: AlbergueFormulario
): ErroresAlbergue {
  const errores: ErroresAlbergue = {};

  const codigo = formulario.codigo.trim();

  if (!codigo) {
    errores.codigo = "El código es obligatorio.";
  } else if (codigo.length > 20 || !PATRON_CODIGO.test(codigo)) {
    errores.codigo =
      "Usa mayúsculas, números y guiones (máx. 20). Ej: ALB-PER-001.";
  }

  errores.nombre = validarTexto(formulario.nombre, "El nombre", 3, 120);
  errores.departamento = validarTexto(
    formulario.departamento,
    "El departamento",
    2,
    60
  );
  errores.municipio = validarTexto(formulario.municipio, "El municipio", 2, 60);
  errores.direccion = validarTexto(formulario.direccion, "La dirección", 5, 160);

  const capacidad = formulario.capacidadInstalada.trim();

  if (!capacidad) {
    errores.capacidadInstalada = "La capacidad es obligatoria.";
  } else if (!/^\d+$/.test(capacidad)) {
    errores.capacidadInstalada = "La capacidad debe ser un número entero.";
  } else if (
    Number(capacidad) < 1 ||
    Number(capacidad) > CAPACIDAD_MAXIMA
  ) {
    errores.capacidadInstalada = `La capacidad debe estar entre 1 y ${CAPACIDAD_MAXIMA}.`;
  }

  errores.latitud = validarCoordenada(formulario.latitud, -90, 90, "latitud");
  errores.longitud = validarCoordenada(
    formulario.longitud,
    -180,
    180,
    "longitud"
  );

  return Object.fromEntries(
    Object.entries(errores).filter(([, mensaje]) => mensaje)
  ) as ErroresAlbergue;
}

export function formularioAEntrada(
  formulario: AlbergueFormulario
): AlbergueEntrada {
  return {
    codigo: formulario.codigo.trim().toUpperCase(),
    nombre: formulario.nombre.trim(),
    departamento: formulario.departamento.trim(),
    municipio: formulario.municipio.trim(),
    direccion: formulario.direccion.trim(),
    latitud: aNumero(formulario.latitud),
    longitud: aNumero(formulario.longitud),
    capacidadInstalada: Number(formulario.capacidadInstalada.trim()),
    activo: formulario.activo,
  };
}

export function albergueAFormulario(albergue: Albergue): AlbergueFormulario {
  return {
    codigo: albergue.codigo,
    nombre: albergue.nombre,
    departamento: albergue.departamento,
    municipio: albergue.municipio,
    direccion: albergue.direccion,
    latitud: String(albergue.latitud),
    longitud: String(albergue.longitud),
    capacidadInstalada: String(albergue.capacidadInstalada),
    activo: albergue.activo,
  };
}

export function calcularOcupacion(albergue: Albergue): number | null {
  if (albergue.poblacionActual === null || albergue.capacidadInstalada <= 0) {
    return null;
  }

  return Math.round(
    (albergue.poblacionActual / albergue.capacidadInstalada) * 100
  );
}
