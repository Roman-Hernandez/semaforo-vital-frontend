import { ApiError,crearClienteApi } from "./api-client";
import {
  construirQueryPaginada,
  mapearPagina,
  type ConsultaPaginada,
  type Page,
} from "./paginacion";
import type {
  Albergue,
  AlbergueEntrada,
  CampoAlbergue,
  ErroresAlbergue,
  NivelRiesgo,
} from "@/layers/domain/albergues/albergue";

const CONSULTA_REGISTROS_INICIAL: ConsultaPaginada=Object.freeze({ page: 1,page_size: 10 });

export type NivelRiesgoCanonico="verde"|"amarillo"|"rojo";

export interface ResumenAlberguesGlobal {
  readonly totalRegistrados: number;
  readonly totalActivos: number;
  readonly conAdministrador: number;
  readonly criticos: number;
  readonly sinClasificacion: number;
  readonly poblacionActual: number|null;
  readonly alberguesSinPoblacion: number;
  readonly porcentajeOcupacion: number|null;
}

export interface CondicionGlobalAlbergue {
  readonly id: string;
  readonly fecha: string;
  readonly aguaPotableDisponible: boolean;
  readonly banosDisponibles: number;
  readonly estadoHigiene: string;
  readonly estadoSaneamiento: string;
  readonly observaciones: string;
}

export interface EnfermedadGlobalAlbergue {
  readonly id: string;
  readonly fecha: string;
  readonly enfermedad: string;
  readonly cantidadCasosActivos: number;
  readonly cantidadRecuperados: number|null;
  readonly observaciones: string;
}

export interface IntervencionGlobalAlbergue {
  readonly id: string;
  readonly fecha: string;
  readonly tipo: string;
  readonly descripcion: string;
  readonly observaciones: string;
}

export interface RegistrosAlbergueGlobal {
  readonly condiciones: Page<CondicionGlobalAlbergue>;
  readonly enfermedades: Page<EnfermedadGlobalAlbergue>;
  readonly intervenciones: Page<IntervencionGlobalAlbergue>;
}

export interface AlberguesGateway {
  listar(consulta?: ConsultaPaginada): Promise<Page<Albergue>>;
  resumen?(): Promise<ResumenAlberguesGlobal>;
  obtener?(id: string): Promise<Albergue>;
  crear(entrada: AlbergueEntrada): Promise<Albergue>;
  actualizar(id: string,entrada: AlbergueEntrada): Promise<Albergue>;
  cambiarEstado(id: string,activo: boolean): Promise<Albergue>;
  consultarRegistros?(
    id: string,
    consulta?: ConsultaPaginada
  ): Promise<RegistrosAlbergueGlobal>;
  listarCondiciones?(
    id: string,
    consulta?: ConsultaPaginada
  ): Promise<Page<CondicionGlobalAlbergue>>;
  listarEnfermedades?(
    id: string,
    consulta?: ConsultaPaginada
  ): Promise<Page<EnfermedadGlobalAlbergue>>;
  listarIntervenciones?(
    id: string,
    consulta?: ConsultaPaginada
  ): Promise<Page<IntervencionGlobalAlbergue>>;
}

export class AlberguesError extends Error {
  readonly status: number;
  readonly campos: ErroresAlbergue;

  constructor(status: number,mensaje: string,campos: ErroresAlbergue={}) {
    super(mensaje);
    this.name="AlberguesError";
    this.status=status;
    this.campos=campos;
  }
}

export interface AlbergueApi {
  _id?: string;
  id?: string;
  codigo_albergue: string;
  nombre: string;
  ubicacion: {
    departamento: string;
    municipio: string;
    direccion: string;
    coordenadas: { type: "Point"; coordinates: [number,number] };
  };
  capacidad_instalada: number;
  activo: boolean;
  poblacion_actual?: number|null;
  administrador?: string|null;
  nivel_riesgo?: NivelRiesgoCanonico|NivelRiesgo|null;
  created_at?: string;
}

export interface ResumenAlberguesApi {
  total_registrados: number;
  total_activos: number;
  con_administrador: number;
  criticos: number;
  sin_clasificacion: number;
  poblacion_actual: number|null;
  albergues_sin_poblacion: number;
  porcentaje_ocupacion: number|null;
}

interface CondicionApi {
  id?: string;
  _id?: string;
  fecha: string;
  agua_potable_disponible: boolean;
  banos_disponibles: number;
  estado_higiene: string;
  estado_saneamiento: string;
  observaciones?: string|null;
}

interface EnfermedadApi {
  id?: string;
  _id?: string;
  fecha: string;
  enfermedad: string;
  cantidad_casos_activos: number;
  cantidad_recuperados?: number|null;
  observaciones?: string|null;
}

interface IntervencionApi {
  id?: string;
  _id?: string;
  fecha_intervencion: string;
  tipo_intervencion: string;
  descripcion: string;
  observaciones?: string|null;
}

const CAMPOS_API: Record<string,CampoAlbergue>={
  codigo_albergue: "codigo",
  nombre: "nombre",
  departamento: "departamento",
  municipio: "municipio",
  direccion: "direccion",
  capacidad_instalada: "capacidadInstalada",
  activo: "activo",
};

export function adaptarNivelRiesgo(
  nivel?: NivelRiesgoCanonico|NivelRiesgo|null
): NivelRiesgo|null {
  if(!nivel) return null;
  if(nivel==="verde"||nivel==="bajo") return "bajo";
  if(nivel==="amarillo"||nivel==="medio") return "medio";
  if(nivel==="rojo"||nivel==="critico") return "critico";
  if(nivel==="alto") return "alto";
  return null;
}

export function desdeApi(dato: AlbergueApi): Albergue {
  const [longitud,latitud]=dato.ubicacion.coordenadas.coordinates;

  return {
    id: dato.id??dato._id??dato.codigo_albergue,
    codigo: dato.codigo_albergue,
    nombre: dato.nombre,
    departamento: dato.ubicacion.departamento,
    municipio: dato.ubicacion.municipio,
    direccion: dato.ubicacion.direccion,
    latitud,
    longitud,
    capacidadInstalada: dato.capacidad_instalada,
    activo: dato.activo,
    poblacionActual:
      dato.poblacion_actual??null,
    administrador: dato.administrador??null,
    riesgo: adaptarNivelRiesgo(dato.nivel_riesgo),
    creadoEn: dato.created_at??"",
  };
}

export function mapearResumenGlobal(
  dato: ResumenAlberguesApi
): ResumenAlberguesGlobal {
  return {
    totalRegistrados: dato.total_registrados,
    totalActivos: dato.total_activos,
    conAdministrador: dato.con_administrador,
    criticos: dato.criticos,
    sinClasificacion: dato.sin_clasificacion,
    poblacionActual:
      dato.poblacion_actual??null,
    alberguesSinPoblacion: dato.albergues_sin_poblacion,
    porcentajeOcupacion:
      dato.porcentaje_ocupacion??null,
  };
}

export function haciaApi(entrada: AlbergueEntrada) {
  return {
    nombre: entrada.nombre,
    ubicacion: {
      departamento: entrada.departamento,
      municipio: entrada.municipio,
      direccion: entrada.direccion,
      coordenadas: {
        type: "Point" as const,
        coordinates: [entrada.longitud,entrada.latitud] as [number,number],
      },
    },
    capacidad_instalada: entrada.capacidadInstalada,
  };
}

function mapearCondicionGlobal(c: CondicionApi): CondicionGlobalAlbergue {
  return {
    id: c.id??c._id??c.fecha,
    fecha: c.fecha.slice(0,10),
    aguaPotableDisponible: c.agua_potable_disponible,
    banosDisponibles: c.banos_disponibles,
    estadoHigiene: c.estado_higiene,
    estadoSaneamiento: c.estado_saneamiento,
    observaciones: c.observaciones??"",
  };
}

function mapearEnfermedadGlobal(e: EnfermedadApi): EnfermedadGlobalAlbergue {
  return {
    id: e.id??e._id??`${e.fecha}-${e.enfermedad}`,
    fecha: e.fecha.slice(0,10),
    enfermedad: e.enfermedad,
    cantidadCasosActivos: e.cantidad_casos_activos,
    cantidadRecuperados:
      e.cantidad_recuperados??null,
    observaciones: e.observaciones??"",
  };
}

function mapearIntervencionGlobal(
  i: IntervencionApi
): IntervencionGlobalAlbergue {
  return {
    id: i.id??i._id??`${i.fecha_intervencion}-${i.tipo_intervencion}`,
    fecha: i.fecha_intervencion.slice(0,10),
    tipo: i.tipo_intervencion,
    descripcion: i.descripcion,
    observaciones: i.observaciones??"",
  };
}

export function crearGatewayHttp(
  baseUrl: string,
  obtenerToken: () => string|null,
  fetchFn: typeof fetch=(...args) => fetch(...args)
): AlberguesGateway {
  const cliente=crearClienteApi(baseUrl,obtenerToken,fetchFn);

  async function solicitar<T>(
    ruta: string,
    init: RequestInit={}
  ): Promise<T> {
    try {
      return await cliente.solicitar<T>(`/api/v1/albergues${ruta}`,init);
    } catch(error) {
      if(!(error instanceof ApiError)) throw error;
      const campos: ErroresAlbergue={};
      for(const [campo,mensaje] of Object.entries(error.campos)) {
        const destino=CAMPOS_API[campo];
        if(destino) campos[destino]=mensaje;
      }
      throw new AlberguesError(error.status,error.message,campos);
    }
  }

  return {
    async listar(consulta={}) {
      const query=construirQueryPaginada(consulta);
      const pagina=await solicitar<Page<AlbergueApi>>(query);
      return mapearPagina(pagina,desdeApi);
    },
    async resumen() {
      const datos=await solicitar<ResumenAlberguesApi>("/resumen");
      return mapearResumenGlobal(datos);
    },
    async obtener(id) {
      const dato=await solicitar<AlbergueApi>(`/${encodeURIComponent(id)}`);
      return desdeApi(dato);
    },
    async crear(entrada) {
      return desdeApi(
        await solicitar<AlbergueApi>("",{
          method: "POST",
          body: JSON.stringify(haciaApi(entrada)),
        })
      );
    },
    async actualizar(id,entrada) {
      return desdeApi(
        await solicitar<AlbergueApi>(`/${encodeURIComponent(id)}`,{
          method: "PATCH",
          body: JSON.stringify({
            nombre: entrada.nombre,
            ubicacion: haciaApi(entrada).ubicacion,
            capacidad_instalada: entrada.capacidadInstalada,
          }),
        })
      );
    },
    async cambiarEstado(id,activo) {
      if(activo) {
        throw new AlberguesError(
          422,
          "La reactivación de albergues aún no está disponible."
        );
      }
      return desdeApi(
        await solicitar<AlbergueApi>(`/${encodeURIComponent(id)}/desactivar`,{
          method: "PATCH",
        })
      );
    },
    async listarCondiciones(id,consulta={}) {
      const encoded=encodeURIComponent(id);
      const query=construirQueryPaginada(consulta);
      const pagina=await solicitar<Page<CondicionApi>>(
        `/${encoded}/condiciones-sanitarias${query}`
      );
      return mapearPagina(pagina,mapearCondicionGlobal);
    },
    async listarEnfermedades(id,consulta={}) {
      const encoded=encodeURIComponent(id);
      const query=construirQueryPaginada(consulta);
      const pagina=await solicitar<Page<EnfermedadApi>>(
        `/${encoded}/enfermedades${query}`
      );
      return mapearPagina(pagina,mapearEnfermedadGlobal);
    },
    async listarIntervenciones(id,consulta={}) {
      const encoded=encodeURIComponent(id);
      const query=construirQueryPaginada(consulta);
      const pagina=await solicitar<Page<IntervencionApi>>(
        `/${encoded}/intervenciones${query}`
      );
      return mapearPagina(pagina,mapearIntervencionGlobal);
    },
    async consultarRegistros(id,consulta=CONSULTA_REGISTROS_INICIAL) {
      const encoded=encodeURIComponent(id);
      const query=construirQueryPaginada(consulta);
      const [condiciones,enfermedades,intervenciones]=await Promise.all([
        solicitar<Page<CondicionApi>>(
          `/${encoded}/condiciones-sanitarias${query}`
        ),
        solicitar<Page<EnfermedadApi>>(`/${encoded}/enfermedades${query}`),
        solicitar<Page<IntervencionApi>>(
          `/${encoded}/intervenciones${query}`
        ),
      ]);

      return {
        condiciones: mapearPagina(condiciones,mapearCondicionGlobal),
        enfermedades: mapearPagina(enfermedades,mapearEnfermedadGlobal),
        intervenciones: mapearPagina(intervenciones,mapearIntervencionGlobal),
      };
    },
  };
}

let gatewayPorDefecto: AlberguesGateway|null=null;

export function obtenerAlberguesGateway(
  obtenerToken: () => string|null
): AlberguesGateway {
  if(!gatewayPorDefecto) {
    const baseUrl=process.env.NEXT_PUBLIC_API_URL??"";
    gatewayPorDefecto=crearGatewayHttp(baseUrl,obtenerToken);
  }

  return gatewayPorDefecto;
}
