export type RolUsuario="super_administrador"|"administrador_albergue";

export interface UsuarioSesion {
  readonly id: string;
  readonly email: string;
  readonly role: RolUsuario;
  readonly active: boolean;
  readonly nombre: string|null;
  readonly apellido: string|null;
  readonly albergue_id: string|null;
}

export interface Sesion {
  readonly rol: RolUsuario|null;
  readonly usuario: UsuarioSesion|null;
  readonly demostracion: boolean;
}

export const CLAVE_TOKEN="access_token";
export const CLAVE_USUARIO="user_session";
export const EVENTO_SESION="sv-sesion-change";

const ROLES: ReadonlySet<string>=new Set<RolUsuario>([
  "super_administrador",
  "administrador_albergue",
]);

const SESION_VACIA: Sesion=Object.freeze({
  rol: null,
  usuario: null,
  demostracion: false,
});

let cacheUsuarioRaw: string|null=null;
let cacheUsuarioValor: UsuarioSesion|null=null;

let cacheSesionClave="";
let cacheSesionValor: Sesion=SESION_VACIA;

function notificarCambioSesion(): void {
  if(typeof window!=="undefined") {
    window.dispatchEvent(new Event(EVENTO_SESION));
  }
}

export function leerToken(): string|null {
  try {
    return globalThis.localStorage?.getItem(CLAVE_TOKEN)??null;
  } catch {
    return null;
  }
}

/**
 * Devuelve una referencia estable (cacheada) para ser seguro con useSyncExternalStore.
 */
export function leerUsuarioSesion(): UsuarioSesion|null {
  try {
    const raw=globalThis.localStorage?.getItem(CLAVE_USUARIO)??null;
    if(raw===cacheUsuarioRaw) {
      return cacheUsuarioValor;
    }
    cacheUsuarioRaw=raw;
    if(!raw) {
      cacheUsuarioValor=null;
      return null;
    }
    const datos=JSON.parse(raw);
    if(!datos||typeof datos!=="object"||!ROLES.has(datos.role)) {
      cacheUsuarioValor=null;
      return null;
    }
    cacheUsuarioValor=Object.freeze(datos as UsuarioSesion);
    return cacheUsuarioValor;
  } catch {
    cacheUsuarioRaw=null;
    cacheUsuarioValor=null;
    return null;
  }
}

export function rolDesdeToken(token: string|null): RolUsuario|null {
  if(!token) return null;

  try {
    const carga=token.split(".")[1];
    const base64=carga.replaceAll("-","+").replaceAll("_","/");
    const datos=JSON.parse(atob(base64));

    if(
      typeof datos.exp!=="number"||
      !Number.isFinite(datos.exp)||
      datos.exp*1000<=Date.now()
    ) {
      return null;
    }

    return ROLES.has(datos.role)? (datos.role as RolUsuario):null;
  } catch {
    return null;
  }
}

/**
 * Devuelve una referencia estable (cacheada) de Sesion.
 */
export function obtenerSesion(token?: string|null): Sesion {
  if(token===null) {
    return SESION_VACIA;
  }

  const jwt=token??leerToken();
  const rawUsuario=globalThis.localStorage?.getItem(CLAVE_USUARIO)??"";
  const clave=`${jwt??""}|${rawUsuario}`;

  if(clave===cacheSesionClave) {
    return cacheSesionValor;
  }

  const usuario=leerUsuarioSesion();
  if(usuario&&(!token||token===leerToken())) {
    cacheSesionClave=clave;
    cacheSesionValor=Object.freeze({
      rol: usuario.role,
      usuario,
      demostracion: false,
    });
    return cacheSesionValor;
  }

  const rol=rolDesdeToken(jwt);
  if(!rol) {
    cacheSesionClave=clave;
    cacheSesionValor=SESION_VACIA;
    return SESION_VACIA;
  }

  cacheSesionClave=clave;
  cacheSesionValor=Object.freeze({
    rol,
    usuario: null,
    demostracion: false,
  });
  return cacheSesionValor;
}

export function rutaPorRol(rol: RolUsuario): string {
  return rol==="super_administrador"? "/gestion/albergues":"/albergue";
}

export function guardarUsuarioSesion(usuario: UsuarioSesion): void {
  try {
    const serializado=JSON.stringify(usuario);
    globalThis.localStorage?.setItem(CLAVE_USUARIO,serializado);
    cacheUsuarioRaw=serializado;
    cacheUsuarioValor=Object.freeze({ ...usuario });
    cacheSesionClave="";
    notificarCambioSesion();
  } catch {
    // Sin localStorage disponible.
  }
}

export function guardarToken(token: string,usuario?: UsuarioSesion): RolUsuario {
  const rol=usuario?.role??rolDesdeToken(token);
  if(!rol||!ROLES.has(rol)) {
    throw new Error("El servidor devolvió una sesión inválida o vencida.");
  }

  globalThis.localStorage?.setItem(CLAVE_TOKEN,token);

  const perfil: UsuarioSesion=usuario??
    leerUsuarioSesion()??{
    id: "",
    email: "",
    role: rol,
    active: true,
    nombre: null,
    apellido: null,
    albergue_id: null,
  };

  const serializado=JSON.stringify({ ...perfil,role: rol });
  globalThis.localStorage?.setItem(CLAVE_USUARIO,serializado);
  cacheUsuarioRaw=serializado;
  cacheUsuarioValor=Object.freeze({ ...perfil,role: rol });
  cacheSesionClave="";

  notificarCambioSesion();
  return rol;
}

export function cerrarSesion(): void {
  try {
    globalThis.localStorage?.removeItem(CLAVE_TOKEN);
    globalThis.localStorage?.removeItem(CLAVE_USUARIO);
    globalThis.sessionStorage?.removeItem(CLAVE_TOKEN);
    cacheUsuarioRaw=null;
    cacheUsuarioValor=null;
    cacheSesionClave="";
    cacheSesionValor=SESION_VACIA;
    notificarCambioSesion();
  } catch {
    // Ignorar errores de almacenamiento.
  }
}

export function suscribirSesion(onChange: () => void): () => void {
  if(typeof window==="undefined") {
    return () => { };
  }
  window.addEventListener("storage",onChange);
  window.addEventListener(EVENTO_SESION,onChange);
  return () => {
    window.removeEventListener("storage",onChange);
    window.removeEventListener(EVENTO_SESION,onChange);
  };
}
