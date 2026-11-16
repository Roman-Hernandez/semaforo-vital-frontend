import { crearClienteApi, esperar, type ClienteApi } from "./api-client";
import type {
  Clasificacion,
  ResultadoRegresion,
} from "../../domain/analisis-regresion/resultado";

export interface AnalisisRegresionGateway {
  /** Resultados del albergue asignado al administrador en sesión. */
  listarResultados(): Promise<ResultadoRegresion[]>;
}

/* ------------------------------------------------------------------ */
/* API real                                                           */
/* ------------------------------------------------------------------ */

export const RUTA_RESULTADOS = "/api/v1/mi-albergue/analisis-regresion/resultados";

export interface ResultadoApi {
  _id?: string;
  id?: string;
  registro_id: string;
  clasificacion: Clasificacion;
  probabilidad: number;
  fecha_ejecucion: string;
  modelo?: { nombre: string; version: string } | null;
}

export function desdeApi(dato: ResultadoApi): ResultadoRegresion {
  return {
    id: dato.id ?? dato._id ?? `${dato.fecha_ejecucion}-${dato.registro_id}`,
    registro: dato.registro_id,
    clasificacion: dato.clasificacion,
    probabilidad: dato.probabilidad,
    fechaEjecucion: dato.fecha_ejecucion,
    modelo: dato.modelo ?? null,
  };
}

export function crearGatewayHttp(cliente: ClienteApi): AnalisisRegresionGateway {
  return {
    async listarResultados() {
      const datos = await cliente.solicitar<ResultadoApi[]>(RUTA_RESULTADOS);
      return datos.map(desdeApi);
    },
  };
}

/* ------------------------------------------------------------------ */
/* Datos de prueba mientras backend expone el endpoint               */
/* ------------------------------------------------------------------ */

const MODELO_DEMO = { nombre: "Regresión logística binaria", version: "1.2.0" };

function demo(
  id: string,
  registro: string,
  probabilidad: number,
  fechaEjecucion: string,
  modelo: ResultadoRegresion["modelo"] = MODELO_DEMO
): ResultadoRegresion {
  return {
    id,
    registro,
    probabilidad,
    fechaEjecucion,
    modelo,
    clasificacion: probabilidad >= 0.5 ? "contagiado" : "no_contagiado",
  };
}

export const RESULTADOS_DEMO: ResultadoRegresion[] = [
  demo("res-01", "REG-0142", 0.87, "2026-11-14T13:30:00.000Z"),
  demo("res-02", "REG-0137", 0.64, "2026-11-14T13:30:00.000Z"),
  demo("res-03", "REG-0129", 0.52, "2026-11-14T13:30:00.000Z"),
  demo("res-04", "REG-0118", 0.31, "2026-11-14T13:30:00.000Z"),
  demo("res-05", "REG-0105", 0.18, "2026-11-14T13:30:00.000Z"),
  demo("res-06", "REG-0098", 0.07, "2026-11-14T13:30:00.000Z"),
  demo("res-07", "REG-0142", 0.71, "2026-11-07T14:00:00.000Z", null),
  demo("res-08", "REG-0118", 0.44, "2026-11-07T14:00:00.000Z", null),
  demo("res-09", "REG-0098", 0.12, "2026-11-07T14:00:00.000Z", null),
];

export function crearGatewayMemoria(
  semilla: readonly ResultadoRegresion[] = RESULTADOS_DEMO,
  latenciaMs = 350
): AnalisisRegresionGateway {
  return {
    async listarResultados() {
      await esperar(latenciaMs);
      return semilla.map((item) => ({ ...item }));
    },
  };
}

export function obtenerAnalisisRegresionGateway(
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL
): AnalisisRegresionGateway {
  return baseUrl
    ? crearGatewayHttp(crearClienteApi(baseUrl))
    : crearGatewayMemoria();
}
