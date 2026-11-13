import { afterEach, describe, expect, it } from "vitest";
import { CLAVE_TOKEN, leerToken, obtenerSesion, rolDesdeToken } from "./sesion";

function token(carga: Record<string, unknown>): string {
  const base64 = btoa(JSON.stringify(carga))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `cabecera.${base64}.firma`;
}

const futuro = Math.floor(Date.now() / 1000) + 3600;

describe("Sesión del usuario", () => {
  afterEach(() => sessionStorage.clear());

  it("lee el rol desde el token del login", () => {
    expect(rolDesdeToken(token({ role: "super_administrador", exp: futuro }))).toBe("super_administrador");
    expect(rolDesdeToken(token({ role: "administrador_albergue", exp: futuro }))).toBe("administrador_albergue");
  });

  it("ignora tokens vencidos, inválidos o con roles desconocidos", () => {
    expect(rolDesdeToken(token({ role: "super_administrador", exp: 1 }))).toBeNull();
    expect(rolDesdeToken(token({ role: "otro" }))).toBeNull();
    expect(rolDesdeToken("no-es-un-token")).toBeNull();
    expect(rolDesdeToken(null)).toBeNull();
  });

  it("lee el token guardado en la sesión del navegador", () => {
    expect(leerToken()).toBeNull();
    sessionStorage.setItem(CLAVE_TOKEN, "abc");
    expect(leerToken()).toBe("abc");
  });

  it("usa modo demostración solo cuando no hay API configurada", () => {
    expect(obtenerSesion(null, false)).toEqual({ rol: "super_administrador", demostracion: true });
    expect(obtenerSesion(null, true)).toEqual({ rol: null, demostracion: false });
    expect(obtenerSesion(token({ role: "administrador_albergue", exp: futuro }), true)).toEqual({
      rol: "administrador_albergue",
      demostracion: false,
    });
  });
});
