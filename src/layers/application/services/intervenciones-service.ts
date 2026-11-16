import {
  ApiError,
  crearClienteApi,
  esperar,
  type ClienteApi,
} from "./api-client";
import {
  normalizarIntervencion,
  type Intervencion,
  type IntervencionEntrada,
} from "../../domain/intervenciones/intervencion";

export interface IntervencionesGateway {
  /** Intervenciones del albergue asignado al administrador en sesión. */
  listar(): Promise<Intervencion[]>;
  registrar(entrada: IntervencionEntrada): Promise<Intervencion>;
}

/* ------------------------------------------------------------------ */
/* API real: colección `intervenciones` (contrato MongoDB)            */
/* ------------------------------------------------------------------ */

export const RUTA_INTERVENCIONES = "/api/v1/mi-albergue/intervenciones";

export interface IntervencionApi {
  _id?: string;
  id?: string;
  tipo_intervencion: string;
  descripcion: string;
  observaciones?: string | null;
  fecha_intervencion: string;
  created_at?: string;
}

export function desdeApi(dato: IntervencionApi): Intervencion {
  return {
    id: dato.id ?? dato._id ?? `${dato.fecha_intervencion}-${dato.tipo_intervencion}`,
    tipo: dato.tipo_intervencion,
    descripcion: dato.descripcion,
    observaciones: dato.observaciones ?? "",
    fecha: dato.fecha_intervencion.slice(0, 10),
    registradoEn: dato.created_at ?? "",
  };
}

export function haciaApi(entrada: IntervencionEntrada) {
  const limpia = normalizarIntervencion(entrada);

  return {
    tipo_intervencion: limpia.tipo,
    descripcion: limpia.descripcion,
    fecha_intervencion: limpia.fecha,
    ...(limpia.observaciones ? { observaciones: limpia.observaciones } : {}),
  };
}

const CAMPOS_API: Readonly<Record<string, string>> = {
  tipo_intervencion: "tipo",
  descripcion: "descripcion",
  observaciones: "observaciones",
  fecha_intervencion: "fecha",
};

function traducirCampos(error: unknown): never {
  if (error instanceof ApiError) {
    const campos = Object.fromEntries(
      Object.entries(error.campos).map(([campo, mensaje]) => [
        CAMPOS_API[campo] ?? campo,
        mensaje,
      ])
    );
    throw new ApiError(error.status, error.message, campos);
  }

  throw error;
}

export function crearGatewayHttp(cliente: ClienteApi): IntervencionesGateway {
  return {
    async listar() {
      const datos = await cliente.solicitar<IntervencionApi[]>(RUTA_INTERVENCIONES);
      return datos.map(desdeApi);
    },
    async registrar(entrada) {
      try {
        const creada = await cliente.solicitar<IntervencionApi>(RUTA_INTERVENCIONES, {
          method: "POST",
          body: JSON.stringify(haciaApi(entrada)),
        });
        return desdeApi(creada);
      } catch (error) {
        return traducirCampos(error);
      }
    },
  };
}

/* ------------------------------------------------------------------ */
/* Datos de prueba mientras backend expone el endpoint               */
/* ------------------------------------------------------------------ */

export const INTERVENCIONES_DEMO: Intervencion[] = [
  {
    id: "int-001",
    tipo: "Agua potable",
    descripcion: "Instalación de dos tanques de 1.000 litros con agua tratada en el área común.",
    observaciones: "Se programó revisión del cloro residual cada 48 horas.",
    fecha: "2026-11-12",
    registradoEn: "2026-11-12T15:10:00.000Z",
  },
  {
    id: "int-002",
    tipo: "Saneamiento",
    descripcion: "Reparación de cuatro sanitarios y limpieza profunda de las baterías sanitarias.",
    observaciones: "",
    fecha: "2026-11-10",
    registradoEn: "2026-11-10T20:30:00.000Z",
  },
  {
    id: "int-003",
    tipo: "Higiene",
    descripcion: "Campaña de lavado de manos con entrega de jabón y alcohol glicerinado a 45 familias.",
    observaciones: "Apoyo de la Secretaría de Salud municipal.",
    fecha: "2026-11-08",
    registradoEn: "2026-11-08T14:00:00.000Z",
  },
  {
    id: "int-004",
    tipo: "Aislamiento temprano",
    descripcion: "Habilitación de un espacio de aislamiento para residentes con síntomas respiratorios.",
    observaciones: "",
    fecha: "2026-11-03",
    registradoEn: "2026-11-03T18:45:00.000Z",
  },
];

export function crearGatewayMemoria(
  semilla: readonly Intervencion[] = INTERVENCIONES_DEMO,
  latenciaMs = 350
): IntervencionesGateway {
  let intervenciones = semilla.map((item) => ({ ...item }));
  let secuencia = intervenciones.length;

  return {
    async listar() {
      await esperar(latenciaMs);
      return intervenciones.map((item) => ({ ...item }));
    },
    async registrar(entrada) {
      await esperar(latenciaMs);
      secuencia += 1;

      const nueva: Intervencion = {
        ...normalizarIntervencion(entrada),
        id: `int-${String(secuencia).padStart(3, "0")}`,
        registradoEn: new Date().toISOString(),
      };

      intervenciones = [nueva, ...intervenciones];
      return { ...nueva };
    },
  };
}

export function obtenerIntervencionesGateway(
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL
): IntervencionesGateway {
  return baseUrl
    ? crearGatewayHttp(crearClienteApi(baseUrl))
    : crearGatewayMemoria();
}
