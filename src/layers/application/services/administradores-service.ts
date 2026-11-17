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

export interface Administrador {
  readonly id: string;
  readonly email: string;
  readonly role: "super_administrador" | "administrador_albergue";
  readonly active: boolean;
  readonly nombre: string | null;
  readonly apellido: string | null;
  readonly albergueId: string | null;
  readonly albergueNombre?: string | null;
  readonly codigoAlbergue?: string | null;
}

export interface AdministradorCrear {
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
  readonly password: string;
  readonly albergueId?: string | null;
}

export interface AdministradorActualizar {
  readonly nombre?: string;
  readonly apellido?: string;
  readonly email?: string;
  readonly password?: string;
  readonly active?: boolean;
}

export interface AdministradoresGateway {
  listar(consulta?: ConsultaPaginada): Promise<Page<Administrador>>;
  crear(entrada: AdministradorCrear): Promise<Administrador>;
  actualizar(
    id: string,
    cambios: AdministradorActualizar
  ): Promise<Administrador>;
  asignarAlbergue(
    id: string,
    albergueId: string | null
  ): Promise<Administrador>;
}

interface AdministradorApi {
  id: string;
  email: string;
  role: "super_administrador" | "administrador_albergue";
  active: boolean;
  nombre: string | null;
  apellido: string | null;
  albergue_id: string | null;
  albergue_nombre?: string | null;
  codigo_albergue?: string | null;
}

function desdeApi(dato: AdministradorApi): Administrador {
  return {
    id: dato.id,
    email: dato.email,
    role: dato.role,
    active: dato.active,
    nombre: dato.nombre,
    apellido: dato.apellido,
    albergueId: dato.albergue_id,
    albergueNombre: dato.albergue_nombre ?? null,
    codigoAlbergue: dato.codigo_albergue ?? null,
  };
}

export function crearAdministradoresGateway(
  cliente: ClienteApi
): AdministradoresGateway {
  return {
    async listar(consulta = {}) {
      const query = construirQueryPaginada(consulta);
      const pagina = await cliente.solicitar<Page<AdministradorApi>>(
        `/api/v1/administradores${query}`
      );
      return mapearPagina(pagina, desdeApi);
    },
    async crear(entrada) {
      const cuerpo: Record<string, unknown> = {
        nombre: entrada.nombre.trim(),
        apellido: entrada.apellido.trim(),
        email: entrada.email.trim(),
        password: entrada.password,
      };
      if (entrada.albergueId) {
        cuerpo.albergue_id = entrada.albergueId;
      }
      const creado = await cliente.solicitar<AdministradorApi>(
        "/api/v1/administradores",
        {
          method: "POST",
          body: JSON.stringify(cuerpo),
        }
      );
      return desdeApi(creado);
    },
    async actualizar(id, cambios) {
      const cuerpo: Record<string, unknown> = {};
      if (cambios.nombre !== undefined) cuerpo.nombre = cambios.nombre.trim();
      if (cambios.apellido !== undefined)
        cuerpo.apellido = cambios.apellido.trim();
      if (cambios.email !== undefined) cuerpo.email = cambios.email.trim();
      if (cambios.active !== undefined) cuerpo.active = cambios.active;
      if (cambios.password) cuerpo.password = cambios.password;

      const actualizado = await cliente.solicitar<AdministradorApi>(
        `/api/v1/administradores/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(cuerpo),
        }
      );
      return desdeApi(actualizado);
    },
    async asignarAlbergue(id, albergueId) {
      const actualizado = await cliente.solicitar<AdministradorApi>(
        `/api/v1/administradores/${encodeURIComponent(id)}/albergue`,
        {
          method: "PUT",
          body: JSON.stringify({ albergue_id: albergueId }),
        }
      );
      return desdeApi(actualizado);
    },
  };
}

export function obtenerAdministradoresGateway(
  baseUrl: string = process.env.NEXT_PUBLIC_API_URL ?? ""
): AdministradoresGateway {
  return crearAdministradoresGateway(crearClienteApi(baseUrl, leerTokenAcceso));
}
