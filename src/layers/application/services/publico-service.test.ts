import { describe, expect, it, vi } from "vitest";
import { crearClienteApi } from "./api-client";
import { crearPublicoGateway } from "./publico-service";

function respuesta(status: number, cuerpo: unknown): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Servicio de consulta pública (/api/v1/publico)", () => {
  it("lista los albergues públicos paginados y normaliza ubicación, riesgo y condiciones sanitarias", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () =>
      respuesta(200, {
        items: [
          {
            id: "alb-1",
            codigo_albergue: "ALB-PER-001",
            nombre: "[DEMO] Albergue Municipal Centro",
            ubicacion: {
              departamento: "Risaralda",
              municipio: "Pereira",
              direccion: "Cra. 8 # 20-15",
              coordenadas: { type: "Point", coordinates: [-75.6946, 4.8143] },
            },
            capacidad_instalada: 200,
            poblacion_actual: 140,
            porcentaje_ocupacion: 70,
            cupos_disponibles: 60,
            nivel_riesgo: "verde",
            fecha_calculo_riesgo: "2026-11-17T10:00:00Z",
            condiciones_sanitarias: {
              fecha: "2026-11-17T08:00:00Z",
              agua_potable_disponible: true,
              banos_disponibles: 12,
              estado_higiene: "Adecuado",
              estado_saneamiento: "Adecuado",
            },
          },
        ],
        page: 1,
        page_size: 20,
        total: 30,
        total_pages: 2,
        has_next: true,
        has_previous: false,
      })
    );

    const gateway = crearPublicoGateway(
      crearClienteApi("https://api.local", () => null, fetchFn)
    );
    const pagina = await gateway.listarAlbergues({ page: 1, page_size: 20 });

    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.local/api/v1/publico/albergues?page=1&page_size=20",
      expect.any(Object)
    );
    expect(pagina.total).toBe(30);
    expect(pagina.has_next).toBe(true);
    expect(pagina.items[0]?.nombre).toBe("[DEMO] Albergue Municipal Centro");
  });

  it("consulta alertas públicas generales y por albergue paginadas", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () =>
      respuesta(200, {
        items: [
          {
            id: "alt-1",
            albergue_id: "alb-1",
            fecha_alerta: "2026-11-17T09:30:00Z",
            nivel_riesgo: "amarillo",
            tipo_alerta: "Saneamiento",
            mensaje: "Revisión preventiva de baterías sanitarias.",
            activa: true,
          },
        ],
        page: 1,
        page_size: 20,
        total: 1,
        total_pages: 1,
        has_next: false,
        has_previous: false,
      })
    );

    const gateway = crearPublicoGateway(
      crearClienteApi("https://api.local", () => null, fetchFn)
    );
    const alertas = await gateway.listarAlertas({ activa: true });
    const alertasAlbergue = await gateway.listarAlertasAlbergue("alb-1", {
      page: 1,
      page_size: 10,
      activa: true,
    });

    expect(alertas.items).toHaveLength(1);
    expect(alertas.items[0].tipoAlerta).toBe("Saneamiento");
    expect(alertasAlbergue.items).toHaveLength(1);
    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.local/api/v1/publico/albergues/alb-1/alertas?page=1&page_size=10&activa=true",
      expect.any(Object)
    );
  });
});
