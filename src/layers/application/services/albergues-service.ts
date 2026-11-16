import type {
  Albergue,
  AlbergueEntrada,
  CampoAlbergue,
  ErroresAlbergue,
  NivelRiesgo,
} from "@/layers/domain/albergues/albergue";

export interface AlberguesGateway {
  listar(): Promise<Albergue[]>;
  crear(entrada: AlbergueEntrada): Promise<Albergue>;
  actualizar(id: string, entrada: AlbergueEntrada): Promise<Albergue>;
  cambiarEstado(id: string, activo: boolean): Promise<Albergue>;
}

export class AlberguesError extends Error {
  readonly status: number;
  readonly campos: ErroresAlbergue;

  constructor(status: number, mensaje: string, campos: ErroresAlbergue = {}) {
    super(mensaje);
    this.name = "AlberguesError";
    this.status = status;
    this.campos = campos;
  }
}

/* ------------------------------------------------------------------ */
/* Implementación HTTP (contrato de la colección `albergues` en MongoDB) */
/* ------------------------------------------------------------------ */

interface AlbergueApi {
  _id?: string;
  id?: string;
  codigo_albergue: string;
  nombre: string;
  ubicacion: {
    departamento: string;
    municipio: string;
    direccion: string;
    coordenadas: { type: "Point"; coordinates: [number, number] };
  };
  capacidad_instalada: number;
  activo: boolean;
  poblacion_actual?: number | null;
  administrador?: string | null;
  nivel_riesgo?: NivelRiesgo | null;
  created_at?: string;
}

const CAMPOS_API: Record<string, CampoAlbergue> = {
  codigo_albergue: "codigo",
  nombre: "nombre",
  departamento: "departamento",
  municipio: "municipio",
  direccion: "direccion",
  capacidad_instalada: "capacidadInstalada",
  activo: "activo",
};

export function desdeApi(dato: AlbergueApi): Albergue {
  const [longitud, latitud] = dato.ubicacion.coordenadas.coordinates;

  return {
    id: dato.id ?? dato._id ?? dato.codigo_albergue,
    codigo: dato.codigo_albergue,
    nombre: dato.nombre,
    departamento: dato.ubicacion.departamento,
    municipio: dato.ubicacion.municipio,
    direccion: dato.ubicacion.direccion,
    latitud,
    longitud,
    capacidadInstalada: dato.capacidad_instalada,
    activo: dato.activo,
    poblacionActual: dato.poblacion_actual ?? null,
    administrador: dato.administrador ?? null,
    riesgo: dato.nivel_riesgo ?? null,
    creadoEn: dato.created_at ?? "",
  };
}

export function haciaApi(entrada: AlbergueEntrada) {
  return {
    codigo_albergue: entrada.codigo,
    nombre: entrada.nombre,
    ubicacion: {
      departamento: entrada.departamento,
      municipio: entrada.municipio,
      direccion: entrada.direccion,
      coordenadas: {
        type: "Point",
        coordinates: [entrada.longitud, entrada.latitud],
      },
    },
    capacidad_instalada: entrada.capacidadInstalada,
    activo: entrada.activo,
  };
}

function mensajePorEstado(status: number): string {
  switch (status) {
    case 401:
      return "Tu sesión expiró. Inicia sesión nuevamente.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "El albergue no existe o fue eliminado.";
    case 409:
      return "Ya existe un albergue con ese código.";
    case 422:
      return "Revisa los datos ingresados.";
    default:
      return "Ocurrió un error en el servidor. Inténtalo nuevamente.";
  }
}

function camposDesdeDetalle(detalle: unknown): ErroresAlbergue {
  if (!Array.isArray(detalle)) {
    return {};
  }

  const campos: ErroresAlbergue = {};

  for (const item of detalle) {
    const loc: unknown[] = Array.isArray(item?.loc) ? item.loc : [];
    const campo = loc
      .map((parte) => CAMPOS_API[String(parte)])
      .find(Boolean);

    if (campo && typeof item?.msg === "string") {
      campos[campo] = item.msg;
    }
  }

  return campos;
}

async function leerError(respuesta: Response): Promise<AlberguesError> {
  let cuerpo: { detail?: unknown } = {};

  try {
    cuerpo = await respuesta.json();
  } catch {
    // La respuesta no trae JSON: se usa el mensaje por defecto.
  }

  const campos = camposDesdeDetalle(cuerpo.detail);

  if (respuesta.status === 409) {
    campos.codigo ??= mensajePorEstado(409);
  }

  const mensaje =
    typeof cuerpo.detail === "string"
      ? cuerpo.detail
      : mensajePorEstado(respuesta.status);

  return new AlberguesError(respuesta.status, mensaje, campos);
}

export function crearGatewayHttp(
  baseUrl: string,
  obtenerToken: () => string | null,
  fetchFn: typeof fetch = (...args) => fetch(...args)
): AlberguesGateway {
  const url = `${baseUrl.replace(/\/$/, "")}/api/v1/albergues`;

  async function solicitar<T>(ruta: string, init: RequestInit = {}): Promise<T> {
    const token = obtenerToken();
    let respuesta: Response;

    try {
      respuesta = await fetchFn(`${url}${ruta}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      throw new AlberguesError(
        0,
        "No se pudo conectar con el servidor. Verifica tu conexión."
      );
    }

    if (!respuesta.ok) {
      throw await leerError(respuesta);
    }

    return (await respuesta.json()) as T;
  }

  return {
    async listar() {
      const datos = await solicitar<AlbergueApi[]>("");
      return datos.map(desdeApi);
    },
    async crear(entrada) {
      return desdeApi(
        await solicitar<AlbergueApi>("", {
          method: "POST",
          body: JSON.stringify(haciaApi(entrada)),
        })
      );
    },
    async actualizar(id, entrada) {
      return desdeApi(
        await solicitar<AlbergueApi>(`/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(haciaApi(entrada)),
        })
      );
    },
    async cambiarEstado(id, activo) {
      return desdeApi(
        await solicitar<AlbergueApi>(`/${encodeURIComponent(id)}/estado`, {
          method: "PATCH",
          body: JSON.stringify({ activo }),
        })
      );
    },
  };
}

/* ------------------------------------------------------------------ */
/* Implementación en memoria (mientras backend expone `/albergues`)   */
/* ------------------------------------------------------------------ */

export const ALBERGUES_DEMO: Albergue[] = [
  {
    id: "alb-001",
    codigo: "ALB-PER-001",
    nombre: "Albergue San José",
    departamento: "Risaralda",
    municipio: "Pereira",
    direccion: "Cra. 7 # 19-45, Centro",
    latitud: 4.8143,
    longitud: -75.6946,
    capacidadInstalada: 470,
    activo: true,
    poblacionActual: 386,
    administrador: "María López",
    riesgo: "critico",
    creadoEn: "2026-09-18",
  },
  {
    id: "alb-002",
    codigo: "ALB-DOS-002",
    nombre: "Polideportivo Norte",
    departamento: "Risaralda",
    municipio: "Dosquebradas",
    direccion: "Av. Simón Bolívar # 35-10",
    latitud: 4.8395,
    longitud: -75.6673,
    capacidadInstalada: 428,
    activo: true,
    poblacionActual: 274,
    administrador: "Carlos Méndez",
    riesgo: "medio",
    creadoEn: "2026-09-20",
  },
  {
    id: "alb-003",
    codigo: "ALB-SRO-003",
    nombre: "Centro Comunal La Esperanza",
    departamento: "Risaralda",
    municipio: "Santa Rosa de Cabal",
    direccion: "Calle 14 # 15-20, Barrio La Esperanza",
    latitud: 4.8682,
    longitud: -75.6214,
    capacidadInstalada: 686,
    activo: true,
    poblacionActual: 521,
    administrador: "Ana Sofía Ruiz",
    riesgo: "bajo",
    creadoEn: "2026-09-22",
  },
  {
    id: "alb-004",
    codigo: "ALB-VIR-004",
    nombre: "Instituto Técnico Sur",
    departamento: "Caldas",
    municipio: "La Virginia",
    direccion: "Cra. 8 # 5-30",
    latitud: 4.8994,
    longitud: -75.8823,
    capacidadInstalada: 380,
    activo: true,
    poblacionActual: 334,
    administrador: "Jorge Palacios",
    riesgo: "critico",
    creadoEn: "2026-09-25",
  },
  {
    id: "alb-005",
    codigo: "ALB-BEL-005",
    nombre: "Complejo Municipal El Roble",
    departamento: "Risaralda",
    municipio: "Belén de Umbría",
    direccion: "Vereda El Roble, km 2",
    latitud: 5.2001,
    longitud: -75.8689,
    capacidadInstalada: 341,
    activo: false,
    poblacionActual: 198,
    administrador: null,
    riesgo: "alto",
    creadoEn: "2026-09-27",
  },
  {
    id: "alb-006",
    codigo: "ALB-PER-006",
    nombre: "Coliseo Cuba",
    departamento: "Risaralda",
    municipio: "Pereira",
    direccion: "Av. de las Américas # 70-12",
    latitud: 4.7937,
    longitud: -75.7381,
    capacidadInstalada: 520,
    activo: true,
    poblacionActual: 210,
    administrador: "Luisa Fernanda Ríos",
    riesgo: "bajo",
    creadoEn: "2026-10-02",
  },
  {
    id: "alb-007",
    codigo: "ALB-MAR-007",
    nombre: "Escuela Rural Marsella",
    departamento: "Risaralda",
    municipio: "Marsella",
    direccion: "Calle 10 # 9-04",
    latitud: 4.9361,
    longitud: -75.7386,
    capacidadInstalada: 150,
    activo: true,
    poblacionActual: 132,
    administrador: null,
    riesgo: "alto",
    creadoEn: "2026-10-05",
  },
];

function retrasar(milisegundos: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milisegundos));
}

export function crearGatewayMemoria(
  semilla: Albergue[] = ALBERGUES_DEMO,
  latenciaMs = 350
): AlberguesGateway {
  let albergues = semilla.map((albergue) => ({ ...albergue }));
  let secuencia = albergues.length;

  function buscar(id: string): Albergue {
    const albergue = albergues.find((item) => item.id === id);

    if (!albergue) {
      throw new AlberguesError(404, mensajePorEstado(404));
    }

    return albergue;
  }

  function validarCodigoUnico(codigo: string, idActual?: string) {
    const duplicado = albergues.some(
      (item) => item.codigo === codigo && item.id !== idActual
    );

    if (duplicado) {
      throw new AlberguesError(409, mensajePorEstado(409), {
        codigo: mensajePorEstado(409),
      });
    }
  }

  function reemplazar(actualizado: Albergue): Albergue {
    albergues = albergues.map((item) =>
      item.id === actualizado.id ? actualizado : item
    );
    return actualizado;
  }

  return {
    async listar() {
      await retrasar(latenciaMs);
      return albergues.map((albergue) => ({ ...albergue }));
    },
    async crear(entrada) {
      await retrasar(latenciaMs);
      validarCodigoUnico(entrada.codigo);
      secuencia += 1;

      const nuevo: Albergue = {
        ...entrada,
        id: `alb-${String(secuencia).padStart(3, "0")}`,
        poblacionActual: null,
        administrador: null,
        riesgo: null,
        creadoEn: new Date().toISOString().slice(0, 10),
      };

      albergues = [nuevo, ...albergues];
      return { ...nuevo };
    },
    async actualizar(id, entrada) {
      await retrasar(latenciaMs);
      const actual = buscar(id);
      validarCodigoUnico(entrada.codigo, id);
      return { ...reemplazar({ ...actual, ...entrada }) };
    },
    async cambiarEstado(id, activo) {
      await retrasar(latenciaMs);
      return { ...reemplazar({ ...buscar(id), activo }) };
    },
  };
}

let gatewayPorDefecto: AlberguesGateway | null = null;

export function obtenerAlberguesGateway(
  obtenerToken: () => string | null
): AlberguesGateway {
  if (!gatewayPorDefecto) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    gatewayPorDefecto = baseUrl
      ? crearGatewayHttp(baseUrl, obtenerToken)
      : crearGatewayMemoria();
  }

  return gatewayPorDefecto;
}
