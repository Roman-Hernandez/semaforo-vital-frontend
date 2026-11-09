export type RolUsuario = "super_administrador" | "administrador_albergue";

export interface Sesion {
  readonly rol: RolUsuario | null;
  readonly demostracion: boolean;
}

export const CLAVE_TOKEN = "semaforo_vital_token";

const ROLES: readonly RolUsuario[] = [
  "super_administrador",
  "administrador_albergue",
];

export function leerToken(): string | null {
  try {
    return globalThis.sessionStorage?.getItem(CLAVE_TOKEN) ?? null;
  } catch {
    return null;
  }
}

/**
 * Lee el rol del token solo para decidir qué mostrar en la interfaz.
 * La firma la valida el backend: esto NO reemplaza la autorización.
 */
export function rolDesdeToken(token: string | null): RolUsuario | null {
  if (!token) {
    return null;
  }

  try {
    const carga = token.split(".")[1];
    const base64 = carga.replaceAll("-", "+").replaceAll("_", "/");
    const datos = JSON.parse(atob(base64));

    if (typeof datos.exp === "number" && datos.exp * 1000 < Date.now()) {
      return null;
    }

    return ROLES.includes(datos.role) ? datos.role : null;
  } catch {
    return null;
  }
}

export function obtenerSesion(
  token: string | null,
  apiConfigurada: boolean
): Sesion {
  const rol = rolDesdeToken(token);

  // Sin API configurada se trabaja con datos de prueba como súper administrador.
  if (!rol && !apiConfigurada) {
    return { rol: "super_administrador", demostracion: true };
  }

  return { rol, demostracion: false };
}
