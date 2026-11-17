import { crearClienteApi,type ClienteApi } from "./api-client";
import {
  construirQueryPaginada,
  mapearPagina,
  type ConsultaPaginada,
  type Page,
} from "./paginacion";

export type NivelRiesgoPublico="verde"|"amarillo"|"rojo";

export interface CondicionSanitariaPublica {
  readonly fecha: string;
  readonly aguaPotableDisponible: boolean;
  readonly banosDisponibles: number;
  readonly estadoHigiene: string;
  readonly estadoSaneamiento: string;
}

export interface AlberguePublico {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly departamento: string;
  readonly municipio: string;
  readonly direccion: string;
  readonly latitud: number;
  readonly longitud: number;
  readonly capacidadInstalada: number;
  readonly poblacionActual: number|null;
  readonly porcentajeOcupacion: number|null;
  readonly cuposDisponibles: number|null;
  readonly nivelRiesgo: NivelRiesgoPublico|null;
  readonly fechaCalculoRiesgo: string|null;
  readonly condicionesSanitarias: CondicionSanitariaPublica|null;
}

export interface AlertaPublica {
  readonly id: string;
  readonly albergueId: string;
  readonly fechaAlerta: string;
  readonly nivelRiesgo: NivelRiesgoPublico;
  readonly tipoAlerta: string;
  readonly mensaje: string;
  readonly activa: boolean;
}

interface CondicionSanitariaPublicaApi {
  fecha: string;
  agua_potable_disponible: boolean;
  banos_disponibles: number;
  estado_higiene: string;
  estado_saneamiento: string;
}

interface AlberguePublicoApi {
  id: string;
  codigo_albergue: string;
  nombre: string;
  ubicacion: {
    departamento: string;
    municipio: string;
    direccion: string;
    coordenadas: { type: "Point"; coordinates: [number,number] };
  };
  capacidad_instalada: number;
  poblacion_actual: number|null;
  porcentaje_ocupacion: number|null;
  cupos_disponibles: number|null;
  nivel_riesgo: NivelRiesgoPublico|null;
  fecha_calculo_riesgo: string|null;
  condiciones_sanitarias: CondicionSanitariaPublicaApi|null;
}

interface AlertaPublicaApi {
  id: string;
  albergue_id: string;
  fecha_alerta: string;
  nivel_riesgo: NivelRiesgoPublico;
  tipo_alerta: string;
  mensaje: string;
  activa: boolean;
}

export interface PublicoGateway {
  listarAlbergues(consulta?: ConsultaPaginada): Promise<Page<AlberguePublico>>;
  listarAlertas(consulta?: ConsultaPaginada): Promise<Page<AlertaPublica>>;
  listarAlertasAlbergue(
    id: string,
    consulta?: ConsultaPaginada
  ): Promise<Page<AlertaPublica>>;
}

function mapearCondicion(
  dato: CondicionSanitariaPublicaApi|null
): CondicionSanitariaPublica|null {
  if(!dato) return null;
  return {
    fecha: dato.fecha,
    aguaPotableDisponible: dato.agua_potable_disponible,
    banosDisponibles: dato.banos_disponibles,
    estadoHigiene: dato.estado_higiene,
    estadoSaneamiento: dato.estado_saneamiento,
  };
}

function mapearAlbergue(dato: AlberguePublicoApi): AlberguePublico {
  const [longitud,latitud]=dato.ubicacion.coordenadas.coordinates;
  return {
    id: dato.id,
    codigo: dato.codigo_albergue,
    nombre: dato.nombre,
    departamento: dato.ubicacion.departamento,
    municipio: dato.ubicacion.municipio,
    direccion: dato.ubicacion.direccion,
    latitud,
    longitud,
    capacidadInstalada: dato.capacidad_instalada,
    poblacionActual: dato.poblacion_actual,
    porcentajeOcupacion: dato.porcentaje_ocupacion,
    cuposDisponibles: dato.cupos_disponibles,
    nivelRiesgo: dato.nivel_riesgo,
    fechaCalculoRiesgo: dato.fecha_calculo_riesgo,
    condicionesSanitarias: mapearCondicion(dato.condiciones_sanitarias),
  };
}

function mapearAlerta(dato: AlertaPublicaApi): AlertaPublica {
  return {
    id: dato.id,
    albergueId: dato.albergue_id,
    fechaAlerta: dato.fecha_alerta,
    nivelRiesgo: dato.nivel_riesgo,
    tipoAlerta: dato.tipo_alerta,
    mensaje: dato.mensaje,
    activa: dato.activa,
  };
}

export function crearPublicoGateway(cliente: ClienteApi): PublicoGateway {
  return {
    async listarAlbergues(consulta={}) {
      const query=construirQueryPaginada(consulta);
      const pagina=await cliente.solicitar<Page<AlberguePublicoApi>>(
        `/api/v1/publico/albergues${query}`
      );
      return mapearPagina(pagina,mapearAlbergue);
    },
    async listarAlertas(consulta={}) {
      const query=construirQueryPaginada(consulta);
      const pagina=await cliente.solicitar<Page<AlertaPublicaApi>>(
        `/api/v1/publico/alertas${query}`
      );
      return mapearPagina(pagina,mapearAlerta);
    },
    async listarAlertasAlbergue(id,consulta={}) {
      const query=construirQueryPaginada(consulta);
      const pagina=await cliente.solicitar<Page<AlertaPublicaApi>>(
        `/api/v1/publico/albergues/${encodeURIComponent(id)}/alertas${query}`
      );
      return mapearPagina(pagina,mapearAlerta);
    },
  };
}

export function obtenerPublicoGateway(
  baseUrl: string=process.env.NEXT_PUBLIC_API_URL??""
): PublicoGateway {
  return crearPublicoGateway(crearClienteApi(baseUrl,() => null));
}

export const publicoGateway: PublicoGateway=obtenerPublicoGateway();
