/**
 * Contratos y utilidades compartidas para la paginación y filtrado en servidor.
 * Nunca envía `limite` ni `offset` (producen 422 en los endpoints paginados).
 */

export interface Page<T> {
  readonly items: T[];
  readonly page: number;
  readonly page_size: number;
  readonly total: number;
  readonly total_pages: number;
  readonly has_next: boolean;
  readonly has_previous: boolean;
}

export const TAMANOS_PAGINA = [10, 20, 50, 100] as const;
export type TamanoPagina = (typeof TAMANOS_PAGINA)[number];
export const TAMANO_PAGINA_PREDETERMINADO: TamanoPagina = 20;
export const MAX_PAGINA = 1_000_000;
export const MAX_LONGITUD_Q = 100;

export interface ConsultaPaginada {
  readonly page?: number;
  readonly page_size?: number;
  readonly q?: string;
  readonly desde?: string;
  readonly hasta?: string;
  readonly activo?: boolean;
  readonly activa?: boolean;
  readonly enfermedad?: string;
}

export interface OpcionesQueryPaginada {
  readonly permitirQ?: boolean;
  readonly permitirFechas?: boolean;
}

export function normalizarPagina(pagina?: number): number {
  if (typeof pagina !== "number" || !Number.isFinite(pagina)) {
    return 1;
  }
  const entero = Math.trunc(pagina);
  if (entero < 1) return 1;
  if (entero > MAX_PAGINA) return MAX_PAGINA;
  return entero;
}

export function normalizarTamanoPagina(tamano?: number): number {
  if (typeof tamano !== "number" || !Number.isFinite(tamano)) {
    return TAMANO_PAGINA_PREDETERMINADO;
  }
  const entero = Math.trunc(tamano);
  if (entero < 1) return 1;
  if (entero > 100) return 100;
  return entero;
}

const PATRON_FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

function fechaValida(valor?: string): string | null {
  if (!valor) return null;
  const limpia = valor.trim();
  if (!PATRON_FECHA_ISO.test(limpia) || limpia === "9999-12-31") {
    return null;
  }
  return limpia;
}

export function construirQueryPaginada(
  consulta: ConsultaPaginada = {},
  opciones: OpcionesQueryPaginada = {}
): string {
  const { permitirQ = true, permitirFechas = true } = opciones;
  const params = new URLSearchParams();

  params.set("page", String(normalizarPagina(consulta.page)));
  params.set("page_size", String(normalizarTamanoPagina(consulta.page_size)));

  if (permitirQ && typeof consulta.q === "string") {
    const texto = consulta.q.trim().slice(0, MAX_LONGITUD_Q);
    if (texto.length > 0) {
      params.set("q", texto);
    }
  }

  if (permitirFechas) {
    const desde = fechaValida(consulta.desde);
    const hasta = fechaValida(consulta.hasta);
    const rangoValido = !(desde && hasta && desde > hasta);

    if (rangoValido) {
      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);
    }
  }

  if (typeof consulta.activo === "boolean") {
    params.set("activo", String(consulta.activo));
  }

  if (typeof consulta.activa === "boolean") {
    params.set("activa", String(consulta.activa));
  }

  if (typeof consulta.enfermedad === "string") {
    const enf = consulta.enfermedad.trim().slice(0, 300);
    if (enf.length > 0) {
      params.set("enfermedad", enf);
    }
  }

  const serializado = params.toString();
  return serializado ? `?${serializado}` : "";
}

export function mapearPagina<TApi, TDom>(
  respuesta: Page<TApi>,
  mapearItem: (item: TApi) => TDom
): Page<TDom> {
  return {
    items: (respuesta.items ?? []).map(mapearItem),
    page: respuesta.page ?? 1,
    page_size: respuesta.page_size ?? TAMANO_PAGINA_PREDETERMINADO,
    total: respuesta.total ?? 0,
    total_pages: respuesta.total_pages ?? 0,
    has_next: Boolean(respuesta.has_next),
    has_previous: Boolean(respuesta.has_previous),
  };
}

export function paginaVacia<T>(
  page = 1,
  page_size: number = TAMANO_PAGINA_PREDETERMINADO
): Page<T> {
  return {
    items: [],
    page: normalizarPagina(page),
    page_size: normalizarTamanoPagina(page_size),
    total: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  };
}

export function calcularRangoPagina<T>(pagina: Page<T>): {
  readonly desde: number;
  readonly hasta: number;
  readonly fueraDeRango: boolean;
} {
  if (pagina.total === 0 || pagina.items.length === 0) {
    return {
      desde: 0,
      hasta: 0,
      fueraDeRango: pagina.total > 0 && pagina.items.length === 0,
    };
  }
  const desde = (pagina.page - 1) * pagina.page_size + 1;
  const hasta = desde + pagina.items.length - 1;
  return { desde, hasta, fueraDeRango: false };
}
