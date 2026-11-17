import { describe, expect, it, vi } from "vitest";
import { crearClienteApi } from "./api-client";
import {
  crearCondicionesSanitariasGateway,
  crearEnfermedadesGateway,
} from "./registros-sanitarios-service";

function respuesta(status: number, cuerpo: unknown): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Servicios de condiciones sanitarias y enfermedades (/api/v1/mi-albergue)", () => {
  it("lista paginado, crea (POST) y actualiza (PUT) condiciones sanitarias", async () => {
    const fetchFn = vi.fn<typeof fetch>(async (url, init) => {
      if (!init?.method || init.method === "GET") {
        return respuesta(200, {
          items: [
            {
              id: "cs-1",
              fecha: "2026-11-17T00:00:00Z",
              agua_potable_disponible: true,
              banos_disponibles: 10,
              estado_higiene: "Adecuado",
              estado_saneamiento: "Adecuado",
              otros_recursos_sanitarios: [],
              observaciones: "Revisión diaria",
            },
          ],
          page: 1,
          page_size: 20,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        });
      }
      return respuesta(200, {
        id: "cs-1",
        fecha: "2026-11-17T00:00:00Z",
        agua_potable_disponible: true,
        banos_disponibles: 10,
        estado_higiene: "Adecuado",
        estado_saneamiento: "Adecuado",
        otros_recursos_sanitarios: [],
        observaciones: "Revisión diaria",
      });
    });

    const gateway = crearCondicionesSanitariasGateway(
      crearClienteApi("https://api.local", () => "token-1", fetchFn)
    );

    const pagina = await gateway.listar({ page: 1, page_size: 20, q: "Adecuado" });
    expect(pagina.items).toHaveLength(1);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "https://api.local/api/v1/mi-albergue/condiciones-sanitarias?page=1&page_size=20&q=Adecuado"
    );

    const creada = await gateway.crear({
      fecha: "2026-11-17",
      aguaPotableDisponible: true,
      banosDisponibles: 10,
      estadoHigiene: "Adecuado",
      estadoSaneamiento: "Adecuado",
      observaciones: "Revisión diaria",
    });

    await gateway.actualizar("cs-1", {
      fecha: "2026-11-17",
      aguaPotableDisponible: false,
      banosDisponibles: 8,
      estadoHigiene: "Requiere atención",
      estadoSaneamiento: "Adecuado",
      observaciones: "Corte temporal",
    });

    expect(creada.id).toBe("cs-1");
    expect(fetchFn.mock.calls[1][1]?.method).toBe("POST");
    expect(fetchFn.mock.calls[2][0]).toBe(
      "https://api.local/api/v1/mi-albergue/condiciones-sanitarias/cs-1"
    );
    expect(fetchFn.mock.calls[2][1]?.method).toBe("PUT");
  });

  it("lista paginado, crea (POST) y actualiza (PUT) casos de enfermedades con cantidad_recuperados opcional y null conservado", async () => {
    const fetchFn = vi.fn<typeof fetch>(async (_url, init) => {
      if (!init?.method || init.method === "GET") {
        return respuesta(200, {
          items: [
            {
              id: "enf-1",
              fecha: "2026-11-17T00:00:00Z",
              enfermedad: "Infección respiratoria aguda",
              cantidad_casos_activos: 4,
              cantidad_recuperados: null,
              observaciones: "En control",
            },
          ],
          page: 1,
          page_size: 20,
          total: 1,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        });
      }
      return respuesta(200, {
        id: "enf-1",
        fecha: "2026-11-17T00:00:00Z",
        enfermedad: "Infección respiratoria aguda",
        cantidad_casos_activos: 4,
        cantidad_recuperados: 12,
        observaciones: "En control",
      });
    });

    const gateway = crearEnfermedadesGateway(
      crearClienteApi("https://api.local", () => "token-1", fetchFn)
    );

    const pagina = await gateway.listar();
    expect(pagina.items[0]?.cantidadRecuperados).toBeNull();

    const creado = await gateway.crear({
      fecha: "2026-11-17",
      enfermedad: "Infección respiratoria aguda",
      cantidadCasosActivos: 4,
      cantidadRecuperados: 12,
      observaciones: "En control",
    });

    expect(creado.cantidadRecuperados).toBe(12);
    expect(JSON.parse(String(fetchFn.mock.calls[1][1]?.body))).toEqual({
      fecha: "2026-11-17",
      enfermedad: "Infección respiratoria aguda",
      cantidad_casos_activos: 4,
      cantidad_recuperados: 12,
      observaciones: "En control",
    });

    await gateway.actualizar("enf-1", {
      fecha: "2026-11-17",
      enfermedad: "Infección respiratoria aguda",
      cantidadCasosActivos: 2,
      cantidadRecuperados: null,
      observaciones: "Disminución de casos",
    });

    expect(JSON.parse(String(fetchFn.mock.calls[2][1]?.body))).not.toHaveProperty(
      "cantidad_recuperados"
    );
  });
});
