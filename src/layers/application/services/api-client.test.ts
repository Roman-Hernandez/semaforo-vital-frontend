import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  CLAVE_TOKEN_ACCESO,
  crearClienteApi,
  esperar,
  leerTokenAcceso,
  mensajePorEstado,
} from "./api-client";

function respuesta(status: number, cuerpo?: unknown): Response {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Cliente de la API", () => {
  afterEach(() => sessionStorage.clear());

  it("lee el token guardado por el inicio de sesión", () => {
    expect(leerTokenAcceso()).toBeNull();
    sessionStorage.setItem(CLAVE_TOKEN_ACCESO, "abc");
    expect(leerTokenAcceso()).toBe("abc");
  });

  it("envía el token y devuelve el JSON de la respuesta", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => respuesta(200, { ok: true }));
    const cliente = crearClienteApi("https://api.local/", () => "token-1", fetchFn);

    await expect(cliente.solicitar("/api/v1/prueba")).resolves.toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.local/api/v1/prueba",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-1" }),
      })
    );
  });

  it("no envía la cabecera de autorización sin token", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => respuesta(200, []));
    const cliente = crearClienteApi("https://api.local", () => null, fetchFn);

    await cliente.solicitar("/x");

    expect(fetchFn.mock.calls[0][1]?.headers).not.toHaveProperty("Authorization");
  });

  it("traduce los errores de validación a campos", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () =>
      respuesta(422, { detail: [{ loc: ["body", "descripcion"], msg: "Muy corta" }, { loc: [], msg: "x" }] })
    );
    const cliente = crearClienteApi("https://api.local", () => null, fetchFn);

    await expect(cliente.solicitar("/x")).rejects.toMatchObject({
      status: 422,
      message: "Revisa los datos ingresados.",
      campos: { descripcion: "Muy corta" },
    });
  });

  it("usa el mensaje del servidor cuando es texto", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => respuesta(400, { detail: "Fecha inválida" }));
    const cliente = crearClienteApi("https://api.local", () => null, fetchFn);

    await expect(cliente.solicitar("/x")).rejects.toThrow("Fecha inválida");
  });

  it.each([
    [401, "Tu sesión expiró"],
    [403, "No tienes permisos"],
    [404, "No se encontró"],
    [500, "error en el servidor"],
  ])("da un mensaje claro para el estado %i", async (status, texto) => {
    const fetchFn = vi.fn<typeof fetch>(async () => new Response("sin json", { status }));
    const cliente = crearClienteApi("https://api.local", () => null, fetchFn);

    await expect(cliente.solicitar("/x")).rejects.toThrow(texto);
  });

  it("informa cuando no hay conexión", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => {
      throw new TypeError("Failed to fetch");
    });
    const cliente = crearClienteApi("https://api.local", () => null, fetchFn);

    const error = await cliente.solicitar("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, message: mensajePorEstado(0) });
  });

  it("espera el tiempo indicado", async () => {
    await expect(esperar(0)).resolves.toBeUndefined();
  });
});
