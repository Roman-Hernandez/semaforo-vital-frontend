import { describe, expect, it, vi } from "vitest";
import { ApiError, type ClienteApi } from "./api-client";
import {
  INTERVENCIONES_DEMO,
  RUTA_INTERVENCIONES,
  crearGatewayHttp,
  crearGatewayMemoria,
  desdeApi,
  haciaApi,
  obtenerIntervencionesGateway,
} from "./intervenciones-service";

const entrada = {
  tipo: "Ventilación",
  descripcion: "Apertura de ventanas y ventiladores en dormitorios.",
  observaciones: " ",
  fecha: "2026-11-14",
};

const datoApi = {
  _id: "abc",
  tipo_intervencion: "Ventilación",
  descripcion: "Apertura de ventanas y ventiladores en dormitorios.",
  fecha_intervencion: "2026-11-14T05:00:00.000Z",
  created_at: "2026-11-14T15:00:00.000Z",
};

function clienteCon(solicitar: ClienteApi["solicitar"]): ClienteApi {
  return { solicitar };
}

describe("Servicio de intervenciones", () => {
  it("convierte el contrato de MongoDB en ambos sentidos", () => {
    expect(desdeApi(datoApi)).toEqual({
      id: "abc",
      tipo: "Ventilación",
      descripcion: datoApi.descripcion,
      observaciones: "",
      fecha: "2026-11-14",
      registradoEn: "2026-11-14T15:00:00.000Z",
    });
    expect(desdeApi({ ...datoApi, _id: undefined, id: "x1", observaciones: "Ok" })).toMatchObject({ id: "x1", observaciones: "Ok" });
    expect(desdeApi({ ...datoApi, _id: undefined, created_at: undefined }).id).toBe("2026-11-14T05:00:00.000Z-Ventilación");

    expect(haciaApi(entrada)).toEqual({
      tipo_intervencion: "Ventilación",
      descripcion: entrada.descripcion,
      fecha_intervencion: "2026-11-14",
    });
    expect(haciaApi({ ...entrada, observaciones: "Con apoyo" })).toHaveProperty("observaciones", "Con apoyo");
  });

  it("lista y registra usando el endpoint del albergue asignado", async () => {
    const solicitar = vi.fn(
      async (_ruta: string, init?: RequestInit) => (init?.method === "POST" ? datoApi : [datoApi]) as never
    );
    const gateway = crearGatewayHttp(clienteCon(solicitar));

    expect(await gateway.listar()).toHaveLength(1);
    expect((await gateway.registrar(entrada)).id).toBe("abc");
    expect(solicitar).toHaveBeenNthCalledWith(1, RUTA_INTERVENCIONES);
    expect(solicitar).toHaveBeenNthCalledWith(2, RUTA_INTERVENCIONES, expect.objectContaining({ method: "POST" }));
  });

  it("traduce los campos con error del backend al formulario", async () => {
    const gateway = crearGatewayHttp(
      clienteCon(async () => {
        throw new ApiError(422, "Revisa los datos ingresados.", { fecha_intervencion: "Fecha inválida", otro: "x" });
      })
    );

    await expect(gateway.registrar(entrada)).rejects.toMatchObject({
      status: 422,
      campos: { fecha: "Fecha inválida", otro: "x" },
    });
  });

  it("propaga otros errores sin cambios", async () => {
    const gateway = crearGatewayHttp(
      clienteCon(async () => {
        throw new TypeError("fallo");
      })
    );

    await expect(gateway.registrar(entrada)).rejects.toThrow("fallo");
  });

  it("trabaja en memoria con datos de prueba", async () => {
    const gateway = crearGatewayMemoria(INTERVENCIONES_DEMO, 0);

    expect(await gateway.listar()).toHaveLength(INTERVENCIONES_DEMO.length);

    const creada = await gateway.registrar(entrada);
    expect(creada).toMatchObject({ tipo: "Ventilación", observaciones: "", fecha: "2026-11-14" });
    expect((await gateway.listar())[0].id).toBe(creada.id);
  });

  it("elige la API real solo si está configurada", () => {
    expect(obtenerIntervencionesGateway("https://api.local")).toHaveProperty("listar");
    expect(obtenerIntervencionesGateway("")).toHaveProperty("registrar");
  });
});
