import {
  crearClienteApi,
  leerTokenAcceso,
  type ClienteApi,
} from "./api-client";
import { construirQueryPaginada, type Page } from "./paginacion";

export type EstadoSIR =
  | "estimacion_disponible"
  | "datos_insuficientes"
  | "datos_incompatibles"
  | "sin_casos_activos";

export interface SIRObservation {
  readonly fecha: string;
  readonly poblacion: number | null;
  readonly infectados: number;
  readonly recuperados: number | null;
  readonly susceptibles: number | null;
  readonly registro_casos_id: string;
  readonly registro_poblacion_id: string | null;
}

export interface SIRProjectedDay {
  readonly dia: number;
  readonly fecha: string;
  readonly susceptibles: number;
  readonly infectados: number;
  readonly recuperados: number;
}

export interface EstimatedSIR {
  readonly beta: number;
  readonly gamma: number;
  readonly error_ajuste_infectados: number;
  readonly intervalos_utilizados: number;
  readonly metodo: string;
}

export interface SIRForecastSummary {
  readonly pico_infectados_en_horizonte: number;
  readonly fecha_pico_en_horizonte: string;
  readonly infectados_finales: number;
  readonly recuperados_finales: number;
  readonly r_efectivo_inicial: number | null;
  readonly error_maximo_poblacion: number;
}

export interface SIRDiseaseResult {
  readonly enfermedad: string;
  readonly estado: EstadoSIR;
  readonly motivos: readonly string[];
  readonly datos_faltantes: readonly string[];
  readonly observado: readonly SIRObservation[];
  readonly proyeccion: readonly SIRProjectedDay[];
  readonly parametros_estimados: EstimatedSIR | null;
  readonly resumen: SIRForecastSummary | null;
}

export interface SIRResult {
  readonly albergue_id: string;
  readonly albergue_nombre: string;
  readonly poblacion_actual: number | null;
  readonly fecha_poblacion: string | null;
  readonly generado_en: string;
  readonly horizonte_dias: number;
  readonly ventana_datos_dias: number;
  readonly metodo_numerico: string;
  readonly datos_faltantes: readonly string[];
  readonly supuestos: readonly string[];
  readonly resultados: Page<SIRDiseaseResult>;
}

export interface ConsultaSIR {
  readonly page?: number;
  readonly page_size?: number;
  readonly enfermedad?: string;
}

export interface SIRGateway {
  consultarResultados(consulta?: ConsultaSIR): Promise<SIRResult>;
  simular?(
    entrada?: { readonly enfermedad?: string },
    consulta?: ConsultaSIR
  ): Promise<SIRResult>;
  configuracion?(consulta?: ConsultaSIR): Promise<SIRResult>;
}

export function crearSIRGateway(cliente: ClienteApi): SIRGateway {
  return {
    consultarResultados(consulta: ConsultaSIR = {}): Promise<SIRResult> {
      const query = construirQueryPaginada(
        {
          page: consulta.page,
          page_size: consulta.page_size,
          enfermedad: consulta.enfermedad,
        },
        { permitirQ: false, permitirFechas: false }
      );
      return cliente.solicitar<SIRResult>(
        `/api/v1/mi-albergue/modelo-sir/resultados${query}`
      );
    },
    simular(
      entrada?: { readonly enfermedad?: string },
      consulta: ConsultaSIR = {}
    ): Promise<SIRResult> {
      const query = construirQueryPaginada(
        {
          page: consulta.page,
          page_size: consulta.page_size,
        },
        { permitirQ: false, permitirFechas: false }
      );
      const enfermedadLimpia = entrada?.enfermedad?.trim();
      return cliente.solicitar<SIRResult>(
        `/api/v1/mi-albergue/modelo-sir/simular${query}`,
        {
          method: "POST",
          body: JSON.stringify(
            enfermedadLimpia ? { enfermedad: enfermedadLimpia } : {}
          ),
        }
      );
    },
    configuracion(consulta: ConsultaSIR = {}): Promise<SIRResult> {
      const query = construirQueryPaginada(
        {
          page: consulta.page,
          page_size: consulta.page_size,
        },
        { permitirQ: false, permitirFechas: false }
      );
      return cliente.solicitar<SIRResult>(
        `/api/v1/mi-albergue/modelo-sir/configuracion${query}`
      );
    },
  };
}

export function obtenerSIRGateway(
  baseUrl: string = process.env.NEXT_PUBLIC_API_URL ?? ""
): SIRGateway {
  return crearSIRGateway(crearClienteApi(baseUrl, leerTokenAcceso));
}

export const sirGateway: SIRGateway = obtenerSIRGateway();
