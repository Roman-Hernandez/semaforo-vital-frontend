import { describe, expect, it, vi } from "vitest";
import type { AlbergueEntrada } from "@/layers/domain/albergues/albergue";
import {
  ALBERGUES_DEMO,
  AlberguesError,
  crearGatewayHttp,
  crearGatewayMemoria,
  desdeApi,
  haciaApi,
} from "./albergues-service";

const entrada: AlbergueEntrada = {
  codigo: "ALB-NEW-001",
  nombre: "Nuevo albergue",
  departamento: "Risaralda",
  municipio: "Pereira",
  direccion: "Calle 1 # 2-3",
  latitud: 4.81,
  longitud: -75.69,
  capacidadInstalada: 100,
  activo: true,
};

const albergueApi = {
  _id: "abc123",
  codigo_albergue: "ALB-NEW-001",
  nombre: "Nuevo albergue",
  ubicacion: {
    departamento: "Risaralda",
    municipio: "Pereira",
    direccion: "Calle 1 # 2-3",
    coordenadas: { type: "Point" as const, coordinates: [-75.69, 4.81] as [number, number] },
  },
  capacidad_instalada: 100,
  activo: true,
  created_at: "2026-11-08T05:00:00.000Z",
};

function respuesta(status: number, cuerpo?: unknown): Response {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Gateway en memoria", () => {
  it("lista, crea, actualiza y cambia el estado", async () => {
    const gateway = crearGatewayMemoria(ALBERGUES_DEMO, 0);

    expect(await gateway.listar()).toHaveLength(ALBERGUES_DEMO.length);

    const creado = await gateway.crear(entrada);
    expect(creado.id).toBeTruthy();
    expect((await gateway.listar())[0].codigo).toBe("ALB-NEW-001");

    const actualizado = await gateway.actualizar(creado.id, { ...entrada, nombre: "Renombrado" });
    expect(actualizado.nombre).toBe("Renombrado");

    const inactivo = await gateway.cambiarEstado(creado.id, false);
    expect(inactivo.activo).toBe(false);
  });

  it("rechaza códigos duplicados con error 409", async () => {
    const gateway = crearGatewayMemoria(ALBERGUES_DEMO, 0);

    await expect(
      gateway.crear({ ...entrada, codigo: ALBERGUES_DEMO[0].codigo })
    ).rejects.toMatchObject({ status: 409, campos: { codigo: expect.any(String) } });
  });

  it("responde 404 si el albergue no existe", async () => {
    const gateway = crearGatewayMemoria([], 0);

    await expect(gateway.cambiarEstado("no-existe", false)).rejects.toBeInstanceOf(AlberguesError);
  });
});

describe("Gateway HTTP", () => {
  it("mapea el contrato de MongoDB en ambos sentidos", () => {
    const albergue = desdeApi(albergueApi);

    expect(albergue).toMatchObject({
      id: "abc123",
      codigo: "ALB-NEW-001",
      latitud: 4.81,
      longitud: -75.69,
      capacidadInstalada: 100,
      poblacionActual: null,
    });
    expect(haciaApi(entrada).ubicacion.coordenadas.coordinates).toEqual([-75.69, 4.81]);
  });

  it("envía el token y las operaciones a los endpoints esperados", async () => {
    const fetchFn = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      void url;
      void init;
      return respuesta(200, albergueApi);
    });
    const gateway = crearGatewayHttp("http://api.local/", () => "token-1", fetchFn as typeof fetch);

    await gateway.crear(entrada);
    await gateway.actualizar("abc123", entrada);
    await gateway.cambiarEstado("abc123", false);

    const llamadas = fetchFn.mock.calls.map(([url, init]) => [url, init?.method]);
    expect(llamadas).toEqual([
      ["http://api.local/api/v1/albergues", "POST"],
      ["http://api.local/api/v1/albergues/abc123", "PUT"],
      ["http://api.local/api/v1/albergues/abc123/estado", "PATCH"],
    ]);
    expect(fetchFn.mock.calls[0][1]?.headers).toMatchObject({ Authorization: "Bearer token-1" });
  });

  it("lista los albergues", async () => {
    const fetchFn = vi.fn(async () => respuesta(200, [albergueApi]));
    const gateway = crearGatewayHttp("http://api.local", () => null, fetchFn as unknown as typeof fetch);

    expect(await gateway.listar()).toHaveLength(1);
  });

  it("traduce errores de validación 422 a campos del formulario", async () => {
    const fetchFn = vi.fn(async () =>
      respuesta(422, {
        detail: [{ loc: ["body", "capacidad_instalada"], msg: "Debe ser mayor a 0" }],
      })
    );
    const gateway = crearGatewayHttp("http://api.local", () => null, fetchFn as unknown as typeof fetch);

    await expect(gateway.crear(entrada)).rejects.toMatchObject({
      status: 422,
      campos: { capacidadInstalada: "Debe ser mayor a 0" },
    });
  });

  it("asocia el conflicto 409 al campo código", async () => {
    const fetchFn = vi.fn(async () => respuesta(409, {}));
    const gateway = crearGatewayHttp("http://api.local", () => null, fetchFn as unknown as typeof fetch);

    await expect(gateway.crear(entrada)).rejects.toMatchObject({
      status: 409,
      campos: { codigo: "Ya existe un albergue con ese código." },
    });
  });

  it.each([
    [401, "Tu sesión expiró"],
    [403, "No tienes permisos"],
    [404, "no existe"],
    [500, "error en el servidor"],
  ])("muestra un mensaje claro para el estado %i", async (status, texto) => {
    const fetchFn = vi.fn(async () => new Response("sin json", { status }));
    const gateway = crearGatewayHttp("http://api.local", () => null, fetchFn as unknown as typeof fetch);

    await expect(gateway.listar()).rejects.toThrow(texto);
  });

  it("usa el mensaje del servidor cuando viene como texto", async () => {
    const fetchFn = vi.fn(async () => respuesta(400, { detail: "Capacidad inválida" }));
    const gateway = crearGatewayHttp("http://api.local", () => null, fetchFn as unknown as typeof fetch);

    await expect(gateway.listar()).rejects.toThrow("Capacidad inválida");
  });

  it("informa cuando no hay conexión", async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const gateway = crearGatewayHttp("http://api.local", () => null, fetchFn as unknown as typeof fetch);

    await expect(gateway.listar()).rejects.toMatchObject({ status: 0 });
  });
});
