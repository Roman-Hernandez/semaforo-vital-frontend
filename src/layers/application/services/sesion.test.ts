import { afterEach, describe, expect, it } from "vitest";
import {
  CLAVE_TOKEN,
  CLAVE_USUARIO,
  cerrarSesion,
  guardarToken,
  guardarUsuarioSesion,
  leerToken,
  leerUsuarioSesion,
  obtenerSesion,
  rolDesdeToken,
  rutaPorRol,
  type UsuarioSesion,
} from "./sesion";

function token(carga: Record<string, unknown>): string {
  const base64 = btoa(JSON.stringify(carga))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `cabecera.${base64}.firma`;
}

const futuro = Math.floor(Date.now() / 1000) + 3600;

describe("Sesión del usuario en localStorage", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("lee el rol desde el token una única vez al iniciar sesión", () => {
    expect(rolDesdeToken(token({ role: "super_administrador", exp: futuro }))).toBe("super_administrador");
    expect(rolDesdeToken(token({ role: "administrador_albergue", exp: futuro }))).toBe("administrador_albergue");
  });

  it("ignora tokens vencidos, inválidos o con roles desconocidos", () => {
    expect(rolDesdeToken(token({ role: "super_administrador", exp: 1 }))).toBeNull();
    expect(rolDesdeToken(token({ role: "otro", exp: futuro }))).toBeNull();
    expect(rolDesdeToken("no-es-un-token")).toBeNull();
    expect(rolDesdeToken(null)).toBeNull();
    expect(rolDesdeToken(token({ role: "super_administrador" }))).toBeNull();
  });

  it("guarda y lee el token y el perfil de usuario en localStorage sin re-decodificar", () => {
    expect(CLAVE_TOKEN).toBe("access_token");
    expect(CLAVE_USUARIO).toBe("user_session");
    expect(leerToken()).toBeNull();
    expect(leerUsuarioSesion()).toBeNull();

    const jwt = token({ sub: "usr-1", role: "super_administrador", exp: futuro });
    const rol = guardarToken(jwt);
    expect(rol).toBe("super_administrador");
    expect(localStorage.getItem(CLAVE_TOKEN)).toBe(jwt);
    expect(leerToken()).toBe(jwt);

    const perfil: UsuarioSesion = {
      id: "usr-1",
      email: "coordinador@semaforo.gob",
      role: "super_administrador",
      active: true,
      nombre: "Laura",
      apellido: "Gómez",
      albergue_id: null,
    };
    guardarUsuarioSesion(perfil);
    expect(leerUsuarioSesion()).toEqual(perfil);
    expect(obtenerSesion()).toEqual({
      rol: "super_administrador",
      usuario: perfil,
      demostracion: false,
    });
  });

  it("resuelve las nuevas rutas institucionales y limpia localStorage al cerrar sesión", () => {
    expect(rutaPorRol("super_administrador")).toBe("/gestion/albergues");
    expect(rutaPorRol("administrador_albergue")).toBe("/albergue");

    const jwt = token({ role: "administrador_albergue", exp: futuro });
    guardarToken(jwt);
    cerrarSesion();

    expect(leerToken()).toBeNull();
    expect(leerUsuarioSesion()).toBeNull();
    expect(obtenerSesion(null)).toEqual({ rol: null, usuario: null, demostracion: false });
    expect(() => guardarToken("invalido")).toThrow();
  });
});
