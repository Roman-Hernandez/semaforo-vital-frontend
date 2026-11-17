import {
  ApiError,
  crearClienteApi,
  type ClienteApi,
} from "./api-client";
import {
  construirQueryPaginada,
  mapearPagina,
  type ConsultaPaginada,
  type Page,
} from "./paginacion";
import {
  normalizarIntervencion,
  type Intervencion,
  type IntervencionEntrada,
} from "../../domain/intervenciones/intervencion";

export interface IntervencionesGateway {
  listar(consulta?: ConsultaPaginada): Promise<Page<Intervencion>>;
  registrar(entrada: IntervencionEntrada): Promise<Intervencion>;
  actualizar?(id: string, entrada: IntervencionEntrada): Promise<Intervencion>;
}

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
    id:
      dato.id ??
      dato._id ??
      `${dato.fecha_intervencion}-${dato.tipo_intervencion}`,
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
    async listar(consulta = {}) {
      const query = construirQueryPaginada(consulta);
      const pagina = await cliente.solicitar<Page<IntervencionApi>>(
        `${RUTA_INTERVENCIONES}${query}`
      );
      return mapearPagina(pagina, desdeApi);
    },
    async registrar(entrada) {
      try {
        const creada = await cliente.solicitar<IntervencionApi>(
          RUTA_INTERVENCIONES,
          {
            method: "POST",
            body: JSON.stringify(haciaApi(entrada)),
          }
        );
        return desdeApi(creada);
      } catch (error) {
        return traducirCampos(error);
      }
    },
    async actualizar(id, entrada) {
      try {
        const actualizada = await cliente.solicitar<IntervencionApi>(
          `${RUTA_INTERVENCIONES}/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            body: JSON.stringify(haciaApi(entrada)),
          }
        );
        return desdeApi(actualizada);
      } catch (error) {
        return traducirCampos(error);
      }
    },
  };
}

export function obtenerIntervencionesGateway(
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL
): IntervencionesGateway {
  return crearGatewayHttp(crearClienteApi(baseUrl ?? ""));
}
