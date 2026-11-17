import {
  crearClienteApi,
  leerTokenAcceso,
  type ClienteApi,
} from "./api-client";
import {
  construirQueryPaginada,
  mapearPagina,
  type ConsultaPaginada,
  type Page,
} from "./paginacion";

export interface RecursoSanitario {
  readonly nombre: string;
  readonly cantidad: number;
  readonly observacion?: string|null;
}

export interface CondicionSanitaria {
  readonly id: string;
  readonly fecha: string;
  readonly aguaPotableDisponible: boolean;
  readonly banosDisponibles: number;
  readonly estadoHigiene: string;
  readonly estadoSaneamiento: string;
  readonly otrosRecursosSanitarios: RecursoSanitario[];
  readonly observaciones: string;
}

export interface CondicionSanitariaEntrada {
  readonly fecha: string;
  readonly aguaPotableDisponible: boolean;
  readonly banosDisponibles: number;
  readonly estadoHigiene: string;
  readonly estadoSaneamiento: string;
  readonly otrosRecursosSanitarios?: RecursoSanitario[];
  readonly observaciones?: string;
}

export interface CondicionesSanitariasGateway {
  listar(consulta?: ConsultaPaginada): Promise<Page<CondicionSanitaria>>;
  crear(entrada: CondicionSanitariaEntrada): Promise<CondicionSanitaria>;
  actualizar(
    id: string,
    entrada: CondicionSanitariaEntrada
  ): Promise<CondicionSanitaria>;
}

export interface RegistroEnfermedad {
  readonly id: string;
  readonly fecha: string;
  readonly enfermedad: string;
  readonly cantidadCasosActivos: number;
  readonly cantidadRecuperados: number|null;
  readonly observaciones: string;
}

export interface EnfermedadEntrada {
  readonly fecha: string;
  readonly enfermedad: string;
  readonly cantidadCasosActivos: number;
  readonly cantidadRecuperados?: number|null;
  readonly observaciones?: string;
}

export interface EnfermedadesGateway {
  listar(consulta?: ConsultaPaginada): Promise<Page<RegistroEnfermedad>>;
  crear(entrada: EnfermedadEntrada): Promise<RegistroEnfermedad>;
  actualizar(
    id: string,
    entrada: EnfermedadEntrada
  ): Promise<RegistroEnfermedad>;
}

interface CondicionApi {
  id?: string;
  _id?: string;
  fecha: string;
  agua_potable_disponible: boolean;
  banos_disponibles: number;
  estado_higiene: string;
  estado_saneamiento: string;
  otros_recursos_sanitarios?: RecursoSanitario[];
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

function mapearCondicion(d: CondicionApi): CondicionSanitaria {
  return {
    id: d.id??d._id??d.fecha,
    fecha: d.fecha.slice(0,10),
    aguaPotableDisponible: d.agua_potable_disponible,
    banosDisponibles: d.banos_disponibles,
    estadoHigiene: d.estado_higiene,
    estadoSaneamiento: d.estado_saneamiento,
    otrosRecursosSanitarios: d.otros_recursos_sanitarios??[],
    observaciones: d.observaciones??"",
  };
}

function haciaCondicionApi(e: CondicionSanitariaEntrada) {
  return {
    fecha: e.fecha,
    agua_potable_disponible: e.aguaPotableDisponible,
    banos_disponibles: e.banosDisponibles,
    estado_higiene: e.estadoHigiene.trim(),
    estado_saneamiento: e.estadoSaneamiento.trim(),
    otros_recursos_sanitarios: e.otrosRecursosSanitarios??[],
    ...(e.observaciones?.trim()
      ? { observaciones: e.observaciones.trim() }
      :{}),
  };
}

function mapearEnfermedad(d: EnfermedadApi): RegistroEnfermedad {
  return {
    id: d.id??d._id??`${d.fecha}-${d.enfermedad}`,
    fecha: d.fecha.slice(0,10),
    enfermedad: d.enfermedad,
    cantidadCasosActivos: d.cantidad_casos_activos,
    cantidadRecuperados:
      d.cantidad_recuperados??null,
    observaciones: d.observaciones??"",
  };
}

function haciaEnfermedadApi(e: EnfermedadEntrada) {
  return {
    fecha: e.fecha,
    enfermedad: e.enfermedad.trim(),
    cantidad_casos_activos: e.cantidadCasosActivos,
    ...(typeof e.cantidadRecuperados==="number"&&
      Number.isInteger(e.cantidadRecuperados)&&
      e.cantidadRecuperados>=0
      ? { cantidad_recuperados: e.cantidadRecuperados }
      :{}),
    ...(e.observaciones?.trim()
      ? { observaciones: e.observaciones.trim() }
      :{}),
  };
}

export function crearCondicionesSanitariasGateway(
  cliente: ClienteApi
): CondicionesSanitariasGateway {
  const ruta="/api/v1/mi-albergue/condiciones-sanitarias";
  return {
    async listar(consulta={}) {
      const query=construirQueryPaginada(consulta);
      const pagina=await cliente.solicitar<Page<CondicionApi>>(
        `${ruta}${query}`
      );
      return mapearPagina(pagina,mapearCondicion);
    },
    async crear(entrada) {
      const creada=await cliente.solicitar<CondicionApi>(ruta,{
        method: "POST",
        body: JSON.stringify(haciaCondicionApi(entrada)),
      });
      return mapearCondicion(creada);
    },
    async actualizar(id,entrada) {
      const actualizada=await cliente.solicitar<CondicionApi>(
        `${ruta}/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: JSON.stringify(haciaCondicionApi(entrada)),
        }
      );
      return mapearCondicion(actualizada);
    },
  };
}

export function crearEnfermedadesGateway(
  cliente: ClienteApi
): EnfermedadesGateway {
  const ruta="/api/v1/mi-albergue/enfermedades";
  return {
    async listar(consulta={}) {
      const query=construirQueryPaginada(consulta);
      const pagina=await cliente.solicitar<Page<EnfermedadApi>>(
        `${ruta}${query}`
      );
      return mapearPagina(pagina,mapearEnfermedad);
    },
    async crear(entrada) {
      const creada=await cliente.solicitar<EnfermedadApi>(ruta,{
        method: "POST",
        body: JSON.stringify(haciaEnfermedadApi(entrada)),
      });
      return mapearEnfermedad(creada);
    },
    async actualizar(id,entrada) {
      const actualizada=await cliente.solicitar<EnfermedadApi>(
        `${ruta}/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: JSON.stringify(haciaEnfermedadApi(entrada)),
        }
      );
      return mapearEnfermedad(actualizada);
    },
  };
}

export function obtenerCondicionesSanitariasGateway(
  baseUrl: string=process.env.NEXT_PUBLIC_API_URL??""
): CondicionesSanitariasGateway {
  return crearCondicionesSanitariasGateway(
    crearClienteApi(baseUrl,leerTokenAcceso)
  );
}

export function obtenerEnfermedadesGateway(
  baseUrl: string=process.env.NEXT_PUBLIC_API_URL??""
): EnfermedadesGateway {
  return crearEnfermedadesGateway(crearClienteApi(baseUrl,leerTokenAcceso));
}
