import { describe, expect, it, vi } from "vitest";
import { crearClienteApi } from "./api-client";
import * as moduloIntervenciones from "./intervenciones-service";
import { crearGatewayHttp, desdeApi, haciaApi } from "./intervenciones-service";

function respuesta(status: number, cuerpo: unknown): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Servicio de intervenciones (/api/v1/mi-albergue/intervenciones)", () => {
  it("no exporta INTERVENCIONES_DEMO ni crearGatewayMemoria", () => {
    expect(moduloIntervenciones).not.toHaveProperty("INTERVENCIONES_DEMO");
    expect(moduloIntervenciones).not.toHaveProperty("crearGatewayMemoria");
  });

  it("mapea intervenciones desde y hacia la API", () => {
    expect(
      desdeApi({
        id: "int-1",
        tipo_intervencion: "Agua potable",
        descripcion: "Instalación de filtro",
        fecha_intervencion: "2026-11-17T00:00:00Z",
        observaciones: "Sin novedad",
      })
    ).toMatchObject({
      id: "int-1",
      tipo: "Agua potable",
      fecha: "2026-11-17",
    });

    expect(
      haciaApi({
        tipo: "Agua potable",
        descripcion: "Instalación de filtro",
        fecha: "2026-11-17",
        observaciones: "",
      })
    ).toEqual({
      tipo_intervencion: "Agua potable",
      descripcion: "Instalación de filtro",
      fecha_intervencion: "2026-11-17",
    });
  });

  it("lista paginado, registra (POST) y actualiza (PUT) intervenciones", async () => {
    const fetchFn = vi.fn<typeof fetch>(async (_url, init) => {
      if (!init?.method || init.method === "GET") {
        return respuesta(200, {
          items: [
            {
              id: "int-1",
              tipo_intervencion: "Higiene",
              descripcion: "Entrega de kits de aseo",
              fecha_intervencion: "2026-11-17T00:00:00Z",
              observaciones: null,
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
        id: "int-1",
        tipo_intervencion: "Higiene",
        descripcion: "Entrega de kits de aseo",
        fecha_intervencion: "2026-11-17T00:00:00Z",
        observaciones: null,
      });
    });

    const gateway = crearGatewayHttp(
      crearClienteApi("https://api.local", () => "token-1", fetchFn)
    );

    const pagina = await gateway.listar({ page: 1, page_size: 20, q: "kits" });
    expect(pagina.items).toHaveLength(1);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "https://api.local/api/v1/mi-albergue/intervenciones?page=1&page_size=20&q=kits"
    );

    await gateway.registrar({
      tipo: "Higiene",
      descripcion: "Entrega de kits de aseo",
      fecha: "2026-11-17",
      observaciones: "",
    });

    await gateway.actualizar?.("int-1", {
      tipo: "Higiene",
      descripcion: "Entrega de kits de aseo actualizada",
      fecha: "2026-11-17",
      observaciones: "Completado",
    });

    expect(fetchFn.mock.calls[1][1]?.method).toBe("POST");
    expect(fetchFn.mock.calls[2][0]).toBe(
      "https://api.local/api/v1/mi-albergue/intervenciones/int-1"
    );
    expect(fetchFn.mock.calls[2][1]?.method).toBe("PUT");
  });
});
