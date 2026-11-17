import type { Albergue, AlbergueEntrada } from "@/layers/domain/albergues/albergue";
import { crearClienteApi, type ClienteApi } from "./api-client";
import { desdeApi, haciaApi, type AlbergueApi } from "./albergues-service";
import {
  construirQueryPaginada,
  mapearPagina,
  type ConsultaPaginada,
  type Page,
} from "./paginacion";

export interface MiAlbergue {
  albergue: Albergue;
  administrador: {
    id: string;
    nombre: string | null;
    apellido: string | null;
    email: string;
  };
}

export interface RegistroPoblacion {
  readonly id: string;
  readonly fecha: string;
  readonly poblacion: number;
  readonly creadoEn: string;
}

export interface ResumenPoblacion {
  readonly poblacionActual: number | null;
  readonly porcentajeOcupacion: number | null;
  readonly cuposDisponibles: number | null;
  readonly ultimoRegistro: RegistroPoblacion | null;
}

export interface PrediccionSirResumen {
  readonly simulacionId: string;
  readonly enfermedad: string;
  readonly fechaEjecucion: string;
  readonly modeloNombre: string;
  readonly modeloVersion: string;
  readonly diaFin: number;
  readonly picoDia: number;
  readonly picoInfectados: number;
  readonly finalRecuperados: number;
}

export interface DashboardAlbergue extends MiAlbergue {
  readonly poblacionActual: number | null;
  readonly porcentajeOcupacion: number | null;
  readonly cuposDisponibles: number | null;
  readonly semaforoVital: {
    readonly nivel: string;
    readonly descripcion: string | null;
    readonly fechaCalculo: string | null;
  } | null;
  readonly alertas: {
    readonly cantidad: number;
    readonly porNivelRiesgo: {
      readonly verde: number;
      readonly amarillo: number;
      readonly rojo: number;
    };
  };
  readonly casosDiarios: {
    readonly casosEda: number | null;
    readonly casosIra: number | null;
    readonly ultimaActualizacion: string | null;
  } | null;
  readonly condicionesSanitarias: {
    readonly id: string;
    readonly fecha: string;
    readonly aguaPotableDisponible: boolean;
    readonly banosDisponibles: number;
    readonly estadoHigiene: string;
    readonly estadoSaneamiento: string;
    readonly observaciones: string;
  } | null;
  readonly analisisIa: {
    readonly fechaEjecucion: string;
    readonly modeloNombre: string;
    readonly modeloVersion: string;
    readonly probabilidadRiesgo: number;
    readonly registrosConsiderados: number;
  } | null;
  readonly resumenCasos: readonly {
    readonly enfermedad: string;
    readonly cantidadCasosActivos: number;
    readonly fecha: string;
  }[];
  readonly intervenciones: readonly {
    readonly id: string;
    readonly fecha: string;
    readonly tipo: string;
    readonly descripcion: string;
    readonly observaciones: string;
  }[];
  readonly predicciones: readonly PrediccionSirResumen[];
  readonly ultimaActualizacion: string | null;
}

export type ConsultaHistorialPoblacion = Omit<ConsultaPaginada, "q">;

export interface MiAlbergueGateway {
  consultar(): Promise<MiAlbergue>;
  actualizar(entrada: AlbergueEntrada): Promise<Albergue>;
  consultarDashboard(limite?: number): Promise<DashboardAlbergue>;
  consultarPoblacion(): Promise<ResumenPoblacion>;
  guardarPoblacion(fecha: string, poblacion: number): Promise<RegistroPoblacion>;
  listarHistorialPoblacion(
    consulta?: ConsultaHistorialPoblacion
  ): Promise<Page<RegistroPoblacion>>;
}

interface RegistroPoblacionApi {
  id: string;
  fecha: string;
  poblacion: number;
  created_at?: string;
}

interface MiAlbergueApi {
  albergue: AlbergueApi;
  administrador: MiAlbergue["administrador"];
  poblacion_actual?: number | null;
  porcentaje_ocupacion?: number | null;
  cupos_disponibles?: number | null;
  ultimo_registro?: RegistroPoblacionApi | null;
}

interface PoblacionApi {
  poblacion_actual: number | null;
  porcentaje_ocupacion: number | null;
  cupos_disponibles: number | null;
  ultimo_registro: RegistroPoblacionApi | null;
}

interface DashboardApi extends MiAlbergueApi {
  semaforo_vital: {
    nivel: string;
    descripcion?: string | null;
    fecha_calculo?: string | null;
  } | null;
  alertas: {
    cantidad: number;
    por_nivel_riesgo: { verde: number; amarillo: number; rojo: number };
  };
  casos_diarios: {
    casos_eda: number | null;
    casos_ira: number | null;
    ultima_actualizacion: string | null;
  } | null;
  condiciones_sanitarias: {
    id: string;
    fecha: string;
    agua_potable_disponible: boolean;
    banos_disponibles: number;
    estado_higiene: string;
    estado_saneamiento: string;
    observaciones?: string | null;
  } | null;
  analisis_ia: {
    fecha_ejecucion: string;
    modelo: { nombre: string; version: string };
    resultado: { probabilidad_riesgo: number };
    preprocesamiento: { registros_considerados: number };
  } | null;
  resumen_casos: {
    enfermedad: string;
    cantidad_casos_activos: number;
    fecha: string;
  }[];
  intervenciones: {
    id: string;
    fecha_intervencion: string;
    tipo_intervencion: string;
    descripcion: string;
    observaciones?: string | null;
  }[];
  predicciones: {
    simulacion_id: string;
    enfermedad: string;
    fecha_ejecucion: string;
    modelo: { nombre: string; version: string };
    periodo_estimacion: { dia_inicio: number; dia_fin: number };
    resultado_final: {
      dia: number;
      susceptibles: number;
      infectados: number;
      recuperados: number;
    };
    pico_infectados: {
      dia: number;
      susceptibles: number;
      infectados: number;
      recuperados: number;
    };
  }[];
  ultima_actualizacion: string | null;
}

function mapearRegistroPoblacion(
  dato: RegistroPoblacionApi
): RegistroPoblacion {
  return {
    id: dato.id,
    fecha: dato.fecha.slice(0, 10),
    poblacion: dato.poblacion,
    creadoEn: dato.created_at ?? dato.fecha,
  };
}

export function crearMiAlbergueGateway(cliente: ClienteApi): MiAlbergueGateway {
  return {
    async consultar(): Promise<MiAlbergue> {
      const datos =
        await cliente.solicitar<MiAlbergueApi>("/api/v1/mi-albergue");
      return {
        albergue: desdeApi({
          ...datos.albergue,
          poblacion_actual:
            datos.poblacion_actual ?? datos.albergue.poblacion_actual,
        }),
        administrador: datos.administrador,
      };
    },
    async actualizar(entrada: AlbergueEntrada): Promise<Albergue> {
      const datos = await cliente.solicitar<AlbergueApi>(
        "/api/v1/mi-albergue",
        {
          method: "PATCH",
          body: JSON.stringify({
            ubicacion: haciaApi(entrada).ubicacion,
            capacidad_instalada: entrada.capacidadInstalada,
          }),
        }
      );
      return desdeApi(datos);
    },
    async consultarDashboard(limite = 30): Promise<DashboardAlbergue> {
      const d = await cliente.solicitar<DashboardApi>(
        `/api/v1/mi-albergue/dashboard?limite=${limite}`
      );
      return {
        albergue: desdeApi({
          ...d.albergue,
          poblacion_actual: d.poblacion_actual ?? d.albergue.poblacion_actual,
        }),
        administrador: d.administrador,
        poblacionActual: d.poblacion_actual ?? null,
        porcentajeOcupacion: d.porcentaje_ocupacion ?? null,
        cuposDisponibles: d.cupos_disponibles ?? null,
        semaforoVital: d.semaforo_vital
          ? {
              nivel: d.semaforo_vital.nivel,
              descripcion: d.semaforo_vital.descripcion ?? null,
              fechaCalculo: d.semaforo_vital.fecha_calculo ?? null,
            }
          : null,
        alertas: {
          cantidad: d.alertas.cantidad,
          porNivelRiesgo: d.alertas.por_nivel_riesgo,
        },
        casosDiarios: d.casos_diarios
          ? {
              casosEda: d.casos_diarios.casos_eda,
              casosIra: d.casos_diarios.casos_ira,
              ultimaActualizacion: d.casos_diarios.ultima_actualizacion,
            }
          : null,
        condicionesSanitarias: d.condiciones_sanitarias
          ? {
              id: d.condiciones_sanitarias.id,
              fecha: d.condiciones_sanitarias.fecha.slice(0, 10),
              aguaPotableDisponible:
                d.condiciones_sanitarias.agua_potable_disponible,
              banosDisponibles: d.condiciones_sanitarias.banos_disponibles,
              estadoHigiene: d.condiciones_sanitarias.estado_higiene,
              estadoSaneamiento: d.condiciones_sanitarias.estado_saneamiento,
              observaciones: d.condiciones_sanitarias.observaciones ?? "",
            }
          : null,
        analisisIa: d.analisis_ia
          ? {
              fechaEjecucion: d.analisis_ia.fecha_ejecucion,
              modeloNombre: d.analisis_ia.modelo.nombre,
              modeloVersion: d.analisis_ia.modelo.version,
              probabilidadRiesgo: d.analisis_ia.resultado.probabilidad_riesgo,
              registrosConsiderados:
                d.analisis_ia.preprocesamiento.registros_considerados,
            }
          : null,
        resumenCasos: d.resumen_casos.map((c) => ({
          enfermedad: c.enfermedad,
          cantidadCasosActivos: c.cantidad_casos_activos,
          fecha: c.fecha.slice(0, 10),
        })),
        intervenciones: d.intervenciones.map((i) => ({
          id: i.id,
          fecha: i.fecha_intervencion.slice(0, 10),
          tipo: i.tipo_intervencion,
          descripcion: i.descripcion,
          observaciones: i.observaciones ?? "",
        })),
        predicciones: d.predicciones.map((p) => ({
          simulacionId: p.simulacion_id,
          enfermedad: p.enfermedad,
          fechaEjecucion: p.fecha_ejecucion,
          modeloNombre: p.modelo.nombre,
          modeloVersion: p.modelo.version,
          diaFin: p.periodo_estimacion.dia_fin,
          picoDia: p.pico_infectados.dia,
          picoInfectados: Math.round(p.pico_infectados.infectados),
          finalRecuperados: Math.round(p.resultado_final.recuperados),
        })),
        ultimaActualizacion: d.ultima_actualizacion,
      };
    },
    async consultarPoblacion(): Promise<ResumenPoblacion> {
      const d = await cliente.solicitar<PoblacionApi>(
        "/api/v1/mi-albergue/poblacion"
      );
      return {
        poblacionActual: d.poblacion_actual,
        porcentajeOcupacion: d.porcentaje_ocupacion,
        cuposDisponibles: d.cupos_disponibles,
        ultimoRegistro: d.ultimo_registro
          ? mapearRegistroPoblacion(d.ultimo_registro)
          : null,
      };
    },
    async guardarPoblacion(
      fecha: string,
      poblacion: number
    ): Promise<RegistroPoblacion> {
      const d = await cliente.solicitar<RegistroPoblacionApi>(
        "/api/v1/mi-albergue/poblacion",
        {
          method: "PUT",
          body: JSON.stringify({ fecha, poblacion }),
        }
      );
      return mapearRegistroPoblacion(d);
    },
    async listarHistorialPoblacion(
      consulta: ConsultaHistorialPoblacion = {}
    ): Promise<Page<RegistroPoblacion>> {
      const query = construirQueryPaginada(consulta, { permitirQ: false });
      const pagina = await cliente.solicitar<Page<RegistroPoblacionApi>>(
        `/api/v1/mi-albergue/poblacion/historial${query}`
      );
      return mapearPagina(pagina, mapearRegistroPoblacion);
    },
  };
}

export const miAlbergueGateway = crearMiAlbergueGateway(
  crearClienteApi(process.env.NEXT_PUBLIC_API_URL ?? "")
);
