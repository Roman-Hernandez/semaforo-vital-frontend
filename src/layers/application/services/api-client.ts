/**
 * Cliente HTTP compartido para consumir la API de Semáforo Vital.
 * Envía el token del inicio de sesión y traduce los errores a mensajes claros.
 */

export const CLAVE_TOKEN_ACCESO = "access_token";

export type ErroresCampos = Readonly<Record<string, string>>;

export class ApiError extends Error {
  readonly status: number;
  readonly campos: ErroresCampos;

  constructor(status: number, mensaje: string, campos: ErroresCampos = {}) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.campos = campos;
  }
}

export interface ClienteApi {
  solicitar<T>(ruta: string, init?: RequestInit): Promise<T>;
}

export function leerTokenAcceso(): string | null {
  try {
    return globalThis.sessionStorage?.getItem(CLAVE_TOKEN_ACCESO) ?? null;
  } catch {
    return null;
  }
}

export function mensajePorEstado(status: number): string {
  switch (status) {
    case 0:
      return "No se pudo conectar con el servidor. Verifica tu conexión.";
    case 401:
      return "Tu sesión expiró. Inicia sesión nuevamente.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "No se encontró la información solicitada.";
    case 422:
      return "Revisa los datos ingresados.";
    default:
      return "Ocurrió un error en el servidor. Inténtalo nuevamente.";
  }
}

function camposDesdeDetalle(detalle: unknown): Record<string, string> {
  const campos: Record<string, string> = {};

  if (!Array.isArray(detalle)) {
    return campos;
  }

  for (const item of detalle) {
    const loc: unknown[] = Array.isArray(item?.loc) ? item.loc : [];
    const campo = loc.at(-1);

    if (typeof campo === "string" && typeof item?.msg === "string") {
      campos[campo] = item.msg;
    }
  }

  return campos;
}

async function leerError(respuesta: Response): Promise<ApiError> {
  let cuerpo: { detail?: unknown } = {};

  try {
    cuerpo = await respuesta.json();
  } catch {
    // La respuesta no trae JSON: se usa el mensaje por defecto.
  }

  const mensaje =
    typeof cuerpo.detail === "string"
      ? cuerpo.detail
      : mensajePorEstado(respuesta.status);

  return new ApiError(
    respuesta.status,
    mensaje,
    camposDesdeDetalle(cuerpo.detail)
  );
}

export function crearClienteApi(
  baseUrl: string,
  obtenerToken: () => string | null = leerTokenAcceso,
  fetchFn: typeof fetch = (...args) => fetch(...args)
): ClienteApi {
  const raiz = baseUrl.replace(/\/$/, "");

  return {
    async solicitar<T>(ruta: string, init: RequestInit = {}): Promise<T> {
      const token = obtenerToken();
      let respuesta: Response;

      try {
        respuesta = await fetchFn(`${raiz}${ruta}`, {
          ...init,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch {
        throw new ApiError(0, mensajePorEstado(0));
      }

      if (!respuesta.ok) {
        throw await leerError(respuesta);
      }

      return (await respuesta.json()) as T;
    },
  };
}

export function esperar(milisegundos: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milisegundos));
}
