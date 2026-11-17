import { describe, expect, it, vi } from "vitest";
import type { AlbergueEntrada } from "@/layers/domain/albergues/albergue";
import * as moduloAlbergues from "./albergues-service";
import {
  AlberguesError,
  crearGatewayHttp,
  desdeApi,
  haciaApi,
} from "./albergues-service";

const entrada: AlbergueEntrada = {
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
  id: "abc123",
  codigo_albergue: "ALB-NEW-001",
  nombre: "Nuevo albergue",
  ubicacion: {
    departamento: "Risaralda",
    municipio: "Pereira",
    direccion: "Calle 1 # 2-3",
    coordenadas: {
      type: "Point" as const,
      coordinates: [-75.69, 4.81] as [number, number],
    },
  },
  capacidad_instalada: 100,
  activo: true,
  poblacion_actual: null,
  administrador: "María López",
  nivel_riesgo: "rojo" as const,
  created_at: "2026-11-08T05:00:00.000Z",
};

function envolverPagina<T>(items: T[]) {
  return {
    items,
    page: 1,
    page_size: 20,
    total: items.length,
    total_pages: items.length > 0 ? 1 : 0,
    has_next: false,
    has_previous: false,
  };
}

function respuesta(status: number, cuerpo?: unknown): Response {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Gateway HTTP de albergues (/api/v1/albergues)", () => {
  it("no exporta ALBERGUES_DEMO ni crearGatewayMemoria", () => {
    expect(moduloAlbergues).not.toHaveProperty("ALBERGUES_DEMO");
    expect(moduloAlbergues).not.toHaveProperty("crearGatewayMemoria");
  });

  it("mapea el contrato de MongoDB conservando null en poblacion_actual y adaptando nivel_riesgo canónico", () => {
    const albergue = desdeApi(albergueApi);

    expect(albergue).toMatchObject({
      id: "abc123",
      codigo: "ALB-NEW-001",
      latitud: 4.81,
      longitud: -75.69,
      capacidadInstalada: 100,
      poblacionActual: null,
      administrador: "María López",
      riesgo: "critico",
    });
    expect(haciaApi(entrada).ubicacion.coordenadas.coordinates).toEqual([
      -75.69, 4.81,
    ]);
  });

  it("consulta listado paginado, resumen global y mutaciones con el contrato Page<T>", async () => {
    const fetchFn = vi.fn<typeof fetch>(async (url) => {
      const ruta = String(url);
      if (ruta.includes("/resumen")) {
        return respuesta(200, {
          total_registrados: 30,
          total_activos: 28,
          con_administrador: 25,
          criticos: 4,
          sin_clasificacion: 2,
          poblacion_actual: 4200,
          albergues_sin_poblacion: 1,
          porcentaje_ocupacion: 72.5,
        });
      }
      if (ruta.includes("?page=")) {
        return respuesta(200, envolverPagina([albergueApi]));
      }
      return respuesta(200, albergueApi);
    });
    const gateway = crearGatewayHttp(
      "https://api.local/",
      () => "token-1",
      fetchFn
    );

    const pagina = await gateway.listar({
      page: 2,
      page_size: 20,
      q: "Pereira",
      activo: true,
    });
    expect(pagina.items).toHaveLength(1);
    expect(fetchFn.mock.calls[0][0]).toBe(
      "https://api.local/api/v1/albergues?page=2&page_size=20&q=Pereira&activo=true"
    );

    const resumen = await gateway.resumen!();
    expect(resumen).toEqual({
      totalRegistrados: 30,
      totalActivos: 28,
      conAdministrador: 25,
      criticos: 4,
      sinClasificacion: 2,
      poblacionActual: 4200,
      alberguesSinPoblacion: 1,
      porcentajeOcupacion: 72.5,
    });

    const creado = await gateway.crear(entrada);
    expect(creado.codigo).toBe(albergueApi.codigo_albergue);
    await gateway.actualizar("abc123", entrada);
    await gateway.cambiarEstado("abc123", false);

    await expect(gateway.cambiarEstado("abc123", true)).rejects.toBeInstanceOf(
      AlberguesError
    );
  });

  it("consulta los registros globales paginados de condiciones, enfermedades e intervenciones de un albergue", async () => {
    const fetchFn = vi.fn<typeof fetch>(async (url) => {
      const ruta = String(url);
      if (ruta.includes("/condiciones-sanitarias")) {
        return respuesta(
          200,
          envolverPagina([
            {
              id: "cs-1",
              fecha: "2026-11-17T00:00:00Z",
              agua_potable_disponible: true,
              banos_disponibles: 10,
              estado_higiene: "Adecuado",
              estado_saneamiento: "Adecuado",
              observaciones: "Todo en orden",
            },
          ])
        );
      }
      if (ruta.includes("/enfermedades")) {
        return respuesta(
          200,
          envolverPagina([
            {
              id: "enf-1",
              fecha: "2026-11-17T00:00:00Z",
              enfermedad: "IRA",
              cantidad_casos_activos: 4,
              cantidad_recuperados: 2,
              observaciones: null,
            },
          ])
        );
      }
      return respuesta(
        200,
        envolverPagina([
          {
            id: "int-1",
            fecha_intervencion: "2026-11-17T00:00:00Z",
            tipo_intervencion: "Higiene",
            descripcion: "Entrega de kits",
            observaciones: null,
          },
        ])
      );
    });

    const gateway = crearGatewayHttp(
      "https://api.local",
      () => "token-1",
      fetchFn
    );
    const registros = await gateway.consultarRegistros!("abc123", {
      page: 1,
      page_size: 10,
      q: "IRA",
    });

    expect(registros.condiciones.items).toHaveLength(1);
    expect(registros.enfermedades.items[0]?.cantidadRecuperados).toBe(2);
    expect(registros.intervenciones.items).toHaveLength(1);
  });
});
