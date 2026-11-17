import { describe, expect, it, vi } from "vitest";
import { crearClienteApi } from "./api-client";
import { crearMiAlbergueGateway } from "./mi-albergue-service";

function respuesta(status: number, cuerpo: unknown): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Servicio de mi albergue (/api/v1/mi-albergue)", () => {
  it("consulta el dashboard consolidado y mapea ocupación, semáforo, alertas y análisis", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () =>
      respuesta(200, {
        poblacion_actual: 120,
        porcentaje_ocupacion: 60,
        cupos_disponibles: 80,
        ultimo_registro: {
          id: "rec-1",
          albergue_id: "alb-1",
          fecha: "2026-11-17T00:00:00Z",
          poblacion: 120,
          created_at: "2026-11-17T08:00:00Z",
          registrado_por: "usr-1",
        },
        ocupacion_intradia: null,
        albergue: {
          id: "alb-1",
          codigo_albergue: "ALB-PER-001",
          nombre: "Albergue San José",
          ubicacion: {
            departamento: "Risaralda",
            municipio: "Pereira",
            direccion: "Cra. 7 # 19-45",
            coordenadas: { type: "Point", coordinates: [-75.6946, 4.8143] },
          },
          capacidad_instalada: 200,
          activo: true,
          fecha: "2026-09-18T00:00:00Z",
          created_at: "2026-09-18T00:00:00Z",
          registrado_por: "usr-0",
        },
        administrador: {
          id: "usr-1",
          nombre: "María",
          apellido: "López",
          email: "maria@semaforo.gob",
        },
        semaforo_vital: {
          nivel: "verde",
          codigo: 1,
          descripcion: "Riesgo bajo",
          fecha_calculo: "2026-11-17T09:00:00Z",
        },
        alertas: {
          cantidad: 2,
          por_nivel_riesgo: { verde: 0, amarillo: 2, rojo: 0 },
        },
        casos_diarios: {
          casos_eda: 1,
          casos_ira: 3,
          ultima_actualizacion: "2026-11-17T08:30:00Z",
        },
        condiciones_sanitarias: {
          id: "cs-1",
          albergue_id: "alb-1",
          fecha: "2026-11-17T00:00:00Z",
          agua_potable_disponible: true,
          banos_disponibles: 10,
          estado_higiene: "Adecuado",
          estado_saneamiento: "Adecuado",
          fuente_datos: "registro_manual",
          otros_recursos_sanitarios: [],
          observaciones: "Agua tratada",
          created_at: "2026-11-17T07:00:00Z",
          registrado_por: "usr-1",
        },
        analisis_ia: {
          id: "ia-1",
          albergue_id: "alb-1",
          fecha_ejecucion: "2026-11-17T09:00:00Z",
          periodo_analizado: {
            fecha_inicio: "2026-11-10T00:00:00Z",
            fecha_fin: "2026-11-17T00:00:00Z",
          },
          modelo: { nombre: "Regresión Logística", version: "1.0.0" },
          resultado: { probabilidad_riesgo: 0.24 },
          datos_entrada: {
            registros_diarios_ids: [],
            condiciones_sanitarias_ids: [],
            casos_enfermedades_ids: [],
            intervenciones_ids: [],
            metricas_albergue_ids: [],
          },
          preprocesamiento: {
            registros_considerados: 14,
            registros_descartados: 0,
            datos_faltantes: [],
          },
          created_at: "2026-11-17T09:00:00Z",
          registrado_por: "usr-1",
        },
        resumen_casos: [
          {
            enfermedad: "IRA",
            cantidad_casos_activos: 3,
            fecha: "2026-11-17T00:00:00Z",
          },
        ],
        evolucion_epidemiologica: [],
        intervenciones: [
          {
            id: "int-1",
            albergue_id: "alb-1",
            fecha_intervencion: "2026-11-17T00:00:00Z",
            tipo_intervencion: "Agua potable",
            descripcion: "Cloración del tanque",
            fuente_datos: "registro_manual",
            observaciones: null,
            created_at: "2026-11-17T06:00:00Z",
            registrado_por: "usr-1",
          },
        ],
        ultima_actualizacion: "2026-11-17T09:00:00Z",
        predicciones: [
          {
            simulacion_id: "sir-1",
            enfermedad: "IRA",
            fecha_ejecucion: "2026-11-17T09:00:00Z",
            modelo: { nombre: "SIR", version: "1.0" },
            periodo_estimacion: { dia_inicio: 0, dia_fin: 30 },
            resultado_final: {
              dia: 30,
              susceptibles: 90,
              infectados: 5,
              recuperados: 25,
            },
            pico_infectados: {
              dia: 12,
              susceptibles: 100,
              infectados: 14,
              recuperados: 6,
            },
          },
        ],
        simulaciones_sir: [],
        datos_no_disponibles: [],
      })
    );

    const gateway = crearMiAlbergueGateway(
      crearClienteApi("https://api.local", () => "token-1", fetchFn)
    );
    const dashboard = await gateway.consultarDashboard();

    expect(dashboard.poblacionActual).toBe(120);
    expect(dashboard.semaforoVital?.nivel).toBe("verde");
    expect(dashboard.alertas.cantidad).toBe(2);
    expect(dashboard.analisisIa?.probabilidadRiesgo).toBe(0.24);
    expect(dashboard.predicciones[0]?.picoInfectados).toBe(14);
  });

  it("actualiza y consulta el historial de población paginado sin enviar q ni limite/offset", async () => {
    const fetchFn = vi.fn<typeof fetch>(async (_url, init) => {
      if (init?.method === "PUT") {
        return respuesta(200, {
          id: "pop-1",
          albergue_id: "alb-1",
          fecha: "2026-11-17T00:00:00Z",
          poblacion: 135,
          created_at: "2026-11-17T10:00:00Z",
          registrado_por: "usr-1",
        });
      }
      return respuesta(200, {
        items: [
          {
            id: "pop-1",
            albergue_id: "alb-1",
            fecha: "2026-11-17T00:00:00Z",
            poblacion: 135,
            created_at: "2026-11-17T10:00:00Z",
            registrado_por: "usr-1",
          },
        ],
        page: 1,
        page_size: 20,
        total: 90,
        total_pages: 5,
        has_next: true,
        has_previous: false,
      });
    });

    const gateway = crearMiAlbergueGateway(
      crearClienteApi("https://api.local", () => "token-1", fetchFn)
    );

    const guardado = await gateway.guardarPoblacion("2026-11-17", 135);
    const historial = await gateway.listarHistorialPoblacion({
      page: 1,
      page_size: 20,
      desde: "2026-10-01",
      hasta: "2026-11-17",
    });

    expect(guardado.poblacion).toBe(135);
    expect(JSON.parse(String(fetchFn.mock.calls[0][1]?.body))).toEqual({
      fecha: "2026-11-17",
      poblacion: 135,
    });
    expect(fetchFn.mock.calls[1][0]).toBe(
      "https://api.local/api/v1/mi-albergue/poblacion/historial?page=1&page_size=20&desde=2026-10-01&hasta=2026-11-17"
    );
    expect(historial.items).toHaveLength(1);
    expect(historial.total).toBe(90);
  });
});

it("consulta detalle, actualiza ficha y conserva ausencia de datos en dashboard y población", async () => {
  const albergue = { id: "a1", codigo_albergue: "ALB-1", nombre: "Esperanza", ubicacion: { departamento: "Risaralda", municipio: "Pereira", direccion: "Calle 1", coordenadas: { type: "Point", coordinates: [-75.69, 4.81] } }, capacidad_instalada: 100, activo: true };
  const fetchFn = vi.fn<typeof fetch>(async (url, init) => {
    if (init?.method === "PATCH") return respuesta(200, albergue);
    if (String(url).includes("dashboard")) return respuesta(200, { albergue, administrador: {}, resumen_casos: [], intervenciones: [], predicciones: [], ultima_actualizacion: null, alertas: { cantidad: 0, por_nivel_riesgo: { verde: 0, amarillo: 0, rojo: 0 } } });
    if (String(url).endsWith("poblacion")) return respuesta(200, { poblacion_actual: null, porcentaje_ocupacion: null, cupos_disponibles: null, ultimo_registro: null });
    return respuesta(200, { albergue, administrador: { id: "admin" }, poblacion_actual: 0 });
  });
  const gateway = crearMiAlbergueGateway(crearClienteApi("https://api.local", () => null, fetchFn));
  expect((await gateway.consultar()).albergue.poblacionActual).toBe(0);
  await gateway.actualizar({ nombre: "Esperanza", departamento: "Risaralda", municipio: "Pereira", direccion: "Calle 2", latitud: 4.81, longitud: -75.69, capacidadInstalada: 120, activo: true });
  expect(JSON.parse(String(fetchFn.mock.calls[1][1]?.body))).toMatchObject({ capacidad_instalada: 120, ubicacion: { direccion: "Calle 2" } });
  const d = await gateway.consultarDashboard(10);
  expect(d.semaforoVital).toBeNull();
  expect(d.casosDiarios).toBeNull();
  expect(d.condicionesSanitarias).toBeNull();
  expect(d.analisisIa).toBeNull();
  expect(d.predicciones).toEqual([]);
  expect(d.poblacionActual).toBeNull();
  expect((await gateway.consultarPoblacion()).ultimoRegistro).toBeNull();
});
