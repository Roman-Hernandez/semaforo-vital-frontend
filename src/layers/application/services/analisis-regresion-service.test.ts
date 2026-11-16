import { describe, expect, it, vi } from "vitest";
import {
  RESULTADOS_DEMO,
  RUTA_RESULTADOS,
  crearGatewayHttp,
  crearGatewayMemoria,
  desdeApi,
  obtenerAnalisisRegresionGateway,
} from "./analisis-regresion-service";

const datoApi = {
  _id: "r1",
  registro_id: "REG-0001",
  clasificacion: "contagiado" as const,
  probabilidad: 0.73,
  fecha_ejecucion: "2026-11-14T13:30:00.000Z",
  modelo: { nombre: "Regresión logística", version: "1.0.0" },
};

describe("Servicio de análisis de regresión", () => {
  it("convierte la respuesta del backend", () => {
    expect(desdeApi(datoApi)).toEqual({
      id: "r1",
      registro: "REG-0001",
      clasificacion: "contagiado",
      probabilidad: 0.73,
      fechaEjecucion: "2026-11-14T13:30:00.000Z",
      modelo: { nombre: "Regresión logística", version: "1.0.0" },
    });
    expect(desdeApi({ ...datoApi, _id: undefined, id: "x" }).id).toBe("x");
    expect(desdeApi({ ...datoApi, _id: undefined, modelo: undefined })).toMatchObject({
      id: "2026-11-14T13:30:00.000Z-REG-0001",
      modelo: null,
    });
  });

  it("consulta los resultados del albergue asignado", async () => {
    const solicitar = vi.fn(async () => [datoApi] as never);
    const gateway = crearGatewayHttp({ solicitar });

    expect(await gateway.listarResultados()).toHaveLength(1);
    expect(solicitar).toHaveBeenCalledWith(RUTA_RESULTADOS);
  });

  it("entrega datos de prueba coherentes con el umbral", async () => {
    const resultados = await crearGatewayMemoria(RESULTADOS_DEMO, 0).listarResultados();

    expect(resultados).toHaveLength(RESULTADOS_DEMO.length);
    expect(resultados.every((r) => (r.probabilidad >= 0.5) === (r.clasificacion === "contagiado"))).toBe(true);
  });

  it("elige la API real solo si está configurada", () => {
    expect(obtenerAnalisisRegresionGateway("https://api.local")).toHaveProperty("listarResultados");
    expect(obtenerAnalisisRegresionGateway("")).toHaveProperty("listarResultados");
  });
});
