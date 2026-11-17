import { describe, expect, it, vi } from "vitest";
import { crearClienteApi } from "./api-client";
import { crearSIRGateway } from "./sir-service";

describe("Servicio SIR automático (/api/v1/mi-albergue/modelo-sir)", () => {
  it("consulta resultados automáticos con paginación y filtro opcional de enfermedad sin enviar parámetros numéricos", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () =>
      new Response(
        JSON.stringify({
          albergue_id: "alb-1",
          albergue_nombre: "[DEMO] Albergue San José",
          poblacion_actual: 250,
          fecha_poblacion: "2026-11-17T00:00:00Z",
          generado_en: "2026-11-17T12:00:00Z",
          horizonte_dias: 14,
          ventana_datos_dias: 28,
          metodo_numerico: "RK4",
          datos_faltantes: [],
          supuestos: ["Población cerrada"],
          resultados: {
            items: [],
            page: 1,
            page_size: 20,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false,
          },
        }),
        { status: 200 }
      )
    );

    const gateway = crearSIRGateway(
      crearClienteApi("http://localhost:8000", () => "token-demo", fetchFn)
    );

    const res = await gateway.consultarResultados({
      page: 1,
      page_size: 20,
      enfermedad: "Infección respiratoria aguda",
    });

    expect(res.metodo_numerico).toBe("RK4");
    expect(fetchFn).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/mi-albergue/modelo-sir/resultados?page=1&page_size=20&enfermedad=Infecci%C3%B3n+respiratoria+aguda",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-demo",
        }),
      })
    );

    await gateway.simular?.({ enfermedad: "Gastroenteritis" });
    expect(fetchFn).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/mi-albergue/modelo-sir/simular?page=1&page_size=20",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ enfermedad: "Gastroenteritis" }),
      })
    );
  });
});
